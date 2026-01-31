
-- 20260201_phase3_social.sql

-- 1. MESSAGES TABLE (Direct Messages)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_system_message BOOLEAN DEFAULT FALSE
);

-- RLS for Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see messages sent by them or sent to them
CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy: Users can send messages
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Policy: Receiver can update read status (mark as read)
CREATE POLICY "Receiver can mark as read" ON public.messages
    FOR UPDATE USING (auth.uid() = receiver_id);


-- 2. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'SYSTEM', 'REPLY', 'DM', 'COUPON', 'REPORT'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: System/Admin can insert notifications (Strictly controlled via Logic or Service Role)
-- Allow Authenticated users to insert triggers for Reply? No, better handle via Database Trigger or Edge Function.
-- For simplicity, we will allow Authenticated users to insert notifications ONLY for 'REPLY' type to the owner of the post, 
-- but this is complex to secure via RLS. Ideally, use Database Functions.

-- FUNCTION: Send Notification on New DM
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
        NEW.receiver_id,
        'DM',
        'New Message Received',
        SUBSTRING(NEW.content FROM 1 FOR 50) || '...',
        '/inbox'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER: Auto-notify on DM
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- 3. COUPON REDEMPTION LOGS (To prevent double usage)
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_id UUID REFERENCES public.coupons(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(coupon_id, user_id)
);

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions" ON public.coupon_redemptions
    FOR SELECT USING (auth.uid() = user_id);

-- COMMENTS: for Korean devs
COMMENT ON TABLE public.messages IS '사용자 간 및 관리자-사용자 간 1:1 메시지';
COMMENT ON TABLE public.notifications IS '시스템 알림, 답글 알림, 쪽지 수신 알림 통합 테이블';
COMMENT ON TABLE public.coupon_redemptions IS '쿠폰 사용 이력 (중복 사용 방지)';

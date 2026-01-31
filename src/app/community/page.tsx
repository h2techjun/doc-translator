import { createClient } from '@/lib/supabase/server';
import { CommunityClient } from '@/components/community/CommunityClient';

export default async function CommunityPage({ searchParams }: { searchParams: { tab?: string } }) {
    const supabase = await createClient();
    const tab = searchParams.tab || 'free';

    const { data: posts } = await supabase
        .from('posts')
        .select(`
            *,
            users (
                full_name,
                email
            )
        `)
        .eq('category', tab)
        .order('created_at', { ascending: false })
        .returns<any[]>();

    return <CommunityClient posts={posts} tab={tab} />;
}

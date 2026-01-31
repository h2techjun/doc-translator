
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGeoSmart } from '@/hooks/use-geo-smart';

interface ReportModalProps {
    targetType: 'POST' | 'COMMENT';
    targetId: string;
}

export function ReportModal({ targetType, targetId }: ReportModalProps) {
    const { t } = useGeoSmart();
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) return;
        setLoading(true);

        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target_type: targetType,
                    target_id: targetId,
                    reason: reason,
                    details: 'User reported content'
                })
            });

            if (res.ok) {
                toast.success(t.reports.success, { description: t.reports.successDesc });
                setOpen(false);
                setReason('');
            } else {
                toast.error(t.reports.errorFailed);
            }
        } catch (e) {
            toast.error(t.reports.errorSystem);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-red-500">
                    <AlertTriangle className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        {t.reports.title}
                    </DialogTitle>
                    <DialogDescription>
                        {t.reports.description.replace('{type}', targetType.toLowerCase())}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder={t.reports.placeholder}
                        value={reason}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>{t.reports.cancel}</Button>
                    <Button onClick={handleSubmit} disabled={loading || !reason.trim()} className="bg-red-600 hover:bg-red-700 text-white">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.reports.submit}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

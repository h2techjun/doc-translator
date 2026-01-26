
import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/storage";
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, XCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default async function MyTranslationsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await getUserSession();
    if (!session?.user?.id) {
        redirect(`/${locale}/login`);
    }

    const t = await getTranslations('Index');

    const jobs = await prisma.job.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    const jobsWithUrls = await Promise.all(jobs.map(async (job) => {
        let url = null;
        if (job.status === 'COMPLETED' && job.translatedFileUrl) {
            try {
                url = await getDownloadUrl(job.translatedFileUrl);
            } catch (e) {
                // file might be deleted or expired
            }
        }
        return {
            ...job,
            downloadUrl: url,
            filename: job.originalFileUrl?.split('/').pop()?.split('_').slice(1).join('_') || 'Document'
        };
    }));

    return (
        <main className="min-h-screen bg-muted/10 py-12">
            <div className="container max-w-4xl space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">My Translations</h1>
                        <p className="text-muted-foreground">Manage and download your translated documents.</p>
                    </div>
                    <Link href={`/${locale}`}>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            New Translation
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-4">
                    {jobsWithUrls.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-background/50">
                            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium">No translations yet</h3>
                            <p className="text-muted-foreground mb-6">Upload a document to get started.</p>
                            <Link href={`/${locale}`}>
                                <Button>Start Translating</Button>
                            </Link>
                        </div>
                    ) : (
                        jobsWithUrls.map((job) => (
                            <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate text-lg">
                                            {job.filename}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                            <Badge
                                                variant="outline"
                                                className={`uppercase text-[10px] font-bold ${job.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                                        job.status === 'FAILED' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                                                            'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                                                    }`}
                                            >
                                                {job.status}
                                            </Badge>
                                            <span className="text-xs">{new Date(job.createdAt).toLocaleDateString()}</span>
                                            {job.costEstimate > 0 && <span className="text-xs text-muted-foreground">Tokens: {Math.round(job.costEstimate)}</span>}
                                        </div>
                                    </div>
                                    <div>
                                        {job.status === 'COMPLETED' && job.downloadUrl ? (
                                            <a href={job.downloadUrl} download>
                                                <Button size="sm" className="font-bold gap-2">
                                                    <Download className="h-4 w-4" />
                                                    Download
                                                </Button>
                                            </a>
                                        ) : job.status === 'FAILED' ? (
                                            <span className="text-red-500 flex items-center text-sm font-medium">
                                                <XCircle className="mr-1 h-4 w-4" /> {job.error ? 'Error' : 'Failed'}
                                            </span>
                                        ) : (
                                            <span className="text-blue-500 flex items-center text-sm font-medium animate-pulse">
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> In Progress
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}

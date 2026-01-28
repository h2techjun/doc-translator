'use client';

import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, FileSpreadsheet, FileIcon, ShieldCheck, Zap, Globe, Github } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/ui/Footer';
import { GamifiedLoading } from '@/components/translation/GamifiedLoading';
import { PersistentGameAd } from '@/components/translation/PersistentGameAd';
import { ModeToggle } from '@/components/mode-toggle';
import { UserMenu } from '@/components/layout/UserMenu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { i18n, type Locale } from '@/lib/i18n/dictionaries';
import { LANGUAGES } from '@/lib/i18n/languages';
import { useGeoSmart } from '@/hooks/use-geo-smart';
import { useSmartEstimation } from '@/hooks/use-smart-estimation';

import { GoogleDrivePicker, DriveFile } from '@/components/drive/GoogleDrivePicker';
import { toast } from 'sonner';

export default function HomePage() {
    // State for File & Processing
    const [file, setFile] = useState<File | null>(null);
    const [driveFile, setDriveFile] = useState<DriveFile | null>(null);
    const [jobId, setJobId] = useState<string | null>(null); // For Drive/Job-based processing
    const [status, setStatus] = useState<'idle' | 'ready' | 'uploading' | 'processing' | 'completed' | 'failed'>('idle');
    const [progress, setProgress] = useState(0);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [resultFileName, setResultFileName] = useState<string>('');
    const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // 🌏 Global Geo-Smart Context Hook (Replaces previous inline logic)
    // This hook manages Region, Currency, PPP, UI Lang, and Target Lang centrally.
    const {
        region, currency, currencySymbol, pppFactor, // Immutable (Pricing)
        uiLang, targetLang,                          // Mutable (User Preference)
        t,                                           // Translations (Auto-synced)
        setUiLang, setTargetLang,
        isLoading: isGeoLoading
    } = useGeoSmart(); // Start with Korean fallback, but hook will override based on IP

    // Remove local T logic as it is now provided by useGeoSmart


    const { estimation, estimateTime } = useSmartEstimation();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            setFile(acceptedFiles[0]);
            setDriveFile(null); // Clear drive file
            setStatus('ready');
            // Reset states
            setJobId(null);
            setProgress(0);
            setDownloadUrl(null);
            setResultFileName('');
            setEstimatedTime(null);
            setErrorMessage('');

            // ✨ Smart Estimation Call
            estimateTime(acceptedFiles[0]);
        }
    }, [estimateTime]);

    const handleDriveSelect = useCallback((dFile: DriveFile) => {
        toast.success(`Selected from Drive: ${dFile.name}`);
        setDriveFile(dFile);
        setFile(null); // Clear local file
        setStatus('ready');
        setJobId(null);
        setProgress(0);
        setDownloadUrl(null);
        setResultFileName('');
        setErrorMessage('');
        setEstimatedTime(30); // Default estimate for drive files
    }, []);

    // Polling for Job Status (For Drive Files)
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status === 'processing' && jobId) {
            timer = setInterval(async () => {
                try {
                    const res = await fetch(`/api/translation/${jobId}`);
                    if (res.ok) {
                        const data = await res.json();
                        // Update progress from server if available
                        if (data.progress) setProgress(data.progress);
                        if (data.remainingSeconds) setEstimatedTime(data.remainingSeconds);

                        if (data.status === 'COMPLETED') {
                            console.log('Job Completed. Data:', data); // Debug Log
                            setStatus('completed');
                            setDownloadUrl(data.translatedFileUrl);
                            console.log('Download URL set to:', data.translatedFileUrl); // Debug Log
                            setResultFileName(`${data.originalFilename || 'translated'}_${targetLang}.docx`); // Fallback extension
                            setProgress(100);
                            setEstimatedTime(0);
                            clearInterval(timer);
                            toast.success("Translation completed!");
                        } else if (data.status === 'FAILED') {
                            setStatus('failed');
                            setErrorMessage('Translation failed on server.');
                            clearInterval(timer);
                            toast.error("Translation failed.");
                        }
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                }
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [status, jobId, targetLang]);

    const handleTranslate = async () => {
        if (!file && !driveFile) return;

        // 1. Upload & Start Processing
        setStatus('uploading');
        setProgress(5);
        setErrorMessage('');

        // Initial Estimated Time from Smart Hook
        const initialDuration = estimation.estimatedSeconds || 30; // Fallback 30s
        setEstimatedTime(initialDuration);

        let currentProgress = 5;
        const startTime = Date.now();
        const progressInterval = setInterval(() => {
            if (status !== 'processing' && status !== 'uploading') return;

            const elapsed = (Date.now() - startTime) / 1000;
            const duration = initialDuration;
            const remaining = Math.max(0, Math.ceil(duration - elapsed));
            setEstimatedTime(remaining);

            if (currentProgress < 90) {
                const step = 90 / (duration * 2);
                currentProgress += Math.max(0.5, step);
                // Only update progress if we are NOT using the Job ID based real progress
                if (!jobId) {
                    setProgress(Math.min(90, Math.round(currentProgress)));
                }
            }
        }, 500);

        try {
            setStatus('processing');

            if (driveFile) {
                // --- Google Drive Flow ---
                const res = await fetch('/api/translation/upload/drive', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileId: driveFile.id,
                        accessToken: driveFile.oauthToken,
                        filename: driveFile.name,
                        mimeType: driveFile.mimeType,
                        sizeBytes: driveFile.sizeBytes
                    }),
                });

                if (!res.ok) {
                    const errorIdx = await res.json();
                    throw new Error(errorIdx.error || 'Drive upload failed');
                }

                const data = await res.json();
                setJobId(data.jobId);

                // Trigger start translation for the job common endpoint
                await fetch(`/api/translation/${data.jobId}/start`, {
                    method: 'POST',
                    body: JSON.stringify({ targetLang, outputFormat: 'docx' }) // Default to docx for now
                });

                // Polling useEffect will take over from here

            } else if (file) {
                // --- Local File FLow (Legacy /api/translate) ---
                const formData = new FormData();
                formData.append('file', file);
                formData.append('targetLang', targetLang);

                const response = await fetch('/api/translate', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Translation failed (${response.status})`);
                }

                // 2. Handle Result (Blob)
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const contentDisposition = response.headers.get('Content-Disposition');
                const filename = contentDisposition?.split('filename="')[1]?.split('"')[0] || `translated_${file.name}`;

                setDownloadUrl(url);
                setResultFileName(filename);
                setProgress(100);
                setEstimatedTime(0);
                setStatus('completed');
            }
        } catch (error: any) {
            console.error(error);
            setErrorMessage(error.message || 'Something went wrong during translation.');
            setStatus('failed');
            setEstimatedTime(null);
        } finally {
            clearInterval(progressInterval);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
        },
        maxFiles: 1,
        disabled: status === 'uploading' || status === 'processing'
    });

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
            {/* Navbar */}
            <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2.5 group cursor-pointer">
                        <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                            <Globe className="w-6 h-6 text-primary" />
                        </div>
                        <span className="font-black text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            {t.nav.brandName}
                        </span>
                    </div>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <div className="hidden md:flex space-x-6">
                            <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">{t.nav.community}</Link>
                            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">{t.nav.pricing}</Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Display Language Selector (Optional Debugging or Override) */}
                            <Select value={uiLang} onValueChange={(v) => setUiLang(v as Locale)}>
                                <SelectTrigger className="w-[80px] h-8 text-xs bg-transparent border-none p-0 focus:ring-0">
                                    <Globe className="w-3 h-3 mr-1" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map((lang) => (
                                        <SelectItem key={lang.code} value={lang.code}>
                                            {lang.short}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Link href="https://github.com/your-repo" target="_blank" className="text-muted-foreground hover:text-foreground">
                                <Github className="w-5 h-5" />
                            </Link>
                            <ModeToggle />
                            <UserMenu />
                        </div>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-20 px-6 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] -z-10 animate-pulse-subtle pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] -z-10 animate-pulse-subtle pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-4xl mx-auto space-y-8 z-10"
                >
                    <div className="inline-flex items-center space-x-2 bg-secondary/50 backdrop-blur-sm border border-border px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-muted-foreground">{t.badge}</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-1.1">
                        {t.title.main}<br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 dark:from-indigo-400 dark:via-blue-400 dark:to-cyan-300 animate-gradient-x">
                            {t.title.highlight}
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
                        {t.description}
                    </p>

                    {/* Language Selector (Always visible when idle/ready to prepare context) */}
                    {(status === 'idle' || status === 'ready') && (
                        <div className="w-full max-w-[200px] mx-auto mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Select value={targetLang} onValueChange={setTargetLang}>
                                <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm border-border h-10 shadow-sm">
                                    <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <SelectValue placeholder={t.selector} />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map((lang) => (
                                        <SelectItem key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </motion.div>

                {/* Persistent Game Ad Area (Always Visible) */}
                <div className="w-full max-w-4xl mt-12 z-20">
                    <PersistentGameAd />
                </div>

                {/* Dropzone & Status Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-full max-w-2xl z-20"
                >
                    {status === 'idle' ? (
                        <div
                            {...getRootProps()}
                            className={`
                                relative group cursor-pointer 
                                rounded-3xl border-2 border-dashed 
                                transition-all duration-300 ease-out
                                h-72 flex flex-col items-center justify-center
                                backdrop-blur-sm bg-white/40 dark:bg-zinc-900/40
                                shadow-lg hover:shadow-xl dark:shadow-none
                                ${isDragActive
                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02]'
                                    : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-white/60 dark:hover:bg-zinc-900/60'}
                            `}
                        >
                            <input {...getInputProps()} />

                            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8 w-full px-6">
                                {/* Local Option */}
                                <div className="group relative flex flex-col items-center">
                                    <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-5 group-hover:opacity-10 transition-opacity" />
                                    <div className="
                                        relative w-56 h-16
                                        bg-background rounded-2xl flex items-center justify-center gap-3
                                        shadow-sm border border-border group-hover:border-primary/40 group-hover:scale-[1.02] transition-all duration-300
                                    ">
                                        <Upload className="w-6 h-6 text-primary" />
                                        <span className="font-bold text-sm tracking-tight text-foreground">{t.nav.local}</span>
                                    </div>
                                    <span className="mt-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300">{t.nav.local}</span>
                                </div>

                                <div className="hidden md:flex items-center gap-2 text-border/40 select-none">
                                    <div className="w-8 h-[1px] bg-current" />
                                    <span className="text-[10px] font-bold">VS</span>
                                    <div className="w-8 h-[1px] bg-current" />
                                </div>

                                {/* Cloud Option */}
                                <div className="group relative flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity" />
                                    <GoogleDrivePicker
                                        onSelect={handleDriveSelect}
                                        onError={(err) => toast.error(`Drive Error: ${err}`)}
                                    />
                                    <span className="mt-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300">{t.nav.cloud}</span>
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-xl font-semibold text-foreground">{t.dropzone.idle}</p>
                                <p className="text-sm text-muted-foreground">{t.dropzone.sub}</p>
                                <div className="flex items-center justify-center gap-2 pt-2">
                                    {['DOCX', 'XLSX', 'PPTX'].map((ext) => (
                                        <span key={ext} className="text-xs font-medium px-2 py-1 bg-secondary rounded text-secondary-foreground">
                                            {ext}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Floating Icons Decoration */}
                            <FileText className="absolute top-10 left-10 w-8 h-8 text-blue-500/10 dark:text-blue-500/20 -rotate-12 group-hover:-rotate-45 transition-transform duration-500" />
                            <FileSpreadsheet className="absolute bottom-10 right-10 w-8 h-8 text-green-500/10 dark:text-green-500/20 rotate-12 group-hover:rotate-45 transition-transform duration-500" />
                        </div>
                    ) : status === 'ready' ? (
                        <div className="relative w-full rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-xl p-8 flex flex-col items-center animate-in zoom-in-95 duration-300">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">{file?.name || driveFile?.name}</h2>
                            <p className="text-muted-foreground mb-8">
                                {((file?.size || driveFile?.sizeBytes || 0) / 1024 / 1024).toFixed(2)} MB
                                {estimation.estimatedSeconds > 0 && (
                                    <span className="ml-2 text-blue-500 font-medium">
                                        (Est. {estimation.estimatedSeconds}s)
                                    </span>
                                )}
                            </p>

                            <button
                                onClick={handleTranslate}
                                className="w-full max-w-sm py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] flex items-center justify-center"
                            >
                                <Zap className="w-5 h-5 mr-2 fill-current" />
                                {t.button.translate}
                            </button>

                            <button
                                onClick={() => { setFile(null); setDriveFile(null); setStatus('idle'); }}
                                className="mt-4 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
                            >
                                {t.nav.backToUpload}
                            </button>
                        </div>
                    ) : (
                        <div className="relative w-full">
                            <GamifiedLoading
                                t={t.loading}
                                status={status}
                                progress={progress}
                                errorMessage={errorMessage}
                                onDownload={() => {
                                    if (downloadUrl) {
                                        // Use Proxy API for reliable download with correct filename
                                        const proxyUrl = `/api/download?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent(resultFileName)}`;

                                        const a = document.createElement('a');
                                        a.href = proxyUrl;
                                        // a.download attribute is not needed when using the proxy, as the server sends Content-Disposition
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);

                                        // Reset state after download
                                        setStatus('idle');
                                        setProgress(0);
                                        setFile(null);
                                        setDriveFile(null); // Clear drive file too
                                    }
                                }}
                            />
                            {/* Estimated Time Overlay */}
                            {(status === 'uploading' || status === 'processing') && estimatedTime !== null && (
                                <div className="absolute -bottom-12 left-0 w-full text-center animate-in fade-in slide-in-from-top-2 duration-700">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t.time.estimated}: <span className="text-foreground font-bold">{estimatedTime}</span> {t.time.seconds}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-6xl w-full px-4">
                    {[
                        { icon: FileIcon, ...t.features.compatibility },
                        { icon: ShieldCheck, ...t.features.format },
                        { icon: Zap, ...t.features.speed }
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (idx * 0.1) }}
                            className="group p-8 rounded-2xl bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/50 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                        >
                            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                                <feature.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg mb-3">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}

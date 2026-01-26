'use client';

import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, FileSpreadsheet, FileIcon, ShieldCheck, Zap } from 'lucide-react';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/ui/Footer';
import { GamifiedLoading } from '@/components/translation/GamifiedLoading';

export default function HomePage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'failed'>('idle');
    const [progress, setProgress] = useState(0);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [resultFileName, setResultFileName] = useState<string>('');

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);

            // 1. Upload & Start Processing
            setStatus('uploading');
            setProgress(10);

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('targetLang', 'ko');

            try {
                // Artificial Delay for "Game Time" (User Request)
                const progressInterval = setInterval(() => {
                    setProgress((prev) => {
                        if (prev >= 90) return prev;
                        return prev + 5; // Slowly increment
                    });
                }, 500);

                setStatus('processing');

                const response = await fetch('/api/translate', {
                    method: 'POST',
                    body: formData,
                });

                clearInterval(progressInterval);

                if (!response.ok) throw new Error('Translation failed');

                // 2. Handle Result (Blob)
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const contentDisposition = response.headers.get('Content-Disposition');
                const filename = contentDisposition?.split('filename="')[1]?.split('"')[0] || `translated_${selectedFile.name}`;

                setDownloadUrl(url);
                setResultFileName(filename);
                setProgress(100);
                setStatus('completed');

            } catch (error) {
                console.error(error);
                setStatus('failed');
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            'application/x-hwp': ['.hwp'],
            'application/haansofthwp': ['.hwp']
        },
        maxFiles: 1,
        disabled: status === 'uploading' || status === 'processing'
    });

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
            {/* Navbar (Temporary inline) */}
            <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl tracking-tighter">DocTranslator</div>
                    <nav className="flex space-x-6 text-sm font-medium">
                        <Link href="/community" className="hover:text-gray-500 transition">Community</Link>
                        <Link href="/admin" className="hover:text-gray-500 transition">Admin</Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-20 px-6 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse-subtle" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-3xl mx-auto space-y-6"
                >
                    <div className="inline-flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-3 py-1 text-xs font-medium mb-4">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>Preserve Formatting 100%</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                        Translation, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                            Unbroken.
                        </span>
                    </h1>

                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Translate Word, Excel, PowerPoint, and HWP documents while keeping your layout, fonts, and images exactly where they belong.
                    </p>
                </motion.div>

                {/* Dropzone OR Gamified Loading */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-full max-w-2xl mt-16"
                >
                    {status === 'idle' ? (
                        <div
                            {...getRootProps()}
                            className={`
                relative group cursor-pointer 
                rounded-2xl border-2 border-dashed 
                transition-all duration-300 ease-out
                h-64 flex flex-col items-center justify-center
                backdrop-blur-sm bg-white/50 dark:bg-zinc-900/50
                ${isDragActive
                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02]'
                                    : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-white/80 dark:hover:bg-zinc-900/80'}
              `}
                        >
                            <input {...getInputProps()} />

                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Upload className={`w-8 h-8 text-zinc-500 dark:text-zinc-400 ${isDragActive ? 'animate-bounce' : ''}`} />
                            </div>

                            {file ? (
                                <div className="text-center">
                                    <p className="font-semibold text-lg">{file.name}</p>
                                    <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div className="text-center space-y-2">
                                    <p className="text-lg font-medium">Drop your file here, or click to browse</p>
                                    <p className="text-sm text-gray-400">Supports DOCX, XLSX, PPTX, HWP</p>
                                </div>
                            )}

                            {/* Decoration Icons */}
                            <FileText className="absolute top-8 left-8 w-6 h-6 text-blue-500/20 -rotate-12" />
                            <FileSpreadsheet className="absolute bottom-8 right-8 w-6 h-6 text-green-500/20 rotate-12" />
                        </div>
                    ) : (
                        <GamifiedLoading
                            status={status}
                            progress={progress}
                            onDownload={() => {
                                if (downloadUrl) {
                                    const a = document.createElement('a');
                                    a.href = downloadUrl;
                                    a.download = resultFileName;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    // Reset state after download
                                    setStatus('idle');
                                    setProgress(0);
                                    setFile(null);
                                }
                            }}
                        />
                    )}
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-6xl w-full">
                    {[
                        { icon: FileIcon, title: "Native Support", desc: "Built for Office & HWP. We don't convert to PDF first." },
                        { icon: ShieldCheck, title: "Zero Layout Shift", desc: "Tables, charts, and images stay perfectly aligned." },
                        { icon: Zap, title: "Lighting Fast", desc: "Optimized parsing engine processes huge files in seconds." }
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (idx * 0.1) }}
                            className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 transition-colors"
                        >
                            <div className="w-10 h-10 bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 shadow-sm">
                                <feature.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}

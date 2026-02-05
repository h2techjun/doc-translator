'use client';

import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, FileSpreadsheet, FileIcon, ShieldCheck, Zap, Globe } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/ui/Footer';
import { GamifiedLoading } from '@/components/translation/GamifiedLoading';
import { GameAd } from '@/components/ads/GameAd';
import { GoogleAd } from '@/components/ads/GoogleAd';
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
import { useUrlSync } from '@/hooks/use-url-sync';

import { type DriveFile, GoogleDrivePicker } from '@/components/drive/GoogleDrivePicker';
import { toast } from 'sonner';
import { CostEstimationModal } from '@/components/translation/CostEstimationModal';
import { POINT_COSTS } from "@/lib/payment/types";

export default function HomePage() {
    const router = useRouter();
    // 파일 및 처리 상태 관리를 위한 상태값
    const [file, setFile] = useState<File | null>(null);
    const [driveFile, setDriveFile] = useState<DriveFile | null>(null);
    const [jobId, setJobId] = useState<string | null>(null); // 드라이브/작업 기반 처리를 위한 ID
    const [status, setStatus] = useState<'idle' | 'ready' | 'uploading' | 'processing' | 'completed' | 'failed'>('idle');
    const [progress, setProgress] = useState(0);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [resultFileName, setResultFileName] = useState<string>('');
    const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isEstimationOpen, setIsEstimationOpen] = useState(false);

    // 🌏 글로벌 Geo-Smart 컨텍스트 훅 (중앙 상태 관리)
    // 이 훅은 지역, 통화, PPP, UI 언어 및 대상 언어를 중앙에서 관리합니다.
    const {
        region, currency, currencySymbol, pppFactor, // 불변 값 (가격 정책)
        uiLang, targetLang,                          // 가변 값 (사용자 기본 설정)
        t,                                           // 번역 데이터 (자동 동기화)
        setUiLang, setTargetLang,
        isLoading: isGeoLoading
    } = useGeoSmart(); // IP 기반으로 위치를 파악하며, 기본값은 한국어입니다.

    // 🔗 URL 기반 언어 동기화 (pSEO 지원)
    useUrlSync();

    const { estimation, estimateTime } = useSmartEstimation();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            setFile(acceptedFiles[0]);
            setDriveFile(null); // Clear drive file
            setStatus('ready');
            // 상태 초기화
            setJobId(null);
            setProgress(0);
            setDownloadUrl(null);
            setResultFileName('');
            setEstimatedTime(null);
            setErrorMessage('');

            // ✨ 스마트 예상 시간 호출
            estimateTime(acceptedFiles[0]);
        }
    }, [estimateTime]);

    const handleDriveSelect = useCallback((dFile: DriveFile) => {
        toast.success(t.nav.driveSelected.replace('{name}', dFile.name));
        setDriveFile(dFile);
        setFile(null); // 로컬 파일 초기화
        setStatus('ready');
        setJobId(null);
        setProgress(0);
        setDownloadUrl(null);
        setResultFileName('');
        setErrorMessage('');
        setEstimatedTime(30); // 드라이브 파일의 기본 예상 시간
    }, []);

    // 작업 상태 폴링 (드라이브 파일 처리용)
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status === 'processing' && jobId) {
            timer = setInterval(async () => {
                try {
                    const res = await fetch(`/api/translation/${jobId}`);
                    if (res.ok) {
                        const data = await res.json();
                        // 서버로부터 진행 상황 업데이트
                        if (data.progress) setProgress(data.progress);
                        if (data.remainingSeconds) setEstimatedTime(data.remainingSeconds);

                        if (data.status === 'COMPLETED') {
                            console.log('작업 완료. 데이터:', data); // 디버그 로그
                            setStatus('completed');
                            setDownloadUrl(data.translatedFileUrl);
                            console.log('다운로드 URL 설정:', data.translatedFileUrl); // 디버그 로그
                            setResultFileName(`${data.originalFilename || 'translated'}_${targetLang}.docx`); // 기본 확장자 폴백
                            setProgress(100);
                            setEstimatedTime(0);
                            clearInterval(timer);
                            toast.success(t.loading.completed.title);
                        } else if (data.status === 'FAILED') {
                            setStatus('failed');
                            // 🔧 Use server-provided error message if available, otherwise fallback to generic dictionary message
                            setErrorMessage(data.error || data.message || t.loading.failed.desc);
                            clearInterval(timer);
                            toast.error(data.error || t.nav.translateFailed);
                        }
                    }
                } catch (error) {
                    console.error("폴링 에러:", error);
                }
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [status, jobId, targetLang]);

    const handleTranslate = async () => {
        if (!file && !driveFile) return;

        // 1. 업로드 및 처리 시작
        setStatus('uploading');
        setProgress(5);
        setErrorMessage('');

        // 스마트 훅으로부터 초기 예상 시간 획득
        const initialDuration = estimation.estimatedSeconds || 30; // 폴백 30초
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
                // 작업 ID 기반의 실제 진행률을 사용하지 않는 경우에만 수동 업데이트
                if (!jobId) {
                    setProgress(Math.min(90, Math.round(currentProgress)));
                }
            }
        }, 500);

        try {
            setStatus('processing');

            if (driveFile) {
                // --- 구글 드라이브 워크플로우 ---
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
                    throw new Error(errorIdx.error || '드라이브 업로드 실패');
                }

                const data = await res.json();
                setJobId(data.jobId);

                // 공통 작업 엔드포인트에 대한 번역 시작 트리거
                await fetch(`/api/translation/${data.jobId}/start`, {
                    method: 'POST',
                    body: JSON.stringify({ targetLang, outputFormat: 'docx' }) // 현재는 기본적으로 docx 사용
                });

                // 이후 처리는 polling useEffect가 담당함

            } else if (file) {
                // --- 로컬 파일 워크플로우 (Async Queue) ---
                const formData = new FormData();
                formData.append('file', file);
                formData.append('targetLang', targetLang);

                // 1. 업로드 및 Job 생성 (Pending)
                const uploadRes = await fetch('/api/translation/upload/local', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) {
                    const errorData = await uploadRes.json().catch(() => ({}));
                    throw new Error(errorData.error || `업로드 실패 (${uploadRes.status})`);
                }

                const { jobId: newJobId } = await uploadRes.json();
                setJobId(newJobId); // 시작과 동시에 폴링 훅(useEffect) 활성화

                // 2. 번역 프로세스 트리거 (Fire & Forget 가능하지만 에러 체크 권장)
                // Vercel Timeout 방지를 위해 await를 하되, 서버가 60초 내 응답하도록 설계됨.
                // 만약 서버가 응답 없이 백그라운드 처리한다면 여기서 await이 타임아웃 날 수 있으나,
                // 현재 구조는 60초 내 완료를 목표로 하므로 await 유지.
                // (만약 60초 넘으면 클라이언트에서 에러 처리되겠지만, 폴링이 계속 돌고 있다면 문제 없음)
                fetch(`/api/translation/${newJobId}/start`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ outputFormat: 'docx' })
                }).catch(err => console.warn("Trigger warning:", err));

                // 상태를 processing으로 변경하여 UI가 "처리중"임을 알림
                setStatus('processing');
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

                    <h1 className="text-[8.5vw] xs:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.15] md:leading-[1.1]">
                        {t.title.main}<br className="hidden md:block" />
                        <span className="inline-block whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 dark:from-indigo-400 dark:via-blue-400 dark:to-cyan-300 animate-gradient-x px-1">
                            {t.title.highlight}
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
                        {t.description}
                    </p>

                    {/* ✨ Pricing Policy Banner */}
                    <div className="mt-8 bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="w-10 h-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.pricingRule.title}</h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium whitespace-pre-wrap">
                                    {t.pricingRule.base
                                        .replace('{base}', POINT_COSTS.BASE_COST.toString())
                                        .replace('{basePages}', POINT_COSTS.BASE_PAGES.toString())}
                                    {' + '}
                                    {t.pricingRule.extra
                                        .replace('{nextPage}', (POINT_COSTS.BASE_PAGES + 1).toString())
                                        .replace('{extra}', POINT_COSTS.ADDITIONAL_PAGE_COST.toString())}
                                </p>
                            </div>
                        </div>

                    </div>
                </motion.div>

                {/* Persistent Game Ad Area (Always Visible) */}
                <div className="w-full max-w-4xl mt-12 z-20">
                    <GameAd />
                </div>

                {/* Language Selector (Always visible when idle/ready to prepare context) */}
                {(status === 'idle' || status === 'ready') && (
                    <div className="w-full max-w-[240px] mx-auto py-10 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 z-20">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block text-center">
                            {t.selectorLabel || "번역할 언어 선택"}
                        </label>
                        <Select value={targetLang} onValueChange={setTargetLang}>
                            <SelectTrigger className="w-full bg-background/50 backdrop-blur-md border-border h-12 shadow-sm rounded-xl ring-offset-background transition-all hover:bg-background/80">
                                <Globe className="w-4 h-4 mr-2 text-primary animate-pulse-subtle" />
                                <SelectValue placeholder={t.selector} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {LANGUAGES.map((lang) => (
                                    <SelectItem key={lang.code} value={lang.code} className="rounded-lg">
                                        {lang.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

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
                                min-h-[22rem] md:h-72 flex flex-col items-center justify-center py-10 md:py-0
                                backdrop-blur-sm bg-white/40 dark:bg-zinc-900/40
                                shadow-lg hover:shadow-xl dark:shadow-none
                                ${isDragActive
                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02]'
                                    : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-white/60 dark:hover:bg-zinc-900/60'}
                            `}
                        >
                            <input {...getInputProps()} />

                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 w-full px-6">
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

                            <div className="text-center space-y-2 px-4">
                                <p className="text-xl font-semibold text-foreground leading-tight">{t.dropzone.idle}</p>
                                <p className="text-sm text-muted-foreground">{t.dropzone.sub}</p>
                                <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                                    {['DOCX', 'XLSX', 'PPTX'].map((ext) => (
                                        <span key={ext} className="text-[10px] md:text-xs font-bold px-2.5 py-1 bg-secondary rounded-full text-secondary-foreground border border-border/50">
                                            {ext}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Floating Icons Decoration - Hidden on mobile to avoid overlap */}
                            <FileText className="absolute top-10 left-10 w-8 h-8 text-blue-500/10 dark:text-blue-500/20 -rotate-12 group-hover:-rotate-45 transition-transform duration-500 hidden sm:block" />
                            <FileSpreadsheet className="absolute bottom-10 right-10 w-8 h-8 text-green-500/10 dark:text-green-500/20 rotate-12 group-hover:rotate-45 transition-transform duration-500 hidden sm:block" />
                        </div>
                    ) : status === 'ready' ? (
                        <div className="relative w-full rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-xl p-8 flex flex-col items-center animate-in zoom-in-95 duration-300">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold mb-2 break-all px-4 text-center">{file?.name || driveFile?.name}</h2>
                            <p className="text-muted-foreground mb-8 text-sm">
                                {((file?.size || driveFile?.sizeBytes || 0) / 1024 / 1024).toFixed(2)} MB
                                {estimation.estimatedSeconds > 0 && (
                                    <span className="ml-2 text-blue-500 font-medium italic">
                                        (Est. {estimation.estimatedSeconds}s)
                                    </span>
                                )}
                            </p>

                            {/* Estimated Point Cost */}
                            {file && (
                                <div className="mb-6 px-4 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-blue-600 fill-current" />
                                    <span className="text-[11px] sm:text-xs font-bold text-blue-700 dark:text-blue-300">
                                        Point Requirement: <span className="underline underline-offset-4 decoration-blue-500/30">Dynamic (Based on Page Count)</span>
                                    </span>
                                </div>
                            )}

                            {/* Cost Estimation Modal */}
                            <CostEstimationModal
                                isOpen={isEstimationOpen}
                                onClose={() => setIsEstimationOpen(false)}
                                onConfirm={() => {
                                    setIsEstimationOpen(false);
                                    handleTranslate();
                                }}
                                onCharge={() => {
                                    setIsEstimationOpen(false);
                                    router.push('/pricing');
                                }}
                                file={file}
                                driveFile={driveFile}
                            />

                            <button
                                onClick={() => setIsEstimationOpen(true)}
                                className="w-full max-w-sm py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] flex items-center justify-center"
                            >
                                <Zap className="w-5 h-5 mr-2 fill-current" />
                                {t.button.translate}
                                <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">Check Cost</span>
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
                                        if (downloadUrl.startsWith('blob:')) {
                                            const a = document.createElement('a');
                                            a.href = downloadUrl;
                                            a.download = resultFileName;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                        } else {
                                            const proxyUrl = `/api/download?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent(resultFileName)}`;
                                            const a = document.createElement('a');
                                            a.href = proxyUrl;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                        }
                                        setStatus('idle');
                                        setProgress(0);
                                        setFile(null);
                                        setDriveFile(null);
                                        // 🔄 Refresh page to update points after translation
                                        window.location.reload();
                                    }
                                }}
                            />
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

                {/* Google Ad Area (Between Translation Object and Features) */}
                <div className="w-full max-w-4xl z-20 mt-8">
                    <GoogleAd />
                </div>

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

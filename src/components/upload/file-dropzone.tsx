
'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, Loader2, X, CheckCircle2, Download, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FileDropzoneProps {
    onUploadComplete?: (jobId: string) => void;
}

/**
 * 📂 파일 업로드 및 변환 관리 컴포넌트 (Enhanced File Dropzone)
 * 
 * 기능:
 * 1. 파일 드래그 앤 드롭
 * 2. 언어 및 출력 형식 선택
 * 3. 업로드 및 변환 상태 브로드캐스팅 (Polling)
 * 4. 원본파일명 + 언어코드 규칙의 다운로드 지원
 */
export function FileDropzone({ onUploadComplete }: FileDropzoneProps) {
    const t = useTranslations('Index');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('IDLE'); // IDLE, UPLOADING, PROCESSING, COMPLETED, FAILED
    const [progress, setProgress] = useState(0);
    const [targetLang, setTargetLang] = useState('en');
    const [outputFormat, setOutputFormat] = useState('pdf');
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [remainingTime, setRemainingTime] = useState<number | null>(null); // ETA (seconds)

    // 작업 상태 폴링 (Polling for job status)
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status === 'PROCESSING' && jobId) {
            timer = setInterval(async () => {
                try {
                    const res = await fetch(`/api/translation/${jobId}`);
                    if (res.ok) {
                        const data = await res.json();

                        // 진행률 및 ETA 업데이트 (서버에서 계산된 값 사용)
                        if (data.progress) setProgress(data.progress);
                        if (data.remainingSeconds) setRemainingTime(data.remainingSeconds);

                        if (data.status === 'COMPLETED') {
                            setStatus('COMPLETED');
                            setDownloadUrl(data.translatedFileUrl);
                            setProgress(100);
                            setRemainingTime(null);
                            clearInterval(timer);
                            toast.success(t('completed'));
                        } else if (data.status === 'FAILED') {
                            setStatus('FAILED');
                            setRemainingTime(null);
                            clearInterval(timer);
                            toast.error(t('failed'));
                        }
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                }
            }, 1000); // 1초마다 확인으로 변경 (실시간성 강화)
        }
        return () => clearInterval(timer);
    }, [status, jobId, t]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);
            setDownloadUrl(null);
            setStatus('IDLE');
            setProgress(0);

            // 파일 타입별 기본 출력 형식 자동 설정
            if (selectedFile.type.includes('spreadsheetml')) {
                setOutputFormat('xlsx');
            } else if (selectedFile.type.includes('presentationml')) {
                setOutputFormat('pptx');
            } else if (selectedFile.type === 'application/pdf') {
                setOutputFormat('pdf');
            } else {
                setOutputFormat('docx');
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        disabled: uploading || status === 'PROCESSING',
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
        },
    });

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setStatus('UPLOADING');
        setProgress(10);

        try {
            // 1. 업로드 URL 요청
            const res = await fetch('/api/translation/upload', {
                method: 'POST',
                body: JSON.stringify({
                    filename: file.name,
                    fileType: file.type,
                    size: file.size,
                    targetLang,
                }),
            });

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error("Please login first to translate documents.");
                    return;
                }

                let errorMessage = 'Failed to get upload URL';
                try {
                    const errorData = await res.json();
                    if (errorData.details) {
                        errorMessage = `Upload Failed: ${errorData.details}`;
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    console.warn("Failed to parse error response", e);
                }

                throw new Error(errorMessage);
            }

            const { uploadUrl, jobId: newJobId } = await res.json();
            setJobId(newJobId);
            setProgress(40);

            // 2. S3 업로드
            await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type },
            });

            setProgress(70);

            // 3. 변환 시작
            const startRes = await fetch(`/api/translation/${newJobId}/start`, {
                method: 'POST',
                body: JSON.stringify({
                    targetLang,
                    outputFormat
                }),
            });

            if (!startRes.ok) throw new Error('Failed to start translation');

            setStatus('PROCESSING');
            setProgress(80);
            toast.info(t('processing'));
            if (onUploadComplete) onUploadComplete(newJobId);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t('error'));
            setStatus('FAILED');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = () => {
        if (!downloadUrl || !file) return;

        const originalName = file.name;
        const lastDot = originalName.lastIndexOf('.');
        const nameWithoutExt = lastDot !== -1 ? originalName.substring(0, lastDot) : originalName;
        const ext = downloadUrl.split('?')[0].split('.').pop();

        const newName = `${nameWithoutExt}_${targetLang.toUpperCase()}.${ext}`;

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', newName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 focus:outline-none",
                    isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/25 hover:border-primary/50",
                    (uploading || status === 'PROCESSING') && "pointer-events-none opacity-50"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-6">
                    <div className="p-6 bg-background rounded-2xl shadow-xl ring-1 ring-border">
                        {status === 'PROCESSING' ? (
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        ) : status === 'COMPLETED' ? (
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                        ) : (
                            <UploadCloud className="h-10 w-10 text-muted-foreground" />
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-xl tracking-tight">
                            {status === 'PROCESSING' ? t('processing') :
                                status === 'COMPLETED' ? t('completed') :
                                    file ? file.name : t('upload')}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            {isDragActive ? "Drop it now!" : t('dragDrop')}
                        </p>
                    </div>
                </div>
            </div>

            {file && status !== 'COMPLETED' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-card border rounded-2xl shadow-sm animate-in zoom-in-95 duration-300">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {t('targetLanguage')}
                        </Label>
                        <Select value={targetLang} onValueChange={setTargetLang} disabled={status !== 'IDLE'}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ko">{t('languages.ko')}</SelectItem>
                                <SelectItem value="en">{t('languages.en')}</SelectItem>
                                <SelectItem value="zh">{t('languages.zh')}</SelectItem>
                                <SelectItem value="ja">{t('languages.ja')}</SelectItem>
                                <SelectItem value="th">{t('languages.th')}</SelectItem>
                                <SelectItem value="vi">{t('languages.vi')}</SelectItem>
                                <SelectItem value="ru">{t('languages.ru')}</SelectItem>
                                <SelectItem value="hi">{t('languages.hi')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {t('outputFormat')}
                        </Label>
                        <Select value={outputFormat} onValueChange={setOutputFormat} disabled={status !== 'IDLE'}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {file?.type.includes('spreadsheetml') ? (
                                    <SelectItem value="xlsx">{t('formats.xlsx')}</SelectItem>
                                ) : file?.type.includes('presentationml') ? (
                                    <SelectItem value="pptx">{t('formats.pptx')}</SelectItem>
                                ) : (
                                    <>
                                        <SelectItem value="pdf">{t('formats.pdf')}</SelectItem>
                                        <SelectItem value="docx">{t('formats.docx')}</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="md:col-span-2 pt-2">
                        <Button
                            className="w-full rounded-xl py-6 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all text-white bg-blue-600 hover:bg-blue-700"
                            onClick={handleUpload}
                            disabled={status !== 'IDLE'}
                        >
                            <Languages className="mr-2 h-5 w-5" />
                            {t('translate')}
                        </Button>
                    </div>
                </div>
            )}

            {(status === 'PROCESSING' || uploading || status === 'COMPLETED') && (
                <div className="p-6 border rounded-2xl bg-card shadow-sm space-y-4 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-bold truncate max-w-[200px]">{file?.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                                    {status === 'COMPLETED' ? 'Ready' : 'In Progress'}
                                </p>
                            </div>
                        </div>
                        {status === 'COMPLETED' && (
                            <Button size="sm" onClick={handleDownload} className="rounded-xl px-4 font-bold bg-green-600 hover:bg-green-700 text-white">
                                <Download className="mr-2 h-4 w-4" />
                                {t('download')}
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold font-mono">
                            <span>{status}</span>
                            {remainingTime !== null && (
                                <span className="text-blue-500 animate-pulse">
                                    Time left: ~{Math.ceil(remainingTime)}s
                                </span>
                            )}
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 rounded-full overflow-hidden" />
                    </div>
                </div>
            )}
        </div>
    );
}

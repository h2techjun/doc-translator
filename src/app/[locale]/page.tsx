
import { useTranslations } from 'next-intl';
import { FileDropzone } from '@/components/upload/file-dropzone';

export default function Index() {
    const t = useTranslations('Index');

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-gradient-to-b from-background to-muted/20">


            <div className="relative flex place-items-center mb-16">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 p-2">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t('description')}
                    </p>
                </div>
            </div>

            <div className="w-full max-w-4xl">
                <div className="grid gap-8">
                    <FileDropzone />
                </div>
            </div>

            <div className="mt-20 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left gap-4">
                {/* Feature cards could go here */}
            </div>
        </main>
    );
}

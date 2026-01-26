
import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Languages, Mail } from "lucide-react";

/**
 * 🔑 로그인 페이지 (Login Page)
 * 
 * 구글, 애플, 이메일 매직 링크 로그인을 지원하는 커스텀 로그인 화면입니다.
 */
export default async function LoginPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const session = await auth();
    const t = await getTranslations('Login');

    // 이미 로그인되어 있다면 메인으로 리다이렉트
    if (session) {
        redirect(`/${locale}`);
    }

    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
            <Card className="w-full max-w-md shadow-2xl border-border/50 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <CardHeader className="space-y-4 text-center pt-10">
                    <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner">
                        <Languages className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl font-bold tracking-tight">{t('title')}</CardTitle>
                        <CardDescription className="text-base">
                            {t('description')}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pb-10 px-8">
                    {/* 소셜 로그인 버튼 */}
                    <div className="grid gap-3">
                        <form action={async () => {
                            "use server";
                            await signIn("google", { redirectTo: `/${locale}` });
                        }}>
                            <Button variant="outline" className="w-full py-6 rounded-xl font-bold border-border/50 hover:bg-muted/50 transition-all flex items-center justify-center gap-3">
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                {t('google')}
                            </Button>
                        </form>

                        <form action={async () => {
                            "use server";
                            await signIn("apple", { redirectTo: `/${locale}` });
                        }}>
                            <Button variant="outline" className="w-full py-6 rounded-xl font-bold border-border/50 hover:bg-muted/50 transition-all flex items-center justify-center gap-3">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.057 1.8c-.89.1-1.89.6-2.49 1.4-.6.7-1.1 1.7-1 2.7.9.1 1.9-.5 2.5-1.3.6-.8 1.1-1.8 1-2.8zm.5 4.3c-1.1 0-2.1.7-2.7.7-.6 0-1.4-.6-2.3-.6-1.1 0-2.2.6-2.8 1.6-1.2 2-1 4.9.2 6.8.6.9 1.3 1.9 2.2 1.9.8 0 1.2-.5 2.2-.5 1 0 1.3.5 2.2.5s1.5-.9 2.1-1.8c.7-1 .9-2 .9-2.1l-.1-.1c-1.3-.5-2.2-1.6-2.2-3 0-1.4 1-2.5 2.3-3-.1-.1-.3-.1-.4-.1zM12 21.2c-1.1 0-2.2-.3-3.2-.8-1-.5-1.8-1.2-2.5-2.1-.7-.9-1.2-1.9-1.5-3-.3-1.1-.4-2.2-.4-3.4 0-1.2.2-2.3.6-3.4.4-1.1 1-2 1.8-2.8.8-.8 1.7-1.4 2.8-1.8 1.1-.4 2.3-.6 3.5-.6 1.2 0 2.4.2 3.5.7 1.1.5 2 1.1 2.8 2 .8.9 1.4 1.9 1.8 3 .4 1.1.6 2.2.6 3.4 0 1.2-.2 2.3-.6 3.4-.4 1.1-1 2-1.8 2.9-.8.9-1.7 1.6-2.8 2.1-1.1.5-2.3.7-3.5.7z" />
                                </svg>
                                {t('apple')}
                            </Button>
                        </form>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border/50" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-3 text-muted-foreground font-semibold tracking-widest leading-none py-1">
                                {t('or')}
                            </span>
                        </div>
                    </div>

                    {/* 이메일 로그인 폼 */}
                    <form action={async (formData) => {
                        "use server";
                        const email = formData.get("email") as string;
                        await signIn("nodemailer", { email, redirectTo: `/${locale}` });
                    }} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-bold pl-1">{t('emailLabel')}</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder={t('emailPlaceholder')}
                                required
                                className="py-6 rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all"
                            />
                        </div>
                        <Button type="submit" className="w-full py-6 rounded-xl font-bold text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all">
                            <Mail className="mr-2 h-5 w-5" />
                            {t('emailButton')}
                        </Button>
                    </form>

                    <div className="pt-4">
                        <form action={async () => {
                            "use server";
                            await signIn("dev-login", { redirectTo: `/${locale}` });
                        }}>
                            <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary transition-colors text-xs font-bold">
                                🛠️ {t('devLogin')}
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

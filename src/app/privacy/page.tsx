"use client";

import { useGeoSmart } from "@/context/geo-smart-context";

export default function PrivacyPage() {
    const { t } = useGeoSmart();

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">개인정보 처리방침 (Privacy Policy)</h1>

            <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">1. 수집하는 개인정보 항목</h2>
                    <p>우리 서비스는 번역 작업을 처리하기 위해 사용자가 업로드한 문서(DOCX, PPTX, XLSX 등)를 최소한의 시간 동안 서버에 보유하며, 작업 완료 후 또는 일정 시간이 지나면 자동으로 영구 삭제합니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">2. 쿠키 및 광고 (Cookies & Ads)</h2>
                    <p>본 서비스는 사용자 경험 향상 및 광고 게재를 위해 쿠키를 사용합니다.</p>
                    <ul className="list-disc pl-6 space-y-2 font-bold text-primary">
                        <li>Google AdSense: 구글을 포함한 제3자 제공업체는 사용자의 이전 웹사이트 방문 기록을 기반으로 광고를 게재하기 위해 쿠키를 사용합니다.</li>
                        <li>사용자는 Google 광고 설정(https://www.google.com/settings/ads)을 방문하여 맞춤형 광고를 해제할 수 있습니다.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">3. 데이터 보안</h2>
                    <p>우리는 사용자의 문서를 암호화된 통신(HTTPS)을 통해 전송하며, 번역을 위한 일시적인 처리 외의 목적으로 데이터를 사용하거나 제3자에게 제공하지 않습니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">4. 권리 및 연락처</h2>
                    <p>사용자는 언제든 자신의 데이터에 대한 삭제를 요청할 수 있으며, 관련 문의는 서비스 내 고객 지원이나 이메일을 통해 가능합니다.</p>
                </section>

                <hr className="border-border my-10" />

                <section className="text-sm">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p>© {t.nav.brandName} - AI 기반 서식 보존 번역 서비스</p>
                </section>
            </div>
        </div>
    );
}

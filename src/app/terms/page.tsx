"use client";

import { useGeoSmart } from "@/context/geo-smart-context";

export default function TermsPage() {
    const { t } = useGeoSmart();

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">이용약관 (Terms of Service)</h1>

            <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">1. 서비스 정의</h2>
                    <p>본 서비스는 AI를 활용하여 문서의 서식을 보존하며 번역을 수행하는 도구입니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">2. 사용자의 의무</h2>
                    <p>사용자는 불법적인 목적이나 타인의 저작권을 침해하는 문서를 번역하는 데 서비스를 이용해서는 안 됩니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">3. 책임의 한계</h2>
                    <p>AI 번역 특성상 결과물이 100% 정확하지 않을 수 있으며, 본 서비스는 번역 결과로 인해 발생하는 직접적, 간접적 손해에 대해 책임을 지지 않습니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">4. 광고 게재</h2>
                    <p>본 서비스는 무료 이용을 지원하기 위해 구글 애드센스 등 광고를 게재할 수 있습니다.</p>
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

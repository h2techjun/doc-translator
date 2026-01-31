export type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'es' | 'fr';

export const i18n: Record<Locale, {
    badge: string;
    title: { main: string; highlight: string };
    description: string;
    dropzone: { idle: string; sub: string; support: string };
    features: {
        compatibility: { title: string; desc: string };
        format: { title: string; desc: string };
        speed: { title: string; desc: string };
    };
    pricingRule: { title: string; base: string; extra: string; guestBadge: string };
    pricingPage: {
        hero: { title: string; highlight: string; subtitle: string; };
        tiers: {
            guest: { name: string; price: string; desc: string; limit: string; button: string; features: string[] };
            bronze: { name: string; price: string; desc: string; bonus: string; button: string; features: string[] };
            silver: { name: string; priceKRW: string; priceUSD: string; desc: string; bonus: string; button: string; features: string[] };
            gold: { name: string; price: string; unit: string; desc: string; vip: string; button: string; features: string[] };
        };
        policy: {
            title: string;
            pointTitle: string;
            pointItems: string[];
            adTitle: string;
            adItems: string[];
            disclaimer: string;
        };
        features: {
            support: { title: string; desc: string; };
            security: { title: string; desc: string; };
            fidelity: { title: string; desc: string; };
        };
    };
    selector: string;
    selectorLabel: string;
    button: { translate: string };
    time: { estimated: string; seconds: string };
    loading: {
        uploading: { title: string; desc: string };
        processing: { title: string; desc: string };
        completed: { title: string; desc: string };
        failed: { title: string; desc: string };
        success: { title: string; desc: string };
        download: string;
    };
    nav: {
        community: string;
        pricing: string;
        login: string;
        signup: string;
        pointsHold: string;
        adminDashboard: string;
        myHistory: string;
        betaBenefits: string;
        boostTitle: string;
        boostDesc: string;
        watchAd: string;
        logout: string;
        loggedOut: string;
        backToUpload: string;
        local: string;
        cloud: string;
        brandName: string;
        tierBronze: string;
        tierSilver: string;
        tierGold: string;
        memberLogin: string;
    };
    community: {
        title: string;
        write: string;
        tabs: {
            free: string;
            inquiry: string;
            notice: string;
        };
        noPosts: string;
        noticeFixed: string;
        postedBy: string;
        views: string;
    };
    adReward: {
        title: string;
        button: string;
        loading: string;
        success: string;
    };
    auth: {
        signinTitle: string;
        signinDesc: string;
        emailLabel: string;
        passwordLabel: string;
        emailPlaceholder: string;
        passwordPlaceholder: string;
        guestLogin: string;
        forgotPassword: string;
        submitLogin: string;
        submitSignup: string;
        toSignup: string;
        toSignin: string;
        social: string;
        alertUnconfirmed: string;
        alertUnconfirmedDesc: string;
        btnResend: string;
        btnSending: string;
        btnLoginOther: string;
        signupTitle: string;
        signupDesc: string;
        sentTo: string;
        checkEmailTitle: string;
        checkEmailDesc: string;
        backWithEmail: string;
        alreadyHaveAccount: string;
        rememberMe?: string;
    };
    admin: {
        dashboard: string;
        users: string;
        jobs: string;
        security: string;
        shutdown: string;
        userManagement: string;
        totalUsers: string;
        translationJobs: string;
        recentActivity: string;
        banSystem: string;
        banDesc: string;
        verifying: string;
    };
}> = {
    ko: {
        badge: "서식 보존율 100% 보장",
        title: { main: "서식은 그대로,", highlight: "언어만 완벽하게." },
        description: "복잡한 표, 차트, 이미지가 포함된 문서도 걱정 마세요.\nAI가 문맥을 파악하여 가장 자연스러운 번역을 제공합니다.",
        dropzone: { idle: "여기로 파일을 드래그하세요", sub: "또는 클릭하여 파일 선택", support: "DOCX, XLSX, PPTX 지원" },
        features: {
            compatibility: { title: "완벽한 호환성", desc: "Microsoft Office 문서(Word, Excel, PPT)를 포맷 변환 없이 원본 그대로 처리합니다." },
            format: { title: "서식 100% 보존", desc: "표, 차트, 스타일이 깨지지 않습니다. 디자이너가 작업한 듯 깔끔합니다." },
            speed: { title: "압도적인 속도", desc: "대용량 문서도 수초 내에 분석하고 번역을 완료합니다." }
        },
        pricingPage: {
            hero: { title: "요금제", highlight: "선택하기", subtitle: "AI 번역 엔진으로 글로벌 커뮤니케이션을 확장하세요." },
            tiers: {
                guest: { name: "게스트", price: "무료", desc: "로그인 없이 사용", limit: "2page", button: "게스트 모드 체험", features: ["Word/Excel/PPT 번역", "2page"] },
                bronze: { name: "브론즈", price: "무료", desc: "기본 멤버십", bonus: "가입 보너스: 50P", button: "무료 가입", features: ["커뮤니티 지원"] },
                silver: { name: "실버", priceKRW: "3,000원", priceUSD: "$5.00", desc: "50P 받고 업그레이드", bonus: "즉시 50P 지급", button: "50P 충전", features: ["인증 배지", "빠른 처리"] },
                gold: { name: "골드", price: "100,000", unit: "원", desc: "누적 결제", vip: "VIP 회원", button: "자동 업그레이드", features: ["최우선 처리", "전담 지원"] }
            },
            policy: {
                title: "포인트 및 운영 정책",
                pointTitle: "1. 포인트 정책",
                pointItems: ["가입 보상: 가입 즉시 50P 지급.", "기본 비용: 문서당 {base}포인트 ({basePages}page).", "추가 비용: {nextPage}page부터 page당 {extra}P 추가.", "게스트 모드: 게스트는 2page 무료."],
                adTitle: "2. 광고 및 충전 정책",
                adItems: ["무료 충전: 포인트가 부족할 경우 광고 시청으로 포인트 획득 가능.", "보상: 광고 시청 시 5P 지급.", "무제한: 베타 기간 동안 광고 보상은 무제한입니다.", "서비스: 광고 수익은 서버 및 AI 엔진 비용으로 사용됩니다."],
                disclaimer: "* 베타 기간 동안 정책이 변경될 수 있습니다. 포인트는 환불되지 않습니다."
            },
            features: {
                support: { title: "글로벌 지원", desc: "20개 이상의 언어를 지원하며 문화적으로 민감한 AI를 사용합니다." },
                security: { title: "엔터프라이즈 보안", desc: "모든 문서에 은행 수준의 암호화 적용." },
                fidelity: { title: "높은 충실도", desc: "모든 서식, 차트, 다이어그램을 보존합니다." }
            }
        },
        community: {
            title: "커뮤니티",
            write: "글쓰기",
            tabs: {
                free: "자유게시판",
                inquiry: "문의게시판",
                notice: "공지사항"
            },
            noPosts: "작성된 글이 없습니다. 첫 글을 남겨보세요!",
            noticeFixed: "고정 공지",
            postedBy: "작성자",
            views: "조회수"
        },
        adReward: {
            title: "광고를 보셨나요? 리워드를 받으세요!",
            button: "5 포인트 받기 (+5P)",
            loading: "처리 중...",
            success: "축하합니다! {points}P가 충전되었습니다."
        },
        pricingRule: {
            title: "합리적인 포인트 정책",
            base: "{base}포인트 ({basePages}page)",
            extra: "{nextPage}page부터 page당 {extra}P 추가",
            guestBadge: "GUEST: 2page 무료"
        },
        selector: "도착 언어 선택",
        selectorLabel: "번역할 언어 선택",
        button: { translate: "번역 시작하기" },
        time: { estimated: "예상 소요 시간", seconds: "초" },
        loading: {
            uploading: { title: "업로드 중...", desc: "문서를 보안 서버로 전송하고 있습니다." },
            processing: { title: "번역 중...", desc: "AI가 문서를 분석하고 재작성 중입니다." },
            completed: { title: "번역 완료!", desc: "번역된 문서를 다운로드할 수 있습니다." },
            failed: { title: "오류 발생", desc: "문제가 발생했습니다. 다시 시도해 주세요." },
            success: { title: "성공!", desc: "서식 보존율 100%" },
            download: "번역된 파일 다운로드"
        },
        nav: {
            community: "커뮤니티",
            pricing: "요금제",
            login: "로그인",
            signup: "무료 시작하기",
            pointsHold: "보유 포인트",
            adminDashboard: "마스터 대시보드",
            myHistory: "나의 번역 기록",
            betaBenefits: "베타 혜택",
            boostTitle: "포인트 충전하기",
            boostDesc: "포인트가 부족하신가요?\n광고 시청하고 2P를 즉시 받으세요!",
            watchAd: "광고 시청하기",
            logout: "로그아웃",
            loggedOut: "로그아웃 되었습니다.",
            backToUpload: "업로드로 돌아가기",
            local: "로컬 업로드",
            cloud: "클라우드 선택",
            brandName: "DocTranslation",
            tierBronze: "브론즈",
            tierSilver: "실버",
            tierGold: "골드",
            memberLogin: "회원 로그인",
        },
        auth: {
            signinTitle: "로그인",
            signinDesc: "가장 빠르고 스마트한 문서 번역의 시작.",
            emailLabel: "이메일",
            passwordLabel: "비밀번호",
            emailPlaceholder: "name@example.com",
            passwordPlaceholder: "••••••••",
            guestLogin: "게스트 모드로 바로 시작하기 (10P)",
            forgotPassword: "비밀번호를 잊으셨나요?",
            submitLogin: "번역의 세계로 입장",
            submitSignup: "계정 생성하기",
            toSignup: "계정 만들기",
            toSignin: "비밀번호로 로그인",
            social: "Enterprise-grade security",
            alertUnconfirmed: "이메일 인증이 필요합니다.",
            alertUnconfirmedDesc: "메일함을 확인해주세요.",
            btnResend: "인증 메일 다시 보내기",
            btnSending: "전송 중...",
            btnLoginOther: "다른 아이디로 로그인",
            signupTitle: "계정 생성",
            signupDesc: "이메일로 전송된 인증 링크를 확인하세요.",
            sentTo: "발송된 주소",
            checkEmailTitle: "이메일을 확인해주세요!",
            checkEmailDesc: "가입 인증 링크가 발송되었습니다.",
            backWithEmail: "이메일 다시 입력하기",
            alreadyHaveAccount: "이미 계정이 있으신가요?",
            rememberMe: "로그인 상태 유지"
        },
        admin: {
            dashboard: "대시보드",
            users: "사용자 관리",
            jobs: "작업 관리",
            security: "보안",
            shutdown: "시스템 종료",
            userManagement: "사용자 관리",
            totalUsers: "총 사용자",
            translationJobs: "번역 작업 현황",
            recentActivity: "최근 활동 기록",
            banSystem: "사용자 제재 및 관리",
            banDesc: "마스터의 권한으로 침입자를 격리하거나 오해를 해소합니다.",
            verifying: "마스터 권한 확인 중..."
        }
    },
    en: {
        badge: "100% Formatting Preservation",
        title: { main: "Translation,", highlight: "Unbroken." },
        description: "Translate documents with complex tables, charts, and images.\nAI understands context for the most natural translation.",
        dropzone: { idle: "Drop your file here", sub: "or click to browse", support: "Supports DOCX, XLSX, PPTX" },
        features: {
            compatibility: { title: "Native Support", desc: "We process Microsoft Office files natively without PDF conversion." },
            format: { title: "Zero Layout Shift", desc: "Tables, charts, and styles stay perfectly aligned." },
            speed: { title: "Lightning Fast", desc: "Optimized engine processes huge files in seconds." }
        },
        pricingPage: {
            hero: { title: "CHOOSE YOUR", highlight: "POWER LEVEL", subtitle: "Scale your global communication with our high-fidelity AI translation engine." },
            tiers: {
                guest: { name: "GUEST", price: "Free", desc: "No login required", limit: "2pages", button: "Try Guest Mode", features: ["Word/Excel/PPT Translation", "2pages per doc"] },
                bronze: { name: "BRONZE", price: "Free", desc: "Basic membership", bonus: "SIGNUP BONUS: 50P", button: "Sign up Free", features: ["Ads enabled", "Community support"] },
                silver: { name: "SILVER", priceKRW: "User", priceUSD: "$5.00", desc: "Get 50P and upgrade", bonus: "INSTANT 50P", button: "Charge 50P", features: ["Verified badge", "Faster processing", "Ads still visible"] },
                gold: { name: "GOLD", price: "100k+", unit: "KRW", desc: "Cumulative payment", vip: "VIP STATUS", button: "Auto Upgrade", features: ["Top priority", "Direct support line"] }
            },
            policy: {
                title: "Points & Operation Policy",
                pointTitle: "1. Point Policy",
                pointItems: ["Signup Reward: 50P is granted immediately upon signup.", "Base Cost: {base} Points per document ({basePages}page).", "Extra Cost: {extra}P per page from page {nextPage}.", "Guest Mode: 2page free for guests."],
                adTitle: "2. Ad & Recharge Policy",
                adItems: ["Free Recharge: You can earn points by watching ads if you run out.", "Reward: Get 5P by clicking [Get 5 points] on ads.", "Unlimited: During beta, ad rewards are unlimited.", "Service: Ad revenue supports server and AI engine costs."],
                disclaimer: "* This policy may change during the beta period. Points are non-refundable."
            },
            features: {
                support: { title: "Global Support", desc: "Support for 20+ languages with culture-aware AI." },
                security: { title: "Enterprise Security", desc: "Bank-level encryption for all your documents." },
                fidelity: { title: "High Fidelity", desc: "Preserves all formatting, charts, and diagrams." }
            }
        },
        community: {
            title: "Community",
            write: "Write",
            tabs: {
                free: "Free Board",
                inquiry: "Inquiry Board",
                notice: "Notice"
            },
            noPosts: "No posts found. Be the first to post!",
            noticeFixed: "Fixed Notice",
            postedBy: "By",
            views: "Views"
        },
        adReward: {
            title: "Did you watch the ad? Get your reward!",
            button: "Get 5 Points (+5P)",
            loading: "Processing...",
            success: "Congratulations! {points}P has been charged."
        },
        pricingRule: {
            title: "Pricing Policy",
            base: "{base} Points ({basePages}page)",
            extra: "{extra}P/page from page {nextPage}",
            guestBadge: "GUEST: 2page FREE"
        },
        selector: "Target Language",
        selectorLabel: "Select Target Language",
        button: { translate: "Start Translation" },
        time: { estimated: "Estimated time", seconds: "sec" },
        loading: {
            uploading: { title: "Uploading...", desc: "Sending your document to the secure server." },
            processing: { title: "Translating...", desc: "AI is analyzing and rewriting your content." },
            completed: { title: "All Done!", desc: "Your document is ready for download." },
            failed: { title: "Error", desc: "Something went wrong. Please try again." },
            success: { title: "Success!", desc: "Layout preserved 100%" },
            download: "Download Translated File"
        },
        nav: {
            community: "Community",
            pricing: "Pricing",
            login: "Login",
            signup: "Start for Free",
            pointsHold: "Points",
            adminDashboard: "Master Dashboard",
            myHistory: "My Translations",
            betaBenefits: "Beta Benefits",
            boostTitle: "Boost Your Points",
            boostDesc: "Need more points?\nWatch an ad and get 2P!",
            watchAd: "Watch Ad",
            logout: "Log Out",
            loggedOut: "Logged out successfully.",
            backToUpload: "Back to Upload",
            local: "Local Upload",
            cloud: "Cloud Selection",
            brandName: "DocTranslation",
            tierBronze: "BRONZE",
            tierSilver: "SILVER",
            tierGold: "GOLD",
            memberLogin: "MEMBER LOGIN",
        },
        auth: {
            signinTitle: "Sign In",
            signinDesc: "Start your fast and smart document translation.",
            emailLabel: "Email",
            passwordLabel: "Password",
            emailPlaceholder: "name@example.com",
            passwordPlaceholder: "••••••••",
            guestLogin: "Start as Guest (10P)",
            forgotPassword: "Forgot password?",
            submitLogin: "Sign In",
            submitSignup: "Create Account",
            toSignup: "Create Account",
            toSignin: "Sign in with Password",
            social: "Enterprise-grade security",
            alertUnconfirmed: "Email not verified.",
            alertUnconfirmedDesc: "Please check your inbox.",
            btnResend: "Resend Verification Email",
            btnSending: "Sending...",
            btnLoginOther: "Log in with other ID",
            signupTitle: "Create Account",
            signupDesc: "Check the verification link sent to your email.",
            sentTo: "Sent to",
            checkEmailTitle: "Check your email!",
            checkEmailDesc: "We sent a verification link to",
            backWithEmail: "Re-enter email",
            alreadyHaveAccount: "Already have an account?"
        },
        admin: {
            dashboard: "Dashboard",
            users: "Users",
            jobs: "Jobs",
            security: "Security",
            shutdown: "System Shutdown",
            userManagement: "User Management",
            totalUsers: "Total Users",
            translationJobs: "Translation Jobs",
            recentActivity: "Recent Activity",
            banSystem: "Ban Management System",
            banDesc: "Isolate intruders or resolve misunderstandings with Master privileges.",
            verifying: "Verifying Master Identity..."
        }
    },
    ja: {
        badge: "フォーマット保持率100%保証",
        title: { main: "書式はそのままで、", highlight: "言葉だけ完璧に。" },
        description: "複雑な表、グラフ、画像を含む文書もお任せください。\nAIが文脈を理解し、最も自然な翻訳を提供します。",
        dropzone: { idle: "ファイルをここにドロップ", sub: "またはクリックして選択", support: "DOCX, XLSX, PPTX, HWP 対応" },
        features: {
            compatibility: { title: "完全な互換性", desc: "Office文書からHWPまで、フォーマット変換なしでそのまま処理します。" },
            format: { title: "レイアウト崩れなし", desc: "表、グラフ、スタイルが崩れません。デザイナーが作業したように綺麗です。" },
            speed: { title: "圧倒的なスピード", desc: "大容量の文書も数秒で分析し、翻訳を完了します。" }
        },
        pricingPage: {
            hero: { title: "あなたの", highlight: "パワーレベルを選択", subtitle: "高精度AI翻訳エンジンで、グローバルなコミュニケーションを拡大しましょう。" },
            tiers: {
                guest: { name: "ゲスト", price: "無料", desc: "ログイン不要", limit: "2page", button: "ゲストモード를 試す", features: ["Word/Excel/PPT翻訳", "1ドキュメント 2page"] },
                bronze: { name: "ブロンズ", price: "無料", desc: "基本メンバーシップ", bonus: "登録ボーナス: 50P", button: "無料で登録", features: ["コミュニティサポート"] },
                silver: { name: "シルバー", priceKRW: "ユーザー", priceUSD: "$5.00", desc: "50Pチャージでアップグレード", bonus: "即時 50P 付与", button: "50Pチャージ", features: ["認証バッジ", "優先処理"] },
                gold: { name: "ゴールド", price: "10万〜", unit: "ウォン", desc: "累計決済額", vip: "VIPステータス", button: "自動アップグレード", features: ["最優先処理", "専用サポート"] }
            },
            policy: {
                title: "ポイントおよび運用ポリシー",
                pointTitle: "1. ポイントポリシー",
                pointItems: ["新規登録特典: 登録時に即座に50P付与します。", "基本料金: 1ドキュメントあたり {base}ポイント ({basePages}page)。", "追加料金: {nextPage}page目から1ページにつき {extra}P 加算。", "ゲストモード: 翻訳は 2pageまでに制限されます。"],
                adTitle: "2. 広告およびチャージポリシー",
                adItems: ["無料チャージ: ポイント不足時、広告視聴でポイントを獲得できます。", "報酬: 広告内の[5ポイント獲得]クリックで5P付与。", "無制限: ベータ期間中、広告報酬は無制限です。", "サービス: 広告収益はサーバーおよびAIエンジンの維持費に充てられます。"],
                disclaimer: "* ベータ期間中にポリシーが変更される場合があります。ポイントの払い戻しはできません。"
            },
            features: {
                support: { title: "グローバルサポート", desc: "文化を理解するAIにより、20以上の言語に対応しています。" },
                security: { title: "エンタープライズセキュリティ", desc: "すべてのドキュメントに銀行レベルの暗号化を適用。" },
                fidelity: { title: "高い再現性", desc: "すべての書式、グラフ、図をそのまま保持します。" }
            }
        },
        community: {
            title: "コミュニティ",
            write: "投稿",
            tabs: {
                free: "自由掲示板",
                inquiry: "お問い合わせ",
                notice: "お知らせ"
            },
            noPosts: "投稿がありません。最初の投稿をしてみましょう！",
            noticeFixed: "固定お知らせ",
            postedBy: "投稿者",
            views: "閲覧数"
        },
        adReward: {
            title: "広告を見ましたか？報酬を受け取りましょう！",
            button: "5ポイントを獲得 (+5P)",
            loading: "処理中...",
            success: "おめでとうございます！ {points}P가 加算されました。"
        },
        pricingRule: {
            title: "ポイント規定",
            base: "{base}ポイント ({basePages}page)",
            extra: "{nextPage}pageから{extra}P/page追加",
            guestBadge: "ゲスト: 2page無料"
        },
        selector: "翻訳言語を選択",
        selectorLabel: "翻訳言語を選択してください",
        button: { translate: "翻訳を開始" },
        time: { estimated: "Estimated time", seconds: "sec" },
        loading: {
            uploading: { title: "アップロード中...", desc: "ドキュメントを安全なサーバーに送信しています。" },
            processing: { title: "翻訳中...", desc: "AIがドキュメントを分析し、書き換えています。" },
            completed: { title: "翻訳完了！", desc: "翻訳されたドキュメントをダウンロードできます。" },
            failed: { title: "エラー発生", desc: "何か問題が発生しました。もう一度お試しください。" },
            success: { title: "成功！", desc: "レイアウト保持率 100%" },
            download: "翻訳されたファイルをダウンロード"
        },
        nav: {
            community: "コミュニティ",
            pricing: "料金プラン",
            login: "ログイン",
            signup: "無料で始める",
            pointsHold: "保有ポイント",
            adminDashboard: "マスターダッシュボード",
            myHistory: "翻訳履歴",
            betaBenefits: "ベータ特典",
            boostTitle: "ポイントをチャージ",
            boostDesc: "ポイントが足りませんか？\n広告を見て2Pをゲット！",
            watchAd: "広告を見る",
            logout: "ログアウト",
            loggedOut: "ログアウトしました。",
            backToUpload: "アップロードに戻る",
            local: "ローカルアップロード",
            cloud: "クラウド選択",
            brandName: "DocTranslation",
            tierBronze: "ブロンズ",
            tierSilver: "シルバー",
            tierGold: "ゴールド",
            memberLogin: "会員ログイン",
        },
        auth: {
            signinTitle: "ログイン",
            signinDesc: "高速でスマートな文書翻訳を始めましょう。",
            emailLabel: "メールアドレス",
            passwordLabel: "パスワード",
            emailPlaceholder: "name@example.com",
            passwordPlaceholder: "••••••••",
            guestLogin: "ゲストとして開始 (10P)",
            forgotPassword: "パスワードをお忘れですか？",
            submitLogin: "ログイン",
            submitSignup: "アカウント作成",
            toSignup: "アカウント登録",
            toSignin: "パスワードでログイン",
            social: "エンタープライズ級のセキュリティ",
            alertUnconfirmed: "メールアドレスが未確認です。",
            alertUnconfirmedDesc: "受信箱を確認してください。",
            btnResend: "認証メールを再送信",
            btnSending: "送信中...",
            btnLoginOther: "別のアカウントでログイン",
            signupTitle: "アカウント作成",
            signupDesc: "メールに送信された認証リンクを確認してください。",
            sentTo: "送信先",
            checkEmailTitle: "メールを確認してください！",
            checkEmailDesc: "認証リンクを送信しました。",
            backWithEmail: "メールアドレスを再入力",
            alreadyHaveAccount: "すでにアカウントをお持ちですか？",
            rememberMe: "ログイン状態を維持"
        },
        admin: {
            dashboard: "ダッシュボード",
            users: "ユーザー管理",
            jobs: "ジョブ管理",
            security: "セキュリティ",
            shutdown: "システム終了",
            userManagement: "ユーザー管理",
            totalUsers: "総ユーザー数",
            translationJobs: "翻訳ジョブ状況",
            recentActivity: "最近の活動記録",
            banSystem: "アクセス制限システム",
            banDesc: "マスター権限で侵入者を隔離したり、誤解を解消したりします。",
            verifying: "マスター権限を確認中..."
        }
    },
    zh: {
        badge: "保证 100% 格式保留",
        title: { main: "格式不变，", highlight: "语言完美转换。" },
        description: "无需担心包含复杂表格、图表和图像的文档。\nAI 理解上下文，提供最自然的翻译。",
        dropzone: { idle: "将文件拖放到此处", sub: "或点击选择文件", support: "支持 DOCX, XLSX, PPTX, HWP" },
        features: {
            compatibility: { title: "完美兼容", desc: "从 Office 文档到 HWP，直接处理原始文件，无需转换格式。" },
            format: { title: "零布局偏移", desc: "表格、图表和样式保持完美对齐。就像设计师制作的一样整洁。" },
            speed: { title: "极速处理", desc: "优化引擎在几秒钟内处理大文件。" }
        },
        pricingPage: {
            hero: { title: "选择您的", highlight: "强力套餐", subtitle: "使用我们的高保真AI翻译引擎扩展您的全球沟通。" },
            tiers: {
                guest: { name: "访客", price: "免费", desc: "无需登录", limit: "2page", button: "试用访客模式", features: ["Word/Excel/PPT翻译", "每个文档 2page"] },
                bronze: { name: "青铜", price: "免费", desc: "基础会员", bonus: "注册奖励：50P", button: "免费注册", features: ["社区支持"] },
                silver: { name: "白银", priceKRW: "用户", priceUSD: "$5.00", desc: "获得50P并升级", bonus: "立即赠送 50P", button: "充值 50P", features: ["认证徽章", "更快的处理速度"] },
                gold: { name: "黄金", price: "100k+", unit: "KRW", desc: "累计支付", vip: "VIP 状态", button: "自动升级", features: ["最高优先级", "直接支持渠道"] }
            },
            policy: {
                title: "积分及运营政策",
                pointTitle: "1. 积分政策",
                pointItems: ["注册奖励：注册后立即赠送50P。", "基础费用：每个文档 {base}积分 ({basePages}page)。", "额外费用：从第 {nextPage}page起，每page增加 {extra}P。", "访客模式：访客 2page 免费。"],
                adTitle: "2. 广告及充值政策",
                adItems: ["免费充值：积分不足时可通过观看广告获得积分。", "奖励：点击广告上的 [获取5积分] 即可获得 5P。", "无限制：测试期间，广告奖励无限制。", "服务：广告收入用于支持服务器和 AI 引擎成本。"],
                disclaimer: "* 测试期间政策可能会有变动。积分不可退还。"
            },
            features: {
                support: { title: "全球支持", desc: "支持20多种语言，配备文化感知型AI。" },
                security: { title: "企业级安全", desc: "为您的所有文档提供银行级加密。" },
                fidelity: { title: "高保真", desc: "保留所有格式、图表和图表。" }
            }
        },
        community: {
            title: "社区",
            write: "发帖",
            tabs: {
                free: "自由板块",
                inquiry: "咨询板块",
                notice: "公告"
            },
            noPosts: "暂无帖子。成为第一个发帖的人吧！",
            noticeFixed: "固定公告",
            postedBy: "作者",
            views: "浏览量"
        },
        adReward: {
            title: "看了广告吗？领取奖励！",
            button: "领取 5 积分 (+5P)",
            loading: "处理中...",
            success: "恭喜！已充值 {points}P。"
        },
        pricingRule: {
            title: "积分政策",
            base: "{base}积分 ({basePages}page)",
            extra: "从第 {nextPage}page起 每page增加 {extra}P",
            guestBadge: "访客：2page免费"
        },
        selector: "选择目标语言",
        selectorLabel: "请选择目标语言",
        button: { translate: "开始翻译" },
        time: { estimated: "预计时间", seconds: "秒" },
        loading: {
            uploading: { title: "上传中...", desc: "正在将文档发送到安全服务器。" },
            processing: { title: "翻译中...", desc: "AI 正在分析并重写您的内容。" },
            completed: { title: "完成！", desc: "您的文档已准备好下载。" },
            failed: { title: "错误", desc: "发生了一些问题，请重试。" },
            success: { title: "成功！", desc: "格式保留 100%" },
            download: "下载翻译后的文件"
        },
        nav: {
            community: "社区",
            pricing: "价格",
            login: "登录",
            signup: "免费开始",
            pointsHold: "持有积分",
            adminDashboard: "大师控制台",
            myHistory: "我的翻译",
            betaBenefits: "测试版福利",
            boostTitle: "获取积分",
            boostDesc: "积分不足？\n观看广告即可获得 2P！",
            watchAd: "观看广告",
            logout: "登出",
            loggedOut: "登出成功。",
            backToUpload: "返回上传",
            local: "本地上传",
            cloud: "云端选择",
            brandName: "DocTranslation",
            tierBronze: "青铜",
            tierSilver: "白银",
            tierGold: "黄金",
            memberLogin: "会员登录",
        },
        auth: {
            signinTitle: "登录",
            signinDesc: "开始快速智能的文档翻译。",
            emailLabel: "电子邮件",
            passwordLabel: "密码",
            emailPlaceholder: "name@example.com",
            passwordPlaceholder: "••••••••",
            guestLogin: "作为访客开始 (10P)",
            forgotPassword: "忘记密码？",
            submitLogin: "登录",
            submitSignup: "创建账户",
            toSignup: "注册新账户",
            toSignin: "使用密码登录",
            social: "企业级安全",
            alertUnconfirmed: "邮箱未验证。",
            alertUnconfirmedDesc: "请检查您的收件箱。",
            btnResend: "重新发送验证邮件",
            btnSending: "发送中...",
            btnLoginOther: "使用其他ID登录",
            signupTitle: "创建账户",
            signupDesc: "请查看发送到您邮箱的验证链接。",
            sentTo: "发送至",
            checkEmailTitle: "请检查您的电子邮件！",
            checkEmailDesc: "我们已向您发送了验证链接",
            backWithEmail: "重新输入邮箱",
            alreadyHaveAccount: "已有账户？",
            rememberMe: "保持登录状态"
        },
        admin: {
            dashboard: "仪表板",
            users: "用户管理",
            jobs: "任务管理",
            security: "安全",
            shutdown: "系统关闭",
            userManagement: "用户管理",
            totalUsers: "总用户数",
            translationJobs: "翻译任务状态",
            recentActivity: "最近活动记录",
            banSystem: "访问限制系统",
            banDesc: "以管理员权限隔离入侵者或解决误会。",
            verifying: "正在验证管理员权限..."
        }
    },
    es: {
        badge: "100% Conservación de Formato",
        title: { main: "Formato intacto,", highlight: "Solo cambia el idioma." },
        description: "Traduce documentos con tablas complejas sin perder el diseño.\nLa IA entiende el contexto para una traducción natural.",
        dropzone: { idle: "Arrastra tu archivo aquí", sub: "o haz clic para seleccionar", support: "Soporta DOCX, XLSX, PPTX, HWP" },
        features: {
            compatibility: { title: "Soporte Nativo", desc: "Procesamos archivos Office y HWP directamente sin convertirlos a PDF." },
            format: { title: "Diseño Perfecto", desc: "Tablas y gráficos mantienen su alineación exacta." },
            speed: { title: "Ultrarrápido", desc: "Motor optimizado para procesar archivos grandes en segundos." }
        },
        pricingPage: {
            hero: { title: "ELIGE TU", highlight: "NIVEL DE PODER", subtitle: "Escala tu comunicación global con nuestro motor de traducción AI de alta fidelidad." },
            tiers: {
                guest: { name: "INVITADO", price: "Gratis", desc: "Sin registro", limit: "2pages", button: "Probar modo invitado", features: ["Traducción Word/Excel/PPT", "2pages por doc"] },
                bronze: { name: "BRONCE", price: "Gratis", desc: "Membresía básica", bonus: "BONO DE REGISTRO: 50P", button: "Registrarse gratis", features: ["Soporte comunitario"] },
                silver: { name: "PLATA", priceKRW: "Usuario", priceUSD: "$5.00", desc: "Obtén 50P y mejora", bonus: "50P INSTANTÁNEOS", button: "Cargar 50P", features: ["Insignia verificada", "Procesamiento más rápido"] },
                gold: { name: "ORO", price: "100k+", unit: "KRW", desc: "Pago acumulativo", vip: "ESTADO VIP", button: "Mejora automática", features: ["Máxima prioridad", "Línea de soporte directo"] }
            },
            policy: {
                title: "Política de puntos y operación",
                pointTitle: "1. Política de puntos",
                pointItems: ["Recompensa de registro: Se otorgan 50P inmediatamente al registrarse.", "Costo base: {base} Puntos por documento ({basePages}page).", "Costo adicional: {extra}P por página a partir de la página {nextPage}.", "Modo invitado: 2page gratis para invitados."],
                adTitle: "2. Política de anuncios y recarga",
                adItems: ["Recarga gratuita: Puedes ganar puntos viendo anuncios si te quedas sin ellos.", "Recompensa: Obtén 5P haciendo clic en [Obtener 5 puntos] en los anuncios.", "Ilimitado: Durante la beta, las recompensas de anuncios son ilimitadas.", "Servicio: Los ingresos por anuncios respaldan los costos del servidor y el motor AI."],
                disclaimer: "* Esta política puede cambiar durante el período beta. Los puntos no son reembolsables."
            },
            features: {
                support: { title: "Soporte global", desc: "Soporte para más de 20 idiomas con IA consciente de la cultura." },
                security: { title: "Seguridad empresarial", desc: "Cifrado de nivel bancario para todos tus documentos." },
                fidelity: { title: "Alta fidelidad", desc: "Conserva todo el formato, gráficos y diagramas." }
            }
        },
        community: {
            title: "Comunidad",
            write: "Escribir",
            tabs: {
                free: "Foro Libre",
                inquiry: "Foro de Consultas",
                notice: "Avisos"
            },
            noPosts: "No hay publicaciones. ¡Sé el primero en publicar!",
            noticeFixed: "Aviso Fijo",
            postedBy: "Por",
            views: "Vistas"
        },
        adReward: {
            title: "¿Has visto el anuncio? ¡Obtén tu recompensa!",
            button: "Obtener 5 Puntos (+5P)",
            loading: "Procesando...",
            success: "¡Felicidades! Se han cargado {points}P."
        },
        pricingRule: {
            title: "Política de puntos",
            base: "{base} Puntos ({basePages}page)",
            extra: "{extra}P/page a partir de la página {nextPage}",
            guestBadge: "INVITADO: 2page GRATIS"
        },
        selector: "Idioma de destino",
        selectorLabel: "Seleccionar idioma de destino",
        button: { translate: "Traducir ahora" },
        time: { estimated: "Tiempo estimado", seconds: "seg" },
        loading: {
            uploading: { title: "Subiendo...", desc: "Enviando documento al servidor seguro." },
            processing: { title: "Traduciendo...", desc: "La IA está analizando y reescribiendo." },
            completed: { title: "¡Listo!", desc: "Su documento está listo para descargar." },
            failed: { title: "Error", desc: "Algo salió mal. Por favor intente de nuevo." },
            success: { title: "¡Éxito!", desc: "Formato conservado al 100%" },
            download: "Descargar archivo traducido"
        },
        nav: {
            community: "Comunidad",
            pricing: "Precios",
            login: "Iniciar sesión",
            signup: "Empieza gratis",
            pointsHold: "Puntos",
            adminDashboard: "Panel de Maestro",
            myHistory: "Mis traducciones",
            betaBenefits: "Beneficios Beta",
            boostTitle: "Carga tus puntos",
            boostDesc: "¿Necesitas más puntos?\n¡Mira un anuncio y obtén 2P!",
            watchAd: "Ver anuncio",
            logout: "Cerrar sesión",
            loggedOut: "Sesión cerrada con éxito.",
            backToUpload: "Volver a subir",
            local: "Subida local",
            cloud: "Nube",
            brandName: "DocTranslation",
            tierBronze: "BRONCE",
            tierSilver: "PLATA",
            tierGold: "ORO",
            memberLogin: "ACCESSO MIEMBROS",
        },
        auth: {
            signinTitle: "Sign In",
            signinDesc: "Start your fast and smart document translation.",
            emailLabel: "Email",
            passwordLabel: "Password",
            emailPlaceholder: "name@example.com",
            passwordPlaceholder: "••••••••",
            guestLogin: "Start as Guest (10P)",
            forgotPassword: "Forgot password?",
            submitLogin: "Sign In",
            submitSignup: "Create Account",
            toSignup: "Create Account",
            toSignin: "Sign in with Password",
            social: "Enterprise-grade security",
            alertUnconfirmed: "Email not verified.",
            alertUnconfirmedDesc: "Please check your inbox.",
            btnResend: "Resend Verification Email",
            btnSending: "Sending...",
            btnLoginOther: "Log in with other ID",
            signupTitle: "Create Account",
            signupDesc: "Check the verification link sent to your email.",
            sentTo: "Sent to",
            checkEmailTitle: "Check your email!",
            checkEmailDesc: "We sent a verification link to",
            backWithEmail: "Re-enter email",
            alreadyHaveAccount: "Already have an account?"
        },
        admin: {
            dashboard: "Dashboard",
            users: "Users",
            jobs: "Jobs",
            security: "Security",
            shutdown: "System Shutdown",
            userManagement: "User Management",
            totalUsers: "Total Users",
            translationJobs: "Translation Jobs",
            recentActivity: "Recent Activity",
            banSystem: "Ban Management System",
            banDesc: "Isolate intruders or resolve misunderstandings with Master privileges.",
            verifying: "Verifying Master Identity..."
        }
    },
    fr: {
        badge: "Préservation du format à 100%",
        title: { main: "Le format reste,", highlight: "La langue change." },
        description: "Traduisez des documents complexes sans perdre la mise en page.\nL'IA comprend le contexte pour une traduction naturelle.",
        dropzone: { idle: "Déposez votre fichier ici", sub: "ou cliquez pour parcourir", support: "Supporte DOCX, XLSX, PPTX, HWP" },
        pricingRule: {
            title: "Politique de points",
            base: "{base} Points ({basePages}page)",
            extra: "{extra}P/page dès la page {nextPage}",
            guestBadge: "INVITÉ : 2page GRATUITES"
        },
        pricingPage: {
            hero: { title: "CHOISISSEZ VOTRE", highlight: "NIVEAU DE PUISSANCE", subtitle: "Développez votre communication mondiale avec notre moteur de traduction IA haute fidélité." },
            tiers: {
                guest: { name: "INVITÉ", price: "Gratuit", desc: "Sans inscription", limit: "2pages", button: "Essayer le mode invité", features: ["Traduction Word/Excel/PPT", "2pages par doc"] },
                bronze: { name: "BRONZE", price: "Gratuit", desc: "Adhésion de base", bonus: "BONUS D'INSCRIPTION : 50P", button: "S'inscrire gratuitement", features: ["Support communautaire"] },
                silver: { name: "ARGENT", priceKRW: "Utilisateur", priceUSD: "$5.00", desc: "Obtenez 50P et améliorez", bonus: "50P INSTANTANÉS", button: "Charger 50P", features: ["Badge vérifié", "Traitement plus rapide"] },
                gold: { name: "OR", price: "100k+", unit: "KRW", desc: "Paiement cumulatif", vip: "STATUT VIP", button: "Mise à niveau automatique", features: ["Priorité maximale", "Ligne de support direct"] }
            },
            policy: {
                title: "Politique de points et d'exploitation",
                pointTitle: "1. Politique de points",
                pointItems: ["Récompense d'inscription : 50P sont accordés immédiatement lors de l'inscription.", "Coût de base : {base} Points par document ({basePages}page).", "Coût supplémentaire : {extra}P par page à partir de la page {nextPage}.", "Mode invité : 2page gratuites pour les invités."],
                adTitle: "2. Politique de publicité et de recharge",
                adItems: ["Recharge gratuite : Vous pouvez gagner des points en regardant des publicités si vous en manquez.", "Récompense : Obtenez 5P en cliquant sur [Obtenir 5 points] sur les publicités.", "Illimité : Pendant la béta, les récompenses publicitaires sont illimitées.", "Service : Les revenus publicitaires soutiennent les coûts du serveur et du moteur IA."],
                disclaimer: "* Cette politique peut changer pendant la période béta. Les points ne sont pas remboursables."
            },
            features: {
                support: { title: "Support mondial", desc: "Support pour plus de 20 langues avec IA consciente de la culture." },
                security: { title: "Sécurité d'entreprise", desc: "Chiffrement de niveau bancaire pour tous vos documents." },
                fidelity: { title: "Haute fidélité", desc: "Préserve tout le formatage, les graphiques et les diagrammes." }
            }
        },
        community: {
            title: "Communauté",
            write: "Écrire",
            tabs: {
                free: "Forum Libre",
                inquiry: "Forum de Questions",
                notice: "Annonces"
            },
            noPosts: "Aucun message trouvé. Soyez le premier à poster !",
            noticeFixed: "Annonce Fixe",
            postedBy: "Par",
            views: "Vues"
        },
        adReward: {
            title: "Avez-vous regardé la publicité ? Obtenez votre récompense !",
            button: "Obtenir 5 Points (+5P)",
            loading: "Traitement en cours...",
            success: "Félicitations ! {points}P ont été chargés."
        },
        features: {
            compatibility: { title: "Support Natif", desc: "Traitement direct des fichiers Office et HWP." },
            format: { title: "Mise en page intacte", desc: "Tableaux et images restent parfaitement alignés." },
            speed: { title: "Éclair", desc: "Traitement des gros fichiers en quelques secondes." }
        },
        selector: "Langue cible",
        selectorLabel: "Choisir la langue cible",
        button: { translate: "Traduire maintenant" },
        time: { estimated: "Temps estimé", seconds: "sec" },
        loading: {
            uploading: { title: "Téléchargement en cours...", desc: "Envoi de votre document au serveur sécurisé." },
            processing: { title: "Traduction en cours...", desc: "L'IA analyse et réécrit votre contenu." },
            completed: { title: "Terminé !", desc: "Votre document est prêt à être téléchargé." },
            failed: { title: "Erreur", desc: "Un problème est survenu. Veuillez réessayer." },
            success: { title: "Succès !", desc: "Mise en page conservée à 100%" },
            download: "Télécharger le fichier traduit"
        },
        nav: {
            community: "Communauté",
            pricing: "Tarifs",
            login: "Connexion",
            signup: "Essai gratuit",
            pointsHold: "Points",
            adminDashboard: "Tableau de bord Maître",
            myHistory: "Mes traductions",
            betaBenefits: "Avantages Beta",
            boostTitle: "Recharge de points",
            boostDesc: "Besoin de points ?\nRegardez une pub et gagnez 2P !",
            watchAd: "Regarder la pub",
            logout: "Déconnexion",
            loggedOut: "Déconnexion réussie.",
            backToUpload: "Retour",
            local: "Local",
            cloud: "Cloud",
            brandName: "DocTranslation",
            tierBronze: "BRONZE",
            tierSilver: "ARGENT",
            tierGold: "OR",
            memberLogin: "ACCÈS MEMBRE",
        },
        auth: {
            signinTitle: "Sign In",
            signinDesc: "Start your fast and smart document translation.",
            emailLabel: "Email",
            passwordLabel: "Password",
            emailPlaceholder: "name@example.com",
            passwordPlaceholder: "••••••••",
            guestLogin: "Start as Guest (10P)",
            forgotPassword: "Forgot password?",
            submitLogin: "Sign In",
            submitSignup: "Create Account",
            toSignup: "Create Account",
            toSignin: "Sign in with Password",
            social: "Enterprise-grade security",
            alertUnconfirmed: "Email not verified.",
            alertUnconfirmedDesc: "Please check your inbox.",
            btnResend: "Resend Verification Email",
            btnSending: "Sending...",
            btnLoginOther: "Log in with other ID",
            signupTitle: "Create Account",
            signupDesc: "Check the verification link sent to your email.",
            sentTo: "Sent to",
            checkEmailTitle: "Check your email!",
            checkEmailDesc: "We sent a verification link to",
            backWithEmail: "Re-enter email",
            alreadyHaveAccount: "Already have an account?"
        },
        admin: {
            dashboard: "Dashboard",
            users: "Users",
            jobs: "Jobs",
            security: "Security",
            shutdown: "System Shutdown",
            userManagement: "User Management",
            totalUsers: "Total Users",
            translationJobs: "Translation Jobs",
            recentActivity: "Recent Activity",
            banSystem: "Ban Management System",
            banDesc: "Isolate intruders or resolve misunderstandings with Master privileges.",
            verifying: "Verifying Master Identity..."
        }
    },
};

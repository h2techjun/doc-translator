export const ko = {
    badge: "100% 원본 서식 유지",
    title: { main: "서식은 그대로,", highlight: "언어만 바꿉니다." },
    description: "복잡한 표와 차트가 있는 문서를 디자인 파괴 없이 번역하세요.\nAI가 문맥을 이해하여 자연스러운 번역을 제공합니다.",
    dropzone: { idle: "파일을 여기에 드래그", sub: "또는 클릭하여 선택", support: "DOCX, XLSX, PPTX, HWP 지원" },
    features: {
        compatibility: { title: "완벽 호환", desc: "오피스 파일과 한글(HWP) 파일을 변환 없이 직접 처리합니다." },
        format: { title: "서식 보존", desc: "표, 차트, 이미지 위치가 원본 그대로 유지됩니다." },
        speed: { title: "초고속 엔진", desc: "대용량 문서도 수십 초 내에 처리가 완료됩니다." }
    },
    pricingPage: {
        hero: { title: "당신의", highlight: "레벨을 선택하세요", subtitle: "고품질 AI 번역 엔진으로 글로벌 커뮤니케이션을 확장하세요." },
        tiers: {
            guest: { name: "GUEST", price: "무료", desc: "회원가입 없음", limit: "2pages", button: "게스트 체험하기", features: ["Word/Excel/PPT 번역", "문서당 2pages 제한"] },
            bronze: { name: "BRONZE", price: "무료", desc: "기본 멤버십", bonus: "가입 축하: 50P", button: "무료로 시작하기", features: ["커뮤니티 이용"] },
            silver: { name: "SILVER", priceKRW: "유저", priceUSD: "$5.00", desc: "50P 획득 시 자동 등업", bonus: "즉시 50P 지급", button: "50P 충전하기", features: ["인증 배지 부여", "빠른 처리 속도"] },
            gold: { name: "GOLD", price: "10만+", unit: "원", desc: "누적 결제액", vip: "VIP 등급", button: "자동 등업", features: ["최우선 순위 처리", "직통 고객센터"] },
            diamond: { name: "DIAMOND", price: "무제한", unit: "", desc: "최상위 등급", vip: "UNLIMITED", button: "사용 중", features: ["포인트 차감 없음", "모든 기능 무제한"] },
            master: { name: "MASTER", price: "무제한", unit: "", desc: "관리자 전용", vip: "GOD MODE", button: "사용 중", features: ["시스템 전체 제어", "무제한 번역"] }
        },
        policy: {
            title: "포인트 및 운영 정책",
            pointTitle: "1. 포인트 정책",
            pointItems: ["가입 보상: 회원가입 시 50P 즉시 지급.", "기본 차감: 문서당 {base} 포인트 ({basePages}page).", "추가 차감: {nextPage}페이지부터 페이지당 {extra}P.", "게스트 모드: 게스트는 2page 무료."],
            adTitle: "2. 광고 및 충전 정책",
            adItems: ["무료 충전: 포인트 부족 시 광고 시청으로 충전 가능.", "보상: 광고 내 [5포인트 받기] 클릭 시 5P 지급.", "제한 없음: 베타 기간 동안 광고 보상 횟수 무제한.", "서비스: 광고 수익은 서버 및 AI 엔진 비용으로 사용됩니다."],
            disclaimer: "* 본 정책은 베타 기간 중 변경될 수 있습니다. 포인트는 환불되지 않습니다."
        },
        features: {
            support: { title: "글로벌 지원", desc: "문화적 맥락까지 이해하는 AI로 20개국어 지원." },
            security: { title: "엔터프라이즈 보안", desc: "모든 문서는 금융권 수준으로 암호화 처리됩니다." },
            fidelity: { title: "고해상도 유지", desc: "차트, 다이어그램, 이미지 화질을 100% 보존합니다." }
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
        noPosts: "게시글이 없습니다. 첫 글을 작성해보세요!",
        noticeFixed: "필독",
        postedBy: "작성",
        views: "조회"
    },
    adReward: {
        title: "광고를 시청하셨나요?",
        button: "5 포인트 받기 (+5P)",
        loading: "처리 중...",
        success: "축하합니다! {points}P가 충전되었습니다."
    },
    pricingRule: {
        title: "포인트 정책",
        base: "{base}포인트 ({basePages}page)",
        extra: "{nextPage}page부터 page당 {extra}P 추가"
    },
    selector: "번역할 언어",
    selectorLabel: "도착 언어 선택",
    button: { translate: "지금 번역하기" },
    time: { estimated: "예상 소요시간", seconds: "초" },
    loading: {
        uploading: { title: "업로드 중...", desc: "보안 서버로 문서를 전송하고 있습니다." },
        processing: { title: "번역 중...", desc: "AI가 문맥을 분석하고 재작성합니다." },
        completed: { title: "완료!", desc: "번역된 문서를 다운로드할 수 있습니다." },
        failed: { title: "오류", desc: "문제가 발생했습니다. 다시 시도해주세요." },
        success: { title: "성공!", desc: "서식 보존율 100%" },
        download: "번역된 파일 다운로드"
    },
    nav: {
        community: "커뮤니티",
        pricing: "요금제",
        login: "로그인",
        signup: "무료 시작",
        pointsHold: "보유 포인트",
        adminDashboard: "마스터 대시보드",
        myHistory: "내 번역 기록",
        betaBenefits: "베타 혜택",
        boostTitle: "포인트 부스트",
        boostDesc: "포인트가 부족하신가요?\n광고 보고 5P 받기!",
        watchAd: "광고 보기",
        logout: "로그아웃",
        loggedOut: "성공적으로 로그아웃되었습니다.",
        backToUpload: "다시 업로드",
        local: "로컬 업로드",
        cloud: "클라우드",
        brandName: "DocTranslation",
        tierBronze: "브론즈",
        tierSilver: "실버",
        tierGold: "골드",
        tierDiamond: "다이아몬드",
        tierMaster: "마스터",
        memberLogin: "회원 접속",
        driveSelected: "드라이브에서 선택됨: {name}",
        translateReady: "번역 준비 완료",
        translating: "번역 중...",
        translateFailed: "번역 실패",
    },
    auth: {
        signinTitle: "로그인",
        signinDesc: "빠르고 똑똑한 문서 번역을 시작하세요.",
        emailLabel: "이메일",
        passwordLabel: "비밀번호",
        emailPlaceholder: "name@example.com",
        passwordPlaceholder: "••••••••",
        guestLogin: "게스트로 시작하기 (10P)",
        forgotPassword: "비밀번호를 잊으셨나요?",
        submitLogin: "로그인",
        submitSignup: "계정 만들기",
        toSignup: "계정 만들기",
        toSignin: "비밀번호로 로그인",
        social: "엔터프라이즈급 보안",
        alertUnconfirmed: "이메일이 인증되지 않았습니다.",
        alertUnconfirmedDesc: "받은 편지함을 확인해주세요.",
        btnResend: "인증 메일 재전송",
        btnSending: "전송 중...",
        btnLoginOther: "다른 아이디로 로그인",
        signupTitle: "계정 생성",
        signupDesc: "이메일로 전송된 인증 링크를 확인해주세요.",
        sentTo: "인증 메일 발송:",
        checkEmailTitle: "이메일을 확인하세요!",
        checkEmailDesc: "인증 링크를 다음 주소로 보냈습니다:",
        backWithEmail: "이메일 다시 입력",
        alreadyHaveAccount: "이미 계정이 있으신가요?",
        rememberMe: "로그인 유지"
    },
    admin: {
        dashboard: "대시보드",
        users: "회원 관리",
        jobs: "작업 감시",
        security: "보안 센터",
        shutdown: "시스템 종료",
        userManagement: "사용자 관리",
        totalUsers: "총 가입자",
        translationJobs: "번역 작업 현황",
        recentActivity: "최근 활동 로그",
        banSystem: "접근 제한 시스템",
        banDesc: "악성 사용자를 격리하거나, 마스터 권한으로 오해를 풀 수 있습니다.",
        verifying: "마스터 신원 확인 중..."
    },
    coupons: {
        title: "쿠폰 등록",
        desc: "프로모션 코드를 입력하고 포인트를 받으세요.",
        placeholder: "코드 입력",
        button: "받기",
        success: "{points}P 적립 완료!",
        successDesc: "쿠폰이 성공적으로 사용되었습니다.",
        failedTitle: "등록 실패",
        errorSystem: "시스템 오류",
        errorSystemDesc: "잠시 후 다시 시도해주세요."
    },
    reports: {
        title: "신고하기",
        description: "이 {type}을(를) 신고하는 이유는 무엇입니까?",
        placeholder: "신고 사유를 자세히 적어주세요...",
        cancel: "취소",
        submit: "신고 접수",
        success: "신고가 접수되었습니다",
        successDesc: "커뮤니티 안전을 위해 노력해주셔서 감사합니다.",
        errorFailed: "신고 처리 실패",
        errorSystem: "시스템 오류"
    }
};

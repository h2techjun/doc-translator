export const en = {
    badge: "100% Format Preservation",
    title: { main: "Translation that keeps", highlight: "the format intact." },
    description: "Translate complex documents seamlessly.\nAI understands context for natural results.",
    dropzone: { idle: "Drag & drop your file here", sub: "or click to browse", support: "Supports DOCX, XLSX, PPTX, HWP" },
    features: {
        compatibility: { title: "Native Support", desc: "Process Office & HWP files directly without PDF conversion." },
        format: { title: "Perfect Layout", desc: "Tables, charts, and images stay exactly where they belong." },
        speed: { title: "Lightning Fast", desc: "Optimized engine processes large files in seconds." }
    },
    pricingPage: {
        hero: { title: "CHOOSE YOUR", highlight: "POWER LEVEL", subtitle: "Scale your global communication with our high-fidelity AI translation engine." },
        tiers: {
            guest: { name: "GUEST", price: "Free", desc: "No signup required", limit: "2pages", button: "Try Guest Mode", features: ["Word/Excel/PPT Translation", "2pages per doc"] },
            bronze: { name: "BRONZE", price: "Free", desc: "Basic Membership", bonus: "SIGNUP BONUS: 50P", button: "Join for Free", features: ["Community Support"] },
            silver: { name: "SILVER", priceKRW: "User", priceUSD: "$5.00", desc: "Get 50P & Upgrade", bonus: "INSTANT 50P", button: "Load 50P", features: ["Verified Badge", "Faster Processing"] },
            gold: { name: "GOLD", price: "100k+", unit: "KRW", desc: "Cumulative Pay", vip: "VIP STATUS", button: "Auto-Upgrade", features: ["Highest Priority", "Direct Support Line"] }
        },
        policy: {
            title: "Points & Operation Policy",
            pointTitle: "1. Points Policy",
            pointItems: ["Signup Reward: 50P is granted immediately upon registration.", "Base Cost: {base} Points per document ({basePages}page).", "Over Cost: {extra}P per page starting from page {nextPage}.", "Guest Mode: 2page free for guests."],
            adTitle: "2. Ad & Recharge Policy",
            adItems: ["Free Recharge: You can earn points by watching ads if you run out.", "Reward: Get 5P by clicking [Get 5 Points] on ads.", "Unlimited: During beta, ad rewards are unlimited.", "Service: Ad revenue supports server & AI engine costs."],
            disclaimer: "* This policy may change during the beta period. Points are non-refundable."
        },
        features: {
            support: { title: "Global Support", desc: "Support for 20+ languages with culture-aware AI." },
            security: { title: "Enterprise Security", desc: "Bank-grade encryption for all your documents." },
            fidelity: { title: "High Fidelity", desc: "Preserves all formatting, charts, and diagrams." }
        }
    },
    community: {
        title: "Community",
        write: "Write Post",
        tabs: {
            free: "Free Board",
            inquiry: "Q&A",
            notice: "Notice"
        },
        noPosts: "No posts found. Be the first to write!",
        noticeFixed: "Notice",
        postedBy: "By",
        views: "Views"
    },
    adReward: {
        title: "Watched the ad? Get your reward!",
        button: "Get 5 Points (+5P)",
        loading: "Processing...",
        success: "Congrats! {points}P loaded."
    },
    pricingRule: {
        title: "Points Policy",
        base: "{base} Points ({basePages}page)",
        extra: "{extra}P/page from page {nextPage}"
    },
    selector: "Target Language",
    selectorLabel: "Select target language",
    button: { translate: "Translate Now" },
    time: { estimated: "Estimated time", seconds: "sec" },
    loading: {
        uploading: { title: "Uploading...", desc: "Sending your document to secure server." },
        processing: { title: "Translating...", desc: "AI is analyzing and rewriting your content." },
        completed: { title: "Finished!", desc: "Your document is ready for download." },
        failed: { title: "Error", desc: "Something went wrong. Please try again." },
        success: { title: "Success!", desc: "Format preserved 100%" },
        download: "Download Translated File"
    },
    nav: {
        community: "Community",
        pricing: "Pricing",
        login: "Sign In",
        signup: "Start Free",
        pointsHold: "Points",
        adminDashboard: "Master Dashboard",
        myHistory: "My Translations",
        betaBenefits: "Beta Benefits",
        boostTitle: "Boost Points",
        boostDesc: "Need points?\nWatch ad & get 2P!",
        watchAd: "Watch Ad",
        logout: "Log out",
        loggedOut: "Successfully logged out.",
        backToUpload: "Back to Upload",
        local: "Local",
        cloud: "Cloud",
        brandName: "DocTranslation",
        tierBronze: "BRONZE",
        tierSilver: "SILVER",
        tierGold: "GOLD",
        memberLogin: "MEMBER ACCESS",
        driveSelected: "Drive selected: {name}",
        translateReady: "Translation ready",
        translating: "Translating...",
        translateFailed: "Translation failed",
    },
    auth: {
        signinTitle: "Sign In",
        signinDesc: "Start your fast, intelligent document translation.",
        emailLabel: "Email",
        passwordLabel: "Password",
        emailPlaceholder: "name@example.com",
        passwordPlaceholder: "••••••••",
        guestLogin: "Start as Guest (10P)",
        forgotPassword: "Forgot password?",
        submitLogin: "Sign In",
        submitSignup: "Create Account",
        toSignup: "Create an account",
        toSignin: "Sign in with password",
        social: "Enterprise-grade Security",
        alertUnconfirmed: "Email not verified.",
        alertUnconfirmedDesc: "Please check your inbox.",
        btnResend: "Resend Verification Email",
        btnSending: "Sending...",
        btnLoginOther: "Sign in with other ID",
        signupTitle: "Create Account",
        signupDesc: "Check the verification link sent to your email.",
        sentTo: "Sent to",
        checkEmailTitle: "Check your email!",
        checkEmailDesc: "We sent a verification link to",
        backWithEmail: "Re-enter email",
        alreadyHaveAccount: "Already have an account?",
        rememberMe: "Stay signed in"
    },
    admin: {
        dashboard: "Dashboard",
        users: "Users",
        jobs: "Jobs",
        security: "Security",
        shutdown: "Shutdown System",
        userManagement: "User Management",
        totalUsers: "Total Users",
        translationJobs: "Translation Job Status",
        recentActivity: "Recent Activity Log",
        banSystem: "Access Restriction System",
        banDesc: "Isolate intruders or resolve misunderstandings with Master privileges.",
        verifying: "Verifying Master Identity..."
    },
    coupons: {
        title: "Redeem Coupon",
        desc: "Enter your promo code and get points.",
        placeholder: "Enter code here",
        button: "Claim",
        success: "{points}P Added!",
        successDesc: "Coupon successfully redeemed.",
        failedTitle: "Redemption Failed",
        errorSystem: "System Error",
        errorSystemDesc: "Please try again later."
    },
    reports: {
        title: "Report Content",
        description: "Why are you reporting this {type}?",
        placeholder: "Please describe the issue...",
        cancel: "Cancel",
        submit: "Submit Report",
        success: "Report Submitted",
        successDesc: "Thank you for keeping our community safe.",
        errorFailed: "Report Failed",
        errorSystem: "System Error"
    }
};

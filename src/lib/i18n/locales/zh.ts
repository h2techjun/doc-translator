export const zh = {
    badge: "100% 格式保留",
    title: { main: "格式不变，", highlight: "只变语言。" },
    description: "翻译包含复杂表格的文档，排版完美保留。\nAI 理解上下文，提供自然的译文。",
    dropzone: { idle: "拖放文件到这里", sub: "或点击选择", support: "支持 DOCX, XLSX, PPTX, HWP" },
    features: {
        compatibility: { title: "原生支持", desc: "无需转换为 PDF，直接处理 Office 和 HWP 文件。" },
        format: { title: "完美排版", desc: "表格、图表和图片位置保持不变。" },
        speed: { title: "极速引擎", desc: "大文件也能在几十秒内处理完成。" }
    },
    pricingPage: {
        hero: { title: "选择你的", highlight: "能力等级", subtitle: "使用我们的高保真 AI 翻译引擎扩展您的全球沟通。" },
        tiers: {
            guest: { name: "访客", price: "免费", desc: "无需注册", limit: "2pages", button: "体验访客模式", features: ["支持 Word/Excel/PPT", "每文档限 2pages"] },
            bronze: { name: "青铜", price: "免费", desc: "基础会员", bonus: "注册奖励: 50P", button: "免费加入", features: ["社区支持"] },
            silver: { name: "白银", priceKRW: "用户", priceUSD: "$5.00", desc: "获得 50P 并升级", bonus: "即时 50P", button: "充值 50P", features: ["认证徽章", "更快的处理速度"] },
            gold: { name: "黄金", price: "100k+", unit: "KRW", desc: "累计支付", vip: "VIP 身份", button: "自动升级", features: ["最高优先级", "直接支持专线"] }
        },
        policy: {
            title: "积分与运营政策",
            pointTitle: "1. 积分政策",
            pointItems: ["注册奖励: 注册时立即获得 50P。", "基础费用: 每个文档消耗 {base} 积分 ({basePages}page)。", "超额费用: 从第 {nextPage} 页起，每页 {extra}P。", "访客模式: 访客可免费翻译 2page。"],
            adTitle: "2. 广告与充值政策",
            adItems: ["免费充值: 积分不足时，可以通过观看广告赚取积分。", "奖励: 点击广告中的 [领取 5 积分] 可获得 5P。", "无限: 测试期间，广告奖励次数不限。", "服务: 广告收入用于支持服务器和 AI 引擎成本。"],
            disclaimer: "* 此政策在测试期间可能会有所变动。积分不可退还。"
        },
        features: {
            support: { title: "全球支持", desc: "支持 20 多种语言，具备文化感知的 AI。" },
            security: { title: "企业级安全", desc: "银行级加密，保护您的所有文档。" },
            fidelity: { title: "高保真", desc: "保留所有格式、图表和图解。" }
        }
    },
    community: {
        title: "社区",
        write: "发帖",
        tabs: {
            free: "自由版块",
            inquiry: "问答版块",
            notice: "公告"
        },
        noPosts: "暂无帖子。快来发布第一篇吧！",
        noticeFixed: "公告",
        postedBy: "作者",
        views: "阅读"
    },
    adReward: {
        title: "观看完广告了吗？领取您的奖励！",
        button: "领取 5 积分 (+5P)",
        loading: "处理中...",
        success: "恭喜！已充值 {points}P。"
    },
    pricingRule: {
        title: "积分政策",
        base: "{base} 积分 ({basePages}page)",
        extra: "第 {nextPage} 页起 {extra}P/页"
    },
    selector: "目标语言",
    selectorLabel: "选择目标语言",
    button: { translate: "立即翻译" },
    time: { estimated: "预计时间", seconds: "秒" },
    loading: {
        uploading: { title: "上传中...", desc: "正在将文档发送至安全服务器。" },
        processing: { title: "翻译中...", desc: "AI 正在分析并重写内容。" },
        completed: { title: "完成！", desc: "您的文档已准备好下载。" },
        failed: { title: "错误", desc: "出错了，请重试。" },
        success: { title: "成功！", desc: "格式保留 100%" },
        download: "下载翻译文件"
    },
    nav: {
        community: "社区",
        pricing: "价格",
        login: "登录",
        signup: "免费开始",
        pointsHold: "持有积分",
        adminDashboard: "总控台",
        myHistory: "我的翻译",
        betaBenefits: "Beta 福利",
        boostTitle: "积分加速",
        boostDesc: "积分不够？\n看广告领 2P！",
        watchAd: "观看广告",
        logout: "退出登录",
        loggedOut: "已成功退出。",
        backToUpload: "返回上传",
        local: "本地上传",
        cloud: "云端",
        brandName: "DocTranslation",
        tierBronze: "青铜",
        tierSilver: "白银",
        tierGold: "黄金",
        memberLogin: "会员登录",
    },
     auth: {
        signinTitle: "登录",
        signinDesc: "开始您的快速智能文档翻译。",
        emailLabel: "电子邮箱",
        passwordLabel: "密码",
        emailPlaceholder: "name@example.com",
        passwordPlaceholder: "••••••••",
        guestLogin: "以访客身份开始 (10P)",
        forgotPassword: "忘记密码？",
        submitLogin: "登录",
        submitSignup: "创建账户",
        toSignup: "创建账户",
        toSignin: "使用密码登录",
        social: "企业级安全",
        alertUnconfirmed: "邮箱未验证。",
        alertUnconfirmedDesc: "请检查您的收件箱。",
        btnResend: "重发验证邮件",
        btnSending: "发送中...",
        btnLoginOther: "使用其他 ID 登录",
        signupTitle: "创建账户",
        signupDesc: "请查看发送到您邮箱的验证链接。",
        sentTo: "已发送至",
        checkEmailTitle: "检查您的邮件！",
        checkEmailDesc: "我们已发送验证链接至",
        backWithEmail: "重新输入邮箱",
        alreadyHaveAccount: "已有账户？",
        rememberMe: "保持登录"
    },
    admin: {
        dashboard: "仪表盘",
        users: "用户管理",
        jobs: "任务监控",
        security: "安全中心",
        shutdown: "系统关机",
        userManagement: "用户管理",
        totalUsers: "总用户数",
        translationJobs: "翻译任务状态",
        recentActivity: "近期活动日志",
        banSystem: "访问限制系统",
        banDesc: "以管理员权限隔离入侵者或解决误会。",
        verifying: "验证管理员身份..."
    },
    coupons: {
        title: "兑换优惠券",
        desc: "输入您的促销代码并获得积分。",
        placeholder: "在此输入代码",
        button: "领取",
        success: "已添加 {points}P！",
        successDesc: "优惠券兑换成功。",
        failedTitle: "兑换失败",
        errorSystem: "系统错误",
        errorSystemDesc: "请稍后再试。"
    },
    reports: {
        title: "举报内容",
        description: "您为什么要举报此{type}？",
        placeholder: "请详细描述问题...",
        cancel: "取消",
        submit: "提交举报",
        success: "举报已提交",
        successDesc: "感谢您维护社区安全。",
        errorFailed: "举报失败",
        errorSystem: "系统错误"
    }
};

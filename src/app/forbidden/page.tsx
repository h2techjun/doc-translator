export default function ForbiddenPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
            <h2 className="text-2xl font-semibold mb-6">Unauthorized Access</h2>
            <p className="text-gray-400 mb-8 max-w-md text-center">
                당신은 마스터 대시보드에 접근할 권한이 없습니다.<br />
                관리자에게 문의하거나, 올바른 계정으로 로그인해주세요.
            </p>
            <div className="flex gap-4">
                <a
                    href="/signin"
                    className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition"
                >
                    로그인 페이지로 이동
                </a>
                <a
                    href="/"
                    className="px-6 py-3 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10 transition"
                >
                    홈으로 가기
                </a>
            </div>
        </div>
    );
}

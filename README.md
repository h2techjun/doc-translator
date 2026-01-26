# 📄 문서 번역 서비스 (Document Translation Service)

> **세계 최고 수준의 레이아웃 보존 문서 번역 시스템**

## 🎯 핵심 기능

- ✅ **완벽한 서식 보존**: Word, Excel, PDF, PowerPoint 원본 레이아웃 100% 유지
- ✅ **AI 기반 번역**: Gemini API를 활용한 고품질 번역
- ✅ **PDF 특화 기술**: PDFMathTranslate (pdf2zh) 통합으로 학술 논문급 품질
- ✅ **비동기 처리**: BullMQ + Redis로 대용량 파일 안정적 처리
- ✅ **다국어 지원**: 한국어, 영어, 일본어, 중국어, 태국어, 베트남어 등

---

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 필수 값 입력
```

### 2. 서비스 시작

```bash
# 개발 서버 시작
npm run dev

# Worker 시작 (별도 터미널)
npm run worker
```

### 3. 접속

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

---

## 📦 PDF 고급 번역 (pdf2zh) 설정

**최고 품질의 PDF 번역**을 원하신다면 pdf2zh를 설치하세요:

### 필수 요구사항
- Python 3.10 이상

### 설치 방법

```bash
# Python 설치 확인
python --version

# pdf2zh 자동 설치
python scripts/install-pdf2zh.py
```

### 환경 변수 설정

`.env` 파일에 추가:

```env
PDF_STRATEGY=pdf2zh  # 최고 품질 (기본값)
# PDF_STRATEGY=gemini  # Fallback (Python 불필요)
```

📚 **상세 가이드**: [docs/PDF2ZH_SETUP.md](./docs/PDF2ZH_SETUP.md)

---

## 🛠️ 기술 스택

### Frontend
- **Next.js 16** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **Radix UI** - 컴포넌트 라이브러리

### Backend
- **Prisma** - ORM
- **PostgreSQL** - 데이터베이스
- **Redis + BullMQ** - 작업 큐
- **AWS S3 / MinIO** - 파일 스토리지

### AI & 문서 처리
- **Gemini API** - AI 번역
- **pdf2zh (PDFMathTranslate)** - PDF 레이아웃 보존
- **docx** - Word 문서 처리
- **ExcelJS** - Excel 처리
- **pdf-lib** - PDF 조작

---

## 📂 프로젝트 구조

```
src/
├── app/                    # Next.js 앱 라우터
├── components/             # React 컴포넌트
├── lib/
│   ├── ai/                # AI 번역 로직
│   ├── document/          # 문서 처리 (DOCX, XLSX, PDF)
│   ├── translation/       # 번역 전략 패턴
│   │   └── strategies/    # 파일 타입별 전략
│   ├── storage.ts         # S3/MinIO 연동
│   └── queue.ts           # BullMQ 설정
├── workers/               # 백그라운드 Worker
└── types/                 # TypeScript 타입 정의

scripts/
├── install-pdf2zh.py      # pdf2zh 자동 설치
└── translate-pdf.py       # Python 브릿지
```

---

## 🔧 개발 가이드

### 환경 변수

필수 환경 변수:

```env
# Database
DATABASE_URL="postgresql://..."

# Redis
REDIS_URL="redis://localhost:6379"

# S3 Storage
AWS_BUCKET_NAME="translations"
AWS_REGION="auto"
AWS_ENDPOINT="http://localhost:9000"
AWS_ACCESS_KEY_ID="minioadmin"
AWS_SECRET_ACCESS_KEY="minioadmin"

# AI
GEMINI_API_KEY="your-gemini-api-key"

# PDF Strategy (선택)
PDF_STRATEGY="pdf2zh"  # or "gemini"
```

### 데이터베이스 마이그레이션

```bash
npx prisma migrate dev
npx prisma generate
```

### 테스트

```bash
npm test
```

---

## 📊 성능 비교

| 파일 형식 | 처리 방식 | 레이아웃 보존 | 속도 |
|----------|----------|-------------|------|
| **PDF (pdf2zh)** | Python 서브프로세스 | ✅ 100% | 🐢 느림 |
| **PDF (Gemini)** | Vision API | ⚠️ 70% | 🚀 빠름 |
| **DOCX** | PizZip + XML | ✅ 95% | ⚡ 매우 빠름 |
| **XLSX** | ExcelJS | ✅ 100% | ⚡ 매우 빠름 |

---

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

This project is licensed under the MIT License.

---

## 🙏 감사의 말

- [PDFMathTranslate](https://github.com/Byaidu/PDFMathTranslate) - 세계 최고의 PDF 번역 도구
- [Gemini API](https://ai.google.dev/) - 강력한 AI 번역 엔진
- [Next.js](https://nextjs.org/) - 최고의 React 프레임워크

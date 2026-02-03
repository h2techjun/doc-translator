# 🌍 언어 구조 변경 계획

## 📋 작업 내용

### 1. 표시 언어 (UI Language) 축소
**변경 전**: 20개 언어
- ko, en, ja, zh, vi, es, fr, de, ru, pt, it, id, th, tr, pl, nl, ar, hi, bn, ms

**변경 후**: 6개 주요 언어
- ✅ ko (한국어)
- ✅ en (영어)
- ✅ ja (일본어)
- ✅ zh (중국어)
- ✅ es (스페인어)
- ✅ fr (프랑스어)

### 2. 번역 대상 언어 (Translation Target)
**추천 언어 (수요 기준)**:
1. 영어 (en) - 글로벌 표준
2. 중국어 간체 (zh-CN)
3. 중국어 번체 (zh-TW)
4. 일본어 (ja)
5. 스페인어 (es)
6. 프랑스어 (fr)
7. 독일어 (de)
8. 러시아어 (ru)
9. 포르투갈어 (pt)
10. 아랍어 (ar)
11. 힌디어 (hi)
12. 베트남어 (vi)

### 3. 수정 필요 파일
- ✅ `src/lib/i18n/dictionaries.ts` - Locale 타입 수정 완료
- 🔄 `src/lib/i18n/dictionaries.ts` - 불필요한 언어 데이터 제거 필요
- 🔄 번역 대상 언어 설정 파일 확인 필요

### 4. 다음 작업
1. dictionaries.ts에서 de, ru, pt, it, id, th, tr, pl, nl, ar, hi, bn, ms, vi 섹션 삭제
2. 번역 대상 언어 목록 업데이트
3. 언어 선택 UI 컴포넌트 확인 및 업데이트
4. 빌드 및 테스트

## ⚠️ 주의사항
- 기존 사용자 데이터의 언어 설정은 유지
- 제거된 언어로 설정된 사용자는 자동으로 영어로 fallback

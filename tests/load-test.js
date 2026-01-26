
import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * 🚀 k6 부하 테스트 시나리오
 * 
 * 이 스크립트는 서비스의 주요 엔드포인트에 대한 부하 테스트를 수행합니다.
 * 1. 홈 페이지 접속 (GET /en)
 * 2. 커뮤니티 페이지 접속 (GET /en/community)
 * 3. 번역 업로드 API 호출 (POST /api/translation/upload)
 */

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // 30초 동안 20명의 가상 사용자(VU)로 증가
    { duration: '1m', target: 20 },  // 1분 동안 20명 유지
    { duration: '30s', target: 0 },  // 30초 동안 0명으로 감소
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95%의 요청이 500ms 이내여야 함
    http_req_failed: ['rate<0.01'],   // 에러율 1% 미만 유지
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // 1. Home Page
  const homeRes = http.get(`${BASE_URL}/en`);
  check(homeRes, {
    'home status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // 2. Community Page
  const communityRes = http.get(`${BASE_URL}/en/community`);
  check(communityRes, {
    'community status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // 3. Translation Upload API (Mock payload) - Dynamic request
  const payload = JSON.stringify({
    fileType: 'docx',
    priority: 'LOW',
    targetLang: 'ko',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const uploadRes = http.post(`${BASE_URL}/api/translation/upload`, payload, params);
  check(uploadRes, {
    'upload api status is 200 or 401': (r) => [200, 401].includes(r.status), // 401 is okay if not logged in
  });

  sleep(2);
}

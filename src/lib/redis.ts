
import IORedis from 'ioredis';

/**
 * 🔴 Redis 클라이언트 설정 (Redis Configuration)
 * 
 * ioredis를 사용하여 Redis 서버에 연결합니다.
 * 싱글톤 패턴을 적용하여 개발 환경에서 불필요한 연결 생성을 방지합니다.
 * 
 * 주요 용도:
 * 1. BullMQ 작업 큐 (Job Queue) 저장소
 * 2. 번역 데이터 해시 캐싱 (Translation Memory)
 * 3. 사용자 세션 관리 (Prisma Adapter가 자동 처리하지만 직접 접근도 가능)
 */
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null, // BullMQ 요구사항: null이어야 함
    enableReadyCheck: false,
});

export default connection;

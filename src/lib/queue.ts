
import { Queue } from 'bullmq';
import connection from './redis';

/**
 * 🐂 BullMQ 작업 큐 설정 (Queue Configuration)
 * 
 * 'translation-queue'라는 이름의 대기열을 생성합니다.
 * 이 큐는 문서 번역 및 포맷 변환 작업을 관리합니다.
 * 
 * ⚡ 우선순위 (Priority) 전략:
 * - High Priority: Pro 플랜 사용자 (빠른 처리)
 * - Low Priority: Free 플랜 사용자 (대기 시간 발생 가능)
 */
export const translationQueue = new Queue('translation-queue', {
    connection: connection as any,
    defaultJobOptions: {
        attempts: 3, // 실패 시 3회 재시도
        backoff: {
            type: 'exponential', // 지수 백오프 (점점 늦게 재시도)
            delay: 1000,
        },
        removeOnComplete: true, // 완료된 작업은 자동 삭제 (메모리 절약)
        removeOnFail: false, // 실패한 작업은 디버깅을 위해 보존
    },
});

/**
 * 🛠️ 작업 추가 함수 (Add Job Wrapper)
 * 
 * 작업을 큐에 추가하는 헬퍼 함수입니다.
 * @param data 파일 경로, 타겟 언어 등 작업에 필요한 데이터
 * @param priority 우선순위 (1: High, 2+: Low) - 숫자가 작을수록 높음
 */
export const addTranslationJob = async (data: any, priority: number = 2) => {
    return await translationQueue.add('translate-document', data, {
        priority,
        jobId: data.jobId, // DB의 Job ID(CUID)를 큐 작업 ID로 사용 (Worker와 동기화 필수)
    });
};


import { cn } from '@/lib/utils'; // Adjust path if needed

describe('utils', () => {
    describe('cn', () => {
        it('should merge class names correctly', () => {
            const result = cn('c-1', 'c-2');
            expect(result).toBe('c-1 c-2');
        });

        it('should handle conditional classes', () => {
            const result = cn('c-1', true && 'c-2', false && 'c-3');
            expect(result).toBe('c-1 c-2');
        });

        it('should merge tailwind classes', () => {
            const result = cn('p-4', 'p-2');
            expect(result).toBe('p-2');
        });
    });
});

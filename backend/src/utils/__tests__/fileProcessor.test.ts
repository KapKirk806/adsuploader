import { calculateAspectRatio } from '../fileProcessor';

describe('FileProcessor', () => {
  describe('calculateAspectRatio', () => {
    it('should detect 1:1 square ratio', () => {
      const ratio = calculateAspectRatio(1080, 1080);
      expect(ratio).toBe('1:1');
    });

    it('should detect 1.91:1 landscape ratio', () => {
      const ratio = calculateAspectRatio(1200, 628);
      expect(ratio).toBe('1.91:1');
    });

    it('should detect 4:5 portrait ratio', () => {
      const ratio = calculateAspectRatio(1080, 1350);
      expect(ratio).toBe('4:5');
    });

    it('should detect 9:16 story ratio', () => {
      const ratio = calculateAspectRatio(1080, 1920);
      expect(ratio).toBe('9:16');
    });

    it('should detect 16:9 widescreen ratio', () => {
      const ratio = calculateAspectRatio(1920, 1080);
      expect(ratio).toBe('16:9');
    });

    it('should return unknown for zero dimensions', () => {
      const ratio = calculateAspectRatio(0, 0);
      expect(ratio).toBe('unknown');
    });

    it('should calculate custom ratio for non-standard dimensions', () => {
      const ratio = calculateAspectRatio(800, 600);
      expect(ratio).toBe('4:3');
    });

    it('should handle large numbers', () => {
      const ratio = calculateAspectRatio(3840, 2160);
      expect(ratio).toBe('16:9');
    });
  });
});

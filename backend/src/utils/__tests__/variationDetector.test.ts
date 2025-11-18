import {
  extractVariationInfo,
  groupFilesByVariation,
  sortVariationFiles,
  getVariationGroups,
  validateVariationGroup,
  generateVariationName,
} from '../variationDetector';

describe('VariationDetector', () => {
  describe('extractVariationInfo', () => {
    it('should extract variation info from _v pattern', () => {
      const result = extractVariationInfo('image_A_v1.jpg');
      expect(result).toEqual({
        group: 'image_A',
        number: 1,
        originalName: 'image_A_v1.jpg',
      });
    });

    it('should extract variation info from numbered pattern', () => {
      const result = extractVariationInfo('creative_001.png');
      expect(result).toEqual({
        group: 'creative',
        number: 1,
        originalName: 'creative_001.png',
      });
    });

    it('should extract variation info from dash pattern', () => {
      const result = extractVariationInfo('banner-5.jpg');
      expect(result).toEqual({
        group: 'banner',
        number: 5,
        originalName: 'banner-5.jpg',
      });
    });

    it('should extract variation info from letter pattern', () => {
      const result = extractVariationInfo('product_a.jpg');
      expect(result).toEqual({
        group: 'product',
        number: 1,
        originalName: 'product_a.jpg',
      });
    });

    it('should return null for files without variation pattern', () => {
      const result = extractVariationInfo('randomfile.jpg');
      expect(result).toBeNull();
    });
  });

  describe('groupFilesByVariation', () => {
    it('should group files by variation pattern', () => {
      const files = [
        'image_A_v1.jpg',
        'image_A_v2.jpg',
        'image_B_v1.jpg',
        'random.jpg',
      ];

      const groups = groupFilesByVariation(files);

      expect(groups.size).toBe(3);
      expect(groups.get('image_A')?.count).toBe(2);
      expect(groups.get('image_B')?.count).toBe(1);
      expect(groups.get('random')?.count).toBe(1);
    });

    it('should handle empty array', () => {
      const groups = groupFilesByVariation([]);
      expect(groups.size).toBe(0);
    });
  });

  describe('sortVariationFiles', () => {
    it('should sort files by variation number', () => {
      const files = [
        'image_v3.jpg',
        'image_v1.jpg',
        'image_v2.jpg',
      ];

      const sorted = sortVariationFiles(files);

      expect(sorted).toEqual([
        'image_v1.jpg',
        'image_v2.jpg',
        'image_v3.jpg',
      ]);
    });

    it('should sort different groups separately', () => {
      const files = [
        'banner_v2.jpg',
        'creative_v1.jpg',
        'banner_v1.jpg',
      ];

      const sorted = sortVariationFiles(files);

      expect(sorted[0]).toBe('banner_v1.jpg');
      expect(sorted[1]).toBe('banner_v2.jpg');
      expect(sorted[2]).toBe('creative_v1.jpg');
    });
  });

  describe('getVariationGroups', () => {
    it('should return sorted variation groups', () => {
      const files = [
        'product_v2.jpg',
        'product_v1.jpg',
        'banner_v1.jpg',
      ];

      const groups = getVariationGroups(files);

      expect(groups).toHaveLength(2);
      expect(groups[0].name).toBe('banner');
      expect(groups[1].name).toBe('product');
      expect(groups[1].files).toEqual(['product_v1.jpg', 'product_v2.jpg']);
    });
  });

  describe('validateVariationGroup', () => {
    it('should return true for valid variation group', () => {
      const files = ['image_v1.jpg', 'image_v2.jpg', 'image_v3.jpg'];
      expect(validateVariationGroup(files)).toBe(true);
    });

    it('should return false for mixed variation groups', () => {
      const files = ['image_v1.jpg', 'banner_v1.jpg'];
      expect(validateVariationGroup(files)).toBe(false);
    });

    it('should return true for single file', () => {
      const files = ['image_v1.jpg'];
      expect(validateVariationGroup(files)).toBe(true);
    });

    it('should return false for empty array', () => {
      const files: string[] = [];
      expect(validateVariationGroup(files)).toBe(false);
    });
  });

  describe('generateVariationName', () => {
    it('should generate variation name with v pattern', () => {
      const name = generateVariationName('product', 3, 'v');
      expect(name).toBe('product_v3');
    });

    it('should generate variation name with number pattern', () => {
      const name = generateVariationName('banner', 5, 'number');
      expect(name).toBe('banner_005');
    });

    it('should generate variation name with letter pattern', () => {
      const name = generateVariationName('creative', 2, 'letter');
      expect(name).toBe('creative_b');
    });

    it('should default to v pattern', () => {
      const name = generateVariationName('image', 1);
      expect(name).toBe('image_v1');
    });
  });
});

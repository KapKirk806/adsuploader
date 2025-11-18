/**
 * Variation Detection Utility
 * Detects and groups ad creative variations based on naming patterns
 */

export interface VariationInfo {
  group: string;
  number: number;
  originalName: string;
}

export interface VariationGroup {
  name: string;
  files: string[];
  count: number;
}

/**
 * Common variation patterns:
 * - image_A_v1.jpg, image_A_v2.jpg
 * - creative_001.jpg, creative_002.jpg
 * - banner-1.jpg, banner-2.jpg
 * - product_variant_a.jpg, product_variant_b.jpg
 */

const variationPatterns = [
  // Pattern: name_v1, name_v2, etc.
  /^(.+?)_v(\d+)/i,
  // Pattern: name_001, name_002, etc.
  /^(.+?)_(\d{2,})/,
  // Pattern: name-1, name-2, etc.
  /^(.+?)-(\d+)/,
  // Pattern: name_variant_a, name_variant_b, etc.
  /^(.+?)_variant_([a-z])$/i,
  // Pattern: name_a, name_b, etc.
  /^(.+?)_([a-z])$/i,
  // Pattern: name(1), name(2), etc.
  /^(.+?)\((\d+)\)/,
];

/**
 * Extract variation info from filename
 */
export const extractVariationInfo = (filename: string): VariationInfo | null => {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

  for (const pattern of variationPatterns) {
    const match = nameWithoutExt.match(pattern);
    if (match) {
      const group = match[1].trim();
      let number: number;

      // Handle letter variations (a=1, b=2, etc.)
      if (/^[a-z]$/i.test(match[2])) {
        number = match[2].toLowerCase().charCodeAt(0) - 96;
      } else {
        number = parseInt(match[2], 10);
      }

      return {
        group,
        number,
        originalName: filename,
      };
    }
  }

  return null;
};

/**
 * Group files by variation pattern
 */
export const groupFilesByVariation = (filenames: string[]): Map<string, VariationGroup> => {
  const groups = new Map<string, VariationGroup>();

  filenames.forEach((filename) => {
    const variation = extractVariationInfo(filename);

    if (variation) {
      const existing = groups.get(variation.group);

      if (existing) {
        existing.files.push(filename);
        existing.count++;
      } else {
        groups.set(variation.group, {
          name: variation.group,
          files: [filename],
          count: 1,
        });
      }
    } else {
      // Files without variation pattern get their own group
      const groupName = filename.replace(/\.[^/.]+$/, '');
      groups.set(groupName, {
        name: groupName,
        files: [filename],
        count: 1,
      });
    }
  });

  return groups;
};

/**
 * Sort files within a variation group by number
 */
export const sortVariationFiles = (filenames: string[]): string[] => {
  return filenames.sort((a, b) => {
    const varA = extractVariationInfo(a);
    const varB = extractVariationInfo(b);

    if (!varA || !varB) return 0;
    if (varA.group !== varB.group) return varA.group.localeCompare(varB.group);

    return varA.number - varB.number;
  });
};

/**
 * Get variation groups with sorted files
 */
export const getVariationGroups = (filenames: string[]): VariationGroup[] => {
  const groupsMap = groupFilesByVariation(filenames);
  const groups: VariationGroup[] = [];

  groupsMap.forEach((group) => {
    groups.push({
      ...group,
      files: sortVariationFiles(group.files),
    });
  });

  // Sort groups by name
  return groups.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Suggest naming pattern for new variations
 */
export const suggestNamingPattern = (baseName: string, existingCount: number): string => {
  // Use _v{number} pattern as default
  const nextNumber = existingCount + 1;
  return `${baseName}_v${nextNumber}`;
};

/**
 * Validate if files belong to same variation group
 */
export const validateVariationGroup = (filenames: string[]): boolean => {
  if (filenames.length === 0) return false;
  if (filenames.length === 1) return true;

  const firstVariation = extractVariationInfo(filenames[0]);
  if (!firstVariation) return false;

  return filenames.every((filename) => {
    const variation = extractVariationInfo(filename);
    return variation && variation.group === firstVariation.group;
  });
};

/**
 * Generate variation name based on group and number
 */
export const generateVariationName = (
  groupName: string,
  number: number,
  pattern: 'v' | 'number' | 'letter' = 'v'
): string => {
  switch (pattern) {
    case 'v':
      return `${groupName}_v${number}`;
    case 'number':
      return `${groupName}_${String(number).padStart(3, '0')}`;
    case 'letter':
      const letter = String.fromCharCode(96 + number); // 1=a, 2=b, etc.
      return `${groupName}_${letter}`;
    default:
      return `${groupName}_v${number}`;
  }
};

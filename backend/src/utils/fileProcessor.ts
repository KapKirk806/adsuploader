import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

// Set ffmpeg path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

const unlinkAsync = promisify(fs.unlink);

export interface FileMetadata {
  width: number;
  height: number;
  aspectRatio: string;
  duration?: number;
  size: number;
  type: 'image' | 'video';
}

/**
 * Get image metadata using sharp
 */
export const getImageMetadata = async (filePath: string): Promise<FileMetadata> => {
  const metadata = await sharp(filePath).metadata();
  const stats = await fs.promises.stat(filePath);

  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const aspectRatio = calculateAspectRatio(width, height);

  return {
    width,
    height,
    aspectRatio,
    size: stats.size,
    type: 'image',
  };
};

/**
 * Get video metadata using ffmpeg
 */
export const getVideoMetadata = (filePath: string): Promise<FileMetadata> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, async (err, metadata) => {
      if (err) {
        return reject(err);
      }

      const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
      if (!videoStream) {
        return reject(new Error('No video stream found'));
      }

      const stats = await fs.promises.stat(filePath);
      const width = videoStream.width || 0;
      const height = videoStream.height || 0;
      const aspectRatio = calculateAspectRatio(width, height);
      const duration = metadata.format.duration || 0;

      resolve({
        width,
        height,
        aspectRatio,
        duration: Math.round(duration),
        size: stats.size,
        type: 'video',
      });
    });
  });
};

/**
 * Calculate aspect ratio and return standard format
 */
export const calculateAspectRatio = (width: number, height: number): string => {
  if (width === 0 || height === 0) return 'unknown';

  const ratio = width / height;

  // Standard aspect ratios for social media ads
  if (Math.abs(ratio - 1) < 0.1) return '1:1'; // Square
  if (Math.abs(ratio - 1.91) < 0.1) return '1.91:1'; // Landscape
  if (Math.abs(ratio - 0.8) < 0.1) return '4:5'; // Portrait
  if (Math.abs(ratio - 0.5625) < 0.1) return '9:16'; // Story
  if (Math.abs(ratio - 1.78) < 0.1) return '16:9'; // Widescreen

  // Return calculated ratio
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
};

/**
 * Generate thumbnail from video
 */
export const generateVideoThumbnail = (
  videoPath: string,
  outputPath: string,
  timeInSeconds: number = 1
): Promise<string> => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timeInSeconds],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '640x?',
      })
      .on('end', () => resolve(outputPath))
      .on('error', reject);
  });
};

/**
 * Generate multiple thumbnails from video at different timestamps
 */
export const generateMultipleThumbnails = async (
  videoPath: string,
  outputDir: string,
  times: number[] = [1, 3, 5]
): Promise<string[]> => {
  const thumbnails: string[] = [];

  for (const time of times) {
    const outputPath = path.join(outputDir, `thumb_${time}s_${Date.now()}.jpg`);
    await generateVideoThumbnail(videoPath, outputPath, time);
    thumbnails.push(outputPath);
  }

  return thumbnails;
};

/**
 * Resize image to specific dimensions
 */
export const resizeImage = async (
  inputPath: string,
  outputPath: string,
  width?: number,
  height?: number
): Promise<void> => {
  await sharp(inputPath)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFile(outputPath);
};

/**
 * Optimize image for web
 */
export const optimizeImage = async (
  inputPath: string,
  outputPath: string,
  quality: number = 80
): Promise<void> => {
  const ext = path.extname(inputPath).toLowerCase();

  if (ext === '.jpg' || ext === '.jpeg') {
    await sharp(inputPath).jpeg({ quality }).toFile(outputPath);
  } else if (ext === '.png') {
    await sharp(inputPath).png({ quality }).toFile(outputPath);
  } else if (ext === '.webp') {
    await sharp(inputPath).webp({ quality }).toFile(outputPath);
  } else {
    // Just copy the file if format is not supported
    await fs.promises.copyFile(inputPath, outputPath);
  }
};

/**
 * Clean up temporary files
 */
export const cleanupFile = async (filePath: string): Promise<void> => {
  try {
    if (fs.existsSync(filePath)) {
      await unlinkAsync(filePath);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

/**
 * Clean up multiple files
 */
export const cleanupFiles = async (filePaths: string[]): Promise<void> => {
  await Promise.all(filePaths.map((path) => cleanupFile(path)));
};

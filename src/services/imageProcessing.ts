import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export interface ImageProcessingOptions {
  width: number;
  height: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export class ImageProcessor {
  /**
   * Process and optimize image for Twitter Cards
   */
  static async processImage(
    inputPath: string, 
    outputPath: string, 
    options: ImageProcessingOptions
  ): Promise<void> {
    const { width, height, quality = 85, format = 'jpeg' } = options;

    await sharp(inputPath)
      .resize(width, height, {
        fit: 'cover' // Resize to fit exact dimensions
      })
      .jpeg({ quality })
      .toFile(outputPath);
  }

  /**
   * Get image dimensions
   */
  static async getImageDimensions(imagePath: string): Promise<{ width: number; height: number }> {
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0
    };
  }

  /**
   * Generate optimized image for Twitter Cards (always landscape format)
   */
  static async generateTwitterCardImage(
    inputPath: string,
    outputPath: string
  ): Promise<void> {
    // Always use landscape format (1200x600) for consistent Twitter Card display
    await this.processImage(inputPath, outputPath, {
      width: 1200,
      height: 600,
      quality: 85,
      format: 'jpeg'
    });
  }

  /**
   * Clean up temporary files
   */
  static async cleanupFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
}


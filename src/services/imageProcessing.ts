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
        fit: 'cover', // Crop to fit exact dimensions
        position: 'center' // Center the crop
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
   * Generate optimized image for specific Twitter Card format
   */
  static async generateTwitterCardImage(
    inputPath: string,
    outputPath: string,
    format: 'portrait' | 'landscape' | 'square',
    cropOptions?: {
      cropX: number;
      cropY: number;
      cropWidth: number;
      cropHeight: number;
    }
  ): Promise<void> {
    const formatSpecs = {
      portrait: { width: 400, height: 600 },
      landscape: { width: 1200, height: 600 },
      square: { width: 400, height: 400 }
    };

    const specs = formatSpecs[format];

    if (cropOptions) {
      // Apply custom cropping
      await sharp(inputPath)
        .extract({
          left: Math.round(cropOptions.cropX),
          top: Math.round(cropOptions.cropY),
          width: Math.round(cropOptions.cropWidth),
          height: Math.round(cropOptions.cropHeight)
        })
        .resize(specs.width, specs.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath);
    } else {
      // Use default processing
      await this.processImage(inputPath, outputPath, {
        width: specs.width,
        height: specs.height,
        quality: 85,
        format: 'jpeg'
      });
    }
  }

  /**
   * Generate optimized image for general display (16:9 aspect ratio)
   */
  static async generateDisplayImage(
    inputPath: string,
    outputPath: string
  ): Promise<void> {
    await this.processImage(inputPath, outputPath, {
      width: 1200,
      height: 628, // 16:9 aspect ratio
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


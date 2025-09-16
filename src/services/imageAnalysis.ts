export interface ImageFormat {
  type: 'portrait' | 'landscape' | 'square';
  width: number;
  height: number;
  aspectRatio: number;
  description: string;
}

export interface ImageAnalysisResult {
  originalWidth: number;
  originalHeight: number;
  originalAspectRatio: number;
  recommendedFormats: ImageFormat[];
  needsCropping: boolean;
  perfectMatch?: ImageFormat;
}

export class ImageAnalysisService {
  // Twitter Card format specifications
  private static readonly FORMATS: ImageFormat[] = [
    {
      type: 'portrait',
      width: 400,
      height: 600, // 2:3 aspect ratio
      aspectRatio: 2/3,
      description: 'Portrait (Summary Card)'
    },
    {
      type: 'landscape', 
      width: 1200,
      height: 600, // 2:1 aspect ratio
      aspectRatio: 2,
      description: 'Landscape (Summary Card with Large Image)'
    },
    {
      type: 'square',
      width: 400,
      height: 400, // 1:1 aspect ratio
      aspectRatio: 1,
      description: 'Square (App Card)'
    }
  ];

  // Tolerance for "perfect match" detection (within 5% of target aspect ratio)
  private static readonly PERFECT_MATCH_TOLERANCE = 0.05;

  /**
   * Analyze an uploaded image and determine which formats it's suitable for
   */
  static analyzeImage(width: number, height: number): ImageAnalysisResult {
    const aspectRatio = width / height;
    
    // Check for perfect matches first
    const perfectMatch = this.findPerfectMatch(aspectRatio);
    
    if (perfectMatch) {
      return {
        originalWidth: width,
        originalHeight: height,
        originalAspectRatio: aspectRatio,
        recommendedFormats: [perfectMatch],
        needsCropping: false,
        perfectMatch
      };
    }

    // If no perfect match, recommend all formats (user will need to crop)
    return {
      originalWidth: width,
      originalHeight: height,
      originalAspectRatio: aspectRatio,
      recommendedFormats: [...this.FORMATS],
      needsCropping: true
    };
  }

  /**
   * Check if the image aspect ratio matches any format perfectly
   */
  private static findPerfectMatch(aspectRatio: number): ImageFormat | null {
    for (const format of this.FORMATS) {
      const ratioDifference = Math.abs(aspectRatio - format.aspectRatio);
      const tolerance = format.aspectRatio * this.PERFECT_MATCH_TOLERANCE;
      
      if (ratioDifference <= tolerance) {
        return format;
      }
    }
    return null;
  }

  /**
   * Get all available formats
   */
  static getAvailableFormats(): ImageFormat[] {
    return [...this.FORMATS];
  }

  /**
   * Calculate crop dimensions for a specific format
   */
  static calculateCropDimensions(
    originalWidth: number,
    originalHeight: number,
    targetFormat: ImageFormat,
    cropX: number = 0.5, // 0-1, where 0.5 is center
    cropY: number = 0.5  // 0-1, where 0.5 is center
  ): {
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
  } {
    const originalAspectRatio = originalWidth / originalHeight;
    const targetAspectRatio = targetFormat.aspectRatio;

    let cropWidth: number;
    let cropHeight: number;

    if (originalAspectRatio > targetAspectRatio) {
      // Original is wider than target - crop width
      cropHeight = originalHeight;
      cropWidth = originalHeight * targetAspectRatio;
    } else {
      // Original is taller than target - crop height
      cropWidth = originalWidth;
      cropHeight = originalWidth / targetAspectRatio;
    }

    // Calculate crop position based on user selection
    const cropX_px = Math.max(0, Math.min(originalWidth - cropWidth, (originalWidth - cropWidth) * cropX));
    const cropY_px = Math.max(0, Math.min(originalHeight - cropHeight, (originalHeight - cropHeight) * cropY));

    return {
      cropX: cropX_px,
      cropY: cropY_px,
      cropWidth,
      cropHeight
    };
  }

  /**
   * Determine if an image is suitable for a specific format without cropping
   */
  static isSuitableForFormat(
    width: number,
    height: number,
    format: ImageFormat
  ): boolean {
    const aspectRatio = width / height;
    const ratioDifference = Math.abs(aspectRatio - format.aspectRatio);
    const tolerance = format.aspectRatio * this.PERFECT_MATCH_TOLERANCE;
    
    return ratioDifference <= tolerance;
  }
}

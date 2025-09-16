import express from 'express';
import { upload } from '../middleware/upload';
import { uploadRateLimit } from '../middleware/rateLimit';
import { ImageProcessor } from '../services/imageProcessing';
import { generateSlug } from '../utils/slugGenerator';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

const router = express.Router();

// Upload endpoint with rate limiting
router.post('/upload', uploadRateLimit, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { link, title, description, imageFormat, cropData } = req.body;

    if (!link) {
      // Clean up uploaded file if no link provided
      await ImageProcessor.cleanupFile(req.file.path);
      return res.status(400).json({ error: 'Destination link is required' });
    }

    // Generate unique slug
    const slug = generateSlug();

    // Process image for selected Twitter Card format
    const processedImagePath = path.join(
      process.cwd(), 
      'data', 
      'uploads', 
      `processed-${slug}.jpg`
    );

    // Parse crop data if provided
    let cropOptions = undefined;
    if (cropData) {
      try {
        const parsedCropData = JSON.parse(cropData);
        cropOptions = {
          cropX: parsedCropData.cropX,
          cropY: parsedCropData.cropY,
          cropWidth: parsedCropData.cropWidth,
          cropHeight: parsedCropData.cropHeight
        };
      } catch (error) {
        console.error('Error parsing crop data:', error);
      }
    }

    await ImageProcessor.generateTwitterCardImage(
      req.file.path, 
      processedImagePath, 
      imageFormat || 'landscape',
      cropOptions
    );

    // Clean up original uploaded file
    await ImageProcessor.cleanupFile(req.file.path);

    // Save to database
    const card = await prisma.card.create({
      data: {
        slug,
        targetUrl: link,
        title: title || null,
        description: description || null,
        imageUrl: `/uploads/processed-${slug}.jpg`,
        imageFormat: imageFormat || 'landscape'
      }
    });

    res.json({
      success: true,
      card: card,
      previewUrl: `${req.protocol}://${req.get('host')}/${slug}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if it exists
    if (req.file) {
      await ImageProcessor.cleanupFile(req.file.path);
    }
    
    // Clean up processed image if it exists
    const processedImagePath = path.join(
      process.cwd(), 
      'data', 
      'uploads', 
      `processed-${req.body.slug || 'unknown'}.jpg`
    );
    await ImageProcessor.cleanupFile(processedImagePath);
    
    res.status(500).json({ error: 'Failed to process image' });
  }
});

export default router;


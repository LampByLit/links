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

    const { link, title, description } = req.body;

    if (!link) {
      // Clean up uploaded file if no link provided
      await ImageProcessor.cleanupFile(req.file.path);
      return res.status(400).json({ error: 'Destination link is required' });
    }

    // Generate unique slug
    const slug = generateSlug();

    // Process image for selected Twitter Card format - use absolute path for Railway volume
    const processedImagePath = `/data/uploads/processed-${slug}.jpg`;

    // Process image to landscape format (1200x600)
    await ImageProcessor.generateTwitterCardImage(
      req.file.path, 
      processedImagePath
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
        imageUrl: `/uploads/processed-${slug}.jpg`
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
    const processedImagePath = `/data/uploads/processed-${generateSlug()}.jpg`;
    await ImageProcessor.cleanupFile(processedImagePath);
    
    res.status(500).json({ error: 'Failed to process image' });
  }
});

export default router;


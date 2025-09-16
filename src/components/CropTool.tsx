import React, { useState, useRef, useEffect } from 'react';

interface CropToolProps {
  imageUrl: string;
  format: 'portrait' | 'landscape' | 'square';
  onCropChange: (cropData: CropData) => void;
  disabled?: boolean;
}

interface CropData {
  cropX: number; // 0-1, where 0.5 is center
  cropY: number; // 0-1, where 0.5 is center
  cropWidth: number;
  cropHeight: number;
}

const CropTool: React.FC<CropToolProps> = ({ 
  imageUrl, 
  format, 
  onCropChange, 
  disabled = false 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [cropData, setCropData] = useState<CropData>({
    cropX: 0.5,
    cropY: 0.5,
    cropWidth: 0,
    cropHeight: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Format specifications
  const formatSpecs = {
    portrait: { width: 400, height: 600, aspectRatio: 2/3, description: 'Portrait (Summary Card)' },
    landscape: { width: 1200, height: 600, aspectRatio: 2, description: 'Landscape (Summary Card with Large Image)' },
    square: { width: 400, height: 400, aspectRatio: 1, description: 'Square (App Card)' }
  };

  const currentFormat = formatSpecs[format];

  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      img.onload = () => {
        calculateInitialCrop(img.width, img.height);
        drawCropOverlay();
      };
    }
  }, [imageUrl, format]);

  const calculateInitialCrop = (imgWidth: number, imgHeight: number) => {
    const imgAspectRatio = imgWidth / imgHeight;
    const targetAspectRatio = currentFormat.aspectRatio;

    let cropWidth: number;
    let cropHeight: number;

    if (imgAspectRatio > targetAspectRatio) {
      // Image is wider than target - crop width
      cropHeight = imgHeight;
      cropWidth = imgHeight * targetAspectRatio;
    } else {
      // Image is taller than target - crop height
      cropWidth = imgWidth;
      cropHeight = imgWidth / targetAspectRatio;
    }

    const newCropData = {
      cropX: 0.5,
      cropY: 0.5,
      cropWidth,
      cropHeight
    };

    setCropData(newCropData);
    onCropChange(newCropData);
  };

  const drawCropOverlay = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image display size
    const rect = img.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate crop area
    const cropX = (cropData.cropX * (img.naturalWidth - cropData.cropWidth)) * (canvas.width / img.naturalWidth);
    const cropY = (cropData.cropY * (img.naturalHeight - cropData.cropHeight)) * (canvas.height / img.naturalHeight);
    const cropW = cropData.cropWidth * (canvas.width / img.naturalWidth);
    const cropH = cropData.cropHeight * (canvas.height / img.naturalHeight);

    // Clear crop area
    ctx.clearRect(cropX, cropY, cropW, cropH);

    // Draw crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    // Draw corner handles
    const handleSize = 8;
    ctx.fillStyle = '#3b82f6';
    
    // Top-left
    ctx.fillRect(cropX - handleSize/2, cropY - handleSize/2, handleSize, handleSize);
    // Top-right
    ctx.fillRect(cropX + cropW - handleSize/2, cropY - handleSize/2, handleSize, handleSize);
    // Bottom-left
    ctx.fillRect(cropX - handleSize/2, cropY + cropH - handleSize/2, handleSize, handleSize);
    // Bottom-right
    ctx.fillRect(cropX + cropW - handleSize/2, cropY + cropH - handleSize/2, handleSize, handleSize);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || disabled) return;

    const img = imageRef.current;
    if (!img) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const newCropX = Math.max(0, Math.min(1, cropData.cropX + (deltaX * scaleX) / (img.naturalWidth - cropData.cropWidth)));
    const newCropY = Math.max(0, Math.min(1, cropData.cropY + (deltaY * scaleY) / (img.naturalHeight - cropData.cropHeight)));

    const newCropData = {
      ...cropData,
      cropX: newCropX,
      cropY: newCropY
    };

    setCropData(newCropData);
    onCropChange(newCropData);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    drawCropOverlay();
  }, [cropData, isDragging]);

  return (
    <div className="relative inline-block">
      <div className="relative">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Crop preview"
          className="max-w-full max-h-64 object-contain"
          style={{ display: 'block' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ 
            pointerEvents: disabled ? 'none' : 'auto',
            opacity: disabled ? 0.5 : 1
          }}
        />
      </div>
      <div className="mt-2 text-sm text-gray-600">
        {currentFormat.description} ({currentFormat.width}×{currentFormat.height})
        {disabled && <span className="ml-2 text-blue-600">✓ Perfect fit</span>}
      </div>
    </div>
  );
};

export default CropTool;

import React, { useState } from 'react';
import CropTool from './CropTool';

interface FormatPreviewProps {
  imageUrl: string;
  imageAnalysis: {
    originalWidth: number;
    originalHeight: number;
    originalAspectRatio: number;
    recommendedFormats: Array<{
      type: 'portrait' | 'landscape' | 'square';
      width: number;
      height: number;
      aspectRatio: number;
      description: string;
    }>;
    needsCropping: boolean;
    perfectMatch?: {
      type: 'portrait' | 'landscape' | 'square';
      width: number;
      height: number;
      aspectRatio: number;
      description: string;
    };
  };
  onFormatSelect: (format: 'portrait' | 'landscape' | 'square', cropData?: any) => void;
}

interface CropData {
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
}

const FormatPreview: React.FC<FormatPreviewProps> = ({ 
  imageUrl, 
  imageAnalysis, 
  onFormatSelect 
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'portrait' | 'landscape' | 'square' | null>(null);
  const [cropData, setCropData] = useState<Record<string, CropData>>({});

  const handleCropChange = (format: 'portrait' | 'landscape' | 'square', data: CropData) => {
    setCropData(prev => ({
      ...prev,
      [format]: data
    }));
  };

  const handleFormatSelect = (format: 'portrait' | 'landscape' | 'square') => {
    setSelectedFormat(format);
    onFormatSelect(format, cropData[format]);
  };

  // If there's a perfect match, show only that format
  if (imageAnalysis.perfectMatch && !imageAnalysis.needsCropping) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Perfect Match Found!
        </h3>
        <div className="text-center">
          <div className="mb-4">
            <CropTool
              imageUrl={imageUrl}
              format={imageAnalysis.perfectMatch.type}
              onCropChange={() => {}}
              disabled={true}
            />
          </div>
          <button
            onClick={() => handleFormatSelect(imageAnalysis.perfectMatch!.type)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Use {imageAnalysis.perfectMatch.description}
          </button>
        </div>
      </div>
    );
  }

  // Show all three formats with crop tools
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Choose Your Format
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Your image needs cropping. Choose the format that works best for your content:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {imageAnalysis.recommendedFormats.map((format) => (
          <div key={format.type} className="text-center">
            <div className="mb-4">
              <CropTool
                imageUrl={imageUrl}
                format={format.type}
                onCropChange={(data) => handleCropChange(format.type, data)}
                disabled={false}
              />
            </div>
            <button
              onClick={() => handleFormatSelect(format.type)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedFormat === format.type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Choose {format.description}
            </button>
          </div>
        ))}
      </div>

      {selectedFormat && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            ✓ Selected: {imageAnalysis.recommendedFormats.find(f => f.type === selectedFormat)?.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default FormatPreview;

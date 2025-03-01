import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Crop, X, ZoomIn, ZoomOut } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { useTranslation } from '@/hooks/use-translation';

// Define types that were previously imported
interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: File) => void;
  imageFile: File;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  onSave,
  imageFile
}) => {
  const { t } = useTranslation();
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Load image when file changes
  React.useEffect(() => {
    if (!imageFile) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        setImageSrc(reader.result);
      }
    });
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Set canvas size to the cropped size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    // Get the image as a blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas is empty'));
          }
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleSave = async () => {
    try {
      if (!croppedAreaPixels) return;

      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([croppedImage], imageFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      onSave(file);
    } catch (error) {
      console.error(t.images.errorCropping, error);
    }
  };

  const handleZoom = (value: number[]) => {
    setZoom(value[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            {t.images.cropProfilePicture}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full h-[300px] rounded-lg overflow-hidden border">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
                style={{
                  containerStyle: {
                    borderRadius: '8px',
                  },
                }}
              />
            )}
          </div>

          <div className="w-full flex items-center gap-4">
            <ZoomOut className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={handleZoom}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              {t.common.cancel}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!imageSrc}
            >
              <Crop className="h-4 w-4 mr-2" />
              {t.common.save}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
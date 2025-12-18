import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Image, X, Flashlight, FlashlightOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface QRScannerProps {
  onScan: (text: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

export function QRScanner({ onScan, isActive, onToggle }: QRScannerProps) {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const cameraQrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [flashSupported, setFlashSupported] = useState(false);
  const [scanCooldown, setScanCooldown] = useState(false);

  const handleScanSuccess = useCallback((decodedText: string) => {
    if (scanCooldown) return;
    
    setScanCooldown(true);
    onScan(decodedText);
    toast.success('QR Code scanned successfully!');
    
    // 1 second cooldown before next scan
    setTimeout(() => {
      setScanCooldown(false);
    }, 1000);
  }, [onScan, scanCooldown]);

  useEffect(() => {
    if (isActive && !cameraQrCodeRef.current) {
      const html5QrCode = new Html5Qrcode('qr-reader');
      cameraQrCodeRef.current = html5QrCode;

      // iOS-compatible camera configuration
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };

      html5QrCode.start(
        { facingMode: 'environment' },
        config,
        handleScanSuccess,
        () => {
          // Silently handle scan errors
        }
      ).then(() => {
        setIsScanning(true);
        // Check if torch/flash is supported
        try {
          const capabilities = html5QrCode.getRunningTrackCameraCapabilities();
          if (capabilities && capabilities.torchFeature && capabilities.torchFeature().isSupported()) {
            setFlashSupported(true);
          }
        } catch (e) {
          console.log('Torch not supported');
        }
      }).catch((err) => {
        console.error('Error starting scanner:', err);
        // Try alternative camera configuration for iOS
        html5QrCode.start(
          { facingMode: { exact: 'environment' } },
          config,
          handleScanSuccess,
          () => {}
        ).then(() => {
          setIsScanning(true);
        }).catch((err2) => {
          console.error('Fallback also failed:', err2);
          // Final fallback - try any camera
          html5QrCode.start(
            { facingMode: 'user' },
            config,
            handleScanSuccess,
            () => {}
          ).then(() => {
            setIsScanning(true);
            toast.info('Using front camera');
          }).catch((err3) => {
            console.error('All camera attempts failed:', err3);
            toast.error('Could not start camera. Please check permissions in your browser settings.');
          });
        });
      });
    }

    return () => {
      if (cameraQrCodeRef.current && cameraQrCodeRef.current.isScanning) {
        cameraQrCodeRef.current.stop().then(() => {
          cameraQrCodeRef.current = null;
          setIsScanning(false);
          setFlashOn(false);
          setFlashSupported(false);
        }).catch(console.error);
      }
    };
  }, [isActive, handleScanSuccess]);

  const toggleFlash = async () => {
    if (!cameraQrCodeRef.current || !flashSupported) return;
    
    try {
      const capabilities = cameraQrCodeRef.current.getRunningTrackCameraCapabilities();
      if (capabilities && capabilities.torchFeature) {
        const torch = capabilities.torchFeature();
        if (flashOn) {
          await torch.apply(false);
          setFlashOn(false);
        } else {
          await torch.apply(true);
          setFlashOn(true);
        }
      }
    } catch (error) {
      console.error('Error toggling flash:', error);
      toast.error('Could not toggle flash');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-file-scanner');
      }

      const result = await html5QrCodeRef.current.scanFile(file, true);
      onScan(result);
      toast.success('QR Code from image scanned successfully!');
    } catch (error) {
      toast.error('Could not read QR code from image. Please try another image.');
      console.error('Error scanning file:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={onToggle}
          variant={isActive ? 'destructive' : 'default'}
          className={isActive ? '' : 'bg-gradient-gold hover:opacity-90'}
        >
          {isActive ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Stop Scanner
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </>
          )}
        </Button>

        {isActive && flashSupported && (
          <Button
            variant="outline"
            onClick={toggleFlash}
            className={`border-primary/30 hover:border-primary hover:bg-primary/10 ${flashOn ? 'bg-primary/20 border-primary' : ''}`}
          >
            {flashOn ? (
              <>
                <FlashlightOff className="w-4 h-4 mr-2" />
                Flash Off
              </>
            ) : (
              <>
                <Flashlight className="w-4 h-4 mr-2" />
                Flash On
              </>
            )}
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="border-primary/30 hover:border-primary hover:bg-primary/10"
        >
          <Image className="w-4 h-4 mr-2" />
          Scan from Gallery
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {scanCooldown && isActive && (
        <div className="text-center text-sm text-muted-foreground animate-pulse">
          Ready for next scan...
        </div>
      )}

      {isActive && (
        <div className="relative animate-fade-in">
          <div
            id="qr-reader"
            className="w-full max-w-md mx-auto bg-card rounded-lg overflow-hidden shadow-gold"
          />
          <div className="absolute inset-0 pointer-events-none border-2 border-primary/30 rounded-lg" />
        </div>
      )}

      {/* Hidden element for file scanning */}
      <div id="qr-file-scanner" className="hidden" />
    </div>
  );
}

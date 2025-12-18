import { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/Header';
import { QRScanner } from '@/components/QRScanner';
import { JewelleryItemCard } from '@/components/JewelleryItemCard';
import { TotalsSummary } from '@/components/TotalsSummary';
import { PDFForm } from '@/components/PDFForm';
import { StoneCharges } from '@/components/StoneCharges';
import { JewelleryItem } from '@/types/jewellery';
import { OtherCharge } from '@/types/otherCharges';
import { parseQRCode } from '@/utils/qrParser';
import { useImageStorage } from '@/hooks/useImageStorage';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Trash2 } from 'lucide-react';

const ITEMS_STORAGE_KEY = 'rk_gold_items';
const SETTINGS_STORAGE_KEY = 'rk_gold_settings';
const RATES_STORAGE_KEY = 'rk_gold_rates';
const OTHER_CHARGES_KEY = 'rk_gold_other_charges';

interface StoneRates {
  stoneRate: number;
  bigStoneRate: number;
  xlStoneRate: number;
  minaRate: number;
  motiRate: number;
  mozoRate: number;
}

const DEFAULT_RATES: StoneRates = {
  stoneRate: 1200,
  bigStoneRate: 600,
  xlStoneRate: 800,
  minaRate: 2500,
  motiRate: 1800,
  mozoRate: 1500,
};

const Index = () => {
  const [items, setItems] = useState<JewelleryItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [defaultMelting, setDefaultMelting] = useState(84);
  const [stoneRates, setStoneRates] = useState<StoneRates>(DEFAULT_RATES);
  const [otherCharges, setOtherCharges] = useState<OtherCharge[]>([{ id: '1', name: 'Other Charges', amount: 0 }]);
  const { imageMappings, setImageForDesign, getImageForDesign, removeImageForDesign } = useImageStorage();

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(ITEMS_STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
      
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        setDefaultMelting(settings.defaultMelting || 84);
      }
      
      const storedRates = localStorage.getItem(RATES_STORAGE_KEY);
      if (storedRates) {
        setStoneRates(JSON.parse(storedRates));
      }
      
      const storedOtherCharges = localStorage.getItem(OTHER_CHARGES_KEY);
      if (storedOtherCharges) {
        const parsed = JSON.parse(storedOtherCharges);
        if (Array.isArray(parsed)) {
          setOtherCharges(parsed);
        } else {
          // Migration from old format (single number)
          setOtherCharges([{ id: '1', name: 'Other Charges', amount: parsed || 0 }]);
        }
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving items:', e);
    }
  }, [items]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ defaultMelting }));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }, [defaultMelting]);

  // Save rates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(stoneRates));
    } catch (e) {
      console.error('Error saving rates:', e);
    }
  }, [stoneRates]);

  // Save other charges to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(OTHER_CHARGES_KEY, JSON.stringify(otherCharges));
    } catch (e) {
      console.error('Error saving other charges:', e);
    }
  }, [otherCharges]);

  const handleQRScan = useCallback((text: string) => {
    const parsed = parseQRCode(text, defaultMelting);
    if (parsed) {
      // No duplicate checking - allow all scans
      // Check if we have an image for this design
      const existingImage = getImageForDesign(parsed.designNo);
      if (existingImage) {
        parsed.imageUrl = existingImage;
      }

      setItems((prev) => [...prev, parsed]);
      toast.success(`Added: ${parsed.designNo}`);
    } else {
      toast.error('Invalid QR code format');
    }
  }, [defaultMelting, getImageForDesign]);

  const handleUpdateItem = useCallback((id: string, updates: Partial<JewelleryItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.info('Item removed');
  }, []);

  const handleImageChange = useCallback((designNo: string, imageBase64: string | null) => {
    if (imageBase64) {
      setImageForDesign(designNo, imageBase64);
      // Update all items with this design number
      setItems((prev) =>
        prev.map((item) =>
          item.designNo === designNo ? { ...item, imageUrl: imageBase64 } : item
        )
      );
    } else {
      removeImageForDesign(designNo);
      setItems((prev) =>
        prev.map((item) =>
          item.designNo === designNo ? { ...item, imageUrl: undefined } : item
        )
      );
    }
  }, [setImageForDesign, removeImageForDesign]);

  const handleClearData = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all scanned items?')) {
      setItems([]);
      toast.success('All data cleared');
    }
  }, []);

  // Calculate totals for stone charges
  const totals = items.reduce(
    (acc, item) => ({
      stoneWeight: acc.stoneWeight + item.stoneWeight,
      bigStoneWeight: acc.bigStoneWeight + item.bigStoneWeight,
      xlStoneWeight: acc.xlStoneWeight + (item.xlStoneWeight || 0),
      minaWeight: acc.minaWeight + item.minaWeight,
      motiWeight: acc.motiWeight + item.motiWeight,
      mozoWeight: acc.mozoWeight + item.mozoWeight,
    }),
    {
      stoneWeight: 0,
      bigStoneWeight: 0,
      xlStoneWeight: 0,
      minaWeight: 0,
      motiWeight: 0,
      mozoWeight: 0,
    }
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Settings */}
        <Card className="p-4 bg-card border-border/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold text-foreground">Settings</h3>
            </div>
            {items.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearData}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="defaultMelting" className="text-sm text-muted-foreground whitespace-nowrap">
                Default Melting %
              </Label>
              <Input
                id="defaultMelting"
                type="number"
                value={defaultMelting}
                onChange={(e) => setDefaultMelting(parseFloat(e.target.value) || 84)}
                className="w-20 bg-secondary border-none"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>
        </Card>

        {/* Scanner Section */}
        <Card className="p-4 bg-card border-border/50">
          <h3 className="font-display text-lg font-semibold mb-4 text-gradient-gold">
            Scan QR Code
          </h3>
          <QRScanner
            onScan={handleQRScan}
            isActive={isScanning}
            onToggle={() => setIsScanning(!isScanning)}
          />
        </Card>

        {/* PDF Form */}
        <PDFForm items={items} stoneRates={stoneRates} otherCharges={otherCharges} />

        {/* Totals */}
        <TotalsSummary items={items} />

        {/* Stone Charges */}
        <StoneCharges
          totals={totals}
          rates={stoneRates}
          onRatesChange={setStoneRates}
          otherCharges={otherCharges}
          onOtherChargesChange={setOtherCharges}
        />

        {/* Scanned Items */}
        {items.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-display text-lg font-semibold text-gradient-gold">
              Scanned Items ({items.length})
            </h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <JewelleryItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  imageUrl={item.imageUrl || getImageForDesign(item.designNo)}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                  onImageChange={handleImageChange}
                />
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && (
          <Card className="p-8 bg-card border-border/50 text-center">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">No items scanned yet</p>
              <p className="text-sm">
                Start scanning QR codes using the camera or upload from your gallery
              </p>
            </div>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 mt-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            RK GOLD • Shop no.41 Opp Shri Ji Mandir, Mittal Complex, LAKHERAPURA BHOPAL-462001
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

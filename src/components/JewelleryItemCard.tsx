import { useState, useRef } from 'react';
import { JewelleryItem } from '@/types/jewellery';
import { recalculateFineWeight } from '@/utils/qrParser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, ImagePlus, X } from 'lucide-react';

interface JewelleryItemCardProps {
  item: JewelleryItem;
  index: number;
  imageUrl?: string;
  onUpdate: (id: string, updates: Partial<JewelleryItem>) => void;
  onDelete: (id: string) => void;
  onImageChange: (designNo: string, imageBase64: string | null) => void;
}

export function JewelleryItemCard({
  item,
  index,
  imageUrl,
  onUpdate,
  onDelete,
  onImageChange,
}: JewelleryItemCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localMelting, setLocalMelting] = useState(item.melting.toString());
  const [localBSW, setLocalBSW] = useState(item.bigStoneWeight.toString());
  const [localXLStone, setLocalXLStone] = useState(item.xlStoneWeight.toString());

  const handleMeltingChange = (value: string) => {
    setLocalMelting(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      const newFineWeight = recalculateFineWeight(item.netWeight, numValue);
      onUpdate(item.id, { melting: numValue, fineWeight: newFineWeight });
    }
  };

  const handleBSWChange = (value: string) => {
    setLocalBSW(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onUpdate(item.id, { bigStoneWeight: numValue });
    }
  };

  const handleXLStoneChange = (value: string) => {
    setLocalXLStone(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onUpdate(item.id, { xlStoneWeight: numValue });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onImageChange(item.designNo, base64);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-4 bg-card border-border/50 hover:border-primary/30 transition-all animate-scale-in">
      <div className="flex gap-4">
        {/* Image Section */}
        <div className="relative w-20 h-20 flex-shrink-0">
          {imageUrl ? (
            <div className="relative w-full h-full group">
              <img
                src={imageUrl}
                alt={item.designNo}
                className="w-full h-full object-cover rounded-lg border border-border"
              />
              <button
                onClick={() => onImageChange(item.designNo, null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-destructive-foreground" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full border-2 border-dashed border-border hover:border-primary/50 rounded-lg flex flex-col items-center justify-center transition-colors"
            >
              <ImagePlus className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Add</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Details Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
              <span className="font-display font-semibold text-primary">{item.designNo}</span>
              <span className="text-xs text-muted-foreground">S.No: {item.serialNo}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-11 gap-2 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground block">GW</span>
              <span className="font-medium">{item.grossWeight.toFixed(3)}</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block">SW</span>
              <span className="font-medium">{item.stoneWeight.toFixed(3)}</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block">BSW</span>
              <Input
                type="number"
                value={localBSW}
                onChange={(e) => handleBSWChange(e.target.value)}
                className="h-6 w-14 px-1 text-xs text-center bg-secondary border-none"
                min="0"
                step="0.001"
              />
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block">XL Stone</span>
              <Input
                type="number"
                value={localXLStone}
                onChange={(e) => handleXLStoneChange(e.target.value)}
                className="h-6 w-14 px-1 text-xs text-center bg-secondary border-none"
                min="0"
                step="0.001"
              />
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block">Mina</span>
              <span className="font-medium">{item.minaWeight.toFixed(3)}</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block">Moti</span>
              <span className="font-medium">{item.motiWeight.toFixed(3)}</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block">Mozo</span>
              <span className="font-medium">{item.mozoWeight.toFixed(3)}</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block">Net W</span>
              <span className="font-semibold text-foreground">{item.netWeight.toFixed(3)}</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block">Melting</span>
              <Input
                type="number"
                value={localMelting}
                onChange={(e) => handleMeltingChange(e.target.value)}
                className="h-6 w-14 px-1 text-xs text-center bg-secondary border-none"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <span className="text-muted-foreground block">Fine W</span>
              <span className="font-semibold text-primary">{item.fineWeight.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

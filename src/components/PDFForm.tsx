import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { FileDown, Loader2 } from 'lucide-react';
import { JewelleryItem } from '@/types/jewellery';
import { OtherCharge } from '@/types/otherCharges';
import { generatePDF, StoneRates } from '@/utils/pdfGenerator';
import { toast } from 'sonner';
import logo from '@/assets/rk-logo.png';

const PDF_FORM_STORAGE_KEY = 'rk_gold_pdf_form';

interface PDFFormProps {
  items: JewelleryItem[];
  stoneRates: StoneRates;
  otherCharges: OtherCharge[];
}

export function PDFForm({ items, stoneRates, otherCharges }: PDFFormProps) {
  const [partyName, setPartyName] = useState('');
  const [slipNumber, setSlipNumber] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load saved form data on mount
  useEffect(() => {
    try {
      const savedForm = localStorage.getItem(PDF_FORM_STORAGE_KEY);
      if (savedForm) {
        const { partyName: savedParty, slipNumber: savedSlip } = JSON.parse(savedForm);
        if (savedParty) setPartyName(savedParty);
        if (savedSlip) setSlipNumber(savedSlip);
      }
    } catch (e) {
      console.error('Error loading form data:', e);
    }
  }, []);

  // Save form data whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(PDF_FORM_STORAGE_KEY, JSON.stringify({ partyName, slipNumber }));
    } catch (e) {
      console.error('Error saving form data:', e);
    }
  }, [partyName, slipNumber]);

  const handleGeneratePDF = async () => {
    if (!partyName.trim()) {
      toast.error('Please enter party name');
      return;
    }
    if (!slipNumber.trim()) {
      toast.error('Please enter slip number');
      return;
    }
    if (items.length === 0) {
      toast.error('Please scan at least one item');
      return;
    }

    setIsGenerating(true);
    try {
      // Convert logo to base64
      const response = await fetch(logo);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onload = async () => {
        const logoBase64 = reader.result as string;
        await generatePDF(
          {
            partyName: partyName.trim(),
            slipNumber: slipNumber.trim(),
            items,
            stoneRates,
            otherCharges,
          },
          logoBase64
        );
        toast.success('PDF generated successfully!');
        setIsGenerating(false);
      };
      
      reader.onerror = () => {
        generatePDF({
          partyName: partyName.trim(),
          slipNumber: slipNumber.trim(),
          items,
          stoneRates,
          otherCharges,
        });
        toast.success('PDF generated successfully!');
        setIsGenerating(false);
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-4 bg-card border-border/50">
      <h3 className="font-display text-lg font-semibold mb-4 text-gradient-gold">Invoice Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="partyName" className="text-sm text-muted-foreground">
            Party Name
          </Label>
          <Input
            id="partyName"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            placeholder="Enter party name"
            className="bg-secondary border-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slipNumber" className="text-sm text-muted-foreground">
            Slip Number
          </Label>
          <Input
            id="slipNumber"
            value={slipNumber}
            onChange={(e) => setSlipNumber(e.target.value)}
            placeholder="Enter slip number"
            className="bg-secondary border-none"
          />
        </div>
        <div className="flex items-end">
          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating || items.length === 0}
            className="w-full bg-gradient-gold hover:opacity-90 font-semibold"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Generate PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

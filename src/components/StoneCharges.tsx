import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OtherCharge } from '@/types/otherCharges';

interface StoneChargesProps {
  totals: {
    stoneWeight: number;
    bigStoneWeight: number;
    xlStoneWeight: number;
    minaWeight: number;
    motiWeight: number;
    mozoWeight: number;
  };
  rates: {
    stoneRate: number;
    bigStoneRate: number;
    xlStoneRate: number;
    minaRate: number;
    motiRate: number;
    mozoRate: number;
  };
  onRatesChange: (rates: StoneChargesProps['rates']) => void;
  otherCharges: OtherCharge[];
  onOtherChargesChange: (charges: OtherCharge[]) => void;
}

export function StoneCharges({ totals, rates, onRatesChange, otherCharges, onOtherChargesChange }: StoneChargesProps) {
  const charges = [
    { label: 'Small Stone', weight: totals.stoneWeight, rate: rates.stoneRate, key: 'stoneRate' as const },
    { label: 'Big Stone', weight: totals.bigStoneWeight, rate: rates.bigStoneRate, key: 'bigStoneRate' as const },
    { label: 'XL Stone', weight: totals.xlStoneWeight, rate: rates.xlStoneRate, key: 'xlStoneRate' as const },
    { label: 'Mina', weight: totals.minaWeight, rate: rates.minaRate, key: 'minaRate' as const },
    { label: 'Moti', weight: totals.motiWeight, rate: rates.motiRate, key: 'motiRate' as const },
    { label: 'Mozo', weight: totals.mozoWeight, rate: rates.mozoRate, key: 'mozoRate' as const },
  ];

  // Filter only charges that have weight > 0
  const activeCharges = charges.filter(c => c.weight > 0);

  const stoneTotal = activeCharges.reduce((sum, c) => sum + c.weight * c.rate, 0);
  const otherTotal = otherCharges.reduce((sum, c) => sum + c.amount, 0);
  const totalCharge = stoneTotal + otherTotal;

  const handleOtherChargeChange = (id: string, field: 'name' | 'amount', value: string | number) => {
    const updated = otherCharges.map(c => 
      c.id === id ? { ...c, [field]: field === 'amount' ? (parseFloat(value as string) || 0) : value } : c
    );
    
    // If editing the last row's name and it's no longer empty, add a new row
    const lastCharge = updated[updated.length - 1];
    if (field === 'name' && id === lastCharge?.id && lastCharge.name.trim() !== '') {
      updated.push({ id: Date.now().toString(), name: 'Other Charges', amount: 0 });
    }
    
    onOtherChargesChange(updated);
  };

  // Ensure there's always at least one "Other Charges" row
  if (otherCharges.length === 0) {
    onOtherChargesChange([{ id: Date.now().toString(), name: 'Other Charges', amount: 0 }]);
  }

  return (
    <Card className="p-4 bg-card border-border/50">
      <h3 className="font-display text-lg font-semibold mb-3 text-gradient-gold">
        Stone Charges
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-2 px-2 text-muted-foreground font-medium">Type</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium">Weight (g)</th>
              <th className="text-center py-2 px-2 text-muted-foreground font-medium">× Rate (₹/g)</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {activeCharges.map((charge) => (
              <tr key={charge.key} className="border-b border-border/30">
                <td className="py-2 px-2 text-foreground">{charge.label}</td>
                <td className="py-2 px-2 text-right text-foreground">{charge.weight.toFixed(3)}</td>
                <td className="py-2 px-2">
                  <Input
                    type="number"
                    value={charge.rate}
                    onChange={(e) => onRatesChange({ ...rates, [charge.key]: parseFloat(e.target.value) || 0 })}
                    className="w-24 mx-auto text-right bg-secondary border-none h-8"
                    min="0"
                  />
                </td>
                <td className="py-2 px-2 text-right font-semibold text-primary">
                  {(charge.weight * charge.rate).toFixed(2)}
                </td>
              </tr>
            ))}
            {/* Other Charges Rows */}
            {otherCharges.map((charge) => (
              <tr key={charge.id} className="border-b border-border/30">
                <td className="py-2 px-2">
                  <Input
                    type="text"
                    value={charge.name}
                    onChange={(e) => handleOtherChargeChange(charge.id, 'name', e.target.value)}
                    className="w-32 bg-secondary border-none h-8"
                    placeholder="Charge name"
                  />
                </td>
                <td className="py-2 px-2 text-right text-muted-foreground">-</td>
                <td className="py-2 px-2">
                  <Input
                    type="number"
                    value={charge.amount}
                    onChange={(e) => handleOtherChargeChange(charge.id, 'amount', e.target.value)}
                    className="w-24 mx-auto text-right bg-secondary border-none h-8"
                    min="0"
                    placeholder="0"
                  />
                </td>
                <td className="py-2 px-2 text-right font-semibold text-primary">
                  {charge.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-secondary/50">
              <td colSpan={3} className="py-2 px-2 font-semibold text-foreground">Total Charges</td>
              <td className="py-2 px-2 text-right font-bold text-lg text-primary">
                ₹{totalCharge.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
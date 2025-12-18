import { JewelleryItem } from '@/types/jewellery';
import { Card } from '@/components/ui/card';

interface TotalsSummaryProps {
  items: JewelleryItem[];
}

export function TotalsSummary({ items }: TotalsSummaryProps) {
  if (items.length === 0) return null;

  const totals = items.reduce(
    (acc, item) => ({
      grossWeight: acc.grossWeight + item.grossWeight,
      stoneWeight: acc.stoneWeight + item.stoneWeight,
      bigStoneWeight: acc.bigStoneWeight + item.bigStoneWeight,
      xlStoneWeight: acc.xlStoneWeight + (item.xlStoneWeight || 0),
      minaWeight: acc.minaWeight + item.minaWeight,
      motiWeight: acc.motiWeight + item.motiWeight,
      mozoWeight: acc.mozoWeight + item.mozoWeight,
      netWeight: acc.netWeight + item.netWeight,
      fineWeight: acc.fineWeight + item.fineWeight,
    }),
    {
      grossWeight: 0,
      stoneWeight: 0,
      bigStoneWeight: 0,
      xlStoneWeight: 0,
      minaWeight: 0,
      motiWeight: 0,
      mozoWeight: 0,
      netWeight: 0,
      fineWeight: 0,
    }
  );

  const summaryItems = [
    { label: 'Gross Weight', value: totals.grossWeight },
    { label: 'Stone Weight', value: totals.stoneWeight },
    { label: 'Big Stone', value: totals.bigStoneWeight },
    { label: 'XL Stone', value: totals.xlStoneWeight },
    { label: 'Mina', value: totals.minaWeight },
    { label: 'Moti', value: totals.motiWeight },
    { label: 'Mozo', value: totals.mozoWeight },
    { label: 'Net Weight', value: totals.netWeight, highlight: true },
    { label: 'Fine Weight', value: totals.fineWeight, primary: true },
  ];

  return (
    <Card className="p-4 bg-gradient-to-r from-card to-secondary border-primary/20 shadow-gold">
      <h3 className="font-display text-lg font-semibold mb-3 text-gradient-gold">
        Totals ({items.length} items)
      </h3>
      <div className="grid grid-cols-5 sm:grid-cols-9 gap-3">
        {summaryItems.map((item) => (
          <div key={item.label} className="text-center">
            <span className="text-xs text-muted-foreground block mb-1">{item.label}</span>
            <span
              className={`font-semibold text-sm ${
                item.primary
                  ? 'text-primary text-base'
                  : item.highlight
                  ? 'text-foreground'
                  : 'text-secondary-foreground'
              }`}
            >
              {item.value.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

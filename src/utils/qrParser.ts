import { JewelleryItem } from "@/types/jewellery";

export function parseQRCode(qrText: string, defaultMelting: number = 84): JewelleryItem | null {
  try {
    // QR format: brand/factory/cz/s.no/design number/GW/SW/BSW/MINA/MOTI/MOZO/NET WEIGHT
    const parts = qrText.split('/');
    
    if (parts.length < 13) {
      console.error('Invalid QR format: not enough parts', parts.length);
      return null;
    }

    // Extract values (skip brand[0], factory[1], cz[2])
    // Format: brand/factory/cz/s.no/design/extra/GW/SW/BSW/MINA/MOTI/MOZO/NET WEIGHT
    const serialNo = parts[3]?.trim() || '';
    const designNo = parts[4]?.trim() || '';
    const grossWeight = parseFloat(parts[6]) || 0;
    const stoneWeight = parseFloat(parts[7]) || 0;
    const bigStoneWeight = parseFloat(parts[8]) || 0;
    const minaWeight = parseFloat(parts[9]) || 0;
    const motiWeight = parseFloat(parts[10]) || 0;
    const mozoWeight = parseFloat(parts[11]) || 0;
    const netWeight = parseFloat(parts[12]) || 0;

    // Calculate fine weight: net weight * (melting/100)
    const fineWeight = netWeight * (defaultMelting / 100);

    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      serialNo,
      designNo,
      grossWeight,
      stoneWeight,
      bigStoneWeight,
      xlStoneWeight: 0,
      minaWeight,
      motiWeight,
      mozoWeight,
      netWeight,
      melting: defaultMelting,
      fineWeight: parseFloat(fineWeight.toFixed(3)),
    };
  } catch (error) {
    console.error('Error parsing QR code:', error);
    return null;
  }
}

export function recalculateFineWeight(netWeight: number, melting: number): number {
  return parseFloat((netWeight * (melting / 100)).toFixed(3));
}

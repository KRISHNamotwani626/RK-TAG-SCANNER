export interface JewelleryItem {
  id: string;
  serialNo: string;
  designNo: string;
  grossWeight: number;
  stoneWeight: number;
  bigStoneWeight: number;
  xlStoneWeight: number;
  minaWeight: number;
  motiWeight: number;
  mozoWeight: number;
  netWeight: number;
  melting: number;
  fineWeight: number;
  imageUrl?: string;
}

export interface PDFData {
  partyName: string;
  slipNumber: string;
  items: JewelleryItem[];
}

export interface ImageMapping {
  [designNo: string]: string; // designNo -> base64 image
}

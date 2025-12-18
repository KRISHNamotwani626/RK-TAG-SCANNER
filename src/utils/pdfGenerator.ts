import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { JewelleryItem } from '@/types/jewellery';
import { OtherCharge } from '@/types/otherCharges';

const BRAND_NAME = 'RK GOLD';
const ADDRESS = 'Shop no.41 Opp Shri Ji Mandir, Mittal Complex, LAKHERAPURA BHOPAL-462001';
const GMAIL = 'RKGOLDMP@GMAIL.COM';
const INSTAGRAM = '@_RK_GOLD';

export interface StoneRates {
  stoneRate: number;
  bigStoneRate: number;
  xlStoneRate: number;
  minaRate: number;
  motiRate: number;
  mozoRate: number;
}

export interface PDFData {
  partyName: string;
  slipNumber: string;
  items: JewelleryItem[];
  stoneRates: StoneRates;
  otherCharges: OtherCharge[];
}

// Gmail icon SVG path (simplified envelope)
const drawGmailIcon = (doc: jsPDF, x: number, y: number, size: number) => {
  doc.setFillColor(234, 67, 53); // Gmail red
  doc.setDrawColor(234, 67, 53);
  
  // Envelope body
  doc.roundedRect(x, y, size, size * 0.7, 0.5, 0.5, 'F');
  
  // Inner part (white)
  doc.setFillColor(255, 255, 255);
  const innerPadding = size * 0.1;
  doc.rect(x + innerPadding, y + innerPadding, size - innerPadding * 2, size * 0.5, 'F');
  
  // M shape (red lines)
  doc.setLineWidth(0.3);
  doc.setDrawColor(234, 67, 53);
  doc.line(x + innerPadding, y + innerPadding, x + size / 2, y + size * 0.4);
  doc.line(x + size / 2, y + size * 0.4, x + size - innerPadding, y + innerPadding);
};

// Instagram icon (properly drawn)
const drawInstagramIcon = (doc: jsPDF, x: number, y: number, size: number) => {
  // Gradient-like solid color (Instagram pink/purple)
  doc.setFillColor(225, 48, 108); // Instagram magenta
  doc.roundedRect(x, y, size, size, size * 0.22, size * 0.22, 'F');
  
  // Inner rounded rectangle border (white)
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  const innerPad = size * 0.15;
  doc.roundedRect(x + innerPad, y + innerPad, size - innerPad * 2, size - innerPad * 2, size * 0.1, size * 0.1, 'S');
  
  // Center circle (camera lens) - white outline
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const circleRadius = size * 0.22;
  doc.setLineWidth(0.35);
  doc.circle(centerX, centerY, circleRadius, 'S');
  
  // Small dot in top right (flash)
  doc.setFillColor(255, 255, 255);
  doc.circle(x + size * 0.72, y + size * 0.28, size * 0.07, 'F');
};

export async function generatePDF(data: PDFData, logoBase64?: string): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header background
  doc.setFillColor(30, 25, 22);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Logo placeholder area
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 10, 5, 35, 35);
    } catch (e) {
      console.error('Error adding logo:', e);
    }
  }

  // Brand name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(205, 150, 125);
  doc.text(BRAND_NAME, 50, 20);

  // Address
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 170, 160);
  doc.text(ADDRESS, 50, 28);

  // Social icons and text in top right
  const socialX = pageWidth - 65;
  const iconSize = 5;
  
  // Gmail
  drawGmailIcon(doc, socialX, 8, iconSize);
  doc.setFontSize(8);
  doc.setTextColor(220, 200, 180);
  doc.text(GMAIL, socialX + iconSize + 2, 12);
  
  // Instagram
  drawInstagramIcon(doc, socialX, 18, iconSize);
  doc.text(INSTAGRAM, socialX + iconSize + 2, 22);

  // Party details
  doc.setFontSize(11);
  doc.setTextColor(220, 200, 180);
  doc.text(`Party: ${data.partyName}`, 50, 38);
  doc.text(`Slip No: ${data.slipNumber}`, 160, 38);

  // Date
  const date = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.text(`Date: ${date}`, pageWidth - 50, 38);

  // Calculate totals
  const totals = data.items.reduce(
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

  // Prepare table data (without images - we'll add them in didDrawCell)
  const tableData = data.items.map((item, index) => [
    (index + 1).toString(),
    item.designNo,
    '', // Image placeholder
    item.grossWeight.toFixed(3),
    item.stoneWeight.toFixed(3),
    item.bigStoneWeight.toFixed(3),
    (item.xlStoneWeight || 0).toFixed(3),
    item.minaWeight.toFixed(3),
    item.motiWeight.toFixed(3),
    item.mozoWeight.toFixed(3),
    item.netWeight.toFixed(3),
    `${item.melting}%`,
    item.fineWeight.toFixed(3),
  ]);

  // Add totals row
  tableData.push([
    'TOTAL',
    '',
    '',
    totals.grossWeight.toFixed(3),
    totals.stoneWeight.toFixed(3),
    totals.bigStoneWeight.toFixed(3),
    totals.xlStoneWeight.toFixed(3),
    totals.minaWeight.toFixed(3),
    totals.motiWeight.toFixed(3),
    totals.mozoWeight.toFixed(3),
    totals.netWeight.toFixed(3),
    '-',
    totals.fineWeight.toFixed(3),
  ]);

  // Generate table
  autoTable(doc, {
    head: [['S.No', 'Design', 'Image', 'GW', 'SW', 'BSW', 'XL St', 'Mina', 'Moti', 'Mozo', 'Net W', 'Melt', 'Fine W']],
    body: tableData,
    startY: 50,
    theme: 'grid',
    rowPageBreak: 'avoid',
    styles: {
      fontSize: 7,
      cellPadding: 2,
      textColor: [40, 35, 30],
      lineColor: [180, 150, 130],
      lineWidth: 0.1,
      minCellHeight: 18,
    },
    headStyles: {
      fillColor: [45, 38, 35],
      textColor: [205, 150, 125],
      fontStyle: 'bold',
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [250, 245, 240],
    },
    footStyles: {
      fillColor: [45, 38, 35],
      textColor: [205, 150, 125],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 18 },
      2: { cellWidth: 18, halign: 'center' }, // Image column
      3: { cellWidth: 16, halign: 'right' },
      4: { cellWidth: 16, halign: 'right' },
      5: { cellWidth: 16, halign: 'right' },
      6: { cellWidth: 16, halign: 'right' }, // XL Stone
      7: { cellWidth: 16, halign: 'right' },
      8: { cellWidth: 16, halign: 'right' },
      9: { cellWidth: 16, halign: 'right' },
      10: { cellWidth: 16, halign: 'right' },
      11: { cellWidth: 14, halign: 'center' },
      12: { cellWidth: 18, halign: 'right' },
    },
    didDrawCell: (cellData) => {
      // Add images in the image column (index 2)
      if (cellData.section === 'body' && cellData.column.index === 2) {
        const rowIndex = cellData.row.index;
        // Skip totals row
        if (rowIndex < data.items.length) {
          const item = data.items[rowIndex];
          if (item.imageUrl) {
            try {
              const imgX = cellData.cell.x + 1;
              const imgY = cellData.cell.y + 1;
              const imgSize = Math.min(cellData.cell.width - 2, cellData.cell.height - 2, 16);
              doc.addImage(item.imageUrl, 'JPEG', imgX, imgY, imgSize, imgSize);
            } catch (e) {
              console.error('Error adding product image:', e);
            }
          }
        }
      }
      // Style the totals row
      if (cellData.row.index === tableData.length - 1 && cellData.section === 'body') {
        doc.setFillColor(45, 38, 35);
        doc.setTextColor(205, 150, 125);
      }
    },
  });

  // Stone Charges Table
  let stoneChargesY = (doc as any).lastAutoTable.finalY + 10;

  const stoneCharges = [
    { label: 'Small Stone', weight: totals.stoneWeight, rate: data.stoneRates.stoneRate },
    { label: 'Big Stone', weight: totals.bigStoneWeight, rate: data.stoneRates.bigStoneRate },
    { label: 'XL Stone', weight: totals.xlStoneWeight, rate: data.stoneRates.xlStoneRate },
    { label: 'Mina', weight: totals.minaWeight, rate: data.stoneRates.minaRate },
    { label: 'Moti', weight: totals.motiWeight, rate: data.stoneRates.motiRate },
    { label: 'Mozo', weight: totals.mozoWeight, rate: data.stoneRates.mozoRate },
  ].filter(c => c.weight > 0);

  const activeOtherCharges = data.otherCharges.filter(c => c.amount > 0);
  
  if (stoneCharges.length > 0 || activeOtherCharges.length > 0) {
    const stoneTotal = stoneCharges.reduce((sum, c) => sum + c.weight * c.rate, 0);
    const otherTotal = activeOtherCharges.reduce((sum, c) => sum + c.amount, 0);
    const grandTotal = stoneTotal + otherTotal;

    const stoneChargesData = stoneCharges.map(c => [
      c.label,
      c.weight.toFixed(3) + ' g',
      'Rs. ' + c.rate.toFixed(0),
      'Rs. ' + (c.weight * c.rate).toFixed(2),
    ]);

    // Add other charges rows
    activeOtherCharges.forEach(charge => {
      stoneChargesData.push([charge.name, '-', '-', 'Rs. ' + charge.amount.toFixed(2)]);
    });

    // Add total row
    stoneChargesData.push(['Total Charges', '', '', 'Rs. ' + grandTotal.toFixed(2)]);

    autoTable(doc, {
      head: [['Stone Type', 'Weight', 'Rate', 'Amount']],
      body: stoneChargesData,
      startY: stoneChargesY,
      theme: 'grid',
      tableWidth: 180,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [40, 35, 30],
        lineColor: [180, 150, 130],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [45, 38, 35],
        textColor: [205, 150, 125],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 45, halign: 'right' },
        2: { cellWidth: 45, halign: 'right' },
        3: { cellWidth: 45, halign: 'right' },
      },
      didDrawCell: (cellData) => {
        // Style the total row
        if (cellData.row.index === stoneChargesData.length - 1 && cellData.section === 'body') {
          doc.setFillColor(45, 38, 35);
          doc.setTextColor(205, 150, 125);
        }
      },
    });

    stoneChargesY = (doc as any).lastAutoTable.finalY;
  }

  // Footer
  const finalY = stoneChargesY + 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 140, 130);
  doc.text('Generated by RK GOLD Jewellery Management System', pageWidth / 2, finalY, { align: 'center' });

  // Save PDF
  const filename = `RK_GOLD_${data.partyName.replace(/\s+/g, '_')}_${data.slipNumber}_${Date.now()}.pdf`;
  doc.save(filename);
}

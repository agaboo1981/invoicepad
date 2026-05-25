import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceData } from './types';
import { calculateTotals, formatCurrency } from './utils';

export function generateInvoicePDF(data: InvoiceData, t: (key: string) => string) {
  const doc = new jsPDF('p', 'pt', 'letter');
  
  const { subtotal, discountAmount, taxAmount, total } = calculateTotals(data);
  let yPos = 40;
  
  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(t('invoice').toUpperCase(), 40, yPos);
  
  if (data.companyName) {
    doc.setFontSize(14);
    doc.text(data.companyName, 570 - doc.getTextWidth(data.companyName), yPos);
  }
  
  yPos += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`#${data.invoiceNumber || '---'}`, 40, yPos);
  
  // Logo
  if (data.logo) {
    try {
      // Very basic support for base64 images if available 
      // Just try to add it. If it fails, we continue
      doc.addImage(data.logo, 'JPEG', 570 - 100, 40, 100, 40, '', 'FAST');
    } catch (e) {
      console.warn('Failed to add logo to PDF', e);
    }
  }

  yPos += 40;
  
  // Addresses
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(150, 150, 150);
  doc.text(t('from').toUpperCase(), 40, yPos);
  doc.text(t('billedTo').toUpperCase(), 570 - doc.getTextWidth(t('billedTo').toUpperCase()), yPos);
  
  yPos += 12;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const fromLines = doc.splitTextToSize(data.fromDetails || '---', 200);
  const toLines = doc.splitTextToSize(data.toDetails || '---', 200);
  
  doc.text(fromLines, 40, yPos);
  const toLinesHeight = toLines.length * 12;
  // Right align the 'to' address
  toLines.forEach((line: string, i: number) => {
    doc.text(line, 570 - doc.getTextWidth(line), yPos + (i * 12));
  });
  
  yPos += Math.max(fromLines.length * 12, toLinesHeight) + 20;

  // Dates
  doc.setDrawColor(230, 230, 230);
  doc.line(40, yPos, 570, yPos);
  yPos += 15;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(150, 150, 150);
  doc.text(t('issueDate').toUpperCase(), 40, yPos);
  doc.text(t('dueDate').toUpperCase(), 570 - doc.getTextWidth(t('dueDate').toUpperCase()), yPos);
  
  yPos += 12;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(data.issueDate || '---', 40, yPos);
  doc.text(data.dueDate || '---', 570 - doc.getTextWidth(data.dueDate || '---'), yPos);
  
  yPos += 15;
  doc.line(40, yPos, 570, yPos);
  yPos += 20;
  
  // Table
  const tableColumn = [
    t('itemDesc').toUpperCase(),
    t('qty').toUpperCase(),
    t('price').toUpperCase(),
    t('total').toUpperCase()
  ];
  
  const tableRows = data.items.map(item => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.price, data.currency, data.locale),
    formatCurrency(item.quantity * item.price, data.currency, data.locale)
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [tableColumn],
    body: tableRows.length > 0 ? tableRows : [['-', '-', '-', '-']],
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 10, textColor: [0, 0, 0] },
    headStyles: { fontStyle: 'bold', textColor: [150, 150, 150], fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 300 },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    },
    margin: { left: 40, right: 40 }
  });
  
  // @ts-ignore
  yPos = doc.lastAutoTable.finalY + 20;
  
  // Totals
  const totalsX = 390;
  const totalsRightX = 570;
  let totalsY = yPos;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  
  // Subtotal
  doc.text(t('subtotal'), totalsX, totalsY);
  const subtotalStr = formatCurrency(subtotal, data.currency, data.locale);
  doc.text(subtotalStr, totalsRightX - doc.getTextWidth(subtotalStr), totalsY);
  totalsY += 15;
  
  // Discount
  if (data.discount > 0) {
    const discountLabel = `${t('discount')} (${data.discount}%)`;
    doc.text(discountLabel, totalsX, totalsY);
    const discountStr = `-${formatCurrency(discountAmount, data.currency, data.locale)}`;
    doc.text(discountStr, totalsRightX - doc.getTextWidth(discountStr), totalsY);
    totalsY += 15;
  }
  
  // Tax
  if (data.taxRate > 0) {
    const taxLabel = `${data.isTaxInclusive ? t('includesTax') : t('tax')} (${data.taxRate}%)`;
    doc.text(taxLabel, totalsX, totalsY);
    const taxStr = formatCurrency(taxAmount, data.currency, data.locale);
    doc.text(taxStr, totalsRightX - doc.getTextWidth(taxStr), totalsY);
    totalsY += 15;
  }
  
  totalsY += 5;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.5);
  doc.line(totalsX, totalsY, totalsRightX, totalsY);
  totalsY += 15;
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const totalLabel = t('total').toUpperCase();
  doc.text(totalLabel, totalsX, totalsY);
  
  const totalStr = formatCurrency(total, data.currency, data.locale);
  doc.text(totalStr, totalsRightX - doc.getTextWidth(totalStr), totalsY);

  // Footer notes and signature
  let footerY = totalsY + 40;
  
  if (data.notes) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(150, 150, 150);
    doc.text(t('notesTerms').toUpperCase(), 40, footerY);
    
    footerY += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const splitNotes = doc.splitTextToSize(data.notes, 300);
    doc.text(splitNotes, 40, footerY);
  }
  
  doc.save(data.pdfFileName || `${t('invoice')}_${data.invoiceNumber || t('draft')}.pdf`);
}

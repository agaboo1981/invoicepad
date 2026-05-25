export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  locale: string;
  taxRate: number;
  discount: number;
  fromDetails: string;
  toDetails: string;
  items: InvoiceItem[];
  notes: string;
  logo?: string;
  companyName?: string;
  paymentQrLink?: string;
  pdfFileName?: string;
  isTaxInclusive?: boolean;
  signature?: string;
  signatureLabel?: string;
}

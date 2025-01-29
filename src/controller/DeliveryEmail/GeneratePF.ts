
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';


export const generatePDF = async (ticketDetails: {
    ticketNumber: string;
    customerName: string;
    amount: string;
    paymentStatus: string;
  }) => {
    return new Promise<string>((resolve, reject) => {
      const pdfPath = path.join(__dirname, `Bukti_Transaksi_${ticketDetails.ticketNumber}.pdf`);
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(pdfPath);
  
      doc.pipe(stream);
  
      doc.fontSize(18).text('Bukti Transaksi', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Nomor Tiket: ${ticketDetails.ticketNumber}`);
      doc.text(`Nama Pemesan: ${ticketDetails.customerName}`);
      doc.text(`Total Pembayaran: Rp ${ticketDetails.amount}`);
      doc.text(`Status Pembayaran: ${ticketDetails.paymentStatus}`, { underline: true });
  
      doc.end();
  
      stream.on('finish', () => resolve(pdfPath));
      stream.on('error', (error) => reject(error));
    });
  };
  
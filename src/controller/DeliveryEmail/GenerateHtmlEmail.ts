import fs from 'fs';
import path from 'path';
import { TransactionModel } from '../../models/Transaction/models_transaksi';

interface GetEmailTemplateProps {
  ticketNumber: string;
  paymentStatus: string;
}

const FormatDate = (dates : any) => {

  const date = new Date(dates);
  const formattedDateTime = date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return formattedDateTime;

}

export const getEmailTemplate = async ({
  ticketNumber,
  paymentStatus,
}: GetEmailTemplateProps) => {

  const templatePath = path.join(__dirname, '../DeliveryEmail/email-template.html');

  const DataTransaction = await TransactionModel.find({ bookingId: ticketNumber, isDeleted: false });

  if (!DataTransaction || DataTransaction.length === 0) {

    throw new Error("Data Transaction not found");
  }

  // Pastikan file template ada
  if (!fs.existsSync(templatePath)) {
    throw new Error(`File template tidak ditemukan di path: ${templatePath}`);
  }

  // Tentukan warna berdasarkan status pembayaran
  const paymentClass =
    paymentStatus.toLowerCase() === 'PAID' ? 'PAID' :
    paymentStatus.toLowerCase() === 'EXPIRE' ? 'EXPIRE' :
    'FAILED';

  let emailTemplate = fs.readFileSync(templatePath, 'utf8');

  const CEK_TRANSACTION = `${process.env.WEB_CLIENT_URL}/order-status?order_id=${DataTransaction[0]?.bookingId}`;

  
  // Pastikan `products` ada sebelum digunakan
  const productListHTML = DataTransaction[0]?.products?.length
    ? DataTransaction[0].products
        .map(product => `
          <tr>
            <th>${product.name}</th>
            <td>x${product.quantity}</td>
            <td>IDR ${product.price.toLocaleString("id-ID")}</td>
          </tr>
        `)
        .join("")
    : "<tr><td colspan='3'>No products available</td></tr>";

    const BUTTON_LINK_HTML = `
      <a href="${CEK_TRANSACTION}" class="button">View Transaction</a>
    `;

  // Debugging log
  // console.log("DataTransaction:", JSON.stringify(DataTransaction, null, 2));
  // console.log("Product list:", DataTransaction[0]?.products);

  // Ganti placeholder dengan data dinamis
  emailTemplate = emailTemplate
    .replace(/ID_Transaction/g, DataTransaction[0]?.bookingId || "N/A")
    .replace(/Name_User/g,  DataTransaction[0]?.name || "N/A")
    .replace(/Total_Price/g, `${DataTransaction[0]?.grossAmount.toLocaleString("id-ID")}` )
    .replace(/CheckIn/g, FormatDate(DataTransaction[0]?.checkIn) || "N/A")
    .replace(/CheckOut/g, FormatDate(DataTransaction[0]?.checkOut) || "N/A")
    .replace(/Payment_Type/g, DataTransaction[0]?.payment_type || "N/A")
    .replace(/Status_Payment/g, DataTransaction[0]?.status)
    .replace(/Date_transaction/g, DataTransaction[0]?.createdAt.toLocaleDateString("id-ID"))
    .replace("class=\"payment-status Status_Payment\"", `class="payment-status ${paymentClass}"`)
    .replace("{{PRODUCT_LIST}}", productListHTML)
    .replace("{{BUTTON_LINK}}", BUTTON_LINK_HTML);
    

  return emailTemplate;
};

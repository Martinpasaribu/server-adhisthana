"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmailTemplate = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const models_transaksi_1 = require("../../models/Transaction/models_transaksi");
const FormatDate = (dates) => {
    const date = new Date(dates);
    // Tambahkan 7 jam untuk konversi ke WIB (UTC+7)
    date.setHours(date.getUTCHours() + 7);
    const formattedDateTime = date.toLocaleString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    return formattedDateTime.replace(",", " Pukul"); // Ubah format
};
const getEmailTemplate = (_a) => __awaiter(void 0, [_a], void 0, function* ({ ticketNumber, paymentStatus, }) {
    // const templatePath = path.join(__dirname, 'DeliveryEmail/TemplateHtml/email-template.html');
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const templatePath = path_1.default.join(process.cwd(), 'dist/controller/DeliveryEmail/TemplateHtml/email-template.html');
    const DataTransaction = yield models_transaksi_1.TransactionModel.find({ bookingId: ticketNumber, isDeleted: false });
    if (!DataTransaction || DataTransaction.length === 0) {
        throw new Error("Data Transaction not found");
    }
    // Pastikan file template ada
    if (!fs_1.default.existsSync(templatePath)) {
        throw new Error(`File template tidak ditemukan di path: ${templatePath}`);
    }
    // Tentukan warna berdasarkan status pembayaran
    const paymentClass = paymentStatus.toLowerCase() === 'PAID' ? 'PAID' :
        paymentStatus.toLowerCase() === 'EXPIRE' ? 'EXPIRE' :
            'FAILED';
    let emailTemplate = fs_1.default.readFileSync(templatePath, 'utf8');
    const CEK_TRANSACTION = `${process.env.WEB_CLIENT_URL}/order-status?order_id=${(_b = DataTransaction[0]) === null || _b === void 0 ? void 0 : _b.bookingId}`;
    // Pastikan `products` ada sebelum digunakan
    const productListHTML = ((_d = (_c = DataTransaction[0]) === null || _c === void 0 ? void 0 : _c.products) === null || _d === void 0 ? void 0 : _d.length)
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
      <a href="${CEK_TRANSACTION}" 
        display: inline-block;
        background-color: #C0562F;
        color: white;
        padding: 12px 24px;
        font-size: 16px;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
      >View Transaction
      </a>
    `;
    // Debugging log
    // console.log("DataTransaction:", JSON.stringify(DataTransaction, null, 2));
    // console.log("Product list:", DataTransaction[0]?.products);
    // Ganti placeholder dengan data dinamis
    emailTemplate = emailTemplate
        .replace(/ID_Transaction/g, ((_e = DataTransaction[0]) === null || _e === void 0 ? void 0 : _e.bookingId) || "N/A")
        .replace(/Name_User/g, ((_f = DataTransaction[0]) === null || _f === void 0 ? void 0 : _f.name) || "N/A")
        .replace(/Total_Price/g, `${(_g = DataTransaction[0]) === null || _g === void 0 ? void 0 : _g.grossAmount.toLocaleString("id-ID")}`)
        .replace(/CheckIn/g, FormatDate((_h = DataTransaction[0]) === null || _h === void 0 ? void 0 : _h.checkIn) || "N/A")
        .replace(/CheckOut/g, FormatDate((_j = DataTransaction[0]) === null || _j === void 0 ? void 0 : _j.checkOut) || "N/A")
        .replace(/Payment_Type/g, ((_k = DataTransaction[0]) === null || _k === void 0 ? void 0 : _k.payment_type) || "N/A")
        .replace(/Status_Payment/g, (_l = DataTransaction[0]) === null || _l === void 0 ? void 0 : _l.status)
        .replace(/Date_transaction/g, (_m = DataTransaction[0]) === null || _m === void 0 ? void 0 : _m.createdAt.toLocaleDateString("id-ID"))
        .replace("class=\"payment-status Status_Payment\"", `class="payment-status ${paymentClass}"`)
        .replace("{{PRODUCT_LIST}}", productListHTML)
        .replace("{{BUTTON_LINK}}", BUTTON_LINK_HTML);
    return emailTemplate;
});
exports.getEmailTemplate = getEmailTemplate;

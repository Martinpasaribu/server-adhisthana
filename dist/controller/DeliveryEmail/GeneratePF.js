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
exports.generatePDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const generatePDF = (ticketDetails) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const pdfPath = path_1.default.join(__dirname, `Bukti_Transaksi_${ticketDetails.ticketNumber}.pdf`);
        const doc = new pdfkit_1.default();
        const stream = fs_1.default.createWriteStream(pdfPath);
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
});
exports.generatePDF = generatePDF;

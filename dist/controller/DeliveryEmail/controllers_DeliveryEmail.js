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
exports.DeliveryEmailController = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const GenerateHtmlEmail_1 = require("./GenerateHtmlEmail");
dotenv_1.default.config();
class DeliveryEmailController {
    static SendEmailDelivery(ticketNumber, // = "TRX-5355ba5637",
    paymentStatus, userEmail, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validasi parameter
                if (!ticketNumber || !paymentStatus || !userEmail) {
                    // return res.status(400).json({
                    //   requestId: uuidv4(),
                    //   message: 'Missing required parameters',
                    //   success: false,
                    // });
                    throw new Error('Missing required parameters on send Confirm Email');
                }
                // Pastikan ENV tersedia
                if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                    throw new Error('EMAIL_USER or EMAIL_PASS is not defined in environment variables');
                }
                // Setup Nodemailer
                const transporter = nodemailer_1.default.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.APP_EMAIL,
                        pass: process.env.APP_PASS,
                    },
                });
                // Generate email dari template
                const emailContent = yield (0, GenerateHtmlEmail_1.getEmailTemplate)({
                    ticketNumber,
                    paymentStatus
                });
                // Kirim Email
                const mailOptions = {
                    from: `"Adhisthana Villas" <${process.env.APP_EMAIL}>`,
                    to: userEmail,
                    subject: "Here's Your Booking Confirmation & Receipt",
                    html: emailContent,
                };
                const result = yield transporter.sendMail(mailOptions);
                console.log("Successfully sent email to user. : ", result);
                // Respon sukses
                // res.status(201).json({
                //   requestId: uuidv4(),
                //   message: 'Successfully sent email to user.',
                //   success: true,
                // });
            }
            catch (error) {
                // res.status(400).json({
                //   requestId: uuidv4(),
                //   message: (error as Error).message,
                //   success: false,
                // });
                throw new Error(` Error after send Email to User: ${error}`);
            }
        });
    }
}
exports.DeliveryEmailController = DeliveryEmailController;

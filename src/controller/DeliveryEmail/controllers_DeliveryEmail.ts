import { v4 as uuidv4 } from 'uuid'; 
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { getEmailTemplate } from "./GenerateHtmlEmail";

dotenv.config();

export class DeliveryEmailController {

  static async SendEmailDelivery(
    ticketNumber: string , // = "TRX-5355ba5637",
    paymentStatus: string,
    userEmail: string,
    res: any
  ) {
    try {
      // Validasi parameter
      if (!ticketNumber ||  !paymentStatus || !userEmail) {
        
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
      const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: process.env.APP_EMAIL,
              pass: process.env.APP_PASS,
          },
      });

      // Generate email dari template
      const emailContent = await getEmailTemplate({ 
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

      const result = await transporter.sendMail(mailOptions);


      console.log("Successfully sent email to user. : ", result);
      // Respon sukses
      // res.status(201).json({
      //   requestId: uuidv4(),
      //   message: 'Successfully sent email to user.',
      //   success: true,
      // });

    } catch (error) {

      // res.status(400).json({
      //   requestId: uuidv4(),
      //   message: (error as Error).message,
      //   success: false,
      // });

      throw new Error(` Error after send Email to User: ${error}`);

    }
  }
}

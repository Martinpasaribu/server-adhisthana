import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import helmet from "helmet";
import session from 'express-session';
import MongoDBStore from 'connect-mongodb-session';
import './controller/PendingRoom/Cron_job'
import { connectToDatabase } from "./config/mongodbLocal";

import InstagramRouter from "./router/router_instagram";
import ContactRouter from "./router/router_contact";
import BookingRouter from "./router/router_booking";
import AuthRouter from "./router/router_auth";
import UserRouter from "./router/router_user";
import { connectToMongoDB } from "./config/mongoDbCloud";
import ShortAvailableRouter from "./router/router_shortAvailable";
import TransactionRouter from "./router/router_transaction";
import cookieParser from 'cookie-parser';
import SessionRouter from "./router/router_session";
import RoomRouter from "./router/Admin/router_room";
import AdminRouter from "./router/Admin/router_admin";
import SiteMinderRouter from "./router/Admin/router_siteminder";
import ReservationRouter from "./router/Admin/router_reservation";
import DashboardRouter from "./router/Admin/router_dashboard";
import AdminBookingRouter from "./router/Admin/router_admin_booking";
import AdminCustomerRouter from "./router/Admin/router_admin_customer";



const app: express.Application = express();

dotenv.config()

app.use(cors({
    origin:   [
      
                "http://localhost:3000","http://localhost:3001",
                "https://adhistahan.vercel.app","https://adhisthanavillas.com",
                "https://admin-adhisthana.vercel.app","https://api.adhisthanavillas.com,"
              
              ],

    methods: ["POST", "GET", "PATCH", "DELETE", 'PUT', "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(cookieParser());

// Jika klien mengirim JSON, maka express.json() akan mem-parsingnya.
app.use(express.json());

// Jika klien mengirim URL-encoded data (misalnya form submission dari aplikasi web), maka express.urlencoded() akan mem-parsingnya.
// Content-Type: application/x-www-form-urlencoded.
// ex : name=John&age=30

app.use(express.urlencoded({extended:false}))


 const MongoDBStoreKU = MongoDBStore(session);

 const store = new MongoDBStoreKU({
     uri: `${process.env.MongoDB_cloud as string}`, 
     collection: 'sessions' 
 });     

 store.on('error', function(error) {
    console.log(error);
});

// app.set('trust proxy', 1)
app.set('trust proxy', true);

app.use(session({
    secret: process.env.SESS_SECRET as string,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {

        //  ==========  Development  ============


        // secure: false,
        // httpOnly: true,      
        // maxAge: 1000 * 60 * 60 * 24, // 1 hari

        
        // ===========  Chrome , edge , fireFox Production  ==============


        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        httpOnly: true, 
        maxAge: 1000 * 60 * 60 * 24, 


        // ===========  Safari Production ==============

        
        // secure: true,           // Menggunakan HTTPS wajib
        // sameSite: 'none',       // Dibutuhkan untuk cookie lintas domain
        // httpOnly: true,         // Melindungi dari XSS
        // maxAge: 1000 * 60 * 60 * 24, // 1 hari
          
    },
}));

// Deklarasi Tipe yang Diperluas
declare module 'express-serve-static-core' {
    interface Request {
      userId?: string; // Tambahkan properti userId
    }
  }
  
// Deklarasi Tipe yang Diperluas
declare module 'express-session' {
    interface SessionData {
      cart?: {
        roomId: string;
        quantity: number;
        price: number;
      }[],
      deviceInfo? : {
        userAgent?: string;
        ipAddress?: string;
      },
      userId: string;
      night: string;
      refreshToken : string;
      date : {
        checkin : Date |string ;
        checkout : Date |string ;
      };
    }
  }

//   app.use((req, res, next) => {
//     console.log('Session ID:', req.sessionID);
//     console.log('Session Data:', req.session);
//     next();
// });



app.get('/', (req, res) => {
    res.send('Welcome to the Server Main Aras Service!');
});

// : Melindungi dari XSS, Clickjacking, dan Sniffing
app.use(helmet());

app.use((req, res, next) => {
    console.log('Cookies:', req.headers.cookie || 'No cookies received');
    console.log('Session ID:', req.sessionID);
    next();
});

app.use((req, res, next) => {
    res.setHeader('Set-Cookie', 'test_cookie=test_value; Path=/; Secure; HttpOnly; SameSite=None');
    next();
});


// Admin
app.use("/api/v1/room", RoomRouter)
app.use("/api/v1/admin", AdminRouter)
app.use("/api/v1/site/minder", SiteMinderRouter)
app.use("/api/v1/reservation", ReservationRouter)
app.use("/api/v1/dashboard", DashboardRouter)
app.use("/api/v1/admin/booking", AdminBookingRouter)
app.use("/api/v1/admin/customer", AdminCustomerRouter)

app.use("/api/v1/instagram", InstagramRouter)
app.use("/api/v1/contact", ContactRouter)
app.use("/api/v1/booking", BookingRouter)
app.use("/api/v1/auth", AuthRouter)
app.use("/api/v1/user", UserRouter)
app.use("/api/v1/short", ShortAvailableRouter)
app.use("/api/v1/transaction", TransactionRouter)
app.use("/api/v1/session", SessionRouter)




const startServer = async () => {
    try {
        
        // await connectToDatabase();

        await connectToMongoDB()
        console.log('Server Read Database');
        
        app.listen(process.env.PORT, () => {
            console.log(`Server Active on Port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1); 
    }
};

startServer.keepAliveTimeout = 60000; // 60 detik
startServer.headersTimeout = 65000; 

startServer();
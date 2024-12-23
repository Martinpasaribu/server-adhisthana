import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import RoomRouter from "./router/router_room";
import { connectToDatabase } from "./config/mongodb";
import InstagramRouter from "./router/router_instagram";
import ContactRouter from "./router/router_contact";
import BookingRouter from "./router/router_booking";

const app: express.Application = express();

dotenv.config()

app.use(cors({
    origin: ["http://localhost:3000","http://localhost:3001"],
    methods: ["POST", "GET", "PATCH", "DELETE", 'PUT', "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
 }));


// Jika klien mengirim JSON, maka express.json() akan mem-parsingnya.
app.use(express.json());

// Jika klien mengirim URL-encoded data (misalnya form submission dari aplikasi web), maka express.urlencoded() akan mem-parsingnya.
// Content-Type: application/x-www-form-urlencoded.
// ex : name=John&age=30
app.use(express.urlencoded({extended:false}))


app.get('/', (req, res) => {
    res.send('Welcome to the Server Main Aras Service!');
});

// app.use("/v1/packet", packetRouter)

app.use("/api/v1/room", RoomRouter)
app.use("/api/v1/instagram", InstagramRouter)
app.use("/api/v1/contact", ContactRouter)
app.use("/api/v1/booking", BookingRouter)



const startServer = async () => {
    try {
        
        await connectToDatabase();
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

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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongodb_session_1 = __importDefault(require("connect-mongodb-session"));
const router_room_1 = __importDefault(require("./router/router_room"));
const router_instagram_1 = __importDefault(require("./router/router_instagram"));
const router_contact_1 = __importDefault(require("./router/router_contact"));
const router_booking_1 = __importDefault(require("./router/router_booking"));
const router_auth_1 = __importDefault(require("./router/router_auth"));
const router_user_1 = __importDefault(require("./router/router_user"));
const mongoDbCloud_1 = require("./config/mongoDbCloud");
const router_shortAvailable_1 = __importDefault(require("./router/router_shortAvailable"));
const router_transaction_1 = __importDefault(require("./router/router_transaction"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:3001", "https://adhistahan.vercel.app"],
    methods: ["POST", "GET", "PATCH", "DELETE", 'PUT', "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((0, cookie_parser_1.default)());
// Jika klien mengirim JSON, maka express.json() akan mem-parsingnya.
app.use(express_1.default.json());
// Jika klien mengirim URL-encoded data (misalnya form submission dari aplikasi web), maka express.urlencoded() akan mem-parsingnya.
// Content-Type: application/x-www-form-urlencoded.
// ex : name=John&age=30
app.use(express_1.default.urlencoded({ extended: false }));
const MongoDBStoreKU = (0, connect_mongodb_session_1.default)(express_session_1.default);
const store = new MongoDBStoreKU({
    uri: `${process.env.MongoDB_cloud}`,
    collection: 'sessions'
});
store.on('error', function (error) {
    console.log(error);
});
app.set('trust proxy', 1);
app.use((0, express_session_1.default)({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        //  ==========  Development  ============
        // secure: false,
        // httpOnly: true,      
        // maxAge: 1000 * 60 * 60 * 24, // 1 hari
        // ===========  Chrome , edge , fireFox Production  ==============
        secure: true,
        sameSite: 'none',
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24,
        // ===========  Safari Production ==============
        // secure: true,           // Menggunakan HTTPS wajib
        // sameSite: 'none',       // Dibutuhkan untuk cookie lintas domain
        // httpOnly: true,         // Melindungi dari XSS
        // maxAge: 1000 * 60 * 60 * 24, // 1 hari
    },
}));
//   app.use((req, res, next) => {
//     console.log('Session ID:', req.sessionID);
//     console.log('Session Data:', req.session);
//     next();
// });
app.get('/', (req, res) => {
    res.send('Welcome to the Server Main Aras Service!');
});
app.use((req, res, next) => {
    console.log('Cookies:', req.headers.cookie || 'No cookies received');
    console.log('Session ID:', req.sessionID);
    next();
});
app.use("/api/v1/room", router_room_1.default);
app.use("/api/v1/instagram", router_instagram_1.default);
app.use("/api/v1/contact", router_contact_1.default);
app.use("/api/v1/booking", router_booking_1.default);
app.use("/api/v1/auth", router_auth_1.default);
app.use("/api/v1/user", router_user_1.default);
app.use("/api/v1/short", router_shortAvailable_1.default);
app.use("/api/v1/transaction", router_transaction_1.default);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // await connectToDatabase();
        yield (0, mongoDbCloud_1.connectToMongoDB)();
        console.log('Server Read Database');
        app.listen(process.env.PORT, () => {
            console.log(`Server Active on Port ${process.env.PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
});
startServer.keepAliveTimeout = 60000; // 60 detik
startServer.headersTimeout = 65000;
startServer();

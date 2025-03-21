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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var dotenv_1 = require("dotenv");
var cors_1 = require("cors");
var helmet_1 = require("helmet");
var express_session_1 = require("express-session");
var connect_mongodb_session_1 = require("connect-mongodb-session");
require("./controller/PendingRoom/Cron_job");
var router_instagram_1 = require("./router/router_instagram");
var router_contact_1 = require("./router/router_contact");
var router_booking_1 = require("./router/router_booking");
var router_auth_1 = require("./router/router_auth");
var router_user_1 = require("./router/router_user");
var mongoDbCloud_1 = require("./config/mongoDbCloud");
var router_shortAvailable_1 = require("./router/router_shortAvailable");
var router_transaction_1 = require("./router/router_transaction");
var cookie_parser_1 = require("cookie-parser");
var router_session_1 = require("./router/router_session");
var router_room_1 = require("./router/Admin/router_room");
var router_admin_1 = require("./router/Admin/router_admin");
var router_siteminder_1 = require("./router/Admin/router_siteminder");
var router_reservation_1 = require("./router/Admin/router_reservation");
var router_dashboard_1 = require("./router/Admin/router_dashboard");
var router_admin_booking_1 = require("./router/Admin/router_admin_booking");
var router_admin_customer_1 = require("./router/Admin/router_admin_customer");
var router_logging_1 = require("./router/Admin/router_logging");
var app = express_1["default"]();
dotenv_1["default"].config();
app.use(cors_1["default"]({
    origin: [
        "http://localhost:3000", "http://localhost:3001",
        "https://adhistahan.vercel.app", "https://adhisthanavillas.com",
        "https://admin-adhisthana.vercel.app", "https://api.adhisthanavillas.com,",
        "https://www.adhisthanavillas.com"
    ],
    methods: ["POST", "GET", "PATCH", "DELETE", 'PUT', "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(cookie_parser_1["default"]());
// Jika klien mengirim JSON, maka express.json() akan mem-parsingnya.
app.use(express_1["default"].json());
// Jika klien mengirim URL-encoded data (misalnya form submission dari aplikasi web), maka express.urlencoded() akan mem-parsingnya.
// Content-Type: application/x-www-form-urlencoded.
// ex : name=John&age=30
app.use(express_1["default"].urlencoded({ extended: false }));
var MongoDBStoreKU = connect_mongodb_session_1["default"](express_session_1["default"]);
var store = new MongoDBStoreKU({
    uri: "" + process.env.MongoDB_cloud,
    collection: 'sessions'
});
store.on('error', function (error) {
    console.log(error);
});
// app.set('trust proxy', 1)
app.set('trust proxy', true);
app.use(express_session_1["default"]({
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
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));
//   app.use((req, res, next) => {
//     console.log('Session ID:', req.sessionID);
//     console.log('Session Data:', req.session);
//     next();
// });
app.get('/', function (req, res) {
    res.send('Welcome to the Server Main Aras Service!');
});
// : Melindungi dari XSS, Clickjacking, dan Sniffing
app.use(helmet_1["default"]());
app.use(function (req, res, next) {
    console.log('Cookies:', req.headers.cookie || 'No cookies received');
    console.log('Session ID:', req.sessionID);
    next();
});
app.use(function (req, res, next) {
    res.setHeader('Set-Cookie', 'test_cookie=test_value; Path=/; Secure; HttpOnly; SameSite=None');
    next();
});
// Admin
app.use("/api/v1/room", router_room_1["default"]);
app.use("/api/v1/admin", router_admin_1["default"]);
app.use("/api/v1/site/minder", router_siteminder_1["default"]);
app.use("/api/v1/reservation", router_reservation_1["default"]);
app.use("/api/v1/dashboard", router_dashboard_1["default"]);
app.use("/api/v1/admin/booking", router_admin_booking_1["default"]);
app.use("/api/v1/admin/customer", router_admin_customer_1["default"]);
app.use("/api/v1/admin/log", router_logging_1["default"]);
app.use("/api/v1/instagram", router_instagram_1["default"]);
app.use("/api/v1/contact", router_contact_1["default"]);
app.use("/api/v1/booking", router_booking_1["default"]);
app.use("/api/v1/auth", router_auth_1["default"]);
app.use("/api/v1/user", router_user_1["default"]);
app.use("/api/v1/short", router_shortAvailable_1["default"]);
app.use("/api/v1/transaction", router_transaction_1["default"]);
app.use("/api/v1/session", router_session_1["default"]);
var startServer = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                // await connectToDatabase();
                return [4 /*yield*/, mongoDbCloud_1.connectToMongoDB()];
            case 1:
                // await connectToDatabase();
                _a.sent();
                console.log('Server Read Database');
                app.listen(process.env.PORT, function () {
                    console.log("Server Active on Port " + process.env.PORT);
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error("Failed to connect to MongoDB:", error_1);
                process.exit(1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
startServer.keepAliveTimeout = 60000; // 60 detik
startServer.headersTimeout = 65000;
startServer();

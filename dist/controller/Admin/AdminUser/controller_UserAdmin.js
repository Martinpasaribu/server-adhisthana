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
exports.AdminUserController = void 0;
const argon2_1 = __importDefault(require("argon2"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
const models_admin_1 = __importDefault(require("../../../models/Admin/models_admin"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
class AdminUserController {
    static getAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield models_admin_1.default.find();
                res.status(200).json(users);
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    static RegisterAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, username, password, status, role } = req.body;
            try {
                if (!title || !username || !password || !status || !role) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        message: `All Field can't be empty`,
                    });
                }
                // argon2 lebih tahan terhadap serangan GPU brute-force.
                const hashPassword = yield argon2_1.default.hash(password);
                // const salt = await bcrypt.genSalt();
                // const hashPassword = await bcrypt.hash(password, salt);
                const user = yield models_admin_1.default.create({
                    title: title,
                    username: username,
                    role: role,
                    status: status,
                    active: true,
                    password: hashPassword,
                });
                res.status(201).json({
                    requestId: (0, uuid_1.v4)(),
                    data: user,
                    message: "Successfully register user.",
                    success: true
                });
            }
            catch (error) {
                res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message,
                    success: false
                });
            }
        });
    }
    static CheckMeAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.session.userId) {
                    return res.status(401).json({ message: "Your session-Id no exists", success: false });
                }
                const user = yield models_admin_1.default.findOne({ _id: req.session.userId }, { role: true });
                if (!user)
                    return res.status(404).json({ message: "Your session-Id no register", success: false });
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: user,
                    message: "Your session-Id exists",
                    success: true
                });
            }
            catch (error) {
                const axiosError = error;
                const errorResponseData = axiosError.response ? axiosError.response.status : null;
                console.error('Error during Session-Id:', error);
                res.status(500).json({
                    message: "An error occurred during Session-Id:",
                    error: axiosError.message,
                    error2: errorResponseData,
                    stack: axiosError.stack,
                    success: false
                });
            }
        });
    }
    static GetAdminUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield models_admin_1.default.find({ isDeleted: false });
                res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: users,
                    success: true
                });
            }
            catch (error) {
                console.log(error);
                // Kirim hasil response
                return res.status(400).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
    static SetBlock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // ✅ Validasi jika TransactionId tidak ada
                if (!id) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "ID is required!",
                        success: false
                    });
                }
                // ✅ Cari booking berdasarkan TransactionId
                const User = yield models_admin_1.default.findOne({
                    _id: new mongoose_1.default.Types.ObjectId(id),
                    isDeleted: false
                });
                if (!User) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "User not found!",
                        success: false
                    });
                }
                // ✅ Update status verified
                const blockUser = yield models_admin_1.default.findOneAndUpdate({
                    _id: new mongoose_1.default.Types.ObjectId(id), isDeleted: false
                }, {
                    active: false
                }, { new: true } // Mengembalikan data yang sudah diperbarui
                );
                if (!blockUser) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: `Failed to block account ${User === null || User === void 0 ? void 0 : User.username}`,
                        success: false
                    });
                }
                console.log(`Block account ${User === null || User === void 0 ? void 0 : User.username}`);
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: { acknowledged: true },
                    message: `Successfully block account ${User === null || User === void 0 ? void 0 : User.username}`,
                    success: true
                });
            }
            catch (error) {
                console.error("Error block User:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
    static SetActive(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // ✅ Validasi jika TransactionId tidak ada
                if (!id) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "ID is required!",
                        success: false
                    });
                }
                // ✅ Cari booking berdasarkan TransactionId
                const User = yield models_admin_1.default.findOne({
                    _id: new mongoose_1.default.Types.ObjectId(id),
                    isDeleted: false
                });
                if (!User) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "User not found!",
                        success: false
                    });
                }
                // ✅ Update status verified
                const blockUser = yield models_admin_1.default.findOneAndUpdate({
                    _id: new mongoose_1.default.Types.ObjectId(id), isDeleted: false
                }, {
                    active: true
                }, { new: true } // Mengembalikan data yang sudah diperbarui
                );
                if (!blockUser) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: `Failed to active account ${User === null || User === void 0 ? void 0 : User.username}!`,
                        success: false
                    });
                }
                console.log(`Booking ${blockUser.username} has been verified`);
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: { acknowledged: true },
                    message: `Successfully active account ${User === null || User === void 0 ? void 0 : User.username}`,
                    success: true
                });
            }
            catch (error) {
                console.error("Error active account:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
    static DeletedUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { UserId } = req.params;
                // ✅ Validasi jika MessageId tidak ada
                if (!UserId) {
                    return res.status(400).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "UserId is required!",
                        success: false
                    });
                }
                // ✅ Cari booking berdasarkan MessageId
                const UserData = yield models_admin_1.default.findOneAndUpdate({ _id: new mongoose_1.default.Types.ObjectId(UserId), isDeleted: false }, { isDeleted: true }, { new: true } // Mengembalikan data yang diperbarui
                );
                if (!UserData) {
                    return res.status(404).json({
                        requestId: (0, uuid_1.v4)(),
                        data: null,
                        message: "User Data not found!",
                        success: false
                    });
                }
                return res.status(200).json({
                    requestId: (0, uuid_1.v4)(),
                    data: { acknowledged: true },
                    message: `Successfully deleted User: ${UserData.username}`,
                    success: true
                });
            }
            catch (error) {
                console.error("Error deleted User Data:", error);
                return res.status(500).json({
                    requestId: (0, uuid_1.v4)(),
                    data: null,
                    message: error.message || "Internal Server Error",
                    success: false
                });
            }
        });
    }
}
exports.AdminUserController = AdminUserController;

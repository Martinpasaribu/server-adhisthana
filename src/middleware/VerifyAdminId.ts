import AdminModel from "../models/Admin/models_admin";


export const verifyAdmin = async (req: any, res: any, next: any) => {
    console.log("hasil Session from db :", req.session.userId);

    if (!req.session.userId) {
        return res.status(401).json({ message: "Session empty, Login again" });
    }

    const admin = await AdminModel.findOne({ _id: req.session.userId , active: true});

    if (!admin) {
        return res.status(404).json({ message: "User sessionID not found" });
    }

    // Perbaikan logika role
    if (admin.role !== "admin" && admin.role !== "superAdmin" && admin.role !== "coSuperAdmin") {
        return res.status(403).json({ msg: "Access Prohibited!! " });
    }

    req.role = admin.role;
    req.userAdmin = admin.username;
    
    next();
};


import jwt from "jsonwebtoken";


import dotenv from 'dotenv';
dotenv.config();


export const verifyToken = (req:any, res:any, next:any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ message: 'Your session does not exist' });

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(403).json({ message: "Your cookies are missing" });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err : any, decoded : any) => {
        if (err) return res.status(401).json({ message: 'Token verification failed' });
        
        req.email = decoded.email;          
        next();
    });
}

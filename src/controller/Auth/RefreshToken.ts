
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import UserModel from '../../models/User/models_user';

dotenv.config();


export  const refreshToken = async (req : any, res : any) => {
    try {
        console.log("hasil token coockies :",req.cookies);
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.status(401).json({ message: 'Session cookies empty' });
        const user = await UserModel.findOne( { refresh_token: refreshToken });

        if(!user) return res.status(401).json({ message: 'User  empty' });

        // Casting process.env

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, (err : any ) => 
        {
            if(err) return res.status(401).json({ message: 'refreshToken not verify' });
            const userId = user._id;
            const name = user.name;
            const email = user.email;
            const accessToken = jwt.sign({ userId, name, email}, process.env.ACCESS_TOKEN_SECRET as string,{
                expiresIn : '25s'
            });
            res.json({ accessToken})
                
        });

    } catch (error) {
        console.log(error)
    }
}


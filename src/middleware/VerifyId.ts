import { UserModel } from "../models/User/models_user";


export const verifyID = async (req:any, res:any, next:any) => {
      
    // kalo server direset sessionn akan hilang
    console.log("hasil Session coockies :", req.session);
    if(!req.session.userId){
        return res.status(401).json({message: "Session empty, Login again "});
    }
    
    const user = await UserModel.findOne({_id : req.session.userId});

    if(!user) return res.status(404).json({message: "User sessionID tidak ditemukan"});
    req.userId = user._id.toString();
    
    next();    
}

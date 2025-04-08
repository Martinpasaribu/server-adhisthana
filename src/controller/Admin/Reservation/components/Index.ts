import UserModel from "../../../../models/User/models_user";



export const  CekUser = async (email : string) => {

    const users = await UserModel.findOne({email: email});

    if(users){
        
        return users._id

    } else {
       
        return null;
    } 

}

export const  Register = async (title : string, name:string, email : string, phone :number) => {


        const Regis = await UserModel.create({
            title: title,
            name: name,
            email: email,
            phone: phone
    
        });

        if(Regis){
        
            return Regis._id 
            // return {
            //     success: true,
            //     userId: Regis._id, // Mengembalikan ID pengguna yang baru dibuat
            //     message: "User registered successfully"
            // };
    
        }else {   
            throw new Error(" Cannot register use at user Guest");
        } 
    

}





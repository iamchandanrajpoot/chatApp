const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.autherizeUser = async(req, res, next)=>{
    try {
        const token = req.headers["authorization"]
        if(token){
            jwt.verify(token, process.env.JWT_SECRET_KEY,async(err, decodedData)=>{
                if(err){
                   return res.status(500).json({message: "internal server error"})
                }else{
                    const user = await User.findOne({where: {id: decodedData.id}})
                    req.user = user
                    next();
                }
            })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "internal server error"})
    }
}
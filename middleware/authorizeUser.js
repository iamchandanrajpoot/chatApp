const jwt = require("jsonwebtoken");

exports.autherizeUser = async(req, res, next)=>{
    try {
        const token = req.headers["authorization"]
        if(token){
            jwt.verify(token, process.env.JWT_SECRET_KEY,(err, user)=>{
                if(err){
                   return res.status(500).json({message: "internal server error"})
                }else{
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
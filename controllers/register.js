const bcrypt = require('bcrypt');
const User = require('../models/user');

exports.registerController = async(req, res)=>{
    try {
        console.log(req.body);
        const user= await User.findOne({where: {email : req.body.email}})
        if(user){
           return res.status(409).json({message: "User already exist with this email", success: false})
        }
        await User.create({...req.body, password: await bcrypt.hash(req.body.password, 10)})
        res.status(201).json({message: "successfully register", success: true})
    } catch (error) {
        // console.error(error);
        res.status(500).json({message: "internal server error", success: false})
    }
}
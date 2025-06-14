const jwt = require("jsonwebtoken") 
const User = require("../modelFolder/userModel")

const validateRegister = (req, res, next)=>{

    const { username, email, password, role } = req.body

    const errors = []

    if(!email){
        errors.push("Please add your email")
    }

    if(!password){
        errors.push("Please add your password")
    }

    if(errors.length > 0){
        return res.status(400).json({message: errors})
    }

    next()

}


const authorization = async (req, res, next)=>{

    const token = req.header("Authorization")

    if(!token){
        return res.status(401).json({message: "Please login!"})
    }

    const splitToken = token.split(" ")

    const realToken = splitToken[1]

    const decoded = jwt.verify(realToken, `${process.env.ACCESS_TOKEN}`)

    if(!decoded){
        return res.status(401).json({message: "Please login!"})
    }

    const user = await User.findById(decoded.userId);

    if(!user){
        return res.status(404).json({message: "User account does not exist"})
    }


    req.user = user

    next()

}

module.exports = {
    validateRegister,
    authorization
}
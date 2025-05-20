const User = require("../modelFolder/userModel")


const findUserService = async ()=>{
    const allUser = await User.find()

    return allUser
}




module.exports = {
    findUserService
}
const nodemailer = require("nodemailer")

const sendForgotPasswordEmail = async ( email, token )=>{
    
    try {
        const mailTransport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: `${process.env.EMAIL}`,
                pass: `${process.env.EMAIL_PASSWORD}`
            }
        })
    
        const mailDetails = {
            from: process.env.EMAIL,
            to: email,
            subject: "Reset Password Notification",
            text: `Use this link to reset your password: https://www.yourcareerex.com/reset-password/${token}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; color: #0f172a;">
                <h2 style="color: #1e293b;">Reset Your Password</h2>
                <p style="margin-bottom: 20px;">
                  Click the button below to reset your password:
                </p>
                <a href="https://www.yourcareerex.com/reset-password/${token}"
                   style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Reset Password
                </a>
                <p style="margin-top: 30px;">
                  If the button doesn't work, copy and paste the following link into your browser:
                </p>
                <p style="word-break: break-all;">
                  https://www.yourcareerex.com/reset-password/${token}
                </p>
              </div>
            `
          }
          
    
        await mailTransport.sendMail(mailDetails)
        
    } catch (error) {
        console.log(error)
    }

}


const validEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

module.exports = {
    sendForgotPasswordEmail,
    validEmail
}
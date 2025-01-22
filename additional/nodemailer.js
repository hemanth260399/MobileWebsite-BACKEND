import dotenv from "dotenv"
import nodemailer from "nodemailer";
dotenv.config()
export let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.mail_name,
        pass: process.env.pass_key
    }
})
export let mailObj = {
    "from": process.env.mail_name,
    "to": [],
    "subject": "Forget Password",
    "text": "Click here to change your password"
}
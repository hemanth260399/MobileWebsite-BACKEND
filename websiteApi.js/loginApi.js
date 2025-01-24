import express from 'express';
import bcrypt from 'bcrypt';
import { userSchema } from '../mongooseDb/userSchema.js';
import { jwtToken } from '../additional/JWT.js';
import { v4 } from 'uuid';
import jwt from "jsonwebtoken";
import { mailObj, transporter } from '../additional/nodemailer.js';
import passport from 'passport';
import "../additional/passport.js"
export let loginServer = express.Router()
loginServer.post("/register", async (req, res) => {
    let userdata = req.body
    let userfind = await userSchema.findOne({ email: userdata.email })
    if (userfind) {
        return res.status(400).json({ msg: "user already exists" })
    }
    try {
        bcrypt.hash(userdata.password, 10, async (err, hash) => {
            if (err) res.status(500).json({ msg: "Something went wrong" })
            else {
                userdata.password = hash
                let User = new userSchema({
                    ...userdata
                })
                await User.save()
                res.json({ msg: "User registered successfully" })
            }
        })
    } catch (err) {
        res.status(500).json({ msg: "Something went wrong" })
    }
})
loginServer.post("/login", async (req, res) => {
    let userdata = req.body
    let userfind = await userSchema.findOne({ email: userdata.data.email })
    if (userfind) {
        bcrypt.compare(userdata.data.password, userfind.password, (err, data) => {
            if (data) {
                let token = jwtToken({ data: userfind._id }, "1h")
                res.json({ msg: "Login successful", data: { name: userfind.name, email: userfind.email, id: userfind._id }, token: token })
            } else if (err) {
                res.status(400).json({ msg: "Something went wrong" })
            }
            else {
                res.status(404).json({ msg: "Invalid credentials" })
            }
        })
    } else {
        res.status(400).json({ msg: "Please register your email" })
    }
})
loginServer.post("/forgetpassword", async (req, res) => {
    let userdata = req.body
    let tempdata = v4()
    let userfind = await userSchema.findOne({ email: userdata.data })
    if (userfind) {
        let token = jwtToken({ data: tempdata }, "1d")
        await userSchema.updateOne({ email: userdata.data }, { $set: { passwordChange: tempdata } })
        await transporter.sendMail({
            ...mailObj,
            to: userdata.data,
            subject: "Password Reset Link",
            text: `Click on the following link to reset your password: ${process.env.FE_URL}/changepassword?token=${token}`
        })
        res.json({ msg: "Check your email for password reset link" })
    } else {
        res.status(404).json({ msg: "User not found" })
    }
})
loginServer.post("/changepassword", async (req, res) => {
    let userdata = req.body
    let token = req.query
    jwt.verify(token.token, process.env.JWT_KEY, async (err, data) => {
        let userfind = await userSchema.findOne({ passwordChange: data.data })
        if (userfind) {
            bcrypt.hash(userdata.password, 10, async (err, hash) => {
                if (err) res.status(500).json({ msg: "Something went wrong" })
                else {
                    userfind.password = hash
                    await userfind.save()
                    await userSchema.updateOne({ email: userfind.email }, { $set: { passwordChange: "" } })
                    res.json({ msg: "Password changed successfully" })
                }
            })
        } else {
            res.status(404).json({ msg: "Token expired or invalid" })
        }
    })
})
loginServer.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }))
loginServer.get("/auth/google/callback",
    passport.authenticate("google", {
        successRedirect: "/auth/success",
        failureRedirect: '/auth/login/failure'
    }))
loginServer.get("/auth/success", (req, res) => {
    res.redirect(`${process.env.FE_URL}/auth/loginSuccess`)
})
loginServer.get("/auth/login/failure", (req, res) => res.status(401).json({ msg: "Failed to authenticate with Google" }))
loginServer.get("/auth/loginSuccess", (req, res) => {
    let token = jwtToken({ data: req.user.userdata.email }, "1h")
    res.json({ msg: "Login successful", data: { name: req.user.userdata.name, email: req.user.userdata.email, id: req.user.userdata._id }, token: token })
})

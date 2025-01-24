import express from 'express';
import cors from 'cors';
import { dbConnect } from './mongooseDb/dbconnection.js';
import { mobileserver } from './websiteApi.js/mobileProductApi.js';
import { loginServer } from './websiteApi.js/loginApi.js';
import { cartRouter } from './websiteApi.js/addtocart.js';
import jwt from "jsonwebtoken";
import session from "express-session";
import passport from 'passport';
import dotenv from "dotenv"
dotenv.config()
let app = express()
app.use(express.json())
app.use(cors(
    {
        origin: process.env.FE_URL,
        credentials: true,
        methods: 'GET, POST,PUT,DELETE'
    }
))
app.set("trust proxy", 1)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: "auto",
        sameSite: "lax"
    }
}))
app.use(passport.initialize());
app.use(passport.session());
app.get("/", (req, res) => {
    res.json({ msg: "success" })
})
let verifyAuthorization = (req, res, next) => {
    let token = req.headers["auth-token"]
    if (token) {
        jwt.verify(token, process.env.JWT_KEY, async (err, data) => {
            if (err) {
                res.status(403).json({ msg: "Unauthorized or Invalid Token" });
            } else {
                req.user = data.data
                next();
            }
        })
    } else {
        res.status(403).json({ msg: "Unauthorized" });
    }
}
let port = 7777
app.use("/", loginServer)
app.use("/products", verifyAuthorization, mobileserver)
app.use("/", verifyAuthorization, cartRouter)
await dbConnect()
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

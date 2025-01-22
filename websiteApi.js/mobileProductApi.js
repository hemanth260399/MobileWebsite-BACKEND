import express from 'express';
import { mobileProductSchema } from '../mongooseDb/mobileProductSchema.js';
import { cartSchema } from '../mongooseDb/addtocart.js';
import { userSchema } from '../mongooseDb/userSchema.js';
export let mobileserver = express.Router()
mobileserver.post("/", async (req, res) => {
    let data = req.body
    let productdetails = await cartSchema.findOne({ customerid: data.id })
    let status = Boolean(productdetails)
    let productData = await mobileProductSchema.find()
    if (!status) {
        if (productData) {
            res.json({ data: productData })
        }
        else {
            res.json({ msg: "No data found" })
        }
    } else {
        if (productData) {
            res.json({ data: productData, count: productdetails.items.length })
        } else {
            res.json({ msg: "No data found" })
        }
    }
})

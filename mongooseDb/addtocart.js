import mongoose, { Schema } from "mongoose";

let productmodel = new Schema({
    title: { type: String, required: true },
    id: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    modelName: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
})
let addtocartmodel = new Schema({
    customerid: { type: String, required: true },
    customeremail: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    items: [productmodel]
})
export let cartSchema = mongoose.model("addtocart", addtocartmodel)
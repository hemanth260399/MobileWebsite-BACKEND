import mongoose, { Schema } from "mongoose";

let mobileSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPercentage: { type: String, required: true },
    rating: { type: String, required: true },
    stock: { type: Number, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true }
})
export let mobileProductSchema = mongoose.model("mobileProducts", mobileSchema)

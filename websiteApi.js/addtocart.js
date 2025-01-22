import express from "express";
import { cartSchema } from "../mongooseDb/addtocart.js";
import { orderSchema } from "../mongooseDb/placeorder.js";
import Stripe from "stripe";
let stripe = new Stripe("sk_test_51Qhvy0FhehZ1BwTfJf2ax99oRbfOtnw9CTCjN85Wrl1kaouGeOtiRntJeyWHcicBtpnvJkEzbCdKgq7zFlb8pU0600yQJqCJdH");
export let cartRouter = express.Router();
cartRouter.post("/addtocart", async (req, res) => {
  let productData = req.body;
  let productInCart = null
  let userFind = await cartSchema.findOne({ customerid: productData.customerDetails.customerid });
  if (userFind) {
    productInCart = userFind.items.find((item) => item.title === productData.product.title)
  } else {
    productInCart = null
  }
  if (productInCart) {
    res.json({ msg: "Product already in cart", data: productData.product.title, newitem: false })
  } else {
    if (userFind) {
      let newProduct = { ...productData.product, modelName: productData.product.brand }
      userFind.totalPrice += newProduct.price * newProduct.quantity;
      userFind.items.push(newProduct);
      await userFind.save();
      res.status(200).json({ msg: "Data saved successfully", data: newProduct.title, newitem: true })
    } else {
      let newProductData = new cartSchema({
        customerid: productData.customerDetails.customerid,
        customeremail: productData.customerDetails.customername,
        totalPrice: productData.product.price * productData.product.quantity,
        items: [{ ...productData.product, modelName: productData.product.brand }]
      })
      await newProductData.save()
      res.status(200).json({ msg: "Data saved successfully", data: newProductData.items[0].title, newitem: true })
    }
  }
});
cartRouter.post("/removefromcart", async (req, res) => {
  let productData = req.body
  let userFind = await cartSchema.findOneAndUpdate({ customerid: productData.customerid }, { $pull: { items: { title: productData.title } }, $inc: { totalPrice: -productData.total } }, { new: true })
  if (userFind) {
    res.json({ msg: "Product removed successfully", data: userFind })
  } else {
    res.json({ msg: "No such product found" })
  }
})
cartRouter.get("/cart", async (req, res) => {
  let id = req.query
  let userFind = await cartSchema.findOne({ customerid: id.id })
  if (userFind) {
    res.json({ msg: "success", data: userFind.items, totalValue: userFind.totalPrice, cartId: userFind._id })
  } else {
    res.status(404).json({ msg: "Cart is Empty" })
  }
})
cartRouter.post("/placeOrder", async (req, res) => {
  let data = req.body
  let cartFind = await cartSchema.find({ _id: data.cartId })
  if (cartFind) {
    cartFind[0].totalPrice = data.total
    for (let i in data.qty) {
      cartFind[0].items.map((item) => item.id === i ? item.quantity = data.qty[i] : item.quantity)
    } try {
      await cartFind[0].save()
      let newcartFind = await cartSchema.find({ _id: data.cartId })
      let newOrder = new orderSchema({
        customerid: newcartFind[0].customerid,
        customeremail: newcartFind[0].customeremail,
        totalPrice: newcartFind[0].totalPrice,
        items: newcartFind[0].items
      })
      await newOrder.save()
      let placeOrderupdate = newOrder.items.map((item) => {
        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: item.title,
              description: item.description,
              images: [item.image],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }
      })
      let session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: placeOrderupdate,
        mode: "payment",
        success_url: `http://localhost:5173/success`,
        cancel_url: `http://localhost:5173/cancel`
      })
      await cartSchema.deleteOne({ _id: data.cartId })
      res.status(200).send({ msg: "Order placed successfully", data: newOrder, stripeSessionId: session })
    } catch (err) {
      console.log(err, "error")
      res.status(500).send({ msg: "Something went wrong" })
    }
  } else {
    res.status(404).send({ msg: "Cart is Empty" })
  }
})
cartRouter.get("/order", async (req, res) => {
  let id = req.query
  let orderFind = await orderSchema.aggregate([{ $match: { customerid: id.id } }, { $group: { _id: "$customerid", items: { $push: "$items" } } }, { $project: { items: 1, _id: 0 } }])
  let flatArray = []
  if (orderFind.length > 0) {
    flatArray = [].concat(...orderFind[0].items)
    res.json({ msg: "success", data: flatArray })
  }
  else {
    res.status(404).json({ msg: "No orders found" })
  }
})
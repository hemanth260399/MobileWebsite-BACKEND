import mongoose, { Schema } from "mongoose";

let usermodel = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  type: { type: String, required: false },
  passwordChange: { type: String, required: false },
});
export let userSchema = mongoose.model("userData", usermodel);

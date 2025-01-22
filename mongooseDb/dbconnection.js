import dotenv from "dotenv"
import mongoose from "mongoose"
dotenv.config()
let dbName = "MobileWebsite"
let dbURL = `mongodb+srv://${process.env.user}:${process.env.password}@${process.env.cluster_name}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`
export let dbConnect = async () => {
    try {
        await mongoose.connect(dbURL)
        console.log("Database connected successfully")
    } catch (e) {
        console.error("Error connecting to database:", e)
        process.exit(1)
    }

}
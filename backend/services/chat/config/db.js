import mongoose from "mongoose";

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MONGO_URI is not configured");
    }
    await mongoose.connect(mongoUri);
    console.log("Database connected successfully ✅");
};

export default connectDB;
import { mongoose } from "mongoose";

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    avatar: String
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;
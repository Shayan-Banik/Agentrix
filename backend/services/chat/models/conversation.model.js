import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({

    title:{
        type: String,
        default: "Start New Conversation"  
    },
    userId: {
        type: String,
    }
}, {
    timestamps: true
});

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    console.log("user Id : ", userId);
    const conversation = await Conversation.create({
      userId: userId,
    });
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: `Internal server error ${error}` });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const conversations = await Conversation.find({ userId: userId }).sort({
      updatedAt: -1,
    });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: `Internal server error ${error}` });
  }
};


export const createMessages = async (req, res) => {
  try {
    const { conversationId, role, content } = req.body;
    const message = await Message.create({
      conversationId: conversationId,
      role: role,
      content: content,
    });
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: `Internal server error ${error}` });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({
      conversationId: conversationId,
    }).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: `Internal server error ${error}` });
  }
};

export const updateConversationTitle = async (req, res) => {
  try {
    const { conversationId, title } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(conversationId, {
      title,
    });
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: `update server error ${error}` });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { conversationId } = req.params;
    const conversation = await Conversation.findOne({ _id: conversationId, userId });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    await Message.deleteMany({ conversationId: conversation._id });
    await conversation.deleteOne();
    return res.status(200).json({ message: "Conversation deleted" });
  } catch (error) {
    return res.status(500).json({ message: `Unable to delete conversation: ${error.message}` });
  }
};
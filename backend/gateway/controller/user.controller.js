import User from "../../services/auth/models/user.model.js";

export const getCurrentUser = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
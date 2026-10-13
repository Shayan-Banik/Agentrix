import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import User from "../models/user.model.js";

export const login = async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = await getAuth(app).verifyIdToken(token);

    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        name: decodedToken.name,
        email: decodedToken.email,
        avatar: decodedToken.picture,
      });
    }

    const sessioID = crypto.randomUUID();
    res.cookie("session", sessioID, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({
        message: "Login successful",
        user,
    });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import User from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";

export const login = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Firebase ID token is required" });
    }

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

    // sessionID will be stored in redis -> here session is the SessionKey
    const sessioID = crypto.randomUUID();
    await redis.set(`session-${sessioID}`, JSON.stringify({
      userId: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    }), "EX", 60 * 60 * 24 * 7);

    res.cookie("session", sessioID, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({
        message: "Login successful",
        user,
    });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const sessionID = req.cookies?.session;
    if (sessionID) {
      await redis.del(`session-${sessionID}`);
    }

    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("session", {
      path: "/",
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

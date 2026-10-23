import redis from "../../shared/redis/redis.js";


export const authMiddleware = async (req, res, next) => {
  try {
    // 1. Read session ID from cookie
    const sessionID = req.cookies?.session;

    if (!sessionID) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    
    // 2. Retrieve session from Redis
    const session = await redis.get(`session-${sessionID}`);

    if (!session) {
      return res.status(401).json({
        message: "Session expired or invalid",
      });
    }

    // 3. Attach session data to request
    req.user = JSON.parse(session);

    return next();
  } catch (error) {
    console.error("Authentication failed:", error);

    return res.status(500).json({
      message: "Authentication service unavailable",
    });
  }
};

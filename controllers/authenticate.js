import jwt from "jsonwebtoken";
import RefreshToken from "../models/refreshToken.js"; // Import the RefreshToken model

const authenticate = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          const refreshToken = socket.handshake.auth.refreshToken;
          if (!refreshToken) {
            return next(
              new Error("Authentication error: No refresh token provided")
            );
          }
          const storedToken = await RefreshToken.findOne({
            token: refreshToken,
          });
          if (!storedToken) {
            return next(
              new Error("Authentication error: Invalid refresh token")
            );
          }
          jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
              if (err) {
                return next(
                  new Error("Authentication error: Invalid refresh token")
                );
              }
              // Generate new access token
              const newAccessToken = jwt.sign(
                { userId: decoded.userId },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "15m" }
              );
              socket.emit("newAccessToken", { accessToken: newAccessToken });
              socket.userId = decoded.userId;
              next();
            }
          );
        } else {
          return next(new Error("Authentication error: Invalid token"));
        }
      } else {
        socket.userId = decoded.userId;
        next();
      }
    });
  } catch (error) {
    console.log(`Error in socket authentication: ${error}`);
    next(new Error("Internal server error"));
  }
};

export default authenticate;

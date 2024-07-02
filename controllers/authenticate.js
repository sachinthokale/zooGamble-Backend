import jwt from "jsonwebtoken";

const authenticate = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("socket 1 authentication error"));
    }
    jwt.verify(token, "lundfakir", (err, decoded) => {
      if (err) {
        return next(new Error("socket lund authentication error"));
      }
      socket.userId = decoded.userId;
      next();
    });
  } catch (error) {
    console.log(`error in socket authentication:${error}`);
  }
};
export default authenticate;

import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { genrateAccessRefreshTokens } from "../utils/genrateAccessRefreshTokens.js";
import RefreshToken from "../models/refreshToken.js";

export const setUser = async (req, res) => {
  //   try {
  //     const userObj = {
  //       userId: Math.floor(100000 * Math.random() * 900000),
  //       password: "tassm3fs",
  //       conins: 500,
  //     };
  //     const user = await User.create(userObj);
  //     if (user) {
  //       console.log(user);
  //     } else {
  //       console.log("fail to create user");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
};

export const login = async (req, res) => {
  try {
    const { userId, password } = req.body;
    console.log(userId, password);

    if (!userId || !password) {
      return res.status(400).json({
        error: "Please provide UserId and Password",
      });
    }
    if (isNaN(userId)) {
      return res.status(400).json({
        error: "User Id should be only Number",
      });
    }
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(400).json({
        error: "Incorrect userId",
      });
    }
    if (user.password != password) {
      return res.status(400).json({
        error: "Incorrect Password",
      });
    }
    // const token = jwt.sign({ userId: user.userId }, "lundfakir");
    const { accessToken, refreshToken } = genrateAccessRefreshTokens(
      user.userId
    );
    await RefreshToken.create({ userId: user.userId, token: refreshToken });

    res.status(200).json({
      message: "Logged in Successfully",
      userId: user.userId,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({
      error: `Internal server error : ${error}`,
    });
  }
};

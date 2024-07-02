import express from "express";
import { login, setUser } from "../controllers/user.js";

const userRoute = express.Router();

userRoute.route("/setuser").post(setUser);
userRoute.route("/login").post(login);

export default userRoute;

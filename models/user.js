import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  coins: {
    type: Number,
    default: 0,
  },
});

const User = mongoose.model("user", userSchema);
export default User;

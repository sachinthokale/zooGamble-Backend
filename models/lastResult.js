import mongoose from "mongoose";

const lastBetSchema = new mongoose.Schema(
  {
    result: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const BetResult = mongoose.model("betResult", lastBetSchema);
export default BetResult;

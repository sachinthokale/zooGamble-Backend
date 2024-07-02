import mongoose from "mongoose";

const betSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
  },
  bets: {
    Cat: { type: Number, default: 0 },
    Crow: { type: Number, default: 0 },
    Dog: { type: Number, default: 0 },
    Fish: { type: Number, default: 0 },
    Frog: { type: Number, default: 0 },
    Hippo: { type: Number, default: 0 },
    Horse: { type: Number, default: 0 },
    Spider: { type: Number, default: 0 },
    Snake: { type: Number, default: 0 },
    Cow: { type: Number, default: 0 },
  },
});

const Bet = mongoose.model("bet", betSchema);
export default Bet;

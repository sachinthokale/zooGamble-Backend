import Bet from "./models/bet.js";
import BetResult from "./models/lastResult.js";

import User from "./models/user.js";

export const whenSocketJoin = async (userId) => {
  const user = await User.findOne({ userId: userId }, { password: 0 });
  const last10BetResults = await getLast10BetResults();

  return { user, last10BetResults };
};

export const onBetPlace = async (userBetObject, userId) => {
  try {
    console.log("userObject", userBetObject);
    const placedBet = await Bet.create({
      userId: userId,
      bets: userBetObject,
    });
    console.log(placedBet);
    const totalBet = Object.values(placedBet.bets).reduce((sum, bet) => {
      return sum + bet;
    }, 0);
    const player = await User.findOneAndUpdate(
      { userId: userId },
      { $inc: { coins: -totalBet } },
      { password: 0 },
      {
        new: true,
      }
    );
    return { player, placedBet };
  } catch (error) {
    console.log("Error in onBetPlace", error);
  }
};

export const getLast10BetResults = async () => {
  const betResult = await BetResult.find({}, { result: 1, _id: 0 })
    .sort({ createdAt: -1 })
    .limit(10);
  const last10BetResults = betResult.map((bet) => bet.result);
  return last10BetResults;
};

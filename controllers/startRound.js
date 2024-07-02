import Bet from "../models/bet.js";
import BetResult from "../models/lastResult.js";
import User from "../models/user.js";
import { getLast10BetResults } from "../socketHandler.js";

const calculateRoundResult = (totalBet) => {
  let summedBets = {
    Cat: 0,
    Crow: 0,
    Dog: 0,
    Fish: 0,
    Frog: 0,
    Hippo: 0,
    Horse: 0,
    Spider: 0,
    Snake: 0,
    Cow: 0,
  };
  let minAnimal = null;
  let minValue = Infinity;
  if (totalBet.length < 2) {
    const randomIndex = Math.floor(Math.random() * 10);
    const keys = Object.keys(summedBets);
    minAnimal = keys[randomIndex];
  } else {
    totalBet.forEach((bet) => {
      Object.keys(bet.bets).forEach((key) => {
        summedBets[key] += bet.bets[key];
      });
    });

    for (let animal in summedBets) {
      if (summedBets[animal] < minValue) {
        minValue = summedBets[animal];
        minAnimal = animal;
      }
    }
  }

  console.log(minAnimal);

  return minAnimal;
};

const startRound = async (io, timer = 60) => {
  io.emit("newRound");
  try {
    const betClered = await Bet.deleteMany({});
    if (betClered.acknowledged == true) {
      console.log("All previous bet are cleared");
    }
    const countdown = setInterval(async () => {
      timer--;
      console.log(timer);
      io.emit("timer", timer);
      if (timer == 10) {
        io.emit("betclosed");
      }
      if (timer == 0) {
        clearInterval(countdown);

        const totalBets = await Bet.find({}, { _id: 0 });

        const resultAnimal = calculateRoundResult(totalBets);

        io.emit("result", resultAnimal);
        console.log(resultAnimal);

        const winners = await Bet.find(
          { [`bets.${resultAnimal}`]: { $exists: true, $ne: 0 } },
          { _id: 0 }
        );
        winners.forEach(async (winner) => {
          const betPlacedOnResult = winner.bets[resultAnimal];
          console.log("betPlacedOnResult", betPlacedOnResult);
          const winningAmmount = betPlacedOnResult * 9;
          console.log("winningAmmount", winningAmmount);
          const user = await User.findOneAndUpdate(
            { userId: winner.userId },
            {
              $inc: { coins: winningAmmount },
            },
            {
              new: true,
            }
          );
          console.log(user);
        });
        await BetResult.create({ result: resultAnimal });
        const last10Bets = await getLast10BetResults();
        io.emit("last10Bets", last10Bets);
        setTimeout(() => {
          io.emit("refresh");
        }, 2000);
        setTimeout(() => {
          startRound(io);
        }, 3000);
      }
    }, 1000);
  } catch (error) {}
};
export default startRound;

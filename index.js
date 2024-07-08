import dotenv from "dotenv";
import express from "express";
import connectDb from "./middleware/connectDB.js";
import userRoute from "./routes/userRoute.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import authenticate from "./controllers/authenticate.js";
import User from "./models/user.js";
import startRound from "./controllers/startRound.js";
import { onBetPlace, whenSocketJoin } from "./socketHandler.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000, // 1 minute
  pingInterval: 25000, // 25 seconds
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
dotenv.config();
connectDb();
app.use("/user", userRoute);
let playerCoins = {};

io.use(authenticate).on("connection", (socket) => {
  console.log(`Socket ${socket.userId} connected`);

  socket.on("join", async () => {
    const { user, last10BetResults } = await whenSocketJoin(socket.userId);
    playerCoins[user.userId] = user.coins;
    socket.emit("init", { coins: user.coins, last10BetResults });
  });

  socket.on("total-bet", (betAmount) => {
    if (betAmount > playerCoins[socket.userId]) {
      return socket.emit("total-bet-response", {
        success: false,
        message: "Insufficient coins",
      });
    } else {
      playerCoins[socket.userId] -= betAmount;
      socket.emit("total-bet-response", {
        success: true,
        message: "Sufficient coins",
        coins: playerCoins[socket.userId],
      });
    }
  });
  socket.on("cancleParticularBet", (amount) => {
    playerCoins[socket.userId] += amount;
    socket.emit("particularBetCancled", playerCoins[socket.userId]);
  });

  socket.on("bet", async (userBetObject) => {
    socket.emit("betclosed");

    const { placedBet } = await onBetPlace(userBetObject, socket.userId);

    socket.emit("bet-data", placedBet.bets);
  });

  socket.on("refresh-coins", async () => {
    const user = await User.findOne({ userId: socket.userId }, { password: 0 });
    playerCoins[socket.userId] = user.coins;
    socket.emit("init", { coins: user.coins });
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`zoo game app backend port : ${process.env.PORT}`);
  startRound(io);
});

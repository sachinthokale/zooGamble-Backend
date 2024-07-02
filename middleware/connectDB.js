import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI);
    if (!connection) {
      console.log("connection error");
    }
    console.log(`DB connected to : ${connection.host}`);
  } catch (error) {
    console.log(`DB error : ${error.message}`);
    process.exit(1);
  }
};

export default connectDb;

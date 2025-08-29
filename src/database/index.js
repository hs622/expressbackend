import mongoose from "mongoose";
import { DatabaseName } from "../constants.js";

const connectDatabase = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DatabaseName}`
    );
    console.log(
      `\n MongoDB connected!! DB HOST ${connectionInstance.connection.host}`
    );
  } catch (err) {
    console.log("MongoDB connection FAILED: ", err);
    process.exit(1);
  }
};

export default connectDatabase;

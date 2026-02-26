import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI.replace(
  "<db_password>",
  process.env.DB_PASSWORD,
);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`database connected successfully 💗💗💗`);
  } catch (error) {
    console.error(`database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

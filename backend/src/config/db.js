import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import mongoose from "mongoose";


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`database connected successfully 💗💗💗`);
  } catch (error) {
    console.error(`database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

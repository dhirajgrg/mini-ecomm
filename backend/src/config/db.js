import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";

const mongo_url = process.env.MONGO_URI.replace(
  "<db_password>",
  process.env.DB_PASSWORD,
);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongo_url);
    console.log(`database connected successfully 😍😍😍`);
  } catch (error) {
    console.error(`fail to connect database 💣💥: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

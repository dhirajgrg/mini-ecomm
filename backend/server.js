import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = 3000 || process.env.PORT;

const startServer = () => {
  try {
    connectDB();
    app.listen(PORT, () => {
      console.log(`server is listening on port : ${PORT}`);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

startServer();

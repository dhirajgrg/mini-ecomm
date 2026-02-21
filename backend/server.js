//TOP-LEVEL DOTENV
import "dotenv/config";

//CUSTOM MODULES
import app from "./src/app.js";
import connectDB from "./src/config/db.js";


//PORT
const PORT = 3000 || process.env.PORT;


//INITIATE SERVER
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


//START SERVER
startServer();

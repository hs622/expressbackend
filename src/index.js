import dotenv from "dotenv";
import connectDatabase from "./database/index.js";
import { app } from "./app.js";

// new way to implement
dotenv.config({
  debug: true,
});

connectDatabase()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is listining on port: ${process.env.PORT}`);
    });

    app.on("error", (err) => {
      console.log("failed to start server: ", err);
      throw err;
    });
  })
  .catch((err) => {
    console.log("Mongo Database connection failed.");
  });

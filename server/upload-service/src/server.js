require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 5002; 

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connect to Mongodb"))
  .catch((err) => console.log("MongoDb Error", err));

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function startServer() {
  try {
    app.listen(PORT, () =>
      console.log(`Upload Service running on port ${PORT}`),
    );
  } catch (error) {
    console.log("Failed to connect to server", error);
    process.exit(1);
  }
}

startServer();
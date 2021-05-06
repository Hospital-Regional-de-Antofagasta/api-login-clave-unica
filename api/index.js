const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const auth = require("./routes/auth");
const claveUnica = require("./routes/claveUnica");
const { loadConfig } = require("./config");

const app = express();
app.use(express.json());
app.use(cors());

console.log("express");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log("conectado a bd");

loadConfig();

app.use("/hra/auth", auth);

app.use("/toapp", claveUnica);

module.exports = app;

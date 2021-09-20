require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const auth = require("./routes/auth");
const claveUnica = require("./routes/claveUnica");

const app = express();
app.use(express.json());
app.use(cors());

const connection = process.env.MONGO_URI;
const port = process.env.PORT;
const localhost = process.env.HOSTNAME;

mongoose.connect(connection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use("/v1/auth", auth);

app.use("/toapp", claveUnica);

app.get("/health", (req, res) => {
  res.status(200).send("ready");
});

if (require.main === module) {
  // true if file is executed
  process.on("SIGINT", function () {
    process.exit();
  });
  app.listen(port, () => {
    console.log(`App listening at http://${localhost}:${port}`);
  });
}

module.exports = app;

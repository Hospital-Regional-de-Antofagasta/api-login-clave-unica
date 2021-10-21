const app = require("./api/app.js");

const port = process.env.PORT;
const localhost = process.env.HOSTNAME;

app.listen(port, () => {
  console.log(`App listening at http://${localhost}:${port}`);
});

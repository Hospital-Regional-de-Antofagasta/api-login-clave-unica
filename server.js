const app = require("./api/app.js");
const fs = require('fs')
const https = require('https')

const port = process.env.PORT;
const localhost = process.env.HOSTNAME;

// app.listen(port, () => {
//   console.log(`App listening at http://${localhost}:${port}`);
// });

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app).listen(port, () => {
  console.log(`App listening at https://${localhost}:${port}`);
})

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createServer } = require("http");
const routes = require("./routes");

const app = express();
const PORT = 5000;
const server = createServer(app);

app.use(cors());
app.use(bodyParser.json());
app.use(routes);

server.listen(PORT, () => {
  console.log(`Server Up and Running at http://localhost:${PORT}`);
});

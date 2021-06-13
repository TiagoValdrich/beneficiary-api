require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const authMiddleware = require("./middlewares/authentication");
const app = express();

app.use(cors());
app.use(express.json());
app.use(authMiddleware.checkBearerToken);

const routesPath = path.join(__dirname, "routes");
const filenames = fs.readdirSync(routesPath);

for (const filename of filenames) {
  app.use(require(path.join(routesPath, filename)));
}

app.get("/", (req, res) => {
  return res.sendStatus(200);
});

module.exports = app;

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const database = require("./database");
const app = express();

app.use(cors());
app.use(express.json());

(async () => {
  try {
    await database.createInstance();

    const routesPath = path.join(__dirname, "routes");
    const filenames = fs.readdirSync(routesPath);

    for (const filename of filenames) {
      app.use(require(path.join(routesPath, filename)));
    }

    app.listen("3000", () => {
      console.info("Server is running");
    });
  } catch (e) {
    console.error("Failed to bootstrap application", e);
  }
})();

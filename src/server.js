const database = require("./database");
const app = require("./app");

(async () => {
  try {
    await database.createInstance();

    app.listen("3000", () => {
      console.info("Server is running");
    });
  } catch (e) {
    console.error("Failed to bootstrap application", e);
  }
})();

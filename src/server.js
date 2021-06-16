const database = require("./database");
const app = require("./app");

const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

(async () => {
  try {
    // This is for docker-compose don't break
    if (process.env.DATABASE_DELAY) {
      await sleep(process.env.DATABASE_DELAY);
    }

    await database.createInstance();

    app.listen("3000", () => {
      console.info("Server is running");
    });
  } catch (e) {
    console.error("Failed to bootstrap application", e);
  }
})();

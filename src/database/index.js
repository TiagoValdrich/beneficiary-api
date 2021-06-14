const { Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");

class Database {
  constructor() {
    this.instance = null;
  }

  async createInstance(dropBeforeSync = false) {
    this.instance = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "mysql",
        logging: false,
      }
    );

    await this._loadModels();
    await this._makeAssociations();

    if (dropBeforeSync) {
      await this.instance.dropAllSchemas();
    }

    await this.instance.sync();

    return this.instance;
  }

  _getModels() {
    return fs.readdirSync(path.join(".", "src", "models"));
  }

  _loadModels() {
    return new Promise((resolve, reject) => {
      try {
        // Read the filenames on models' folder
        const filenames = this._getModels();

        filenames.forEach((model, index) => {
          const _model = require(path.join("..", "models", model));
          _model.define(this.instance);

          if (index == filenames.length - 1) {
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  _makeAssociations() {
    return new Promise((resolve, reject) => {
      try {
        // Read the filenames on models' folder
        const filenames = this._getModels();

        filenames.forEach((model, index) => {
          const _model = require(path.join("..", "models", model));
          _model.associate(this.instance.models);

          if (index == filenames.length - 1) {
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async close() {
    await this.instance.close();
  }
}

const database = new Database();

module.exports = database;

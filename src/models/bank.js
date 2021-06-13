const { DataTypes, Model } = require("sequelize");

class Bank extends Model {
  static define(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "bank",
        timestamps: true,
        indexes: [
          {
            fields: ["name"],
          },
        ],
      }
    );
  }

  static associate(models) {
    this.hasMany(models.BankAccountType, {
      foreignKey: { name: "bank_id", allowNull: false },
    });
    this.belongsTo(models.Beneficiary, {
      foreignKey: { name: "bank_id", allowNull: false },
    });
  }
}

module.exports = Bank;

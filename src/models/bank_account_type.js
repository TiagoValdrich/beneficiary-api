const { DataTypes, Model } = require("sequelize");

class BankAccountType extends Model {
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
        tableName: "bank_account_type",
        timestamps: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Bank, {
      foreignKey: { name: "bank_id", allowNull: false },
    });
    this.belongsTo(models.Beneficiary, {
      foreignKey: { name: "bank_account_type_id", allowNull: false },
    });
  }
}

module.exports = BankAccountType;

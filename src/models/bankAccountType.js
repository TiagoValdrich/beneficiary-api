const { DataTypes, Model } = require("sequelize");

class BankAccountType extends Model {
  static define(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false,
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
      foreignKey: { name: "bankId", allowNull: false },
    });
    this.hasMany(models.Beneficiary, {
      foreignKey: { name: "bankAccountTypeId", allowNull: false },
    });
  }
}

module.exports = BankAccountType;

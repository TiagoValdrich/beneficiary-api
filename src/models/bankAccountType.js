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
          unique: true,
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
    this.hasMany(models.Beneficiary, {
      foreignKey: { name: "bank_account_type_id", allowNull: false },
    });
  }
}

module.exports = BankAccountType;

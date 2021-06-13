const uuid = require("uuid");
const { DataTypes, Model } = require("sequelize");

const BENEFICIARY_TYPES = require("../enums/beneficiaryTypes");
const BENEFICIARY_STATUS = require("../enums/beneficiaryStatus");

class Beneficiary extends Model {
  static define(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        identifier: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: "Beneficiary CNPJ or CPF number",
          unique: true,
        },
        type: {
          type: DataTypes.ENUM,
          values: Object.values(BENEFICIARY_TYPES),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM,
          values: Object.values(BENEFICIARY_STATUS),
          allowNull: false,
          defaultValue: BENEFICIARY_STATUS.DRAFT,
        },
        agency: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        agency_digit: {
          type: DataTypes.SMALLINT,
          allowNull: true,
        },
        account_number: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        account_digit: {
          type: DataTypes.SMALLINT,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "beneficiaries",
        timestamps: true,
        indexes: [
          {
            fields: ["name", "agency"],
          },
        ],
      }
    );

    this.beforeCreate((beneficiary, _) => {
      return (beneficiary.id = uuid.v4());
    });
  }

  static associate(models) {
    this.hasOne(models.Bank, {
      foreignKey: { name: "bank_id", allowNull: false },
    });
    this.hasOne(models.BankAccountType, {
      foreignKey: { name: "bank_account_type_id", allowNull: false },
    });
  }
}

module.exports = Beneficiary;

const uuid = require("uuid");
const { DataTypes, Model } = require("sequelize");

const BENEFICIARY_DOCUMENT_TYPES = require("../enums/beneficiaryDocumentTypes");
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
        document: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: "Beneficiary CNPJ or CPF number",
          unique: true,
        },
        documentType: {
          type: DataTypes.ENUM,
          values: Object.values(BENEFICIARY_DOCUMENT_TYPES),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM,
          values: Object.values(BENEFICIARY_STATUS),
          allowNull: false,
          defaultValue: BENEFICIARY_STATUS.DRAFT,
        },
        agencyNumber: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        agencyDigit: {
          type: DataTypes.STRING(1),
          allowNull: true,
        },
        accountNumber: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        accountDigit: {
          type: DataTypes.STRING(1),
          length: 1,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "beneficiaries",
        timestamps: true,
        indexes: [
          {
            fields: ["name", "document", "agencyNumber"],
          },
        ],
      }
    );

    this.beforeValidate("id", async (beneficiary, _) => {
      if (!beneficiary.id) {
        beneficiary.id = uuid.v4();
      }

      return beneficiary;
    });
  }

  static associate(models) {
    this.belongsTo(models.Bank, {
      foreignKey: { name: "bankId", allowNull: false },
    });
    this.belongsTo(models.BankAccountType, {
      foreignKey: { name: "bankAccounTypeId", allowNull: false },
    });
  }
}

module.exports = Beneficiary;

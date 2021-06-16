const { cpf, cnpj } = require("cpf-cnpj-validator");

const getValidationSchema = (bankId) => {
  switch (bankId) {
    case "BANCO_DO_BRASIL":
      return {
        agency: {
          maxLength: 4,
          required: true,
          pattern: /^(?:^0*)[1-9][0-9]{0,3}$/,
          digit: {
            required: false,
            pattern: /^[xX0-9]{0,1}$/,
          },
        },
        account: {
          maxLength: 8,
          required: true,
          pattern: /^(?:^0*)[1-9][0-9]{0,7}$/,
          digit: {
            required: true,
            pattern: /^[xX0-9]{0,1}$/,
          },
        },
        accountType: {
          required: true,
          allowedTypes: ["CONTA_CORRENTE", "CONTA_POUPANCA", "CONTA_FACIL"],
        },
      };
    default:
      return {
        agency: {
          maxLength: 4,
          required: true,
          pattern: /^(?:^0*)[1-9][0-9]{0,3}$/,
          digit: {
            required: false,
            pattern: /^[xX0-9]{0,1}$/,
          },
        },
        account: {
          maxLength: 11,
          required: true,
          pattern: /^(?:^0*)[1-9][0-9]{0,10}$/,
          digit: {
            required: true,
            pattern: /^[0-9]{0,1}$/,
          },
        },
        accountType: {
          required: true,
          allowedTypes: ["CONTA_CORRENTE", "CONTA_POUPANCA"],
        },
      };
  }
};

const validateBankData = ({
  bankId,
  agencyNumber,
  agencyDigit,
  accountNumber,
  accountDigit,
  accountType,
}) => {
  const schema = getValidationSchema(bankId);

  if (schema.agency.required) {
    if (agencyNumber.length > schema.agency.maxLength) {
      return {
        valid: false,
        reason: "Agency number has invalid length",
      };
    }

    if (!schema.agency.pattern.test(agencyNumber)) {
      return {
        valid: false,
        reason: "Agency number is invalid",
      };
    }

    if (
      schema.agency.digit.required &&
      !schema.agency.digit.pattern.test(agencyDigit)
    ) {
      return {
        valid: false,
        reason: "Agency digit is invalid",
      };
    }
  }

  if (schema.account.required) {
    if (accountNumber.length > schema.account.maxLength) {
      return {
        valid: false,
        reason: "Account number has invalid length",
      };
    }

    if (!schema.account.pattern.test(accountNumber)) {
      return {
        valid: false,
        reason: "Account number is invalid",
      };
    }

    if (
      schema.account.digit.required &&
      !schema.account.digit.pattern.test(accountDigit)
    ) {
      return {
        valid: false,
        reason: "Account digit is invalid",
      };
    }
  }

  if (
    schema.accountType.required &&
    !schema.accountType.allowedTypes.includes(accountType)
  ) {
    return {
      valid: false,
      reason: "Account type is invalid",
    };
  }

  return {
    valid: true,
    reason: null,
  };
};

const validateDocument = (type, document) => {
  if (!["CPF", "CNPJ"].includes(type)) {
    return { valid: false, reason: "Invalid document type" };
  }

  if (type === "CPF" && !cpf.isValid(document)) {
    return { valid: false, reason: "Invalid CPF" };
  }

  if (type === "CNPJ" && !cnpj.isValid(document)) {
    return { valid: false, reason: "Invalid CNPJ" };
  }

  return { valid: true, reason: null };
};

module.exports = {
  getValidationSchema,
  validateBankData,
  validateDocument,
};

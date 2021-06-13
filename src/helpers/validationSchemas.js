module.exports.getValidationSchema = (id) => {
  switch (id) {
    case "BANCO_DO_BRASIL":
      return {
        agency: {
          maxLength: 4,
          required: "true",
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

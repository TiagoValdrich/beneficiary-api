const config = {
  verbose: false,
  collectCoverage: true,
  collectCoverageFrom: ["**/src/**", "!**/tests/*"],
  coverageDirectory: "<rootDir>/coverage/",
};

module.exports = config;

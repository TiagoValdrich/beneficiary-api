const _authToken = process.env.AUTH_TOKEN;

module.exports = {
  checkBearerToken: (req, res, next) => {
    const auth = req?.headers?.authorization;

    if (auth && auth == `Bearer ${_authToken}`) {
      next();
    } else {
      res.sendStatus(401);
    }
  },
};

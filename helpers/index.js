const { createJWTToken, checkToken } = require("./jwt");
const {
  checkRegister,
  checkLogin,
  checkBodyToken,
  checkAdmin,
} = require("./middleware");

module.exports = {
  createJWTToken,
  checkToken,
  checkRegister,
  checkLogin,
  checkBodyToken,
  checkAdmin,
};

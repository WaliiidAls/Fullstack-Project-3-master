const crypto = require("crypto");

const HashPassword = (password, salt) => {
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
};

module.exports = HashPassword;

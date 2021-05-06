const jwt = require("jsonwebtoken");

exports.signToken = (content, expiresIn, secret) => {
  return jwt.sign(content, secret, { expiresIn: expiresIn });
};

exports.decodeToken = async (token, secret) => {
  const result = await new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return resolve(false);
      return resolve(decoded);
    });
  });
  return result;
};

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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

exports.randomBytes = async (size) => {
  const result = await new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, salt) => {
      if (err) return resolve(false);
      return resolve(salt);
    });
  });
  return result;
};

exports.pbkdf2 = async (password, salt, iterations, keylen, digest) => {
  const result = await new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, key) => {
      if (err) return resolve(false);
      return resolve(key);
    });
  });
  return result;
};
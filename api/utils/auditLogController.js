const AuditLogging = require("../models/AuditLogging.js");

exports.registerAuditLog = async (userName, userId, action, affectedData) => {
  const a = await AuditLogging.create({
    userName,
    userId,
    action,
    affectedData,
  });
};

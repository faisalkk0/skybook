const crypto = require('crypto');

function generateBookingReference() {
  const token = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `SKY-${token}`;
}

module.exports = { generateBookingReference };

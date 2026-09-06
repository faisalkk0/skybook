const bookingService = require('../services/bookingService');

function startJobs() {
  const tick = async () => {
    try {
      await bookingService.expireStaleBookings();
    } catch (error) {
      console.warn(`Booking expiry job failed: ${error.message}`);
    }
  };

  tick();
  return setInterval(tick, 60 * 1000);
}

module.exports = { startJobs };

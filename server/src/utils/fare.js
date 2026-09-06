const CABIN_PRICE_FIELD = {
  economy: 'economyPrice',
  premiumEconomy: 'economyPrice',
  business: 'businessPrice',
  first: 'firstClassPrice',
};

const CABIN_MULTIPLIER = {
  economy: 1,
  premiumEconomy: 1.25,
  business: 1,
  first: 1,
};

function getBaseFare(flight, cabinClass = 'economy') {
  const field = CABIN_PRICE_FIELD[cabinClass] || 'economyPrice';
  const price = Number(flight[field] || flight.economyPrice || 0);
  const extra = CABIN_MULTIPLIER[cabinClass] || 1;
  return Math.round(price * extra);
}

function calculateFare({ flight, passengers = [], selectedSeats = [], cabinClass = 'economy' }) {
  const adults = passengers.filter((p) => p.passengerType !== 'infant').length || passengers.length || 1;
  const infants = passengers.filter((p) => p.passengerType === 'infant').length;
  const baseEach = getBaseFare(flight, cabinClass);
  const baseFare = baseEach * adults + Math.round(baseEach * 0.1) * infants;
  const taxes = Math.round(baseFare * 0.12);
  const airportCharges = 35 * Math.max(adults, 1);
  const baggage = 25 * Math.max(adults, 1);
  const serviceFee = 15;
  const seatPremium = selectedSeats.reduce((sum, seat) => sum + Number(seat.extraPrice || 0), 0);
  const discount = baseFare > 800 ? Math.round(baseFare * 0.04) : 0;
  const totalAmount = Math.max(0, baseFare + taxes + airportCharges + baggage + serviceFee + seatPremium - discount);

  return {
    baseFare,
    taxes,
    airportCharges,
    baggage,
    serviceFee,
    seatPremium,
    discount,
    totalAmount,
    currency: 'USD',
    cabinClass,
    passengerCount: passengers.length || adults,
  };
}

module.exports = { getBaseFare, calculateFare, CABIN_PRICE_FIELD };

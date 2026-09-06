const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

async function generateTicketPdf(booking) {
  const flight = booking.flight;
  const airline = flight.airline || {};
  const from = flight.departureAirport || {};
  const to = flight.arrivalAirport || {};
  const qr = await QRCode.toDataURL(booking.bookingReference, { margin: 1, width: 180 });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(0, 0, doc.page.width, 92).fill('#0B1F3A');
    doc.fillColor('#FFFFFF').fontSize(26).text('SKYBOOK', 40, 28);
    doc.fontSize(11).fillColor('#7DD3FC').text('E-TICKET / BOARDING PASS', 40, 60);
    doc.fontSize(12).fillColor('#FFFFFF').text(booking.bookingReference, 400, 36, { width: 160, align: 'right' });
    doc.fontSize(9).fillColor('#7DD3FC').text(booking.paymentStatus.toUpperCase(), 400, 56, {
      width: 160,
      align: 'right',
    });

    doc.fillColor('#0B1F3A').fontSize(16).text(airline.name || 'Airline', 40, 120);
    doc.fontSize(11).fillColor('#334155').text(`Flight ${flight.flightNumber}  ·  ${flight.aircraft?.model || 'Aircraft'}`, 40, 142);

    doc.roundedRect(40, 170, 515, 110, 10).stroke('#0EA5E9');
    doc.fillColor('#0B1F3A').fontSize(28).text(from.code || '---', 60, 188);
    doc.fontSize(10).fillColor('#64748B').text(from.city || from.name || '', 60, 222);
    doc.fontSize(10).text(`${formatDate(flight.departureDate)}  ${flight.departureTime}`, 60, 238);

    doc.fillColor('#0EA5E9').fontSize(14).text('✈', 270, 208);
    doc.fillColor('#0B1F3A').fontSize(28).text(to.code || '---', 360, 188);
    doc.fontSize(10).fillColor('#64748B').text(to.city || to.name || '', 360, 222);
    doc.fontSize(10).text(`${formatDate(flight.arrivalDate)}  ${flight.arrivalTime}`, 360, 238);

    doc.fillColor('#0B1F3A').fontSize(13).text('Passengers', 40, 304);
    let y = 326;
    booking.passengers.forEach((passenger, index) => {
      doc.fontSize(10).fillColor('#0F172A').text(
        `${index + 1}. ${passenger.firstName} ${passenger.lastName}  ·  ${passenger.passengerType}  ·  Seat ${passenger.seatNumber}  ·  ${passenger.passportNumber}`,
        40,
        y,
        { width: 520 }
      );
      y += 18;
    });

    y += 10;
    doc.fontSize(13).fillColor('#0B1F3A').text('Flight details', 40, y);
    y += 22;
    const details = [
      ['Cabin', booking.fareBreakdown?.cabinClass || 'economy'],
      ['Duration', `${flight.duration} min`],
      ['Baggage', flight.baggageAllowance || '23kg'],
      ['Terminal / Gate', `${flight.terminal || '—'} / ${flight.gate || 'TBA'}`],
      ['Amount paid', `${booking.totalAmount} ${booking.currency}`],
      ['Payment', booking.paymentStatus],
    ];
    details.forEach(([label, value], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      doc.fontSize(9).fillColor('#64748B').text(label, 40 + col * 250, y + row * 32);
      doc.fontSize(11).fillColor('#0B1F3A').text(String(value), 40 + col * 250, y + row * 32 + 12);
    });

    const qrBuffer = Buffer.from(qr.split(',')[1], 'base64');
    doc.image(qrBuffer, 430, 620, { width: 110 });
    doc.fontSize(8).fillColor('#64748B').text('Scan booking reference', 430, 736, { width: 110, align: 'center' });

    doc.fontSize(8).fillColor('#94A3B8').text(
      'This is an electronic ticket issued by SkyBook. Present a valid passport at check-in. Times are local to each airport.',
      40,
      760,
      { width: 370 }
    );

    doc.end();
  });
}

module.exports = { generateTicketPdf };

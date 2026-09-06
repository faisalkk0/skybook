const nodemailer = require('nodemailer');
const env = require('../config/env');

function createTransport() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPassword) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPassword,
    },
  });
}

const transporter = createTransport();

function wrapTemplate(title, body) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:24px;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d4e0ed;">
        <div style="background:#0b1f3a;color:#ffffff;padding:20px 28px;">
          <h1 style="margin:0;font-size:22px;">SkyBook</h1>
          <p style="margin:6px 0 0;color:#7dd3fc;">${title}</p>
        </div>
        <div style="padding:28px;color:#0f2d4e;line-height:1.6;">
          ${body}
        </div>
      </div>
    </div>
  `;
}

async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    console.log(`[email:dev] ${subject} -> ${to}`);
    return { delivered: false, reason: 'smtp_not_configured' };
  }

  try {
    await transporter.sendMail({
      from: env.smtpFrom,
      to,
      subject,
      html,
      text,
    });
    return { delivered: true };
  } catch (error) {
    console.warn(`Email failed (${subject}): ${error.message}`);
    return { delivered: false, reason: error.message };
  }
}

async function sendRegistrationEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to SkyBook',
    html: wrapTemplate(
      'Welcome aboard',
      `<p>Hi ${user.firstName},</p><p>Your SkyBook account is ready. Search flights, pick your seat, and travel with confidence.</p>`
    ),
  });
}

async function sendBookingConfirmationEmail(user, booking, flight) {
  return sendEmail({
    to: user.email,
    subject: `Booking confirmed ${booking.bookingReference}`,
    html: wrapTemplate(
      'Booking confirmed',
      `<p>Hi ${user.firstName},</p>
       <p>Your booking <strong>${booking.bookingReference}</strong> is confirmed.</p>
       <p>Flight ${flight.flightNumber} · ${booking.totalAmount} ${booking.currency}</p>`
    ),
  });
}

async function sendPaymentConfirmationEmail(user, booking, payment) {
  return sendEmail({
    to: user.email,
    subject: `Payment received ${booking.bookingReference}`,
    html: wrapTemplate(
      'Payment received',
      `<p>We received ${payment.amount} ${payment.currency} for booking ${booking.bookingReference}.</p>`
    ),
  });
}

async function sendCancellationEmail(user, booking) {
  return sendEmail({
    to: user.email,
    subject: `Booking cancelled ${booking.bookingReference}`,
    html: wrapTemplate(
      'Booking cancelled',
      `<p>Booking ${booking.bookingReference} has been cancelled.</p>
       <p>Reason: ${booking.cancellationReason || 'Not specified'}</p>`
    ),
  });
}

async function sendRefundEmail(user, booking, amount) {
  return sendEmail({
    to: user.email,
    subject: `Refund processed ${booking.bookingReference}`,
    html: wrapTemplate(
      'Refund processed',
      `<p>A refund of ${amount} ${booking.currency} has been processed for ${booking.bookingReference}.</p>`
    ),
  });
}

async function sendTicketEmail(user, booking, pdfBuffer) {
  if (!transporter) {
    console.log(`[email:dev] ticket ${booking.bookingReference} -> ${user.email}`);
    return { delivered: false, reason: 'smtp_not_configured' };
  }

  try {
    await transporter.sendMail({
      from: env.smtpFrom,
      to: user.email,
      subject: `Your SkyBook e-ticket ${booking.bookingReference}`,
      html: wrapTemplate(
        'Your e-ticket',
        `<p>Your e-ticket for ${booking.bookingReference} is attached.</p>`
      ),
      attachments: [
        {
          filename: `${booking.bookingReference}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
    return { delivered: true };
  } catch (error) {
    console.warn(`Ticket email failed: ${error.message}`);
    return { delivered: false, reason: error.message };
  }
}

module.exports = {
  sendEmail,
  sendRegistrationEmail,
  sendBookingConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendCancellationEmail,
  sendRefundEmail,
  sendTicketEmail,
};

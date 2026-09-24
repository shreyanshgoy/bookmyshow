const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate an automatic Ethereal test account if none configured
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[EmailService] Initialized Ethereal test mailer: ${testAccount.user}`);
    } catch (err) {
      console.warn(`[EmailService] Could not create Ethereal account, falling back to mock logger:`, err.message);
      transporter = {
        sendMail: async (opts) => {
          console.log(`[EmailService Mock] Sending email to ${opts.to}: Subject: ${opts.subject}`);
          return { messageId: 'mock-' + Date.now() };
        },
      };
    }
  }
  return transporter;
};

const sendBookingConfirmation = async (user, booking, show, movie, theater) => {
  try {
    const mailer = await getTransporter();

    const seatList = booking.seats.map((s) => `${s.seatNumber} (${s.tier})`).join(', ');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; border-bottom: 2px dashed #334155; padding-bottom: 16px;">
          <h1 style="color: #f43f5e; margin: 0; font-size: 28px; letter-spacing: 1px;">BOOKMYSHOW</h1>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">Booking Confirmation & E-Ticket</p>
        </div>

        <div style="padding: 20px 0;">
          <h2 style="color: #ffffff; font-size: 22px; margin-top: 0;">${movie.title}</h2>
          <p style="color: #cbd5e1; margin: 4px 0;"><strong>Theater:</strong> ${theater.name}, ${theater.city}</p>
          <p style="color: #cbd5e1; margin: 4px 0;"><strong>Date & Time:</strong> ${show.date} | ${show.startTime}</p>
          <p style="color: #cbd5e1; margin: 4px 0;"><strong>Screen:</strong> ${show.screenId?.screenNumber || 'Audi 1'} (${show.format || '2D'})</p>
          <p style="color: #cbd5e1; margin: 4px 0;"><strong>Seats:</strong> <span style="color: #f43f5e; font-weight: bold;">${seatList}</span></p>
          <p style="color: #cbd5e1; margin: 4px 0;"><strong>Booking ID:</strong> <span style="font-family: monospace; background: #1e293b; padding: 2px 6px; border-radius: 4px;">${booking.bookingId}</span></p>
        </div>

        <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <table style="width: 100%; border-collapse: collapse; color: #cbd5e1;">
            <tr>
              <td style="padding: 6px 0;">Tickets Subtotal (${booking.seats.length} seats):</td>
              <td style="text-align: right; padding: 6px 0;">₹${booking.subtotal}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">Convenience Fee & Taxes:</td>
              <td style="text-align: right; padding: 6px 0;">₹${booking.convenienceFee}</td>
            </tr>
            <tr style="border-top: 1px solid #334155; font-size: 18px; font-weight: bold; color: #f43f5e;">
              <td style="padding: 10px 0 4px 0;">Total Amount Paid:</td>
              <td style="text-align: right; padding: 10px 0 4px 0;">₹${booking.totalAmount}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <p style="color: #94a3b8; font-size: 13px;">Please arrive 15 minutes prior to the show time. Present this QR code or booking ID at the cinema entrance.</p>
          <p style="color: #64748b; font-size: 11px;">Thank you for booking with BookMyShow Clone.</p>
        </div>
      </div>
    `;

    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"BookMyShow" <tickets@bookmyshow-clone.com>',
      to: user.email,
      subject: `🍿 Booking Confirmed: ${movie.title} [${booking.bookingId}]`,
      html: htmlContent,
    });

    if (info.messageId && nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[EmailService] E-Ticket email preview: ${previewUrl}`);
      }
    }

    return info;
  } catch (error) {
    console.error('[EmailService] Error sending email:', error.message);
    return null;
  }
};

module.exports = { sendBookingConfirmation };

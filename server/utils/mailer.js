const nodemailer = require("nodemailer");

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const sendOTPEmail = async (email, name, otp) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "CampusRide — Verify your email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px;">
        <h2 style="color: #1a1a1a;">Hi ${name} 👋</h2>
        <p style="color: #555;">Welcome to <strong>CampusRide</strong>! Use the OTP below to verify your university email address.</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 13px;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
        <p style="color: #999; font-size: 13px;">If you didn't sign up for CampusRide, ignore this email.</p>
      </div>
    `,
  });
};

const sendBookingConfirmationEmail = async (email, name, ride, booking) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "CampusRide — Booking Confirmed!",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px;">
        <h2 style="color: #1a1a1a;">Booking confirmed, ${name}!</h2>
        <p style="color: #555;">Your seat has been reserved. Here are the details:</p>
        <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
          <tr><td style="padding:8px; color:#777;">From</td><td style="padding:8px; font-weight:500;">${ride.from}</td></tr>
          <tr><td style="padding:8px; color:#777;">To</td><td style="padding:8px; font-weight:500;">${ride.to}</td></tr>
          <tr><td style="padding:8px; color:#777;">Departure</td><td style="padding:8px; font-weight:500;">${new Date(ride.departureTime).toLocaleString("en-IN")}</td></tr>
          <tr><td style="padding:8px; color:#777;">Seats</td><td style="padding:8px; font-weight:500;">${booking.seatsBooked}</td></tr>
          <tr><td style="padding:8px; color:#777;">Total Fare</td><td style="padding:8px; font-weight:500;">₹${booking.totalFare}</td></tr>
          <tr><td style="padding:8px; color:#777;">Payment</td><td style="padding:8px; color:#e67e00; font-weight:500;">Pay cash to rider at pickup</td></tr>
        </table>
        <p style="color:#999; font-size:13px;">Use the CampusRide chat to coordinate with your rider.</p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail, sendBookingConfirmationEmail };
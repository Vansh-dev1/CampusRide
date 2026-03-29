const { Resend } = require("resend");
const dotenv = require("dotenv");
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, name, otp) => {
  console.log("Sending OTP email to:", email);

  const { data, error } = await resend.emails.send({
    from: "CampusRide <otp@van-sh.dev>",
    to: email,
    subject: "CampusRide — Verify your email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px;">
        <h2 style="color: #4f46e5;">Hi ${name} 👋</h2>
        <p style="color: #555;">Welcome to <strong>CampusRide</strong>! Use the OTP below to verify your email address.</p>
        <div style="background: #f0f0ff; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #4f46e5;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 13px;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
        <p style="color: #999; font-size: 13px;">If you didn't sign up for CampusRide, ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message);
  }

  console.log("✅ OTP email sent! ID:", data.id);
  return data;
};

const sendBookingConfirmationEmail = async (email, name, ride, booking) => {
  const { error } = await resend.emails.send({
    from: "CampusRide <onboarding@resend.dev>",
    to: email,
    subject: "CampusRide — Booking Confirmed!",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px;">
        <h2 style="color: #4f46e5;">Booking confirmed, ${name}!</h2>
        <p style="color: #555;">Your seat has been reserved. Here are the details:</p>
        <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
          <tr><td style="padding:8px; color:#777;">From</td><td style="padding:8px; font-weight:500;">${ride.from}</td></tr>
          <tr><td style="padding:8px; color:#777;">To</td><td style="padding:8px; font-weight:500;">${ride.to}</td></tr>
          <tr><td style="padding:8px; color:#777;">Departure</td><td style="padding:8px; font-weight:500;">${new Date(ride.departureTime).toLocaleString("en-IN")}</td></tr>
          <tr><td style="padding:8px; color:#777;">Seats</td><td style="padding:8px; font-weight:500;">${booking.seatsBooked}</td></tr>
          <tr><td style="padding:8px; color:#777;">Total Fare</td><td style="padding:8px; font-weight:500;">₹${booking.totalFare}</td></tr>
          <tr><td style="padding:8px; color:#777;">Payment</td><td style="padding:8px; color:#e67e00; font-weight:500;">Pay cash to rider at pickup</td></tr>
        </table>
      </div>
    `,
  });

  if (error) throw new Error(error.message);
};

module.exports = { sendOTPEmail, sendBookingConfirmationEmail };

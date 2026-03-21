const nodemailer = require("nodemailer");

const createTransporter = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
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
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
        <h2 style="color:#4f46e5;">Hi ${name} 👋</h2>
        <p>Use the OTP below to verify your CampusRide account.</p>
        <div style="background:#f5f5f5;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
          <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#4f46e5;">${otp}</span>
        </div>
        <p style="color:#999;font-size:13px;">Expires in 10 minutes. Do not share this OTP.</p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail };
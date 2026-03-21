const nodemailer = require("nodemailer");

const createTransporter = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,          // ← change from 587 to 465
    secure: true,       // ← change from false to true
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const sendOTPEmail = async (email, name, otp) => {
  const transporter = createTransporter();

  // Verify connection first
  await transporter.verify();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "CampusRide — Verify your email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px;">
        <h2 style="color: #4f46e5;">Hi ${name} 👋</h2>
        <p style="color: #555;">Welcome to <strong>CampusRide</strong>! Use the OTP below to verify your email address.</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 13px;">This OTP expires in 10 minutes.</p>
        <p style="color: #999; font-size: 13px;">If you didn't sign up for CampusRide, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail };
```

Then update Render env variable:
```
EMAIL_PORT = 465
```

---



---

## Step 5 — Update all 3 on Render env
```
EMAIL_HOST  =  smtp.gmail.com
EMAIL_PORT  =  465
EMAIL_PASS  =  yourapppasswordwithoutspaces
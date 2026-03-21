const signup = async (req, res) => {
  try {
    const { name, email, password, phone, college } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      phone,
      college,
      otp: { code: otp, expiresAt: otpExpiresAt },
    });

    // Try sending email — log error if it fails but still respond
    try {
      await sendOTPEmail(email, name, otp);
      console.log(`OTP email sent successfully to ${email}`);
    } catch (emailError) {
      console.error("EMAIL SEND FAILED:", emailError.message);
      // Still return success so user knows account was created
      // but log the error so we can debug on Render
    }

    res.status(201).json({
      success: true,
      message: "Account created. OTP sent to your email.",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
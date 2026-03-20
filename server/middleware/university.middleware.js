const validateUniversityEmail = (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const domain = process.env.UNIVERSITY_EMAIL_DOMAIN || "university.ac.in";
  if (!email.toLowerCase().endsWith(`@${domain}`)) {
    return res.status(400).json({
      success: false,
      message: `Only ${domain} email addresses are allowed`,
    });
  }

  next();
};

module.exports = { validateUniversityEmail };
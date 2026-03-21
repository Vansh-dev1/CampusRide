const validateUniversityEmail = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const emailDomain = email.toLowerCase().split("@")[1];

  // Primary university domain from env
  const universityDomain = process.env.UNIVERSITY_EMAIL_DOMAIN || "university.ac.in";

  // Allowed domains — add gmail.com for testing
  const allowedDomains = [
    universityDomain,
    "gmail.com",
  ];

  if (!allowedDomains.includes(emailDomain)) {
    return res.status(400).json({
      success: false,
      message: `Only ${universityDomain} email addresses are allowed`,
    });
  }

  next();
};

module.exports = { validateUniversityEmail };
import nodemailer from "nodemailer";

const sendEmail = async (email, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT), // Ensure this is a number
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // Helps avoid connection refusal on some networks
      rejectUnauthorized: false
    }
  });

  try {
    await transporter.sendMail({
      from: `"DrGPharma" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${email}`);
  } catch (error) {
    console.error("❌ Nodemailer Error:", error);
    throw error; // Re-throw so the controller knows it failed
  }
};

export default sendEmail;
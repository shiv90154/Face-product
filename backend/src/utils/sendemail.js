// utils/sendEmail.js
import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
};

// Generate a 6-digit OTP
export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Simple email template wrapper
const wrapInTemplate = (content, title) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>${title}</h2>
    ${content}
    <p style="color: #777; font-size: 12px;">© ${new Date().getFullYear()} Samraddh Bharat Foundation</p>
  </div>
`;

export const sendOTP = async (email, otp, expiryMinutes = 5) => {
  const content = `
    <p>Your One-Time Password (OTP) for verification is:</p>
    <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; background: #fff; padding: 10px; border-radius: 4px; border: 1px dashed #1a237e; margin: 15px 0;">
      ${otp}
    </div>
    <p>This OTP is valid for <strong>${expiryMinutes} minutes</strong>.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;
  const html = wrapInTemplate(content, "🔐 Email Verification");
  await getTransporter().sendMail({
    from: `"Ankush Sharma Company" <${process.env.EMAIL}>`,
    to: email,
    subject: "🔐 OTP Verification - AnkushSharma-compony.com",
    text: `Your OTP is: ${otp} (valid for ${expiryMinutes} minutes)`,
    html,
  });
};
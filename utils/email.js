const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendMail = async (to, subject, html) => {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

const accountVerifyOtp = async (to, otp) => {
  const subject = "Wallet Account Verification";

  const html = `
  <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <h2 style="color:#333; text-align:center;">Verify Your Wallet Account</h2>
          <p style="font-size:16px; color:#555;">Hi,</p>
          <p style="font-size:16px; color:#555;">
            Thank you for registering with <b>Wallet</b>! Use the OTP below to verify your account:
          </p>
          <div style="text-align:center; margin: 30px 0;">
            <span style="font-size:28px; font-weight:bold; color:#007BFF; letter-spacing:5px;">${otp}</span>
          </div>
          <p style="font-size:16px; color:#555;">
            This OTP is valid for <b>5 minutes</b>. Do not share this code with anyone.
          </p>
          <p style="font-size:14px; color:#999; text-align:center;">
            If you did not request this verification, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;
  return sendMail(to, subject, html);
};

const forgotPasswordOtp = async (to, otp) => {
  const subject = "Password Reset Request";

  const html = `
  <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <h2 style="color:#333; text-align:center;">Reset Your Password</h2>
          <p style="font-size:16px; color:#555;">Hi,</p>
          <p style="font-size:16px; color:#555;">
            We received a request to reset the password for your <b>Wallet</b> account. Use the OTP below to proceed with resetting your password:
          </p>
          <div style="text-align:center; margin: 30px 0;">
            <span style="font-size:28px; font-weight:bold; color:#FF5733; letter-spacing:5px;">${otp}</span>
          </div>
          <p style="font-size:16px; color:#555;">
            This OTP is valid for <b>5 minutes</b>. Do not share this code with anyone.
          </p>
          <p style="font-size:14px; color:#999; text-align:center;">
            If you did not request this password reset, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;

  return sendMail(to, subject, html);
};

module.exports = { sendMail, accountVerifyOtp, forgotPasswordOtp };

const nodemailer = require("nodemailer");

const {
  getPasswordResetTemplate,
  getWelcomeEmailTemplate,
  getLoginOTPTemplate,
  getForgotPasswordOTPTemplate,
} = require("../utils/helper/email.helper"); 

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  if (!to) {
    throw new Error("No recipients defined");
  }

  
  const useStaticOTP = process.env.ENABLE_STATIC_OTP_PROD === 'true';
  
  if (useStaticOTP) {
    console.log(`[STATIC OTP MODE] Email sending bypassed for ${to}`);
    console.log(`Subject: ${subject}`);
    return; // Exit early, don't send email
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true" || false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 300000, // 5 minutes
    greetingTimeout: 300000,   // 5 minutes
    socketTimeout: 300000,     // 5 minutes
  });

  try {
    const mailOptions = {
      from: `"WE FANSS" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`Message ID: ${info.messageId}`);
    
    return info;
    
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    
    // Log more details for debugging
    if (error.code) {
      console.error(`Error Code: ${error.code}`);
    }
    if (error.response) {
      console.error(`SMTP Response: ${error.response}`);
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  } finally {
    // Close the transporter connection
    transporter.close();
  }
};

// Send Login OTP Email
const sendLoginOTPEmail = async (to, username, otp, expiryMinutes = 10) => {
  const html = getLoginOTPTemplate(username, otp, expiryMinutes);
  const text = `Dear ${username},

We received a request to log in to your WE FANSS account.

Please use the One-Time Password (OTP) below to complete your login:

Login OTP: ${otp}

This OTP is valid for ${expiryMinutes} minutes. For security reasons, please do not share this code with anyone.

If you did not initiate this login request, please contact our support team immediately.

Regards,
Team WE FANSS`;

  await sendEmail({
    to,
    subject: "Your WE FANSS Login OTP",
    text,
    html,
  });
};

// Send Forgot Password OTP Email
const sendForgotPasswordOTPEmail = async (to, username, otp, expiryMinutes = 10) => {
  const html = getForgotPasswordOTPTemplate(username, otp, expiryMinutes);
  const text = `Dear ${username},

We received a request to reset the password for your WE FANSS account.

Please use the One-Time Password (OTP) below to proceed with resetting your password:

Password Reset OTP: ${otp}

This OTP is valid for ${expiryMinutes} minutes and can be used only once. For security reasons, please do not share this OTP with anyone.

If you did not request a password reset, please ignore this email or contact our support team immediately.

Regards,
Team WE FANSS`;

  await sendEmail({
    to,
    subject: "WE FANSS – Password Reset OTP",
    text,
    html,
  });
};

// Send Welcome Email with QR Code
const sendWelcomeEmail = async (
  to,
  username,
  temporaryPassword,
  qrCodeBuffer,
  secret
) => {
  const html = getWelcomeEmailTemplate(
    username,
    to,
    temporaryPassword,
    secret
  );

  const text = `Congratulations! Your WE FANSS Account Is Ready

Dear ${username},

Congratulations! Your account has been successfully created on WE FANSS.

You can access your account using the credentials below:

Login Details
Email: ${to}
Password: ${temporaryPassword}

Click here to log in: ${process.env.FRONTEND_URL || "http://localhost:3000"}/login

For enhanced security, please set up your authenticator using the key provided below:

Authenticator Setup Key: ${secret}

If you have any questions or need assistance, feel free to reach out to us.

Warm regards,
Team WE FANSS

---
© ${new Date().getFullYear()} WE FANSS. All rights reserved.
This is an automated message, please do not reply to this email.
`;

  await sendEmail({
    to,
    subject: "Congratulations! Your WE FANSS Account Is Ready",
    text,
    html,
    attachments: qrCodeBuffer ? [
      {
        filename: "qrcode.png",
        content: qrCodeBuffer,
        cid: "qrcode@wefanss",
      },
    ] : undefined,
  });
};


module.exports = {
  sendEmail,
  sendLoginOTPEmail,
  sendForgotPasswordOTPEmail,
  sendWelcomeEmail,
};
const nodemailer = require("nodemailer");



const crypto = require("crypto");


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

// =======================================
// REGISTER OTP TEMPLATE
// =======================================
const getRegisterOTPTemplate = (
  username,
  otp,
  expiryMinutes = 10
) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your WE FANSS Registration OTP</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #000000 !important;
    }
  </style>
</head>

<body style="margin:0 !important; padding:0 !important; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; background-color:#000000 !important;">

  <div style="background-color:#000000; padding:40px 20px; min-height:100vh;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0"
            style="background-color:#1a1a1a; border-radius:12px; overflow:hidden; border:1px solid #2a2a2a; max-width:600px;">

            <!-- LOGO -->
            <tr>
              <td style="padding:40px 30px 30px 30px;">
                <div style="display:inline-block; background-color:#0F4F72; width:48px; height:48px; border-radius:8px; text-align:center; line-height:48px; font-size:24px;">
                  ✨
                </div>
              </td>
            </tr>

            <!-- HEADER -->
            <tr>
              <td style="padding:0 30px 30px 30px;">
                <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:600; line-height:1.3;">
                  Your WE FANSS Registration OTP
                </h1>
              </td>
            </tr>

            <!-- CONTENT -->
            <tr>
              <td style="padding:0 30px 30px 30px;">

                <p style="margin:0 0 20px; color:#e0e0e0; font-size:15px; line-height:1.6;">
                  Dear <strong style="color:#ffffff;">${username}</strong>,
                </p>

                <p style="margin:0 0 30px; color:#e0e0e0; font-size:15px; line-height:1.6;">
                  Thank you for registering with 
                  <strong style="color:#0F4F72;">WE FANSS</strong>.
                </p>

                <p style="margin:0 0 25px; color:#e0e0e0; font-size:15px; line-height:1.6;">
                  Please use the One-Time Password (OTP) below to verify your account:
                </p>

                <!-- OTP BOX -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:0 0 30px 0;">

                      <div style="background-color:#0F4F72; border-radius:8px; padding:20px 40px; display:inline-block;">

                        <p style="margin:0 0 5px 0; color:#ffffff; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:1px;">
                          Registration OTP
                        </p>

                        <span style="color:#ffffff; font-size:32px; font-weight:bold; letter-spacing:8px; font-family:'Courier New', monospace;">
                          ${otp}
                        </span>

                      </div>

                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 20px; color:#b0b0b0; font-size:14px; line-height:1.6;">
                  This OTP is valid for 
                  <strong style="color:#e0e0e0;">
                    ${expiryMinutes} minutes
                  </strong>.
                  For security reasons, please do not share this code with anyone.
                </p>

                <!-- WARNING -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0 0;">
                  <tr>
                    <td style="background-color:#2a2a2a; border-left:4px solid #ffc107; border-radius:6px; padding:15px;">

                      <p style="margin:0; color:#e0e0e0; font-size:14px; line-height:1.5;">
                        ⚠️ <strong style="color:#ffc107;">Important:</strong>
                        If you did not create this account, please ignore this email.
                      </p>

                    </td>
                  </tr>
                </table>

                <p style="margin:30px 0 0 0; color:#e0e0e0; font-size:14px; line-height:1.6;">
                  Regards,<br>
                  <strong style="color:#0F4F72;">
                    Team WE FANSS
                  </strong>
                </p>

              </td>
            </tr>

            <!-- DIVIDER -->
            <tr>
              <td style="padding:0 30px;">
                <div style="border-top:1px solid #2a2a2a;"></div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:30px; text-align:left;">

                <p style="margin:0 0 5px; color:#808080; font-size:12px; line-height:1.5;">
                  © ${new Date().getFullYear()} WE FANSS. All Rights Reserved
                </p>

                <p style="margin:5px 0 0; color:#808080; font-size:12px; line-height:1.5;">
                  This is an automated message, please do not reply to this email.
                </p>

              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>

</body>
</html>
`;
};

// =======================================
// SEND REGISTER OTP EMAIL
// =======================================
const sendRegisterOTPEmail = async (
  to,
  username,
  otp,
  expiryMinutes = 10
) => {

  const html = getRegisterOTPTemplate(
    username,
    otp,
    expiryMinutes
  );

  const text = `Dear ${username},

Thank you for registering with WE FANSS.

Please use the OTP below to verify your account:

Registration OTP: ${otp}

This OTP is valid for ${expiryMinutes} minutes.

If you did not create this account, please ignore this email.

Regards,
Team WE FANSS`;

  await sendEmail({
    to,
    subject: "Your WE FANSS Registration OTP",
    text,
    html,
  });
};
//resendotp

// email config file me ye naya function add karo

// =======================================
// RESEND LOGIN OTP EMAIL
// =======================================
// =======================================
// RESEND OTP TEMPLATE
// =======================================
const getResendOTPTemplate = (
  username,
  otp,
  expiryMinutes = 10
) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your WE FANSS Resend OTP</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #000000 !important;
    }
  </style>
</head>

<body style="margin:0 !important; padding:0 !important; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; background-color:#000000 !important;">

  <div style="background-color:#000000; padding:40px 20px; min-height:100vh;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0"
            style="background-color:#1a1a1a; border-radius:12px; overflow:hidden; border:1px solid #2a2a2a; max-width:600px;">

            <!-- LOGO -->
            <tr>
              <td style="padding:40px 30px 30px 30px;">
                <div style="display:inline-block; background-color:#0F4F72; width:48px; height:48px; border-radius:8px; text-align:center; line-height:48px; font-size:24px;">
                  🔄
                </div>
              </td>
            </tr>

            <!-- HEADER -->
            <tr>
              <td style="padding:0 30px 30px 30px;">
                <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:600; line-height:1.3;">
                  Your WE FANSS Resend OTP
                </h1>
              </td>
            </tr>

            <!-- CONTENT -->
            <tr>
              <td style="padding:0 30px 30px 30px;">

                <p style="margin:0 0 20px; color:#e0e0e0; font-size:15px; line-height:1.6;">
                  Dear <strong style="color:#ffffff;">${username}</strong>,
                </p>

                <p style="margin:0 0 30px; color:#e0e0e0; font-size:15px; line-height:1.6;">
                  A new OTP has been requested for your 
                  <strong style="color:#0F4F72;">WE FANSS</strong> account.
                </p>

                <p style="margin:0 0 25px; color:#e0e0e0; font-size:15px; line-height:1.6;">
                  Please use the OTP below to continue:
                </p>

                <!-- OTP BOX -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:0 0 30px 0;">

                      <div style="background-color:#0F4F72; border-radius:8px; padding:20px 40px; display:inline-block;">

                        <p style="margin:0 0 5px 0; color:#ffffff; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:1px;">
                          Resend OTP
                        </p>

                        <span style="color:#ffffff; font-size:32px; font-weight:bold; letter-spacing:8px; font-family:'Courier New', monospace;">
                          ${otp}
                        </span>

                      </div>

                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 20px; color:#b0b0b0; font-size:14px; line-height:1.6;">
                  This OTP is valid for 
                  <strong style="color:#e0e0e0;">
                    ${expiryMinutes} minutes
                  </strong>.
                  Please do not share this code with anyone.
                </p>

                <!-- WARNING -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0 0;">
                  <tr>
                    <td style="background-color:#2a2a2a; border-left:4px solid #ffc107; border-radius:6px; padding:15px;">

                      <p style="margin:0; color:#e0e0e0; font-size:14px; line-height:1.5;">
                        ⚠️ <strong style="color:#ffc107;">Important:</strong>
                        If you did not request this OTP, please contact support immediately.
                      </p>

                    </td>
                  </tr>
                </table>

                <p style="margin:30px 0 0 0; color:#e0e0e0; font-size:14px; line-height:1.6;">
                  Regards,<br>
                  <strong style="color:#0F4F72;">
                    Team WE FANSS
                  </strong>
                </p>

              </td>
            </tr>

            <!-- DIVIDER -->
            <tr>
              <td style="padding:0 30px;">
                <div style="border-top:1px solid #2a2a2a;"></div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:30px; text-align:left;">

                <p style="margin:0 0 5px; color:#808080; font-size:12px; line-height:1.5;">
                  © ${new Date().getFullYear()} WE FANSS. All Rights Reserved
                </p>

                <p style="margin:5px 0 0; color:#808080; font-size:12px; line-height:1.5;">
                  This is an automated message, please do not reply to this email.
                </p>

              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>

</body>
</html>
`;
};

// =======================================
// SEND RESEND OTP EMAIL
// =======================================
const sendResendOTPEmail = async (
  to,
  username,
  otp,
  expiryMinutes = 10
) => {

  const html = getResendOTPTemplate(
    username,
    otp,
    expiryMinutes
  );

  const text = `Dear ${username},

A new OTP has been requested for your WE FANSS account.

Resend OTP: ${otp}

This OTP is valid for ${expiryMinutes} minutes.

If you did not request this OTP, please contact support immediately.

Regards,
Team WE FANSS`;

  await sendEmail({
    to,
    subject: "Your WE FANSS Resend OTP",
    text,
    html,
  });
};

//reset link

const sendForgotPasswordLinkEmail = async (
  to,
  username,
  resetLink
) => {
  // ✅ New Template Use Here
  const html = getForgotPasswordLinkTemplate(
    username,
    resetLink,
    15
  );

  const text = `Dear ${username},

We received a request to reset your password.

Reset Password Link:
${resetLink}

This link is valid for 15 minutes.

If you did not request this password reset, please ignore this email.

Regards,
Team WE FANSS`;

  await sendEmail({
    to,
    subject: "WE FANSS - Reset Password Link",
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
  sendRegisterOTPEmail,
  sendForgotPasswordOTPEmail,
  sendWelcomeEmail,
  sendResendOTPEmail,
  sendForgotPasswordLinkEmail
  
};
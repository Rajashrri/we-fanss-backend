// 1. Welcome Email Template (For all roles - Admin/Sub Admin/Any User)
const getWelcomeEmailTemplate = (
  username,
  email,
  temporaryPassword,
  secret
) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to WE FANSS</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #000000 !important;
    }
  </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000 !important;">
  <div style="background-color: #000000; padding: 40px 20px; min-height: 100vh;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a; max-width: 600px;">
            
            <!-- Logo/Brand -->
            <tr>
              <td style="padding: 40px 30px 30px 30px;">
                <div style="display: inline-block; background-color: #0F4F72; width: 48px; height: 48px; border-radius: 8px; text-align: center; line-height: 48px; font-size: 24px;">
                  🎉
                </div>
              </td>
            </tr>
            
            <!-- Header -->
            <tr>
              <td style="padding: 0 30px 30px 30px;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; line-height: 1.3;">
                  Congratulations! Your WE FANSS Account Is Ready
                </h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 0 30px 30px 30px;">
                <p style="margin: 0 0 20px; color: #e0e0e0; font-size: 15px; line-height: 1.6;">
                  Dear <strong style="color: #ffffff;">${username}</strong>,
                </p>
                
                <p style="margin: 0 0 30px; color: #e0e0e0; font-size: 15px; line-height: 1.6;">
                  Congratulations! Your account has been successfully created on <strong style="color: #0F4F72;">WE FANSS</strong>.
                </p>
                
                <p style="margin: 0 0 15px; color: #e0e0e0; font-size: 15px; line-height: 1.6;">
                  You can access your account using the credentials below:
                </p>
                
                <!-- Login Details Box -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 25px 0;">
                  <tr>
                    <td style="background-color: #242424; border-left: 4px solid #0F4F72; border-radius: 6px; padding: 20px;">
                      <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                        Login Details
                      </p>
                      <p style="margin: 0 0 10px 0; color: #e0e0e0; font-size: 14px;">
                        <strong style="color: #b0b0b0;">Email:</strong> 
                        <span style="color: #ffffff;">${email}</span>
                      </p>
                      <p style="margin: 0; color: #e0e0e0; font-size: 14px;">
                        <strong style="color: #b0b0b0;">Password:</strong> 
                        <span style="color: #0F4F72; font-family: 'Courier New', monospace; font-weight: bold;">${temporaryPassword}</span>
                      </p>
                    </td>
                  </tr>
                </table>
                
                <!-- Login Button -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                  <tr>
                    <td align="left">
                      <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/login" 
                         style="display: inline-block; background-color: #0F4F72; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 15px; font-weight: 500;">
                        👉 Click here to log in
                      </a>
                    </td>
                  </tr>
                </table>
                
                <!-- 2FA Setup Section -->
                <div style="margin: 30px 0; padding: 20px; background-color: #242424; border-radius: 8px; border: 1px solid #2a2a2a;">
                  <p style="margin: 0 0 15px 0; color: #e0e0e0; font-size: 15px; line-height: 1.6;">
                    For enhanced security, please set up your authenticator using the key provided below:
                  </p>
                  
                  <!-- QR Code -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 15px 0;">
                    <tr>
                      <td align="center" style="padding: 15px; background-color: #1a1a1a; border-radius: 6px;">
                        <img 
                          src="cid:qrcode@wefanss" 
                          width="200" 
                          height="200" 
                          alt="Scan QR Code"
                          style="display: block; border: 2px solid #2a2a2a; border-radius: 6px;"
                        />
                        <p style="margin: 10px 0 0 0; color: #808080; font-size: 13px;">
                          Scan this QR code with your authenticator app
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Manual Key -->
                  <p style="margin: 20px 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 600;">
                    Authenticator Setup Key:
                  </p>
                  <div style="background-color: #1a1a1a; padding: 12px; border-radius: 4px; border: 1px solid #2a2a2a; word-break: break-all;">
                    <code style="color: #0F4F72; font-family: 'Courier New', monospace; font-size: 14px; font-weight: bold;">
                      ${secret}
                    </code>
                  </div>
                </div>
                
                <!-- Backup Codes Section - Removed -->
                
                <p style="margin: 30px 0 10px 0; color: #e0e0e0; font-size: 14px; line-height: 1.6;">
                  If you have any questions or need assistance, feel free to reach out to us.
                </p>
                
                <p style="margin: 20px 0 0 0; color: #e0e0e0; font-size: 14px; line-height: 1.6;">
                  Warm regards,<br>
                  <strong style="color: #0F4F72;">Team WE FANSS</strong>
                </p>
              </td>
            </tr>
            
            <!-- Divider -->
            <tr>
              <td style="padding: 0 30px;">
                <div style="border-top: 1px solid #2a2a2a;"></div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px; text-align: left;">
                <p style="margin: 0 0 5px; color: #808080; font-size: 12px; line-height: 1.5;">
                  © ${new Date().getFullYear()} WE FANSS. All Rights Reserved
                </p>
                <p style="margin: 5px 0 0; color: #808080; font-size: 12px; line-height: 1.5;">
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

// 2. Login OTP Email Template (For all roles - Admin/Sub Admin/Any User)
const getLoginOTPTemplate = (username, otp, expiryMinutes = 10) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your WE FANSS Login OTP</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #000000 !important;
    }
  </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000 !important;">
  <div style="background-color: #000000; padding: 40px 20px; min-height: 100vh;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a; max-width: 600px;">
            
            <!-- Logo/Brand -->
            <tr>
              <td style="padding: 40px 30px 30px 30px;">
                <div style="display: inline-block; background-color: #0F4F72; width: 48px; height: 48px; border-radius: 8px; text-align: center; line-height: 48px; font-size: 24px;">
                  🔐
                </div>
              </td>
            </tr>
            
            <!-- Header -->
            <tr>
              <td style="padding: 0 30px 30px 30px;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; line-height: 1.3;">
                  Your WE FANSS Login OTP
                </h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 0 30px 30px 30px;">
                <p style="margin: 0 0 20px; color: #e0e0e0; font-size: 15px; line-height: 1.6;">
                  Dear <strong style="color: #ffffff;">${username}</strong>,
                </p>
                
                <p style="margin: 0 0 30px; color: #e0e0e0; font-size: 15px; line-height: 1.6;">
                  We received a request to log in to your <strong style="color: #0F4F72;">WE FANSS</strong> account.
                </p>
                
                <p style="margin: 0 0 25px; color: #e0e0e0; font-size: 15px; line-height: 1.6;">
                  Please use the One-Time Password (OTP) below to complete your login:
                </p>
                
                <!-- OTP Box -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding: 0 0 30px 0;">
                      <div style="background-color: #0F4F72; border-radius: 8px; padding: 20px 40px; display: inline-block;">
                        <p style="margin: 0 0 5px 0; color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                          Login OTP
                        </p>
                        <span style="color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                          ${otp}
                        </span>
                      </div>
                    </td>
                  </tr>
                </table>
                
                <p style="margin: 0 0 20px; color: #b0b0b0; font-size: 14px; line-height: 1.6;">
                  This OTP is valid for <strong style="color: #e0e0e0;">${expiryMinutes} minutes</strong>. For security reasons, please do not share this code with anyone.
                </p>
                
                <!-- Warning Box -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0 0 0;">
                  <tr>
                    <td style="background-color: #2a2a2a; border-left: 4px solid #ffc107; border-radius: 6px; padding: 15px;">
                      <p style="margin: 0; color: #e0e0e0; font-size: 14px; line-height: 1.5;">
                        ⚠️ <strong style="color: #ffc107;">Important:</strong> If you did not initiate this login request, please contact our support team immediately.
                      </p>
                    </td>
                  </tr>
                </table>
                
                <p style="margin: 30px 0 0 0; color: #e0e0e0; font-size: 14px; line-height: 1.6;">
                  Regards,<br>
                  <strong style="color: #0F4F72;">Team WE FANSS</strong>
                </p>
              </td>
            </tr>
            
            <!-- Divider -->
            <tr>
              <td style="padding: 0 30px;">
                <div style="border-top: 1px solid #2a2a2a;"></div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px; text-align: left;">
                <p style="margin: 0 0 5px; color: #808080; font-size: 12px; line-height: 1.5;">
                  © ${new Date().getFullYear()} WE FANSS. All Rights Reserved
                </p>
                <p style="margin: 5px 0 0; color: #808080; font-size: 12px; line-height: 1.5;">
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

// 3. Forgot Password OTP Email Template (For all roles - Admin/Sub Admin/Any User)
const getForgotPasswordOTPTemplate = (username, otp, expiryMinutes = 10) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WE FANSS – Password Reset OTP</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #000000 !important;
    }
  </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000 !important;">
  <div style="background-color: #000000; padding: 40px 20px; min-height: 100vh;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a; max-width: 600px;">
            
            <!-- Logo/Brand -->
            <tr>
              <td style="padding: 40px 30px 30px 30px;">
                <div style="display: inline-block; background-color: #0F4F72; width: 48px; height: 48px; border-radius: 8px; text-align: center; line-height: 48px; font-size: 24px;">
                  🔑
                </div>
              </td>
            </tr>
            
            <!-- Header -->
            <tr>
              <td style="padding: 0 30px 30px 30px;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; line-height: 1.3;">
                  WE FANSS – Password Reset OTP
                </h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 0 30px 30px 30px;">
                <p style="margin: 0 0 20px; color: #e0e0e0; font-size: 15px; line-height: 1.6;">
                  Dear <strong style="color: #ffffff;">${username}</strong>,
                </p>
                
                <p style="margin: 0 0 30px; color: #e0e0e0; font-size: 15px; line-height: 1.6;">
                  We received a request to reset the password for your <strong style="color: #0F4F72;">WE FANSS</strong> account.
                </p>
                
                <p style="margin: 0 0 25px; color: #e0e0e0; font-size: 15px; line-height: 1.6;">
                  Please use the One-Time Password (OTP) below to proceed with resetting your password:
                </p>
                
                <!-- OTP Box -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding: 0 0 30px 0;">
                      <div style="background-color: #0F4F72; border-radius: 8px; padding: 20px 40px; display: inline-block;">
                        <p style="margin: 0 0 5px 0; color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                          Password Reset OTP
                        </p>
                        <span style="color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                          ${otp}
                        </span>
                      </div>
                    </td>
                  </tr>
                </table>
                
                <p style="margin: 0 0 20px; color: #b0b0b0; font-size: 14px; line-height: 1.6;">
                  This OTP is valid for <strong style="color: #e0e0e0;">${expiryMinutes} minutes</strong> and can be used only once. For security reasons, please do not share this OTP with anyone.
                </p>
                
                <!-- Warning Box -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0 0 0;">
                  <tr>
                    <td style="background-color: #2a2a2a; border-left: 4px solid #ffc107; border-radius: 6px; padding: 15px;">
                      <p style="margin: 0; color: #e0e0e0; font-size: 14px; line-height: 1.5;">
                        ⚠️ <strong style="color: #ffc107;">Important:</strong> If you did not request a password reset, please ignore this email or contact our support team immediately.
                      </p>
                    </td>
                  </tr>
                </table>
                
                <p style="margin: 30px 0 0 0; color: #e0e0e0; font-size: 14px; line-height: 1.6;">
                  Regards,<br>
                  <strong style="color: #0F4F72;">Team WE FANSS</strong>
                </p>
              </td>
            </tr>
            
            <!-- Divider -->
            <tr>
              <td style="padding: 0 30px;">
                <div style="border-top: 1px solid #2a2a2a;"></div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px; text-align: left;">
                <p style="margin: 0 0 5px; color: #808080; font-size: 12px; line-height: 1.5;">
                  © ${new Date().getFullYear()} WE FANSS. All Rights Reserved
                </p>
                <p style="margin: 5px 0 0; color: #808080; font-size: 12px; line-height: 1.5;">
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

module.exports = {
  getWelcomeEmailTemplate,
  getLoginOTPTemplate,
  getForgotPasswordOTPTemplate
};
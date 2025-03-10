export const supportNotificationTemplate = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Contact Form Submission - Aswaq.online</title>
    <style type="text/css">
      /* CLIENT-SPECIFIC STYLES */
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; }

      /* RESET STYLES */
      body { margin: 0; padding: 0; height: 100% !important; width: 100% !important; }
      img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
      table { border-collapse: collapse !important; }
      
      /* iOS BLUE LINKS */
      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
      
      /* GMAIL BLUE LINKS */
      u + #body a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
      }

      /* SAMSUNG MAIL BLUE LINKS */
      #MessageViewBody a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
      }
      
      /* ANDROID CENTER FIX */
      div[style*="margin: 16px 0;"] { margin: 0 !important; }
      
      /* MAIN STYLES */
      body {
        font-family: Arial, Helvetica, sans-serif;
        line-height: 1.6;
        color: #4a5568;
        background-color: #f7fafc;
      }
      
      @media screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
          max-width: 100% !important;
        }
        .content-padding {
          padding: 30px 20px !important;
        }
        .mobile-responsive {
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
        }
        .mobile-text {
          font-size: 15px !important;
        }
        .mobile-heading {
          font-size: 20px !important;
        }
        .message-box {
          padding: 15px !important;
          margin: 20px 0 !important;
        }
        .divider {
          margin: 0 auto 20px !important;
        }
      }
    </style>
  </head>
  <body bgcolor="#f7fafc" style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #4a5568; background-color: #f7fafc; width: 100%;">
    <!-- Preheader text (hidden) -->
    <div style="display: none; max-height: 0px; overflow: hidden;">
      New Contact Form Submission from {{firstName}} {{lastName}}
    </div>
    
    <center style="width: 100%; background-color: #f7fafc; padding: 20px 0;">
      <!-- Email Container -->
      <table cellpadding="0" cellspacing="0" border="0" width="600" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); margin: auto;">
        <!-- Header -->
        <tr>
          <td align="center" style="padding: 25px 0; background-color: #f8fafc; border-top: 4px solid #006eb8; border-radius: 8px 8px 0 0;">
            <!-- Logo placeholder -->
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td align="left" class="content-padding" style="padding: 40px 30px;">
            <h1 class="mobile-heading" style="color: #2d3748; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center;">
              New Contact Form Submission
            </h1>
            <div class="divider" style="height: 2px; background-color: #e0e0e0; margin: 0 auto 30px; width: 100px;"></div>
            
            <p class="mobile-text" style="margin-bottom: 24px; font-size: 16px;">
              You have received a new message from the aswaq.online contact form.
            </p>
            
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                  <strong style="color: #555555; width: 100px; display: inline-block;">Name:</strong>
                  <span style="color: #333333;">{{firstName}} {{lastName}}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                  <strong style="color: #555555; width: 100px; display: inline-block;">Email:</strong>
                  <a href="mailto:{{email}}" style="color: #006eb8; text-decoration: none;">{{email}}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                  <strong style="color: #555555; width: 100px; display: inline-block;">Phone:</strong>
                  <span style="color: #333333;">{{phone}}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                  <strong style="color: #555555; width: 100px; display: inline-block;">Subject:</strong>
                  <span style="color: #333333;">{{subject}}</span>
                </td>
              </tr>
            </table>
            
            <div style="margin-top: 25px; text-align: left; width: 100%;">
              <h2 style="color: #2d3748; font-size: 18px; margin-bottom: 15px; font-weight: normal;">Message:</h2>
              <div style="padding: 15px; background-color: #f8fafc; border-radius: 4px; white-space: pre-wrap; text-align: left;">
                {{message}}
              </div>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #718096;">
              This is an automated notification from your website's contact form system.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding: 20px; background-color: #f8fafc; font-size: 12px; color: #718096; border-radius: 0 0 8px 8px;">
            <p style="margin-bottom: 5px;">
              &copy; 2025 Aswaq.online. All rights reserved.
            </p>
            <p style="margin-top: 0;">
              This is an automated message from our secure notification system.
            </p>
          </td>
        </tr>
      </table>
    </center>
  </body>
</html>`;

export const userConfirmationTemplate = `<!DOCTYPE html>
<html lang="{{locale}}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{subject}}</title>
    <style type="text/css">
      /* CLIENT-SPECIFIC STYLES */
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; }

      /* RESET STYLES */
      body { margin: 0; padding: 0; height: 100% !important; width: 100% !important; }
      img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
      table { border-collapse: collapse !important; }
      
      /* iOS BLUE LINKS */
      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
      
      /* GMAIL BLUE LINKS */
      u + #body a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
      }

      /* SAMSUNG MAIL BLUE LINKS */
      #MessageViewBody a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
      }
      
      /* ANDROID CENTER FIX */
      div[style*="margin: 16px 0;"] { margin: 0 !important; }
      
      /* MAIN STYLES */
      body {
        font-family: Arial, Helvetica, sans-serif;
        line-height: 1.6;
        color: #4a5568;
        background-color: #f7fafc;
      }
      
      @media screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
          max-width: 100% !important;
        }
        .content-padding {
          padding: 30px 20px !important;
        }
        .mobile-responsive {
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
        }
        .mobile-text {
          font-size: 15px !important;
        }
        .mobile-heading {
          font-size: 20px !important;
        }
        .message-box {
          padding: 15px !important;
          margin: 20px 0 !important;
        }
        .divider {
          margin: 0 auto 20px !important;
        }
      }
    </style>
  </head>
  <body dir="{{direction}}" bgcolor="#f7fafc" style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #4a5568; background-color: #f7fafc; width: 100%;">
    <!-- Preheader text (hidden) -->
    <div style="display: none; max-height: 0px; overflow: hidden;">
      {{subject}}
    </div>
    
    <center style="width: 100%; background-color: #f7fafc; padding: 20px 0;">
      <!-- Email Container -->
      <table cellpadding="0" cellspacing="0" border="0" width="600" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); margin: auto;">
        <!-- Header -->
        <tr>
          <td align="center" style="padding: 25px 0; background-color: #f8fafc; border-top: 4px solid #006eb8; border-radius: 8px 8px 0 0;">
            <!-- Logo placeholder -->
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td align="{{textAlign}}" class="content-padding" style="padding: 40px 30px;">
            <h1 class="mobile-heading" style="color: #2d3748; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center;">
              {{subject}}
            </h1>
            <div class="divider" style="height: 2px; background-color: #e0e0e0; margin: 0 auto 30px; width: 100px;"></div>
            
            <p class="mobile-text" style="margin-bottom: 20px; font-size: 16px;">
              {{greeting}}
            </p>
            <p class="mobile-text" style="margin-bottom: 20px; font-size: 16px;">
              {{message}}
            </p>
            <p class="mobile-text" style="margin-bottom: 20px; font-size: 16px;">
              {{reference}}
            </p>
            
            <div class="message-box" style="
              margin: 30px 0;
              padding: 20px;
              background-color: #f8fafc;
              border-{{borderSide}}: 4px solid #006eb8;
              border-radius: 4px;
            ">
              <h3 style="margin-top: 0; color: #006eb8; font-weight: 600;">
                {{formSubject}}
              </h3>
              <div class="mobile-text" style="white-space: pre-wrap; color: #4a5568;">
                {{formMessage}}
              </div>
            </div>
            
            <p class="mobile-text" style="margin-top: 30px; font-size: 16px;">
              {{closing}}
            </p>
            <p style="font-weight: 600; color: #006eb8; margin-bottom: 0;">
              {{team}}
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding: 20px; background-color: #f8fafc; font-size: 12px; color: #718096; border-radius: 0 0 8px 8px;">
            <p style="margin-bottom: 5px;">
              &copy; {{year}} Aswaq.online. {{copyright}}
            </p>
            <p style="margin-top: 0;">
              {{automatedMessage}}
            </p>
          </td>
        </tr>
      </table>
    </center>
  </body>
</html>`;

export const verificationRequestTemplate = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Verification Request - Aswaq.online</title>
    <style type="text/css">
      /* CLIENT-SPECIFIC STYLES */
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; }

      /* RESET STYLES */
      body { margin: 0; padding: 0; height: 100% !important; width: 100% !important; }
      img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
      table { border-collapse: collapse !important; }
      
      /* iOS BLUE LINKS */
      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
      
      /* MAIN STYLES */
      body {
        font-family: Arial, Helvetica, sans-serif;
        line-height: 1.6;
        color: #4a5568;
        background-color: #f7fafc;
      }
    </style>
  </head>
  <body bgcolor="#f7fafc" style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #4a5568; background-color: #f7fafc; width: 100%;">
    <center style="width: 100%; background-color: #f7fafc; padding: 20px 0;">
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); margin: auto;">
        <tr>
          <td align="center" style="padding: 25px 0; background-color: #f8fafc; border-top: 4px solid #006eb8; border-radius: 8px 8px 0 0;">
            <!-- Logo placeholder -->
          </td>
        </tr>

        <tr>
          <td align="left" style="padding: 40px 30px;">
            <h1 style="color: #2d3748; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center;">
              New Verification Request
            </h1>
            <div style="height: 2px; background-color: #e0e0e0; margin: 0 auto 30px; width: 100px;"></div>
            
            <p style="margin-bottom: 24px; font-size: 16px;">
              A new verification request has been submitted.
            </p>
            
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                  <strong style="color: #555555; width: 120px; display: inline-block;">User:</strong>
                  <span style="color: #333333;">{{userName}}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                  <strong style="color: #555555; width: 120px; display: inline-block;">Document Type:</strong>
                  <span style="color: #333333;">{{documentType}}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                  <strong style="color: #555555; width: 120px; display: inline-block;">Expiry Date:</strong>
                  <span style="color: #333333;">{{documentExpiry}}</span>
                </td>
              </tr>
            </table>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="{{adminUrl}}" style="background-color: #006eb8; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Review Request
              </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #718096; text-align: center;">
              This is an automated notification from the verification system.
            </p>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding: 20px; background-color: #f8fafc; font-size: 12px; color: #718096; border-radius: 0 0 8px 8px;">
            <p style="margin-bottom: 5px;">
              &copy; {{year}} Aswaq.online. All rights reserved.
            </p>
            <p style="margin-top: 0;">
              This is an automated message from our secure notification system.
            </p>
          </td>
        </tr>
      </table>
    </center>
  </body>
</html>`;

export const verificationStatusTemplate = `<!DOCTYPE html>
<html lang="{{locale}}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verification Status Update - Aswaq.online</title>
    <style type="text/css">
      /* CLIENT-SPECIFIC STYLES */
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; }

      /* RESET STYLES */
      body { margin: 0; padding: 0; height: 100% !important; width: 100% !important; }
      img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
      table { border-collapse: collapse !important; }
      
      /* iOS BLUE LINKS */
      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
      
      /* MAIN STYLES */
      body {
        font-family: Arial, Helvetica, sans-serif;
        line-height: 1.6;
        color: #4a5568;
        background-color: #f7fafc;
      }
    </style>
  </head>
  <body dir="{{direction}}" bgcolor="#f7fafc" style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #4a5568; background-color: #f7fafc; width: 100%;">
    <center style="width: 100%; background-color: #f7fafc; padding: 20px 0;">
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); margin: auto;">
        <tr>
          <td align="center" style="padding: 25px 0; background-color: #f8fafc; border-top: 4px solid #006eb8; border-radius: 8px 8px 0 0;">
            <!-- Logo placeholder -->
          </td>
        </tr>

        <tr>
          <td align="{{textAlign}}" style="padding: 40px 30px;">
            <h1 style="color: #2d3748; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center;">
              {{title}}
            </h1>
            <div style="height: 2px; background-color: #e0e0e0; margin: 0 auto 30px; width: 100px;"></div>
            
            <div style="color: #4a5568; font-size: 16px;">
              {{messageContent}}
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="{{actionUrl}}" style="background-color: #006eb8; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                {{actionLabel}}
              </a>
            </div>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding: 20px; background-color: #f8fafc; font-size: 12px; color: #718096; border-radius: 0 0 8px 8px;">
            <p style="margin-bottom: 5px;">
              &copy; {{year}} Aswaq.online. {{copyright}}
            </p>
            <p style="margin-top: 0;">
              {{automatedMessage}}
            </p>
          </td>
        </tr>
      </table>
    </center>
  </body>
</html>`; 
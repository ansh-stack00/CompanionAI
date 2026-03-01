import { Resend } from "resend";

const resend = new Resend("re_gTJdHPmQ_9y1ZF7FAd9v7ci26nQWSUyN4")

export async function sendWelcomeEmail( email ) {

    try {
        const response = await resend.emails.send({
            from: 'onboarding@shaadisnaps.in',
            to: email,
            subject: 'Welcome to Companion!',
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Welcome to Companion</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background-color:#0f172a;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:40px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h1 style="margin:0;font-size:28px;color:#111;">
                Welcome to Your AI Companion 🚀
              </h1>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="font-size:16px;color:#444;line-height:1.6;">
              <p>Hi ${email},</p>

              <p>
                You’ve just joined a new generation of personalized AI.
              </p>

              <p>
                Here, you don’t just chat with AI — you create your own <strong>Companion</strong>.
              </p>

              <!-- Feature List -->
              <div style="margin:25px 0;padding:20px;background:#f8fafc;border-radius:12px;">
                <p style="margin:0 0 10px 0;"><strong>With your Companion, you can:</strong></p>
                <ul style="padding-left:18px;margin:0;color:#555;">
                  <li>Create a unique personality & communication style</li>
                  <li>Build context-aware conversations with memory</li>
                  <li>Get help with productivity, learning & daily tasks</li>
                  <li>Share your companion with others</li>
                  <li>Experience AI that adapts to you</li>
                </ul>
              </div>

              <p>
                Your Companion learns your preferences, remembers important details, 
                and evolves with every conversation.
              </p>

              <!-- CTA -->
              <div style="text-align:center;margin:35px 0;">
                <a href="https://yourwebsite.com/dashboard"
                   style="background:linear-gradient(90deg,#6366f1,#8b5cf6);
                          color:#ffffff;
                          padding:14px 30px;
                          text-decoration:none;
                          border-radius:10px;
                          font-weight:bold;
                          display:inline-block;">
                  Build Your Companion
                </a>
              </div>

              <p>
                We’re excited to see what you create.
              </p>

              <p style="margin-top:30px;">
                — The Companion Team
              </p>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <p style="font-size:12px;color:#94a3b8;margin-top:20px;">
          © ${new Date().getFullYear()} Companion Platform. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`
        });

        console.log("Email sent successfully:", response);
    }
    catch (error) {
        console.log("Error sending email:", error);
    }
    
}
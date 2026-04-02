import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { generateCertificatePDF } from "@/lib/generate-certificate"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { name, email, courseTitle, completedAt, type } = await req.json()

    if (!name || !email || !courseTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // ── Fail email ────────────────────────────────────────────────────────────
    if (type === "fail") {
      await transporter.sendMail({
        from: `"Basecamp Digital" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `Did You Face Any Difficulty In Understanding The Course?`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">
          <tr>
            <td style="background:linear-gradient(135deg,#1a7a3c 0%,#22a94f 100%);padding:40px 48px 32px;text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px;letter-spacing:3px;text-transform:uppercase;font-weight:600;">Basecamp Digital</p>
            </td>
          </tr>
          <tr>
            <td style="padding:48px 48px 40px;">
              <p style="margin:0 0 20px;color:#333;font-size:16px;">Hello ${name},</p>
              <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.7;">
                I want to understand if you have faced any difficulty in understanding the course <strong>${courseTitle}</strong>, as you were not able to clear the quiz.
              </p>
              <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.7;">
                If you have any doubt or you are not able to understand any topic, please feel free to ask me through email or Instagram.
              </p>
              <p style="margin:0 0 40px;color:#555;font-size:15px;line-height:1.7;">
                Digital marketing is one of the top 10 demanding jobs on LinkedIn. I want you to understand the course and give another attempt to clear the quiz.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-top:24px;border-top:1px solid #e8e8e8;">
                    <p style="margin:0 0 4px;color:#555;font-size:14px;">Regards,</p>
                    <p style="margin:0;font-weight:700;color:#1a1a1a;font-size:14px;">Pritesh Patel</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#1a1a1a;padding:24px 48px;text-align:center;">
              <p style="margin:0 0 4px;color:#aaa;font-size:12px;">© 2026 Basecamp Digital. All Rights Reserved.</p>
              <p style="margin:0;color:#666;font-size:12px;">basecampdigital.co</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      })
      return NextResponse.json({ success: true })
    }

    // ── Pass / certificate email ───────────────────────────────────────────────
    const certCompletedAt = completedAt || new Date().toISOString()

    // Generate the certificate PDF
    const pdfBuffer = await generateCertificatePDF(name, courseTitle, certCompletedAt)

    const date = new Date(certCompletedAt).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    })

    const safeName = name.replace(/[^a-z0-9_\-]/gi, "_")
    const pdfFilename = `${safeName}-Certificate-Basecamp-Digital.pdf`

    await transporter.sendMail({
      from: `"Basecamp Digital" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `You Have Successfully Completed The Quiz`,
      attachments: [
        {
          filename: pdfFilename,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- Certificate card -->
          <tr>
            <td style="padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:linear-gradient(160deg,#e8faf3 0%,#ffffff 60%);border:2px solid #45c9a0;border-radius:10px;overflow:hidden;">

                <!-- Top accent bar -->
                <tr>
                  <td style="background:linear-gradient(90deg,#45c9a0,#22a94f);height:6px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>

                <!-- Logo row -->
                <tr>
                  <td align="center" style="padding:28px 40px 16px;">
                    <p style="margin:0;font-size:18px;font-weight:900;color:#1a7a3c;letter-spacing:3px;text-transform:uppercase;line-height:1.1;">BASECAMP &#9654; DIGITAL</p>
                  </td>
                </tr>

                <!-- Title -->
                <tr>
                  <td align="center" style="padding:0 40px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-top:1px solid #d0f0e0;border-bottom:1px solid #d0f0e0;padding:10px 0;text-align:center;">
                          <p style="margin:0;font-size:20px;font-weight:900;letter-spacing:4px;color:#1a1a1a;text-transform:uppercase;">CERTIFICATE OF COMPLETION</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Certifies + name -->
                <tr>
                  <td align="center" style="padding:0 40px 16px;">
                    <p style="margin:0 0 10px;font-size:13px;color:#777;font-style:italic;">This certifies that</p>
                    <p style="margin:0;font-size:36px;font-weight:900;color:#1a1a1a;line-height:1.1;">${name}</p>
                  </td>
                </tr>

                <!-- Course -->
                <tr>
                  <td align="center" style="padding:0 40px 8px;">
                    <p style="margin:0 0 4px;font-size:13px;color:#666;font-style:italic;">Has completed the</p>
                    <p style="margin:0;font-size:15px;color:#444;font-style:italic;line-height:1.5;">${courseTitle}</p>
                  </td>
                </tr>

                <!-- Date -->
                <tr>
                  <td align="center" style="padding:12px 40px 24px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#888;font-style:italic;">on</p>
                    <p style="margin:0;font-size:18px;font-weight:700;color:#1a1a1a;">${date}</p>
                  </td>
                </tr>

                <!-- Signature row -->
                <tr>
                  <td align="center" style="padding:0 40px 28px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:16px;font-size:44px;vertical-align:middle;">🏅</td>
                        <td style="text-align:center;vertical-align:middle;">
                          <p style="margin:0;font-size:20px;font-style:italic;color:#333;font-family:Georgia,serif;">Pritesh Patel</p>
                          <p style="margin:2px 0 0;font-size:12px;font-weight:700;color:#1a1a1a;">Pritesh Patel</p>
                          <p style="margin:1px 0 0;font-size:11px;color:#888;font-style:italic;">Head Coach Basecamp Digital</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Bottom accent bar -->
                <tr>
                  <td style="background:linear-gradient(90deg,#45c9a0,#22a94f);height:6px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Congratulations message -->
          <tr>
            <td style="padding:32px 48px 24px;">
              <p style="margin:0 0 16px;color:#333;font-size:15px;">Dear ${name},</p>
              <p style="margin:0 0 14px;color:#555;font-size:14px;line-height:1.7;">
                Congratulations, you have successfully passed the quiz.
              </p>
              <p style="margin:0 0 28px;color:#555;font-size:14px;line-height:1.7;">
                I am glad that you have extracted good knowledge from the course and successfully passed the quiz. If you are planning to understand the digital marketing industry completely, go ahead and try other courses.
              </p>
              <p style="margin:0 0 4px;color:#555;font-size:14px;">Regards,</p>
              <p style="margin:0;font-weight:700;color:#1a1a1a;font-size:14px;">Pritesh Patel</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1a1a;padding:20px 48px;text-align:center;">
              <p style="margin:0 0 3px;color:#aaa;font-size:11px;">© 2026 Basecamp Digital. All Rights Reserved.</p>
              <p style="margin:0;color:#666;font-size:11px;">basecampdigital.co</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Certificate send error:", err)
    return NextResponse.json({ error: "Failed to send certificate" }, { status: 500 })
  }
}

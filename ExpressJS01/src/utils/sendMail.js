import nodemailer from "nodemailer";

/**
 * Send email via SMTP. SMTP config is read from environment variables.
 * Defaults to Gmail SMTP host and port 465 with secure connection.
 * To use port 587 (STARTTLS) set EMAIL_PORT=587 and EMAIL_SECURE=false.
 */
const sendMail = async (to, subject, html) => {
  try {
    const host = process.env.EMAIL_HOST ?? "smtp.gmail.com";
    const port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 465;
    // if port is 465 we use secure=true (implicit TLS), otherwise starttls (secure=false)
    const secure = process.env.EMAIL_SECURE
      ? process.env.EMAIL_SECURE === "true"
      : port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // For port 587 we use STARTTLS. Allow TLS options via env if needed.
      tls: {
        rejectUnauthorized:
          process.env.EMAIL_TLS_REJECT_UNAUTHORIZED === "false" ? false : true,
      },
    });

    await transporter.sendMail({
      from: `"FullStack App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(">>> Email sent success!");
  } catch (error) {
    console.log(">>> SEND EMAIL ERROR:", error);
    throw error; // rethrow so callers (controllers) can surface failures
  }
};

export default sendMail;
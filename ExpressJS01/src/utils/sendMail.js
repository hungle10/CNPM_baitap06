import nodemailer from "nodemailer";

const sendMail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER, // Gmail
        pass: process.env.EMAIL_PASSWORD, // App password
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
  }
};

export default sendMail;

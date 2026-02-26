import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // 1. Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // Use true for port 465, false for port 587
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  // 2. Define email options
  const mailOptions = {
    from: '"Dhiraj G." <gdhiraj030@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html, // Optional: if you want to send formatted HTML
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;

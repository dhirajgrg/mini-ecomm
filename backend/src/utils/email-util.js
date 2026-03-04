import nodemailer from "nodemailer";
import { convert } from "html-to-text"; // Note: Modern version uses { convert }
import pug from "pug";
import path from "path";
import { fileURLToPath } from "url";

// Necessary for ES Modules to handle __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Dhiraj <${process.env.EMAIL_FROM}>`;
  }

  newTransporter() {
    if (process.env.NODE_ENV === "production") {
      // For production, Jonas usually uses SendGrid
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(
      // Go up from src/utils -> src -> backend, then into views/email
      path.join(__dirname, "..", "..", "views", "email", `${template}.pug`),
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      // FIX: Changed 'subject' to 'text' for the plain-text version
      text: convert(html),
    };

    // 3) Create a transporter and send email
    await this.newTransporter().sendMail(mailOptions);
  }

  async sendWelcome() {
    // Matches the filename welcome.pug
    await this.send("welcome", "Welcome to Hamro Mart!");
  }
}

export default Email;

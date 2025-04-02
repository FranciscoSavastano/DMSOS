import 'dotenv/config'
import nodemailer from 'nodemailer'

interface SendEmailProps {
  to: string;
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  message: string;
  html?: string;
  attachments?: { 
    filename: string;
    content?: string | Buffer;
    encoding?: string;
    contentType?: string;
    path?: string;
  }[];
}

export async function sendEmail({ 
  to, 
  cc,
  bcc,
  subject, 
  message, 
  html, 
  attachments 
}: SendEmailProps) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  const emailOptions = {
    from: `"DMSYS" <dmsys@nao-responda.com>`,
    to,
    cc,
    bcc,
    subject,
    text: message,
    html,
    attachments
  }

  const email = await transporter.sendMail(emailOptions)
  return email
}
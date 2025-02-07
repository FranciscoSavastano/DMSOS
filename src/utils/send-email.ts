import 'dotenv/config'
import nodemailer from 'nodemailer'

interface SendEmailProps {
  to: string
  subject: string
  message: string
  html?: string
}

export async function sendEmail({
  to,
  subject,
  message,
  html,
}: SendEmailProps) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: message,
    html,
  }
  console.log('Sending')
  const email = await transporter.sendMail(emailOptions)
  console.log(email)
  return
}

import { User } from "@prisma/client"
import Mailgun from "mailgun.js"

import { verificationCodeMail } from "./verficationCode.mail"

const key = process.env.MAILGUN_API_KEY!
const domain = process.env.MAILGUN_DOMAIN!
const sender = process.env.MAILGUN_SENDER_EMAIL!

export async function sendVerificationCode(
  user: User,
  code: string,
  cb: () => void
) {
  const mailgun = new Mailgun(FormData)
  const mg = mailgun.client({
    username: "api",
    key,
    url: `https://api.eu.mailgun.net/`,
  })
  try {
    await mg.messages.create(domain, {
      from: `React Application <${sender}>`,
      to: [`${user.name} <${user.email}>`],
      subject: "Your verification code",
      html: verificationCodeMail(code),
    })
    cb()
  } catch (error) {
    console.debug(error)
  }
}

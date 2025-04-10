import { User } from "@prisma/client"
import Mailgun from "mailgun.js"

import { resetPasswordMail } from "./forgotPassword.mail"

const key = process.env.MAILGUN_API_KEY!
const domain = process.env.MAILGUN_DOMAIN!
const sender = process.env.MAILGUN_SENDER_EMAIL!

export const sendResetLink = async (
  user: User,
  token: string,
  cb: () => void
) => {
  const link = createLink(token)
  await sendResetLinkMail(user, link, cb)
}

export const createLink = (token: string) => {
  return (
    process.env.FRONTEND_URL! +
    `/auth/forgot-password?token=${encodeURIComponent(token)}`
  )
}

export async function sendResetLinkMail(
  user: User,
  link: string,
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
      subject: "Passwort zurücksetzen",
      html: resetPasswordMail(link),
    })
    cb()
  } catch (error) {
    console.debug(error)
  }
}

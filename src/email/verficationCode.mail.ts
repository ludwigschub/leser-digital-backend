export const verificationCodeMail = (code: string) => {
  const mail = `
    <html>
      <head>
        <title>Verification Code</title>
      </head>
      <body>
        <h1>Verification Code</h1>
        <p>Your verification code is: <strong>${code}</strong></p>
      </body>
    </html>
  `
  return mail
}
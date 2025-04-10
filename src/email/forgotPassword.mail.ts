export const resetPasswordMail = (link: string) => {
  const mail = `
    <html>
      <head>
        <title>Passwort zurücksetzen</title>
      </head>
      <body>
        <h1>Passwort zurücksetzen</h1>
        <p>Klicke <a href="${link}">diesen Link</a> um dein Passwort zurückzusetzen.</p>
      </body>
    </html>
  `
  return mail
}
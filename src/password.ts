export const hashPassword = async (password: string) => {
  const passwordHash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password)
  )
  return Buffer.from(passwordHash).toString("base64")
}

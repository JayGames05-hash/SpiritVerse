import webpush from 'web-push'

const DEFAULT_VAPID_PUBLIC_KEY = 'BC0uCTmfk749BdaneDk61m4pLDnQqUCe45hK0otJbShvRZ9q7Gc-8UO_6wKjKS4BfI2jZxoP5KM9AhO7LQ5wmk4'
const DEFAULT_VAPID_PRIVATE_KEY = 'uG9wtECX2zzoI-JvfKOqO2V4J_PX4QAkgV2Hd5sLqR8'
const DEFAULT_VAPID_EMAIL = 'mailto:admin@coptic-daily-readings.app'

export function getVapidKeys() {
  return {
    publicKey: process.env.VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE_KEY,
  }
}

export function setupWebPush() {
  const { publicKey, privateKey } = getVapidKeys()
  webpush.setVapidDetails(DEFAULT_VAPID_EMAIL, publicKey, privateKey)
  return { publicKey, privateKey }
}

export function generateVapidKeys() {
  return webpush.generateVAPIDKeys()
}

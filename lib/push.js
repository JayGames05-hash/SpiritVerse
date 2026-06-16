import webpush from 'web-push'

const DEFAULT_VAPID_PUBLIC_KEY = 'BJOINIQx7uWiWOziFQiExPjPtAokZgi31KDNSvbGb6JdiDndjs4qLpiHOX2y8h1z5JqSFCneV9DvsSg0amIjEjQ'
const DEFAULT_VAPID_PRIVATE_KEY = 'mSUzWr1D3m5kdBuvpKbkYcsx4ep9zKxYxDqO0M2K6Po'
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

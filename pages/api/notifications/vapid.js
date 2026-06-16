import { getVapidKeys } from '../../../lib/push'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { publicKey } = getVapidKeys()
  return res.status(200).json({ publicKey })
}

import { getVapidKeys } from '../../../../lib/push'

export default function handler(req, res) {
  const { publicKey } = getVapidKeys()
  res.status(200).json({ publicKey })
}

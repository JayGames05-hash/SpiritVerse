const sharp = require('sharp')
const path = require('path')

const publicDir = path.join(__dirname, '..', 'public')
const input = path.join(publicDir, 'logo.png')
const out192 = path.join(publicDir, 'logo-192.png')
const out512 = path.join(publicDir, 'logo-512.png')

async function gen() {
  try {
    await sharp(input)
      .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(out192)

    await sharp(input)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(out512)

    console.log('Generated icons:', out192, out512)
  } catch (err) {
    console.error('Icon generation failed:', err)
    process.exit(1)
  }
}

gen()

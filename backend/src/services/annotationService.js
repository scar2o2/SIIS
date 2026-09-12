const sharp = require('sharp')

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function createAnnotatedImage({ buffer, image, detections }) {
  const labels = detections.map((detection, index) => {
    const { x1, y1, x2, y2 } = detection.bounding_box
    const color = detection.issue_type === 'road_crack' ? '#d47a17' : '#1463d8'
    const label = `${index + 1}. ${detection.issue_type} ${Math.round(detection.confidence * 100)}%`
    const labelWidth = Math.max(140, label.length * 8 + 16)
    const labelY = Math.max(20, y1)
    return `
      <rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}"
        fill="${color}" fill-opacity="0.14" stroke="${color}" stroke-width="4"/>
      <rect x="${x1}" y="${labelY - 20}" width="${labelWidth}" height="20"
        fill="${color}"/>
      <text x="${x1 + 8}" y="${labelY - 6}" fill="#ffffff"
        font-family="Arial, sans-serif" font-size="13">${escapeXml(label)}</text>
    `
  }).join('')

  const overlay = Buffer.from(`
    <svg width="${image.width}" height="${image.height}" xmlns="http://www.w3.org/2000/svg">
      ${labels}
    </svg>
  `)

  return sharp(buffer)
    .composite([{ input: overlay }])
    .png()
    .toBuffer()
}

module.exports = {
  createAnnotatedImage,
}

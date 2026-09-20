const nodemailer = require('nodemailer')

const recipient = process.env.EMAIL_TO || 'manojcherukuri202@gmail.com'

function createTransporter() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD) {
    return null
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number.parseInt(EMAIL_PORT, 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  })
}

async function notifyNewIssue({
  reportId,
  issueTypes,
  severity,
  priority,
  latitude,
  longitude,
  detectionCount,
  duplicate,
  reporter,
  annotatedImage,
}) {
  const transporter = createTransporter()
  if (!transporter) {
    console.warn('Email notification skipped: SMTP environment variables are not configured.')
    return { sent: false, configured: false }
  }

  const reporterName = reporter?.name?.trim() || 'Unknown'
  const reporterEmail = reporter?.email?.trim() || 'Unknown'
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: recipient,
    subject: `Smart Infrastructure Issue Detected - ${severity}`,
    html: `
      <h2>New infrastructure issue detected</h2>
      <p><strong>Report ID:</strong> ${reportId}</p>
      <h3>Submitted by</h3>
      <p><strong>Name:</strong> ${reporterName}<br>
      <strong>Email:</strong> ${reporterEmail}</p>
      <p><strong>Issue type(s):</strong> ${issueTypes.join(', ') || 'No detected issue'}</p>
      <p><strong>Severity:</strong> ${severity}<br>
      <strong>Priority:</strong> ${priority}<br>
      <strong>Detection count:</strong> ${detectionCount}<br>
      <strong>Duplicate group match:</strong> ${duplicate ? 'Yes' : 'No'}</p>
      <p><strong>Location:</strong> ${latitude}, ${longitude}</p>
      <p><a href="${mapUrl}">Open location in Google Maps</a></p>
      <p>The annotated evidence image is attached to this email.</p>
    `,
    text: [
      'New infrastructure issue detected.',
      `Report ID: ${reportId}`,
      'Submitted by:',
      `Name: ${reporterName}`,
      `Email: ${reporterEmail}`,
      `Issue Type(s): ${issueTypes.join(', ') || 'No detected issue'}`,
      `Severity: ${severity}`,
      `Priority: ${priority}`,
      `Latitude: ${latitude}`,
      `Longitude: ${longitude}`,
      `Detection Count: ${detectionCount}`,
      `Duplicate group match: ${duplicate ? 'Yes' : 'No'}`,
      `Google Maps: ${mapUrl}`,
      `Reported At: ${new Date().toISOString()}`,
      'Status: SUBMITTED',
    ].join('\n'),
    attachments: annotatedImage
      ? [{ filename: `report-${reportId}-annotated.png`, content: annotatedImage, contentType: 'image/png' }]
      : [],
  })

  return { sent: true, configured: true }
}

module.exports = {
  notifyNewIssue,
}

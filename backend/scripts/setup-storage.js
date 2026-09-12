const { ensureReportsBucket } = require('../src/storage')

ensureReportsBucket()
  .then(({ bucketName, created }) => {
    console.log(
      `Supabase Storage bucket "${bucketName}" is ready (${created ? 'created' : 'already existed'}).`
    )
  })
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })

const { supabase } = require('./db')

const REPORTS_BUCKET = 'infrastructure-reports'

async function ensureReportsBucket() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  if (listError) {
    throw new Error(`Unable to list Supabase Storage buckets: ${listError.message}`)
  }

  if (buckets.some((bucket) => bucket.name === REPORTS_BUCKET)) {
    return { bucketName: REPORTS_BUCKET, created: false }
  }

  const { error: createError } = await supabase.storage.createBucket(REPORTS_BUCKET, {
    public: false,
    fileSizeLimit: '10MB',
    allowedMimeTypes: ['image/jpeg', 'image/png'],
  })
  if (createError) {
    throw new Error(`Unable to create Supabase Storage bucket: ${createError.message}`)
  }

  return { bucketName: REPORTS_BUCKET, created: true }
}

module.exports = {
  REPORTS_BUCKET,
  ensureReportsBucket,
}

import { useEffect, useMemo, useState } from 'react'
import DetectionOverlay from '../components/DetectionOverlay'
import DetectionResult from '../components/DetectionResult'
import ImagePreview from '../components/ImagePreview'
import ImageUploader from '../components/ImageUploader'
import { createReport, predictImage } from '../services/aiService'
import { validateImage } from '../utils/imageUtils'
import '../App.css'

function DetectionPage() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingReport, setIsSavingReport] = useState(false)
  const [reportMessage, setReportMessage] = useState('')
  const [error, setError] = useState('')

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  useEffect(() => {
    if (!file) {
      return undefined
    }

    return () => URL.revokeObjectURL(previewUrl)
  }, [file, previewUrl])

  function handleFileSelected(nextFile) {
    const validationError = validateImage(nextFile)
    setError(validationError || '')
    setResult(null)
    setReportMessage('')
    setFile(validationError ? null : nextFile)
  }

  async function handleAnalyze() {
    const validationError = validateImage(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setReportMessage('')
    setIsLoading(true)
    try {
      setResult(await predictImage(file))
    } catch (requestError) {
      setError(requestError.message)
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  function handleReset() {
    setFile(null)
    setResult(null)
    setError('')
    setReportMessage('')
  }

  function handleSaveReport() {
    if (!file || !result || isSavingReport) {
      return
    }

    if (!navigator.geolocation) {
      setReportMessage('Location is unavailable in this browser. The report was not saved.')
      return
    }

    setError('')
    setReportMessage('Requesting your current location...')
    setIsSavingReport(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await createReport({
            file,
            latitude: coords.latitude,
            longitude: coords.longitude,
          })
          setReportMessage('Report saved successfully with the current device location.')
        } catch (requestError) {
          setReportMessage(requestError.message)
        } finally {
          setIsSavingReport(false)
        }
      },
      () => {
        setReportMessage('Location permission is required to save this report.')
        setIsSavingReport(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">SI</span>
            <span className="brand-name">Smart Infrastructure Intelligence System</span>
          </div>
          <div className="service-status">
            <span className="status-dot" aria-hidden="true" />
            Phase 1 detection
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="intro">
          <p className="eyebrow">AI road issue detection</p>
          <h1>Understand road conditions from one image.</h1>
          <p className="intro-copy">
            Upload a road image and run the trained pothole and road-crack models
            together. Results include confidence values and precise bounding boxes.
          </p>
        </section>

        <div className="workspace">
          <section className="panel upload-panel">
            <h2 className="panel-title">Upload image</h2>
            <p className="panel-description">Use a clear image of the road surface.</p>
            <ImageUploader onFileSelected={handleFileSelected} />
            <ImagePreview file={file} previewUrl={previewUrl} />
            <div className="action-row">
              <button
                className="button button-primary"
                type="button"
                disabled={!file || isLoading}
                onClick={handleAnalyze}
              >
                {isLoading ? 'Analyzing image...' : 'Analyze image'}
              </button>
              {file && (
                <button className="button button-secondary" type="button" onClick={handleReset}>
                  Choose another
                </button>
              )}
            </div>
            {error && <p className="message message-error">{error}</p>}
          </section>

          <section className="panel results-panel">
            <div className="results-header">
              <h2 className="panel-title">Detection results</h2>
              {result && (
                <span className="result-count">
                  {result.detections.length} {result.detections.length === 1 ? 'issue' : 'issues'}
                </span>
              )}
            </div>
            <DetectionResult result={result} />
            {result && result.detections.length > 0 && (
              <div className="result-image-wrap">
                <p className="result-image-label">Annotated image</p>
                <DetectionOverlay
                  imageUrl={previewUrl}
                  image={result.image}
                  detections={result.detections}
                />
              </div>
            )}
            {result && (
              <button
                className="button button-primary report-button"
                type="button"
                disabled={isSavingReport}
                onClick={handleSaveReport}
              >
                {isSavingReport ? 'Saving report...' : 'Save report with current location'}
              </button>
            )}
            {reportMessage && <p className="message report-message">{reportMessage}</p>}
          </section>
        </div>
      </main>
    </div>
  )
}

export default DetectionPage

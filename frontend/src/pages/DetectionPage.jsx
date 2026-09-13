import { useEffect, useMemo, useState } from 'react'
import DetectionOverlay from '../components/DetectionOverlay'
import DetectionResult from '../components/DetectionResult'
import ImagePreview from '../components/ImagePreview'
import ImageUploader from '../components/ImageUploader'
import ReportMap from '../components/ReportMap'
import SiteHeader from '../components/SiteHeader'
import { createReport, predictImage } from '../services/aiService'
import { validateImage } from '../utils/imageUtils'
import '../App.css'

function DetectionPage() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingReport, setIsSavingReport] = useState(false)
  const [reportMessage, setReportMessage] = useState('')
  const [savedReport, setSavedReport] = useState(null)
  const [error, setError] = useState('')
  const [description, setDescription] = useState('')

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
    setSavedReport(null)
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
    setSavedReport(null)
    setDescription('')
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
          const report = await createReport({
            file,
            latitude: coords.latitude,
            longitude: coords.longitude,
            description,
          })
          setSavedReport(report)
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
      <SiteHeader />

      <main className="main-content">
        <section className="intro">
          <p className="eyebrow">Citizen report</p>
          <h1>Report an Infrastructure Issue</h1>
          <p className="intro-copy">
            Upload a clear road image, add context, and submit it with your current location after AI analysis.
          </p>
        </section>

        <div className="workspace">
          <section className="panel upload-panel">
            <h2 className="panel-title">Upload image</h2>
            <p className="panel-description">Use a clear image of the road surface.</p>
            <ImageUploader onFileSelected={handleFileSelected} />
            <ImagePreview file={file} previewUrl={previewUrl} />
            <label className="field-block">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows="4"
                placeholder="Road name, landmark, lane direction, or safety context"
              />
            </label>
            <div className="action-row">
              <button
                className="button button-primary"
                type="button"
                disabled={!file || isLoading}
                onClick={handleAnalyze}
              >
                {isLoading ? 'Analyzing image...' : 'Analyze Image'}
              </button>
              {file && (
                <button className="button button-secondary" type="button" onClick={handleReset}>
                  Choose Another
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
                {isSavingReport ? 'Saving report...' : 'Submit Report with Current Location'}
              </button>
            )}
            {reportMessage && <p className="message report-message">{reportMessage}</p>}
            {savedReport && (
              <div className="report-summary">
                <strong>Report saved</strong>
                <span>Status: {savedReport.status || 'SUBMITTED'}</span>
                <span>Severity: {savedReport.severity}</span>
                <span>Priority: {savedReport.priority}</span>
                <span>Issue groups: {savedReport.issue_group_ids?.length || 0}</span>
                <span>{savedReport.duplicate ? 'Associated with an existing issue group.' : 'New issue group created.'}</span>
                <ReportMap latitude={savedReport.latitude} longitude={savedReport.longitude} />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default DetectionPage

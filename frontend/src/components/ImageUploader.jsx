function ImageUploader({
  onFileSelected,
  onCapture,
  isCapturing,
  showCapture,
  showUpload,
}) {
  return (
    <>
      {showCapture && (
        <button
          className="button button-primary"
          type="button"
          onClick={onCapture}
          disabled={isCapturing}
        >
          <svg className="button-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8.5 5 10 3h4l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3.5Z" />
            <circle cx="12" cy="12" r="3.5" />
          </svg>
          {isCapturing ? 'Opening camera...' : 'Capture Image'}
        </button>
      )}
      {showUpload && (
        <label className="drop-zone">
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(event) => onFileSelected(event.target.files?.[0] || null)}
          />
          <span>
            <span className="upload-icon" aria-hidden="true">UP</span>
            <span className="drop-title">Upload an image in the browser</span>
            <span className="drop-help">JPG, JPEG, or PNG up to 10 MB</span>
          </span>
        </label>
      )}
    </>
  )
}

export default ImageUploader

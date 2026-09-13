function ImageUploader({ onFileSelected }) {
  return (
    <label className="drop-zone">
      <input
        type="file"
        accept="image/jpeg,image/png"
        onChange={(event) => onFileSelected(event.target.files?.[0] || null)}
      />
      <span>
        <span className="upload-icon" aria-hidden="true">UP</span>
        <span className="drop-title">Upload or capture road image</span>
        <span className="drop-help">JPG, JPEG, or PNG up to 10 MB</span>
      </span>
    </label>
  )
}

export default ImageUploader

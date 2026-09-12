function ImagePreview({ file, previewUrl }) {
  if (!file || !previewUrl) {
    return null
  }

  return (
    <div className="preview-wrap">
      <img className="preview-image" src={previewUrl} alt="Selected road preview" />
      <p className="file-name">{file.name}</p>
    </div>
  )
}

export default ImagePreview

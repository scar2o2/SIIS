import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

function ReportMap({ latitude, longitude }) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

  return (
    <>
      <div className="report-map">
        <MapContainer center={[latitude, longitude]} zoom={17} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]}>
            <Popup>Reported infrastructure issue</Popup>
          </Marker>
        </MapContainer>
      </div>
      <a
        className="map-link"
        href={googleMapsUrl}
        target="_blank"
        rel="noreferrer"
      >
        Open location in Google Maps
      </a>
    </>
  )
}

export default ReportMap

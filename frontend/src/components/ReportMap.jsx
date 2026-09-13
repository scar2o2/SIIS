import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { configureLeafletIcon } from '../utils/leafletIcon'

function ReportMap({ latitude, longitude }) {
  configureLeafletIcon()

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
  const position = [Number(latitude), Number(longitude)]

  return (
    <>
      <div className="report-map">
        <MapContainer center={position} zoom={17} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
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

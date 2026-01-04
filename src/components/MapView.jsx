import React, { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from 'react-leaflet'
import L from 'leaflet'

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export default function MapView({ drones, paths, selectedId, onSelect }) {
  const center = useMemo(() => {
    if (drones.length === 0) return [39.9208, 32.8541] // Ankara fallback
    const valid = drones.filter(d => Number.isFinite(d.lat) && Number.isFinite(d.lng))
    if (valid.length === 0) return [39.9208, 32.8541]
    const avgLat = valid.reduce((s, d) => s + d.lat, 0) / valid.length
    const avgLng = valid.reduce((s, d) => s + d.lng, 0) / valid.length
    return [avgLat, avgLng]
  }, [drones])

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={6} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {drones.map(d => (
          <React.Fragment key={d.id}>
            {paths?.[d.id]?.length > 1 && (
              <Polyline positions={paths[d.id]} pathOptions={{ color: '#47b2ff', weight: 3, opacity: 0.7 }} />
            )}
            <Marker
              position={[d.lat, d.lng]}
              icon={defaultIcon}
              eventHandlers={{ click: () => onSelect(d.id) }}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <strong>{d.name}</strong>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{d.id}</div>
                  <div style={{ marginTop: 6, fontSize: 12 }}>Durum: {d.status}</div>
                  <div style={{ fontSize: 12 }}>Hız: {Number(d.speed || 0).toFixed(1)} km/h</div>
                  <div style={{ fontSize: 12 }}>
                    İrtifa: {Number.isFinite(d.absoluteAltitude) 
                      ? `${d.absoluteAltitude.toFixed(1)} m` 
                      : `${Number(d.altitude || 0).toFixed(1)} m`}
                  </div>
                  {Number.isFinite(d.relativeAltitude) && (
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      Bağıl: {d.relativeAltitude.toFixed(1)} m
                    </div>
                  )}
                  <div style={{ fontSize: 12 }}>Batarya: {Math.round((d.battery || 0) * 100)}%</div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
        {selectedId && (() => {
          const d = drones.find(x => x.id === selectedId)
          if (!d) return null
          return (
            <>
              <CircleMarker
                center={[d.lat, d.lng]}
                radius={24}
                pathOptions={{ color: '#47b2ff', opacity: 0.6 }}
              />
              {/* Home Point Marker */}
              {d.homeLat && d.homeLng && (
                <Marker
                  position={[d.homeLat, d.homeLng]}
                  icon={new L.Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                    iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  })}
                >
                  <Popup>
                    <div style={{ minWidth: 160 }}>
                      <strong>🏠 Home Point</strong>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>{d.name}</div>
                      <div style={{ marginTop: 6, fontSize: 12 }}>
                        Konum: {d.homeLat.toFixed(5)}, {d.homeLng.toFixed(5)}
                      </div>
                      {Number.isFinite(d.homeAltitude) && (
                        <div style={{ fontSize: 12 }}>
                          İrtifa: {d.homeAltitude.toFixed(1)} m
                        </div>
                      )}
                      <div style={{ marginTop: 6, fontSize: 11, opacity: 0.7, fontStyle: 'italic' }}>
                        Referans noktası (ilk konum)
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
            </>
          )
        })()}
      </MapContainer>
    </div>
  )
}
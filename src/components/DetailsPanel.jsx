import React from 'react'

export default function DetailsPanel({ drone }) {
  if (!drone) {
    return <div className="details-body" style={{ color: 'var(--muted)' }}>Bir drone seçiniz.</div>
  }

  const latText = Number.isFinite(drone.lat) ? drone.lat.toFixed(5) : '—'
  const lngText = Number.isFinite(drone.lng) ? drone.lng.toFixed(5) : '—'
  const speedText = Number.isFinite(drone.speed) ? `${drone.speed.toFixed(1)} km/h` : '—'
  const altText = Number.isFinite(drone.absoluteAltitude) 
    ? `${drone.absoluteAltitude.toFixed(1)} m` 
    : (Number.isFinite(drone.altitude) ? `${drone.altitude.toFixed(1)} m` : '—')
  const relativeAltText = Number.isFinite(drone.relativeAltitude) 
    ? `${drone.relativeAltitude.toFixed(1)} m` 
    : '—'
  const homeAltText = Number.isFinite(drone.homeAltitude) 
    ? `${drone.homeAltitude.toFixed(1)} m` 
    : '—'
  const battText = Number.isFinite(drone.battery) ? `${Math.round(drone.battery * 100)}%` : '—'
  const headingText = Number.isFinite(drone.heading) ? `${drone.heading.toFixed(0)}°` : '—'

  return (
    <div className="details-body">
      <div className="kv"><div className="k">Ad</div><div className="v">{drone.name}</div></div>
      <div className="kv"><div className="k">ID</div><div className="v">{drone.id}</div></div>
      <div className="kv"><div className="k">Durum</div><div className="v">{drone.status}</div></div>
      <div className="kv"><div className="k">Konum</div><div className="v">{latText}, {lngText}</div></div>
      <div className="kv"><div className="k">Hız (Hesaplanmış)</div><div className="v">{speedText}</div></div>
      <div className="kv"><div className="k">İrtifa (Mutlak)</div><div className="v">{altText}</div></div>
      <div className="kv"><div className="k">İrtifa (Bağıl)</div><div className="v">{relativeAltText}</div></div>
      {Number.isFinite(drone.homeAltitude) && (
        <>
          <div className="kv"><div className="k">Home Altitude</div><div className="v">{homeAltText}</div></div>
          {drone.homeLat && drone.homeLng && (
            <div className="kv">
              <div className="k">Home Point</div>
              <div className="v" style={{ fontSize: '0.85em' }}>
                {drone.homeLat.toFixed(5)}, {drone.homeLng.toFixed(5)}
              </div>
            </div>
          )}
          <div style={{ marginTop: 8, padding: 8, background: 'var(--bg-secondary)', borderRadius: 4, fontSize: '0.85em', opacity: 0.8 }}>
            💡 <strong>Referans Noktası:</strong> İlk GPS verisinin geldiği konum. Tüm irtifa hesaplamaları bu noktaya göre yapılır.
          </div>
        </>
      )}
      <div className="kv"><div className="k">Batarya</div><div className="v">{battText}</div></div>
      <div className="kv"><div className="k">Yön</div><div className="v">{headingText}</div></div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button>Takip Et</button>
        <button>Rota Göster</button>
        <button className="primary">Komut Gönder</button>
      </div>
    </div>
  )
}
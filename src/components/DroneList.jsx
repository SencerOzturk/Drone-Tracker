import React from 'react'

function StatusBadge({ status }) {
  const cls = status === 'online' ? 'badge online'
    : status === 'alert' ? 'badge alert'
    : status === 'idle' ? 'badge idle'
    : 'badge'
  const text = status === 'online' ? 'Aktif' : status === 'idle' ? 'Beklemede' : status === 'alert' ? 'Uyarı' : status
  return <span className={cls}>{text}</span>
}

export default function DroneList({ drones, selectedId, onSelect }) {
  return (
    <>
      <div className="section-header" style={{ borderTop: '1px solid var(--border)' }}>
        <strong>Dronelar</strong>
        <span style={{ color: 'var(--muted)', fontSize: 12 }}>{drones.length}</span>
      </div>
      <div className="list">
        {drones.map(d => (
          <div
            key={d.id}
            className="list-item"
            onClick={() => onSelect(d.id)}
            style={selectedId === d.id ? { borderColor: 'var(--accent)' } : undefined}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{d.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{d.id}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <StatusBadge status={d.status} />
            </div>
          </div>
        ))}
        {drones.length === 0 && <div style={{ color: 'var(--muted)', padding: 12 }}>Kayıt bulunamadı.</div>}
      </div>
    </>
  )
}
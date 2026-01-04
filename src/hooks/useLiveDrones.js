import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'

// Tüm canlı veri artık Socket.io + gerçek backend'den gelir.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

const normalizeTelemetry = (payload) => {
  if (!payload) return null
  const droneId = payload.droneId || payload.id
  if (!droneId) return null

  const lat = Number(payload.latitude ?? payload.lat)
  const lng = Number(payload.longitude ?? payload.lng)

  // Hız: calculatedSpeed varsa onu kullan, yoksa raw speed'i km/h'ye çevir
  const speed = payload.calculatedSpeed !== undefined && payload.calculatedSpeed !== null
    ? Number(payload.calculatedSpeed) // km/h (zaten hesaplanmış)
    : (payload.speed ? Number(payload.speed) * 3.6 : 0) // m/s'yi km/h'ye çevir

  // İrtifa: absoluteAltitude varsa onu kullan, yoksa altitude'ı kullan
  const altitude = payload.absoluteAltitude !== undefined && payload.absoluteAltitude !== null
    ? Number(payload.absoluteAltitude)
    : (payload.altitude !== undefined && payload.altitude !== null ? Number(payload.altitude) : 0)

  // Home point koordinatlarını sakla (ilk veri geldiğinde)
  const homeLat = payload.homeLatitude !== undefined ? Number(payload.homeLatitude) : null
  const homeLng = payload.homeLongitude !== undefined ? Number(payload.homeLongitude) : null

  return {
    id: String(droneId),
    name: payload.name || `Drone-${droneId}`,
    status: payload.status || 'online',
    lat: Number.isFinite(lat) ? lat : 0,
    lng: Number.isFinite(lng) ? lng : 0,
    speed: speed,
    altitude: altitude,
    absoluteAltitude: payload.absoluteAltitude !== undefined ? Number(payload.absoluteAltitude) : altitude,
    relativeAltitude: payload.relativeAltitude !== undefined ? Number(payload.relativeAltitude) : 0,
    homeAltitude: payload.homeAltitude !== undefined ? Number(payload.homeAltitude) : 0,
    homeLat: homeLat,
    homeLng: homeLng,
    heading: Number(payload.heading ?? 0),
    battery: Number(payload.battery ?? 1),
    timestamp: payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString(),
  }
}

export function useLiveDrones() {
  const [drones, setDrones] = useState([])
  const [paths, setPaths] = useState({})
  const [selectedId, setSelectedId] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const socketRef = useRef(null)

  const upsertDrone = useCallback((incoming) => {
    const data = normalizeTelemetry(incoming)
    if (!data) return

    setDrones(prev => {
      const exists = prev.find(d => d.id === data.id)
      if (exists) {
        return prev.map(d => d.id === data.id ? { ...exists, ...data } : d)
      }
      return [...prev, data]
    })

    setPaths(prev => {
      const prevPath = prev[data.id] || []
      const nextPath = [...prevPath, [data.lat, data.lng]].slice(-500)
      return { ...prev, [data.id]: nextPath }
    })

    setSelectedId(current => current || data.id)
  }, [])

  const fetchDrones = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch(`${API_BASE}/api/drones`)
      const json = await res.json()
      json.forEach(d => {
        upsertDrone({
          ...d,
          latitude: d.latitude ?? d.lat ?? d.lastKnown?.lat,
          longitude: d.longitude ?? d.lng ?? d.lastKnown?.lng,
        })
      })
    } catch (err) {
      console.error('Dronelar yüklenemedi', err)
    } finally {
      setIsRefreshing(false)
    }
  }, [upsertDrone])

  useEffect(() => {
    fetchDrones()
  }, [fetchDrones])

  useEffect(() => {
    const socket = io(API_BASE, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect', () => console.log('socket connected'))
    socket.on('drone:telemetry:broadcast', upsertDrone)
    socket.on('error', (err) => console.error('socket error', err))

    return () => {
      socket.disconnect()
    }
  }, [upsertDrone])

  const selectedDrone = useMemo(
    () => drones.find(d => d.id === selectedId) ?? null,
    [drones, selectedId]
  )

  const refresh = async () => {
    await fetchDrones()
  }

  return { drones, paths, refresh, isRefreshing, selectedId, setSelectedId, selectedDrone }
}
export interface FuelData {
  ai92?: number
  ai95?: number
  ai98?: number
  diesel?: number
}

export interface GasStation {
  id: number
  name: string
  brand: string
  address: string
  coordinates: [number, number]
  fuel: FuelData
  nextDelivery: string
  hasFuel: boolean
}

export type FuelType = keyof FuelData

export const FUEL_LABELS: Record<FuelType, string> = {
  ai92: 'АИ-92',
  ai95: 'АИ-95',
  ai98: 'АИ-98',
  diesel: 'ДТ',
}

export const FUEL_MAX: Record<FuelType, number> = {
  ai92: 15000,
  ai95: 15000,
  ai98: 15000,
  diesel: 15000,
}

export type FuelStatus = 'full' | 'medium' | 'low' | 'empty'

export const getFuelStatus = (val: number, key: FuelType): FuelStatus => {
  if (val === 0) return 'empty'
  const pct = (val / FUEL_MAX[key]) * 100
  if (pct > 60) return 'full'
  if (pct > 30) return 'medium'
  return 'low'
}

export const STATUS_COLORS: Record<FuelStatus, string> = {
  full: '#22C55E',
  medium: '#EAB308',
  low: '#EF4444',
  empty: '#D1D5DB',
}

export const STATUS_BG: Record<FuelStatus, string> = {
  full: '#F0FDF4',
  medium: '#FEFCE8',
  low: '#FEF2F2',
  empty: '#F3F4F6',
}

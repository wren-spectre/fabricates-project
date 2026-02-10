export interface EquipmentData {
    id: string
    name: string
    process: string
    position: [number, number, number]
    size: [number, number, number]
    color?: string
    description?: string
}

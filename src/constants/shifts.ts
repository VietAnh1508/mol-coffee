export const SHIFT_TEMPLATES = {
  morning: {
    start: '06:00',
    end: '12:00',
    label: 'Ca sáng'
  },
  afternoon: {
    start: '12:00',
    end: '18:00',
    label: 'Ca chiều'
  }
} as const

export type ShiftTemplate = keyof typeof SHIFT_TEMPLATES
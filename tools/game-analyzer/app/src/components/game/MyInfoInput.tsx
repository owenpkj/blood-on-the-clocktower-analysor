'use client'

import { Textarea } from '@/components/ui/textarea'

interface MyInfoInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function MyInfoInput({
  value,
  onChange,
  disabled = false,
  placeholder = '记录你获得的信息...',
}: MyInfoInputProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      rows={4}
      className="resize-none"
    />
  )
}

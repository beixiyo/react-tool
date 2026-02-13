import type { ReactNode } from 'react'

interface FieldWrapperProps {
  label: string
  description?: string
  required: boolean
  error?: string
  children: ReactNode
}

export function FieldWrapper({
  label,
  description,
  required,
  error,
  children,
}: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text">
          {label}
          {required && <span className="ml-1 text-danger">*</span>}
        </span>
        {description && (
          <span className="text-xs text-text2">
            {description}
          </span>
        )}
      </div>
      {children}
      {error && (
        <span className="text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  )
}

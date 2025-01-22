// components/listing/form/FormField.tsx

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps extends React.ComponentPropsWithoutRef<"div"> {
  name: string
  label?: string
  children: React.ReactNode
}

export function FormField({ name, label, children, className, ...props }: FormFieldProps) {
  const { formState: { errors } } = useFormContext()
  const error = errors[name]

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label && <Label htmlFor={name}>{label}</Label>}
      {children}
      {error?.message && (
        <p className="text-sm text-destructive">{error.message as string}</p>
      )}
    </div>
  )
}
import { Badge as UiBadge } from "@/components/atoms/ui/badge"
import { cn } from "@/utils/classname"

type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "info"
  | "error"
  | "muted"

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-success text-white",
  warning: "bg-warning text-black",
  info: "bg-info text-white",
  error: "bg-destructive text-white",
  muted: "bg-muted text-muted-foreground",
}

type BadgeProps = {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}

function Badge({ variant = "primary", className, children }: BadgeProps) {
  return (
    <UiBadge className={cn(variantClasses[variant], className)}>
      {children}
    </UiBadge>
  )
}

export { Badge, type BadgeVariant, type BadgeProps }

import { cn } from "@/utils/classname"

type PageHeaderProps = {
  title: string
  description?: string
  className?: string
}

function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

export { PageHeader, type PageHeaderProps }

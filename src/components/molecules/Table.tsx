import { Inbox } from "lucide-react"
import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/ui/table"
import { cn } from "@/utils/classname"

type Column<T> = {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
}

type TableProps<T> = {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  skeletonRows?: number
  emptyMessage?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  className?: string
}

function Table<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  skeletonRows = 5,
  emptyMessage = "No data",
  emptyDescription,
  emptyIcon = <Inbox className="size-8 text-muted-foreground" />,
  className,
}: TableProps<T>) {
  return (
    <div className={cn("rounded-md border", className)}>
      <UiTable>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key}>{col.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <div
                      className={cn(
                        "h-4 animate-pulse rounded bg-muted-foreground/20",
                        col.key === "id" ? "w-8" : "w-full",
                      )}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-48 text-center"
              >
                <div className="flex flex-col items-center gap-2">
                  {emptyIcon}
                  <p className="text-sm text-muted-foreground">
                    {emptyMessage}
                  </p>
                  {emptyDescription && (
                    <p className="text-xs text-muted-foreground/60">
                      {emptyDescription}
                    </p>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render
                      ? col.render(row)
                      : (row[col.key] as React.ReactNode) ?? ""}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </UiTable>
    </div>
  )
}

export { Table, type Column, type TableProps }

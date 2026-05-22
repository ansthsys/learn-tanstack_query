import {
  Pagination as UiPagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/atoms/ui/pagination"
import { cn } from "@/utils/classname"

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>

      <UiPagination className="w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={page > 1 ? () => onPageChange(page - 1) : undefined}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              onClick={
                page < totalPages ? () => onPageChange(page + 1) : undefined
              }
              className={
                page >= totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </UiPagination>
    </div>
  )
}

export { Pagination, type PaginationProps }

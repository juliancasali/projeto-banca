import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className 
}) {
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "ellipsis", totalPages]
    } else if (currentPage >= totalPages - 2) {
      return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    } else {
      return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages]
    }
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav 
      role="navigation" 
      aria-label="Navegação de páginas" 
      className={cn("flex justify-center items-center mt-6 gap-1", className)}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pageNumbers.map((page, index) => 
        page === "ellipsis" ? (
          <div key={`ellipsis-${index}`} className="flex items-center justify-center w-9 h-9">
            <MoreHorizontal className="h-4 w-4" />
          </div>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            className={cn(
              "h-9 w-9 p-0",
              currentPage === page 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : ""
            )}
            onClick={() => onPageChange(page)}
            aria-label={`Página ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        aria-label="Próxima página"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
} 
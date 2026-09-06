import * as React from "react"
import { MoreHorizontal, Edit, Trash2, Eye, PackageX, Image as ImageIcon } from "lucide-react"
import type { ProductItem } from "~/shared/services/api/productService"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/core/components/shadcn/table"
import { Button } from "~/core/components/shadcn/button"
import { Skeleton } from "~/core/components/shadcn/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/core/components/shadcn/dropdown-menu"
import { formatDateTime } from "~/shared/utils/appUtils"

interface ProductTableProps {
  products: ProductItem[]
  isLoading?: boolean
  onEdit?: (product: ProductItem) => void
  onDelete?: (product: ProductItem) => void
}

export default function ProductTable({
  products,
  isLoading = false,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border border-gray-200 bg-white dark:bg-zinc-900 shadow-2xs overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/80 dark:bg-zinc-800/50">
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead className="w-[180px]">Created At</TableHead>
              <TableHead className="w-[180px]">Updated At</TableHead>
              <TableHead className="w-[70px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-12 w-12 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-48 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32 rounded-md" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-white dark:bg-zinc-900 shadow-2xs p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400">
          <PackageX className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-gray-100">
          No products found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          We couldn't find any products matching your search criteria. Try adjusting your query or filters.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white dark:bg-zinc-900 shadow-2xs overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/80 dark:bg-zinc-800/50">
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead className="w-[180px]">Created At</TableHead>
            <TableHead className="w-[180px]">Updated At</TableHead>
            <TableHead className="w-[70px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40">
              <TableCell>
                <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 flex items-center justify-center shrink-0">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        // Fallback image handling
                        (e.target as HTMLElement).style.display = "none"
                        const parent = (e.target as HTMLElement).parentElement
                        if (parent) {
                          const icon = document.createElement("div")
                          icon.className = "text-gray-400"
                          icon.innerHTML = `<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`
                          parent.appendChild(icon)
                        }
                      }}
                    />
                  ) : (
                    <ImageIcon className="size-5 text-gray-400" />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium text-gray-900 dark:text-gray-100 max-w-[250px] truncate">
                {product.name}
              </TableCell>
              <TableCell className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formatDateTime(product.createdAt || product.created_at)}
              </TableCell>
              <TableCell className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formatDateTime(product.updatedAt || product.updated_at)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEdit?.(product)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Product
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete?.(product)}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Product
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

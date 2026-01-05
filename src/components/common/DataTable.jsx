import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function DataTable({
  columns,
  data,
  isLoading,
  searchable = true,
  searchPlaceholder = "Rechercher...",
  onRowClick,
  emptyMessage = "Aucune donnée disponible"
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const filteredData = searchable && search
    ? data?.filter(item => 
        columns.some(col => {
          const value = col.accessor ? item[col.accessor] : col.render?.(item);
          return String(value || '').toLowerCase().includes(search.toLowerCase());
        })
      )
    : data;

  const totalPages = Math.ceil((filteredData?.length || 0) / pageSize);
  const paginatedData = filteredData?.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {searchable && (
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-10 bg-slate-50 border-slate-200"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              {columns.map((col, index) => (
                <TableHead 
                  key={index} 
                  className={cn(
                    "text-xs font-semibold text-slate-500 uppercase tracking-wider",
                    col.className
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" />
                </TableCell>
              </TableRow>
            ) : paginatedData?.length > 0 ? (
              paginatedData.map((item, rowIndex) => (
                <TableRow 
                  key={item.id || rowIndex}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "transition-colors",
                    onRowClick && "cursor-pointer hover:bg-amber-50"
                  )}
                >
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className={col.cellClassName}>
                      {col.render ? col.render(item) : item[col.accessor]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-slate-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {filteredData?.length || 0} résultat(s)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-600">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
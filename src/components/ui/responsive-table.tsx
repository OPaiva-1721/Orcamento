'use client';

import { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => ReactNode;
  mobileHidden?: boolean;
  mobileLabel?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  className?: string;
  emptyMessage?: string;
  actions?: (item: T) => ReactNode;
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  className,
  emptyMessage = 'Nenhum item encontrado',
  actions,
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={String(column.key)}>
                    {column.label}
                  </TableHead>
                ))}
                {actions && <TableHead>Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={String(item[keyField])}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render 
                        ? column.render(item[column.key], item)
                        : String(item[column.key] || '-')
                      }
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      {actions(item)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((item) => (
          <Card key={String(item[keyField])}>
            <CardContent className="p-4">
              <div className="space-y-3">
                {columns
                  .filter(column => !column.mobileHidden)
                  .map((column) => (
                    <div key={String(column.key)} className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-500">
                        {column.mobileLabel || column.label}:
                      </span>
                      <div className="text-right flex-1 ml-2">
                        {column.render 
                          ? column.render(item[column.key], item)
                          : <span className="text-sm text-gray-900">{String(item[column.key] || '-')}</span>
                        }
                      </div>
                    </div>
                  ))}
                
                {actions && (
                  <div className="pt-3 border-t border-gray-100">
                    {actions(item)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

// Componente para status badges
export function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejeitado':
        return 'bg-red-100 text-red-800';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800';
      case 'em andamento':
        return 'bg-blue-100 text-blue-800';
      case 'concluído':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {status}
    </Badge>
  );
}

// Componente para ações de linha
export function TableActions({ 
  onEdit, 
  onDelete, 
  onView,
  editLabel = 'Editar',
  deleteLabel = 'Excluir',
  viewLabel = 'Ver'
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  viewLabel?: string;
}) {
  return (
    <div className="flex space-x-2">
      {onView && (
        <Button variant="outline" size="sm" onClick={onView}>
          {viewLabel}
        </Button>
      )}
      {onEdit && (
        <Button variant="outline" size="sm" onClick={onEdit}>
          {editLabel}
        </Button>
      )}
      {onDelete && (
        <Button variant="destructive" size="sm" onClick={onDelete}>
          {deleteLabel}
        </Button>
      )}
    </div>
  );
}

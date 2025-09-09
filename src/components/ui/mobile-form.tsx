'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface MobileFormProps {
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function MobileForm({
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  className,
}: MobileFormProps) {
  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">{title}</CardTitle>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
              {children}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto sm:ml-auto"
              >
                {isLoading ? 'Salvando...' : submitLabel}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="w-full sm:w-auto"
                >
                  {cancelLabel}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
}

export function FormField({
  label,
  children,
  error,
  required = false,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

interface FormGridProps {
  children: ReactNode;
  columns?: 1 | 2;
  className?: string;
}

export function FormGrid({
  children,
  columns = 1,
  className,
}: FormGridProps) {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
      className
    )}>
      {children}
    </div>
  );
}

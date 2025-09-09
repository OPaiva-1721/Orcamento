'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Erro no Sistema
            </h1>
            <p className="text-gray-600 max-w-md">
              Ocorreu um erro inesperado. Tente recarregar a página ou entre em contato com o suporte.
            </p>
            <Button onClick={reset}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}

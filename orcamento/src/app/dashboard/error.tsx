'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Ops! Algo deu errado
        </h1>
        <p className="text-gray-600 max-w-md">
          Ocorreu um erro ao carregar o dashboard. Tente novamente ou entre em contato com o suporte.
        </p>
        <div className="space-x-4">
          <Button onClick={reset}>
            Tentar novamente
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Voltar ao início
          </Button>
        </div>
      </div>
    </div>
  );
}

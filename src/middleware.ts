import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Se for ngrok, adicionar parâmetro para pular warning
  if (request.headers.get('host')?.includes('ngrok.io')) {
    const url = request.nextUrl.clone()
    
    // Adicionar parâmetro se não existir
    if (!url.searchParams.has('ngrok-skip-browser-warning')) {
      url.searchParams.set('ngrok-skip-browser-warning', 'true')
      return NextResponse.redirect(url)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

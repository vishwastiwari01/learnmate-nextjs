import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PROTECTED = ['/dashboard', '/arena', '/learn', '/coding', '/courses', '/roadmap']
const PUBLIC    = ['/', '/auth', '/api']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public routes and API
  if (PUBLIC.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check if protected
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // Read session cookie
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, supabaseAnon, {
    auth: {
      storage: {
        getItem: (key) => req.cookies.get(key)?.value ?? null,
        setItem: () => {},
        removeItem: () => {},
      },
    },
  })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg).*)',
  ],
}

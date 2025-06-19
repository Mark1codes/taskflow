
     import { NextResponse } from 'next/server'
     import supabase from '../../../utils/supabase'

     export const dynamic = 'force-dynamic'

     export async function GET(request: Request) {
       const { searchParams } = new URL(request.url)
       const code = searchParams.get('code')
       const state = searchParams.get('state')
       if (code) {
         await supabase.auth.exchangeCodeForSession(code)
       }
       
       return NextResponse.redirect(new URL('/', request.url))
     }
     
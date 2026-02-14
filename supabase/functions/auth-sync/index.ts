import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { firebase_token } = await req.json()
        if (!firebase_token) {
            console.error('Missing firebase_token in request body')
            throw new Error('Missing firebase_token')
        }
        console.log('Received token, length:', firebase_token.length)

        // 1. Verify Firebase Token
        // Fetch public keys from Google
        const response = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com')
        const publicKeys = await response.json()

        // Decode token header to get kid
        const header = jose.decodeProtectedHeader(firebase_token)
        const kid = header.kid

        if (!kid || !publicKeys[kid]) {
            throw new Error('Invalid token or unknown key')
        }

        const certificate = publicKeys[kid]
        const publicKey = await jose.importX509(certificate, 'RS256')

        const { payload } = await jose.jwtVerify(firebase_token, publicKey, {
            audience: 'life-at-jntuh', // Firebase Project ID from .env
            issuer: 'https://securetoken.google.com/life-at-jntuh',
        })

        const uid = payload.sub
        if (!uid) throw new Error('No UID in token')

        // 2. Mint Supabase JWT
        // Use the project's JWT Secret (must be set in Env or via Dashboard)
        // Supabase Edge Functions automatically have this env var if deployed correctly?
        // Actually typically 'SUPABASE_JWT_SECRET' is not exposed by default to user code unless valid.
        // However, we can use the Service Role to mint? No, service role is for DB access.
        // To sign a JWT that Supabase Auth accepts, we need the *HMAC Secret*.
        // Attempt to read JWT_SECRET env var.
        const secret = Deno.env.get('JWT_SECRET')
        if (!secret) {
            // Fallback: This is CRITICAL. If secret is missing, we fail.
            // User must set it: supabase secrets set JWT_SECRET=...
            throw new Error('Server misconfiguration: JWT_SECRET not set')
        }

        const secretKey = new TextEncoder().encode(secret)

        const supabaseToken = await new jose.SignJWT({
            aud: 'authenticated',
            role: 'authenticated',
            sub: uid,
            email: payload.email,
            app_metadata: { provider: 'firebase' },
            user_metadata: {
                name: payload.name,
                picture: payload.picture
            }
        })
            .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
            .setExpirationTime('1h') // Firebase tokens last 1h, match it or shorter
            .sign(secretKey)

        return new Response(
            JSON.stringify({ token: supabaseToken, user_id: uid }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('Auth Sync Error:', error.message)
        if (error.message.includes('JWT_SECRET')) console.error('JWT_SECRET is missing from environment')
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

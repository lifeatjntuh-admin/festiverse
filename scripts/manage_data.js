import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Mimic __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read .env file manually
function getEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env')
        const envContent = fs.readFileSync(envPath, 'utf8')
        const env: Record<string, string> = {}
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=')
            if (key && value) {
                env[key.trim()] = value.trim()
            }
        })
        return env
    } catch (e) {
        console.error('Could not read .env file', e)
        process.exit(1)
    }
}

const env = getEnv()
const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.MCP_SUPABASE_TOKEN || env.VITE_SUPABASE_ANON_KEY // Use MCP token if available for higher privilege, or anon

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    const targetEmail = 'muddassirhq@gmail.com'

    // 1. Get User ID
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', targetEmail)
        .single()

    if (profileError || !profiles) {
        console.error(`User ${targetEmail} not found:`, profileError?.message)
        // Check if we can list users (admin only), probably not with anon key.
        return
    }

    const userId = profiles.id
    console.log(`Found user ${targetEmail} with ID: ${userId}`)

    // 2. Define Events to Insert (Day 1: 2026-03-15, Day 2: 2026-03-16)
    // We will create some clashing events deliberately.
    const events = [
        // Day 1 - Morning Clash
        {
            title: 'Keynote Speech',
            description: 'Opening keynote by industry leaders.',
            category: 'cultural',
            start_time: '2026-03-15T09:00:00+05:30',
            end_time: '2026-03-15T10:30:00+05:30',
            location: 'Main Auditorium',
            organizer_id: userId,
            is_published: true,
            is_featured: true,
            featured_order: 1,
            tags: ['keynote', 'opening'],
            registration_required: false,
            current_registrations: 0,
            is_paid: false
        },
        {
            title: 'Welcome Breakfast',
            description: 'Networking breakfast for early birds.',
            category: 'food',
            start_time: '2026-03-15T09:15:00+05:30', // CLASH with Keynote
            end_time: '2026-03-15T10:00:00+05:30',
            location: 'Cafeteria',
            organizer_id: userId,
            is_published: true,
            is_featured: false,
            tags: ['food', 'networking'],
            registration_required: false,
            current_registrations: 0,
            is_paid: false
        },
        // Day 1 - Afternoon
        {
            title: 'Robotics Workshop',
            description: 'Hands-on workshop on building robots.',
            category: 'workshop',
            start_time: '2026-03-15T14:00:00+05:30',
            end_time: '2026-03-15T16:00:00+05:30',
            location: 'Lab 1',
            organizer_id: userId,
            is_published: true,
            is_featured: true,
            featured_order: 2,
            tags: ['robotics', 'tech'],
            registration_required: true,
            max_participants: 50,
            current_registrations: 0,
            is_paid: true,
            price: 500
        },
        // Day 2
        {
            title: 'Closing Ceremony',
            description: 'Awards and closing remarks.',
            category: 'cultural',
            start_time: '2026-03-16T17:00:00+05:30',
            end_time: '2026-03-16T19:00:00+05:30',
            location: 'Open Air Theatre',
            organizer_id: userId,
            is_published: true,
            is_featured: true,
            featured_order: 3,
            tags: ['ceremony'],
            registration_required: false,
            current_registrations: 0,
            is_paid: false
        }
    ]

    console.log('Inserting events...')

    for (const event of events) {
        const { data, error } = await supabase
            .from('events')
            .insert(event)
            .select()

        if (error) {
            console.error(`Failed to insert ${event.title}:`, error.message)
        } else {
            console.log(`Inserted: ${event.title}`)
        }
    }
}

main().catch(console.error)

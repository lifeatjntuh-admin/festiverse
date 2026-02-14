-- SQL Script to Seed Events and Set Fest Dates for Stress Testing
-- Run this in the Supabase SQL Editor

-- 1. Ensure Fest Dates match the seeded events
INSERT INTO public.app_settings (key, value)
VALUES
  ('fest_dates', '{
    "day1": {"start": "2026-02-26T00:00:00+05:30", "end": "2026-02-26T23:59:59+05:30"},
    "day2": {"start": "2026-02-27T00:00:00+05:30", "end": "2026-02-27T23:59:59+05:30"}
  }'::jsonb)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;

-- 2. Insert Events
WITH organizer AS (
  SELECT id FROM public.profiles LIMIT 1
)
INSERT INTO public.events (
  title,
  description,
  category,
  start_time,
  end_time,
  location,
  image_url,
  organizer_id,
  registration_required,
  is_published,
  is_featured,
  featured_order
)
SELECT 'AI & Robotics Workshop', 'Learn the basics of AI and build your own robot.', 'workshop', '2026-02-26 09:00:00+05:30'::timestamptz, '2026-02-26 12:00:00+05:30'::timestamptz, 'Auditorium A', 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, true, true, true, 1 FROM organizer
UNION ALL
SELECT 'Hackathon 2026 Opening', 'Kickoff for the 24-hour hackathon challenge.', 'competition', '2026-02-26 10:00:00+05:30', '2026-02-26 11:00:00+05:30', 'Main Hall', 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, true, true, true, 2 FROM organizer
UNION ALL
SELECT 'Classical Dance Performance', 'A mesmerizing performance by the university dance troupe.', 'cultural', '2026-02-26 11:30:00+05:30', '2026-02-26 13:00:00+05:30', 'Open Air Theatre', 'https://images.pexels.com/photos/12312/pexels-photo-12312.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, false, true, false, null FROM organizer
UNION ALL
SELECT 'Inter-College Cricket Match', 'Finals of the inter-college cricket tournament.', 'sports', '2026-02-26 14:00:00+05:30', '2026-02-26 18:00:00+05:30', 'Sports Ground', 'https://images.pexels.com/photos/3602833/pexels-photo-3602833.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, false, true, false, null FROM organizer
UNION ALL
SELECT 'Food Carnival', 'Taste dishes from around the world.', 'food', '2026-02-26 12:00:00+05:30', '2026-02-26 22:00:00+05:30', 'Food Court', 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, false, true, true, 3 FROM organizer
UNION ALL
SELECT 'VR Experience Zone', 'Experience the latest in Virtual Reality technology.', 'tech', '2026-02-26 15:00:00+05:30', '2026-02-26 17:00:00+05:30', 'Lab 204', 'https://images.pexels.com/photos/2007647/pexels-photo-2007647.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, false, true, false, null FROM organizer
UNION ALL
SELECT 'Battle of Bands', 'Live music competition featuring top college bands.', 'cultural', '2026-02-26 18:00:00+05:30', '2026-02-26 21:00:00+05:30', 'Main Stage', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, false, true, true, 4 FROM organizer
UNION ALL
SELECT 'Coding Quiz', 'Test your programming knowledge.', 'competition', '2026-02-26 16:00:00+05:30', '2026-02-26 17:30:00+05:30', 'Seminar Hall', 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, true, true, false, null FROM organizer
UNION ALL
SELECT 'Photography Workshop', 'Learn photography from industry experts.', 'workshop', '2026-02-27 09:30:00+05:30', '2026-02-27 11:30:00+05:30', 'Studio B', 'https://images.pexels.com/photos/225157/pexels-photo-225157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, true, true, true, 5 FROM organizer
UNION ALL
SELECT 'Debate Competition', 'Topic: AI and the Future of Work.', 'competition', '2026-02-27 10:00:00+05:30', '2026-02-27 12:00:00+05:30', 'Conference Room', 'https://images.pexels.com/photos/1709003/pexels-photo-1709003.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, true, true, false, null FROM organizer
UNION ALL
SELECT 'Art Exhibition', 'Displaying student artwork.', 'cultural', '2026-02-27 11:00:00+05:30', '2026-02-27 17:00:00+05:30', 'Art Gallery', 'https://images.pexels.com/photos/1646953/pexels-photo-1646953.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, false, true, false, null FROM organizer
UNION ALL
SELECT 'Badminton Tournament', 'Singles and Doubles matches.', 'sports', '2026-02-27 14:00:00+05:30', '2026-02-27 17:00:00+05:30', 'Indoor Stadium', 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, true, true, false, null FROM organizer
UNION ALL
SELECT 'Tech Talk: Blockchain', 'Introduction to Blockchain technology.', 'tech', '2026-02-27 15:00:00+05:30', '2026-02-27 16:30:00+05:30', 'Auditorium B', 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, false, true, true, 6 FROM organizer
UNION ALL
SELECT 'Stand-up Comedy Night', 'Laugh your heart out with student comedians.', 'cultural', '2026-02-27 18:00:00+05:30', '2026-02-27 20:00:00+05:30', 'Open Air Theatre', 'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, false, true, true, 7 FROM organizer
UNION ALL
SELECT 'DJ Night', 'Closing ceremony DJ party.', 'cultural', '2026-02-27 20:00:00+05:30', '2026-02-27 22:00:00+05:30', 'Main Ground', 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, false, true, true, 8 FROM organizer
UNION ALL
SELECT 'Drone Racing', 'High speed drone racing competition.', 'tech', '2026-02-26 16:00:00+05:30', '2026-02-26 18:00:00+05:30', 'Football Ground', 'https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, true, true, false, null FROM organizer
UNION ALL
SELECT 'Cyber Security Workshop', 'Learn to protect your data.', 'workshop', '2026-02-27 13:00:00+05:30', '2026-02-27 15:00:00+05:30', 'Lab 301', 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, true, true, false, null FROM organizer
UNION ALL
SELECT 'Literature Fest', 'Book readings and author meetups.', 'cultural', '2026-02-26 13:00:00+05:30', '2026-02-26 15:00:00+05:30', 'Library Hall', 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, false, true, false, null FROM organizer
UNION ALL
SELECT 'Chess Championship', 'Strategic battle of minds.', 'sports', '2026-02-27 10:00:00+05:30', '2026-02-27 13:00:00+05:30', 'Recreation Room', 'https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, true, true, false, null FROM organizer
UNION ALL
SELECT 'Start-up Pitch', 'Pitch your business ideas to investors.', 'competition', '2026-02-27 14:00:00+05:30', '2026-02-27 16:00:00+05:30', 'Conference Hall B', 'https://images.pexels.com/photos/2182973/pexels-photo-2182973.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', id, true, true, true, 9 FROM organizer;

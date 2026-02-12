# Product Requirements Document (PRD) v2.0
## College Fest Management & Discovery Platform

**Last Updated**: February 12, 2026  
**Product Owner**: [Your Name]  
**Target Launch**: 10-12 weeks from kickoff  
**Platform**: Progressive Web App (PWA) - Mobile-First

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Technical Stack](#3-technical-stack-finalized)
4. [User Model & Personas](#4-user-model--personas)
5. [Information Architecture](#5-information-architecture)
6. [Database Schema](#6-database-schema-supabase-jsonb)
7. [Feature Specifications](#7-feature-specifications)
8. [Design System](#8-design-system)
9. [Page-by-Page Specifications](#9-page-by-page-specifications)
10. [State Management (Zustand)](#10-state-management-zustand)
11. [API & Integrations](#11-api--integrations)
12. [Performance Requirements](#12-performance-requirements)
13. [Development Roadmap](#13-development-roadmap-12-weeks)
14. [Success Metrics](#14-success-metrics)
15. [Risk Assessment](#15-risk-assessment)
16. [Appendix](#16-appendix)

---

## 1. Executive Summary

### **Product Vision**
A vibrant, mobile-first Progressive Web App that serves as the central hub for college fest attendees, enabling seamless event discovery, schedule management, and real-time fest navigation. Think **"Spotify meets Instagram meets Google Calendar"** - but for a 2-day college fest.

### **Target Audience**
- **Primary**: College students (18-24 years old, 500-2000 expected attendees)
- **Secondary**: Event organizers, stall owners
- **Usage Context**: On-the-go, crowded fest venues, intermittent connectivity

### **Core Value Proposition**
```
For students attending the fest:
  - Discover events they'll love
  - Never miss what's happening now
  - Find food/stalls without wandering
  - Manage their personal schedule

For organizers:
  - Self-service event creation
  - Real-time updates to attendees
  - Registration management
```

### **Success Criteria (Launch)**
- ✅ App live 1 week before fest starts
- ✅ 60%+ of attendees use the app at least once
- ✅ <2% error rate during fest
- ✅ Average 5+ events bookmarked per user
- ✅ Lighthouse PWA score 90+

---

## 2. Product Vision & Goals

### **A. Business Goals**

1. **Enhance Fest Experience**
   - Reduce "What's happening now?" confusion
   - Increase event attendance (better discoverability)
   - Improve attendee satisfaction scores

2. **Operational Efficiency**
   - Self-service for organizers (reduce manual work)
   - Centralized information hub (no more scattered posters)
   - Real-time updates (no outdated printed schedules)

3. **Data & Insights**
   - Track popular events (inform future fest planning)
   - Understand attendee behavior (peak times, preferences)
   - Measure engagement (bookmark rates, registration conversions)

4. **Future Scalability**
   - Reusable platform for annual fests
   - Potential for year-round campus events
   - Foundation for multi-college expansion

### **B. User Goals**

**As an Attendee, I want to:**
- [x] Quickly see what's happening today/now
- [x] Browse events by category (Tech, Cultural, Food, etc.)
- [x] Save events I'm interested in
- [x] Get reminders before events start
- [x] Find food stalls and merchandise
- [x] Share events with friends
- [x] View my personalized schedule

**As an Organizer, I want to:**
- [x] List my event with details, images, rules
- [x] Update event info if things change
- [x] See how many people registered/bookmarked
- [x] Send notifications to registered attendees

**As a Stall Owner, I want to:**
- [x] Showcase my stall with photos and menu
- [x] Update location/offerings in real-time
- [x] Get discovered by hungry/interested students

### **C. Non-Goals (Out of Scope for v1)**

❌ **Live Streaming** - Focus on in-person experience
❌ **Social Feed** - Not competing with Instagram/Twitter
❌ **Ticketing/Payments** - External registration links only
❌ **Chat/Messaging** - Use existing platforms (WhatsApp)
❌ **Gamification** - Save for v2 (leaderboards, badges)
❌ **Multi-language Support** - English only for v1
❌ **Native Mobile Apps** - PWA is sufficient

---

## 3. Technical Stack (Finalized)

### **Frontend**
```json
{
  "framework": "React 18.2+",
  "build-tool": "Vite 5.0+",
  "state-management": "Zustand 4.5+",
  "routing": "React Router DOM 6.21+",
  "styling": "TailwindCSS 3.4+",
  "animations": "Framer Motion 11.0+",
  "icons": "Lucide React 0.300+",
  "date-handling": "date-fns 3.0+",
  "toast-notifications": "react-hot-toast 2.4+"
}
```

### **Backend & Services**
```json
{
  "database": "Supabase (PostgreSQL + Realtime)",
  "authentication": "Supabase Auth (Google OAuth)",
  "file-storage": "Cloudinary (images)",
  "email": "Resend.com (100 emails/day free tier)",
  "hosting": "Vercel (frontend + serverless functions)",
  "push-notifications": "PWA Service Worker + Vapid",
  "analytics": "Vercel Analytics (built-in)"
}
```

### **DevOps & Tooling**
```json
{
  "version-control": "Git + GitHub",
  "ci-cd": "Vercel (auto-deploy on push)",
  "environment-management": "Vercel Environment Variables",
  "error-tracking": "Sentry (optional, free tier)",
  "monitoring": "Vercel Analytics + Lighthouse CI"
}
```

### **Why This Stack?**

| Technology | Reasoning |
|------------|-----------|
| **React + Vite** | Fast builds, modern DX, huge ecosystem |
| **Zustand** | Lightweight state (1KB), no boilerplate, perfect for small-medium apps |
| **React Router DOM** | Industry standard, feature-rich routing with data loaders, nested routes, excellent DX |
| **TailwindCSS** | Utility-first, rapid prototyping, mobile-first defaults |
| **Supabase** | Auth + DB + Realtime in one, generous free tier |
| **Cloudinary** | Auto image optimization, CDN, free 25GB/month |
| **Resend.com** | 100 emails/day = perfect for 2-day fest |
| **Vercel** | Zero-config deployment, edge functions, global CDN |

### **Total Cost: $0** (Stays within free tiers)

---

## 4. User Model & Personas

### **A. Core Principle: Everyone is an Attendee First**

```typescript
// Single user type with role flags (not separate user types)
interface User {
  id: uuid;
  email: string;
  name: string;
  // Base attendee properties
  college_id?: string;
  department?: string;
  phone?: string;
  avatar_url?: string;
  
  // Role flags (JSONB - flexible)
  roles: {
    is_organizer: boolean;        // Can create/manage events
    is_stall_owner: boolean;       // Can create/manage stalls
    organized_events: uuid[];      // Events they manage
    owned_stalls: uuid[];          // Stalls they manage
  };
}
```

**Why This Approach?**
- ✅ Single authentication flow
- ✅ Same user can attend events AND organize one
- ✅ No complex role switching UI
- ✅ Easy to add "Become an Organizer" button in profile
- ✅ Flexible for future roles (volunteer, sponsor, etc.)

### **B. User Personas**

#### **Persona 1: Ritika - The Event Enthusiast**
```
Age: 20
Department: Computer Science Engineering (3rd year)
Tech Savvy: High
Goals:
  - Attend 10+ events during the fest
  - Discover new workshops in AI/ML
  - Find best food stalls
  - Share cool events with friends
Pain Points:
  - Printed schedules get outdated
  - Events clash - needs timeline view
  - Forgets about events (needs reminders)
  - Doesn't know where stalls are located
Behavior:
  - Checks app 15-20 times during fest
  - Books all events in advance
  - Active on Instagram (shares everything)
```

#### **Persona 2: Arjun - The Casual Attendee**
```
Age: 19
Department: Mechanical Engineering (2nd year)
Tech Savvy: Medium
Goals:
  - Check what's happening "right now"
  - Find food between classes
  - Maybe attend 2-3 interesting events
Pain Points:
  - Too lazy to plan entire schedule
  - Just wants to see current/upcoming events
  - Overwhelmed by too many options
Behavior:
  - Opens app when bored
  - Uses "What's Happening Now" feature
  - Browses casually, doesn't bookmark much
```

#### **Persona 3: Priya - The Event Organizer**
```
Age: 21
Department: MBA (2nd year)
Role: Cultural Committee Head
Goals:
  - List her 3 cultural events
  - Update event details if venue changes
  - See how many people registered
  - Send reminder to attendees 1hr before
Pain Points:
  - Manual WhatsApp updates are tedious
  - No visibility into attendee interest
  - Last-minute changes hard to communicate
Behavior:
  - Logs in 2-3 times daily
  - Monitors registration counts
  - Updates event info as needed
```

#### **Persona 4: Sameer - The Stall Owner**
```
Age: 22
Department: External (Food Vendor)
Tech Savvy: Low
Goals:
  - List his food stall with menu & prices
  - Show photos of dishes
  - Get foot traffic from students
Pain Points:
  - Students don't know stall exists
  - No way to showcase menu digitally
  - Location hard to communicate verbally
Behavior:
  - Sets up stall info once before fest
  - Minimal app usage after setup
  - Relies on QR code poster at stall
```

---

## 5. Information Architecture

### **A. Navigation Structure**

#### **Primary Navigation (Bottom Nav - 4 Items)**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              Main Content Area                  │
│                (Scrollable)                     │
│                                                 │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│   🏠        📅        🛍️        👤            │
│  Home    Schedule   Stalls    Profile          │
└─────────────────────────────────────────────────┘
```

**Why These 4 Items?**
1. **Home (🏠)**: Discovery hub - featured events, categories, trending
2. **Schedule (📅)**: Core function - timeline view, planning
3. **Stalls (🛍️)**: Physical navigation - food, merchandise, clubs
4. **Profile (👤)**: Personal hub - saved items, settings, my events

**What's NOT in Bottom Nav (and where they live):**
- **Search (🔍)**: Top bar (always accessible, but not a destination)
- **Notifications (🔔)**: Top bar (interrupt-driven, not a section)
- **Map (🗺️)**: Homepage Quick Action (contextual, not constant need)

*(See Appendix A for detailed reasoning on 4-item limit)*

#### **Secondary Navigation (Top Bar - Contextual)**

```
┌─────────────────────────────────────────────────┐
│  [←/Logo]    Page Title        [🔍] [🔔]       │
└─────────────────────────────────────────────────┘
```

**Dynamic Behavior:**
- **Homepage**: Logo + Search + Notifications (no back)
- **Sub-pages**: Back arrow + Title + Search + Notifications
- **Detail pages**: Back arrow + Share + Bookmark

### **B. Site Map**

```
TechFest App
│
├── 🏠 Home
│   ├── Countdown Timer
│   ├── Featured Events Carousel
│   ├── Quick Actions (My Schedule, Venue Map)
│   ├── Category Grid (6 categories)
│   └── Trending Events
│
├── 📅 Schedule
│   ├── Day Tabs (Day 1, Day 2)
│   ├── Filter Chips (Category filter)
│   ├── Timeline View (8 AM - 10 PM)
│   └── Event Detail (Bottom Sheet)
│
├── 🛍️ Stalls
│   ├── Category Filter (All, Food, Merch, Clubs, Sponsors)
│   ├── Grid View (2 columns)
│   └── Stall Detail (Bottom Sheet)
│
├── 👤 Profile
│   ├── User Info Card
│   ├── Quick Stats (Events, Saved, Days Left)
│   ├── My Schedule
│   ├── Saved Events
│   ├── Notifications
│   ├── Settings
│   ├── Organizer Tools (conditional)
│   └── Sign Out
│
├── 🔍 Search (Overlay)
│   ├── Search Bar
│   ├── Recent Searches
│   ├── Suggested Events
│   └── Results (Events + Stalls)
│
├── 🔔 Notifications
│   ├── Unread Notifications
│   ├── All Notifications
│   └── Mark All Read
│
└── Auth
    ├── Login (Google OAuth)
    ├── Signup
    └── Onboarding (first-time users)
```

### **C. User Flows**

#### **Flow 1: Discover & Bookmark Event**
```
Home → Featured Event Card → Tap
  ↓
Event Detail (Bottom Sheet)
  ↓
Tap "Add to Schedule" (bookmark icon)
  ↓
Toast: "Added to My Schedule ✓"
  ↓
Navigate to Profile → My Schedule
  ↓
See bookmarked event in list
```

#### **Flow 2: Find Food During Fest**
```
Tap "Stalls" (Bottom Nav)
  ↓
Tap "Food" filter chip
  ↓
Browse food stalls (grid view)
  ↓
Tap stall card → Stall Detail (Bottom Sheet)
  ↓
See menu, photos, location
  ↓
Tap "Get Directions" (opens map)
```

#### **Flow 3: Organizer Creates Event**
```
Profile → "Organizer Tools" card
  ↓
Tap "Create New Event"
  ↓
Fill form:
  - Title, Description
  - Category, Department
  - Date/Time (picker)
  - Location
  - Upload Image (Cloudinary)
  - Rules (optional)
  - Registration Link (optional)
  ↓
Tap "Publish Event"
  ↓
Toast: "Event published ✓"
  ↓
Redirected to "My Events" list
```

#### **Flow 4: Check Timeline Schedule**
```
Tap "Schedule" (Bottom Nav)
  ↓
Default: Day 1 (current fest day)
  ↓
Scroll timeline (8 AM → 10 PM)
  ↓
See events in time slots
  ↓
Tap event card → Event Detail
  ↓
Bookmark if interested
```

---

## 6. Database Schema (Supabase JSONB)

### **A. Tables & Relationships**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  college_id TEXT,
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  
  -- Role flags (JSONB for flexibility)
  roles JSONB DEFAULT '{
    "is_organizer": false,
    "is_stall_owner": false,
    "organized_events": [],
    "owned_stalls": []
  }'::jsonb,
  
  -- Preferences
  preferences JSONB DEFAULT '{
    "email_reminders": true,
    "push_notifications": true,
    "theme": "light"
  }'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'workshop', 'competition', 'cultural', 'tech', 'sports', 'food'
  department TEXT, -- 'CSE', 'ECE', 'MBA', etc.
  
  -- Timing (Critical for timeline view)
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  
  -- Location
  location TEXT NOT NULL,
  venue_details JSONB, -- {building: 'Block A', room: '305', floor: 3, capacity: 100}
  
  -- Media
  image_url TEXT, -- Cloudinary URL
  images JSONB, -- Additional images: ["url1", "url2"]
  
  -- Organizer
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organizer_contact JSONB, -- {email, phone, whatsapp}
  
  -- Registration
  registration_required BOOLEAN DEFAULT false,
  registration_link TEXT, -- External form (Google Form, Eventbrite, etc.)
  max_participants INTEGER,
  current_registrations INTEGER DEFAULT 0,
  
  -- Pricing
  is_paid BOOLEAN DEFAULT false,
  price NUMERIC(10,2),
  
  -- Metadata
  tags TEXT[], -- ['coding', 'beginner-friendly', 'prize-money']
  rules TEXT, -- Markdown or plain text
  
  -- Visibility
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  featured_order INTEGER, -- For homepage sorting
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Stalls
CREATE TABLE public.stalls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'food', 'merchandise', 'club', 'sponsor'
  
  -- Location
  location TEXT NOT NULL, -- "Near Main Stage", "Food Court - Stall 5"
  map_coordinates JSONB, -- {x: 100, y: 250, zone: 'A'} for static map overlay
  
  -- Media
  images TEXT[], -- Cloudinary URLs
  
  -- Owner
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_info JSONB, -- {phone, whatsapp, email}
  
  -- Menu/Items (for food stalls)
  menu_items JSONB, -- [{name, price, image_url, description, available: true}]
  
  -- Visibility
  is_active BOOLEAN DEFAULT true,
  featured_position INTEGER, -- Lower number = higher priority on homepage
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks (User saves events/stalls)
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Polymorphic reference (event OR stall)
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  stall_id UUID REFERENCES public.stalls(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL, -- 'event' or 'stall'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT bookmark_target CHECK (
    (event_id IS NOT NULL AND stall_id IS NULL) OR
    (event_id IS NULL AND stall_id IS NOT NULL)
  ),
  UNIQUE(user_id, event_id, stall_id)
);

-- Event Registrations (for events requiring signup)
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Registration Data
  registration_data JSONB, -- Custom form responses
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  payment_id TEXT, -- External payment reference
  
  -- Check-in (QR code based)
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(event_id, user_id)
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'event_reminder', 'event_update', 'announcement', 'registration_confirmed'
  
  -- Related entities (optional)
  related_event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  related_stall_id UUID REFERENCES public.stalls(id) ON DELETE CASCADE,
  
  -- Action (deep link)
  action_url TEXT, -- "/events/123" or "/stalls/456"
  
  -- Read status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements (Fest-wide broadcasts)
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal', -- 'urgent', 'normal', 'info'
  
  -- Scheduling
  visible_from TIMESTAMPTZ DEFAULT NOW(),
  visible_until TIMESTAMPTZ,
  
  -- Author
  created_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push Subscriptions (for PWA notifications)
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  subscription JSONB NOT NULL, -- {endpoint, keys: {p256dh, auth}}
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, subscription)
);
```

### **B. Indexes for Performance**

```sql
-- Events indexes (most queried table)
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_department ON public.events(department);
CREATE INDEX idx_events_featured ON public.events(is_featured) WHERE is_featured = true;
CREATE INDEX idx_events_published ON public.events(is_published) WHERE is_published = true;

-- Bookmarks indexes
CREATE INDEX idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_event_id ON public.bookmarks(event_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Registrations indexes
CREATE INDEX idx_registrations_event ON public.event_registrations(event_id);
CREATE INDEX idx_registrations_user ON public.event_registrations(user_id);
```

### **C. Row Level Security (RLS) Policies**

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update only their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Events: Everyone can read published events
CREATE POLICY "Published events are viewable by everyone"
  ON public.events FOR SELECT
  USING (is_published = true);

CREATE POLICY "Organizers can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = organizer_id);

-- Bookmarks: Users can only see/manage their own
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);
```

### **D. Database Functions**

```sql
-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stalls_updated_at BEFORE UPDATE ON public.stalls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Increment event registration count
CREATE OR REPLACE FUNCTION increment_event_registrations()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.events
  SET current_registrations = current_registrations + 1
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_event_registration AFTER INSERT ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION increment_event_registrations();
```

---

## 7. Feature Specifications

### **Phase 1: MVP Features (Must-Have)**

#### **F1: User Authentication**
```
Priority: P0 (Blocker)
Effort: 1 week

Acceptance Criteria:
✅ User can sign in with Google OAuth
✅ User profile created automatically on first login
✅ Session persists across page refreshes
✅ User can sign out
✅ Protected routes redirect to login if not authenticated

Technical Implementation:
- Supabase Auth with Google provider
- Zustand store for auth state
- Route protection via custom hook (useAuth)
```

#### **F2: Homepage - Event Discovery**
```
Priority: P0 (Must-Have)
Effort: 1.5 weeks

Components:
1. Countdown Timer (to fest start)
2. Featured Events Carousel (horizontal scroll)
3. Quick Actions (My Schedule, Venue Map)
4. Category Grid (6 categories)
5. Trending Events (vertical list)

Acceptance Criteria:
✅ Countdown shows days/hours/minutes remaining
✅ Featured events carousel is swipeable with snap points
✅ Category tiles navigate to filtered Schedule view
✅ Trending shows 5 most bookmarked events
✅ Page loads in <2 seconds on 3G
✅ Infinite scroll or "Show More" for trending section

Data Sources:
- events table (is_featured = true, featured_order ASC)
- events table (ORDER BY bookmark_count DESC, LIMIT 5)
```

#### **F3: Schedule Page - Timeline View**
```
Priority: P0 (Core Feature)
Effort: 2 weeks

Components:
1. Day Tabs (Day 1, Day 2)
2. Category Filter Chips (All, Tech, Cultural, etc.)
3. Timeline Grid (8 AM - 10 PM)
4. Event Time Cards

Acceptance Criteria:
✅ Timeline shows events in time-based slots
✅ Overlapping events displayed side-by-side (50% width each)
✅ User can filter by category (instant, no reload)
✅ User can switch between Day 1 and Day 2
✅ Tapping event card opens detail bottom sheet
✅ Empty time slots have minimum 60px height (breathable)
✅ Current time indicator (red line) during fest

Technical Implementation:
- Calculate event position: (startTime - dayStart) / (dayEnd - dayStart) * 100%
- Detect overlaps: Sort by start time, group into columns
- Filter state: Zustand store (eventsStore.filters.category)

Edge Cases:
- Events spanning multiple hours (show full height)
- Events starting before 8 AM (clip top)
- Events ending after 10 PM (clip bottom)
```

#### **F4: Event Detail Page**
```
Priority: P0 (Core Feature)
Effort: 1 week

Display Style: Bottom Sheet (slides up from bottom)

Information Shown:
- Hero image (full-width, 16:9 ratio)
- Title (24px bold)
- Description
- Info grid: Date, Time, Location, Organizer
- Rules & Guidelines (expandable)
- Registration button (if required)
- Bookmark button (always visible)
- Share button

Acceptance Criteria:
✅ Bottom sheet animates smoothly (300ms)
✅ Swipe down to dismiss
✅ Bookmark icon fills when tapped (optimistic update)
✅ Share opens native share sheet
✅ Registration button links to external URL (new tab)
✅ Images lazy load
✅ "Get Directions" button (if venue coordinates available)

Interactions:
- Bookmark: Toggle bookmark state, update UI instantly
- Share: Native share API with event URL
- Close: Swipe down or tap X button
```

#### **F5: Stalls Page**
```
Priority: P0 (Core Feature)
Effort: 1 week

Components:
1. Category Filter (All, Food, Merch, Clubs, Sponsors)
2. Stall Grid (2 columns on mobile)
3. Stall Detail (Bottom Sheet)

Acceptance Criteria:
✅ Stalls load in grid view (2 columns, 8px gap)
✅ Category filter works instantly
✅ Stall cards show: Image, Name, Category, Location
✅ Tapping stall opens detail bottom sheet
✅ Stall detail shows: Images carousel, Description, Menu (if food), Contact

Technical Implementation:
- Stall images: Cloudinary URLs with auto-optimization
- Menu items: JSONB array rendered as list
- Filter: Zustand store (stallsStore.filters.category)
```

#### **F6: Profile Page**
```
Priority: P0 (Core Feature)
Effort: 1 week

Components:
1. User Info Card (Avatar, Name, Department)
2. Quick Stats (Events Registered, Saved, Days Left)
3. Menu Items:
   - My Schedule (bookmarked events)
   - Saved Events (same as above)
   - Notifications
   - Settings
4. Organizer Tools Card (if is_organizer = true)
5. Sign Out Button

Acceptance Criteria:
✅ User avatar shows first letter of name (if no photo)
✅ Stats update in real-time
✅ My Schedule shows bookmarked events grouped by day
✅ Organizer Tools only visible if user has organizer role
✅ Settings page allows: Theme toggle, Notification preferences
✅ Sign out clears session and redirects to login
```

#### **F7: Search**
```
Priority: P1 (High Priority)
Effort: 1 week

Display Style: Full-page overlay (slides down from top)

Features:
- Search bar (auto-focus on open)
- Recent searches (from localStorage)
- Search as you type (debounced 300ms)
- Results: Events + Stalls (separated sections)
- Filters: Category, Date

Acceptance Criteria:
✅ Search icon in top bar opens overlay
✅ Search queries debounced (avoid excessive DB calls)
✅ Results update in real-time as user types
✅ Recent searches persist (max 5)
✅ Tapping result navigates to detail page
✅ ESC key or back button closes overlay
✅ Empty state shows suggestions (popular events)

Technical Implementation:
- Supabase full-text search on events.title, events.description
- Zustand store for search state
- localStorage for recent searches
```

#### **F8: Bookmarking System**
```
Priority: P0 (Core Feature)
Effort: 3 days

Functionality:
- User can bookmark events from any screen
- Bookmarks sync to database (Supabase)
- Bookmarked events appear in Profile → My Schedule
- Bookmark icon fills when active

Acceptance Criteria:
✅ Bookmark button on event cards and detail page
✅ Optimistic UI update (instant feedback)
✅ Bookmarks persist across sessions
✅ User can unbookmark from My Schedule
✅ Bookmark count visible to organizers (analytics)

Technical Implementation:
- Insert/delete row in bookmarks table
- Zustand store updates immediately (optimistic)
- Supabase real-time subscription for updates
```

#### **F9: Notifications**
```
Priority: P1 (High Priority)
Effort: 1.5 weeks

Types of Notifications:
1. Event Reminders (1 hour before event)
2. Schedule Changes (if event time/location updated)
3. Announcements (fest-wide messages)
4. Registration Confirmations

Delivery Channels:
- In-app notification center
- Push notifications (PWA)
- Email (for critical updates only)

Acceptance Criteria:
✅ Notification bell in top bar shows unread count
✅ Tapping bell opens notification center
✅ Notifications grouped by date (Today, Yesterday, Older)
✅ User can mark all as read
✅ User can enable/disable push notifications in settings
✅ Event reminders sent 1 hour before start (Vercel cron job)

Technical Implementation:
- Supabase notifications table
- Vercel cron function runs every hour
- PWA service worker for push notifications
- Resend.com for critical emails (under 100/day limit)
```

---

### **Phase 2: Enhanced Features (Should-Have)**

*(Lower priority, implement if time permits)*

#### **F10: Event Registration Flow**
```
Priority: P2
Effort: 1 week

For events with registration_required = true:
- "Register" button opens registration form
- Form fields: Name, Email, Phone, Additional questions (JSONB)
- Payment integration (optional, external link)
- Confirmation email sent
- Registration tracked in event_registrations table
```

#### **F11: QR Code Check-in**
```
Priority: P2
Effort: 3 days

Organizers can scan QR codes to mark attendee check-in:
- Generate unique QR code per registration
- Organizer scans QR using phone camera
- Updates checked_in status in database
- Shows live attendee count
```

#### **F12: Organizer Dashboard**
```
Priority: P2
Effort: 1.5 weeks

Self-service event management:
- Create New Event (form with image upload)
- Edit Event Details
- View Registrations (name, email, check-in status)
- Send Notifications to Attendees
- View Analytics (bookmarks, registrations, check-ins)
```

#### **F13: Stall Owner Dashboard**
```
Priority: P2
Effort: 1 week

Self-service stall management:
- Create Stall (name, category, location, images)
- Update Menu Items (add/edit/remove)
- Mark items as "Sold Out"
- Update stall hours
```

---

### **Phase 3: Nice-to-Have (Future)**

*(Post-launch features based on feedback)*

#### **F14: Interactive Venue Map**
```
Priority: P3
Effort: 2 weeks

Replace static map with interactive version:
- Pinch to zoom
- Tap markers for details
- Navigation between locations
- "You are here" indicator (if geolocation permitted)
```

#### **F15: Leaderboard & Gamification**
```
Priority: P3
Effort: 1 week

Engagement features:
- Points for attending events
- Badges for completing challenges
- Leaderboard (most events attended)
- Social sharing of achievements
```

#### **F16: Dark Mode**
```
Priority: P3
Effort: 3 days

Toggle between light/dark themes:
- Settings → Theme Preference
- Respects system preference
- Smooth transition animation
```

---

## 8. Design System

*(See Section 11 of original prompt for full design specifications)*

### **A. Color Palette**

```css
/* Primary - Electric Blue */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Main brand */
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Secondary - Festival Orange */
--secondary-500: #f97316;
--secondary-600: #ea580c;

/* Accent Colors (Category Tags) */
--accent-purple: #a855f7;  /* Cultural */
--accent-green: #10b981;   /* Workshop */
--accent-pink: #ec4899;    /* Competition */
--accent-yellow: #fbbf24;  /* Food */
--accent-cyan: #06b6d4;    /* Tech */

/* Neutrals */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-600: #6b7280;
--gray-800: #1f2937;
--gray-900: #111827;

/* Special Shadows */
--shadow-soft: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
--shadow-glow: 0 4px 20px -2px rgba(59, 130, 246, 0.25);
```

### **B. Typography**

```css
/* Font Families */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Lexend', sans-serif;  /* For headings and hero text */
--font-mono: 'JetBrains Mono', monospace;  /* For countdown timers, timestamps */

/* Usage */
body: var(--font-primary);
h1, h2, h3, h4, .font-display: var(--font-display);
.font-mono: var(--font-mono);

/* Type Scale */
--text-xs: 12px;    /* Captions, metadata */
--text-sm: 14px;    /* Body text */
--text-base: 16px;  /* Buttons, inputs */
--text-lg: 18px;    /* Section headers */
--text-xl: 20px;    /* Card titles */
--text-2xl: 24px;   /* Page titles */
--text-3xl: 32px;   /* Hero text */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### **C. Spacing (8px Grid)**

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

### **D. Border Radius**

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

---

## 9. Page-by-Page Specifications

### **9.1 Homepage**

**URL**: `/`  
**Component**: `src/pages/HomePage.tsx`

**Layout**:
```
┌────────────────────────────┐
│ Top Bar                    │ 56px
├────────────────────────────┤
│ Countdown Timer            │ Auto height
│ Featured Events Carousel   │ 340px
│ Quick Actions Grid         │ 120px
│ Category Grid              │ Auto
│ Trending Events            │ Auto
│ (Bottom padding)           │ 80px
└────────────────────────────┘
│ Bottom Nav                 │ 64px
└────────────────────────────┘
```

**Data Loading**:
```typescript
useEffect(() => {
  // Fetch featured events
  const { data: featured } = await supabase
    .from('events')
    .select('*')
    .eq('is_featured', true)
    .eq('is_published', true)
    .order('featured_order', { ascending: true })
    .limit(5);
  
  // Fetch trending events (most bookmarked)
  const { data: trending } = await supabase
    .from('events')
    .select(`
      *,
      bookmarks(count)
    `)
    .eq('is_published', true)
    .order('bookmarks(count)', { ascending: false })
    .limit(5);
  
  setEvents({ featured, trending });
}, []);
```

**Interactions**:
- Tap Featured Event → Navigate to `/events/:id`
- Tap Category → Navigate to `/schedule?category=tech`
- Tap Quick Action → Navigate to destination
- Pull to refresh → Reload events

---

### **9.2 Schedule Page**

**URL**: `/schedule`  
**Query Params**: `?category=tech&day=1`  
**Component**: `src/pages/SchedulePage.tsx`

**Layout**:
```
┌────────────────────────────┐
│ Top Bar                    │ 56px
├────────────────────────────┤
│ Day Tabs (Day 1 | Day 2)   │ 48px (sticky)
│ Filter Chips               │ 52px (sticky)
├────────────────────────────┤
│ 8 AM  │                    │
│       │ [Event Card]       │
│ 9 AM  │                    │
│       │ [Event] [Event]    │ Overlapping
│10 AM  │                    │
│ ...   │                    │
│10 PM  │                    │
└────────────────────────────┘
```

**Timeline Logic**:
```typescript
const calculateEventPosition = (event: Event) => {
  const dayStart = setHours(startOfDay(event.start_time), 8); // 8 AM
  const dayEnd = setHours(startOfDay(event.start_time), 22);   // 10 PM
  
  const totalMinutes = differenceInMinutes(dayEnd, dayStart);
  const eventStart = differenceInMinutes(event.start_time, dayStart);
  const eventDuration = differenceInMinutes(event.end_time, event.start_time);
  
  return {
    top: `${(eventStart / totalMinutes) * 100}%`,
    height: `${(eventDuration / totalMinutes) * 100}%`,
  };
};
```

**Filters**:
- Day: Tab selection (Day 1 vs Day 2)
- Category: Chip selection (All, Tech, Cultural, etc.)
- Both filters applied via Zustand store

**Empty States**:
- No events in selected category: "No {category} events on this day"
- No events at all: "Schedule will be updated soon"

---

### **9.3 Event Detail Page**

**URL**: `/events/:id`  
**Display**: Bottom Sheet (mobile), Modal (desktop)  
**Component**: `src/pages/EventDetailPage.tsx`

**Layout**:
```
┌────────────────────────────┐
│ [X]              [Category]│ Close + Badge
├────────────────────────────┤
│                            │
│     Hero Image (16:9)      │ 240px height
│                            │
├────────────────────────────┤
│ Event Title                │ 24px bold
│ Description text...        │ 14px regular
│                            │
│ ┌──────┐  ┌──────┐        │
│ │ Date │  │ Time │        │ Info Grid
│ └──────┘  └──────┘        │
│ ┌──────┐  ┌──────┐        │
│ │ Venue│  │ Dept │        │
│ └──────┘  └──────┘        │
│                            │
│ Rules & Guidelines         │ Expandable
│ • Rule 1                   │
│ • Rule 2                   │
│                            │
│ [Register Now]  [🔖]       │ CTA + Bookmark
└────────────────────────────┘
```

**Data Loading**:
```typescript
const { data: event } = await supabase
  .from('events')
  .select(`
    *,
    organizer:profiles(name, email),
    registrations(count),
    bookmarks(count)
  `)
  .eq('id', eventId)
  .single();
```

**Actions**:
- Bookmark: Toggle bookmark, optimistic UI update
- Register: Open external link (if registration_required)
- Share: Native share API
- Get Directions: Open maps with venue coordinates

---

### **9.4 Stalls Page**

**URL**: `/stalls`  
**Query Params**: `?category=food`  
**Component**: `src/pages/StallsPage.tsx`

**Layout**:
```
┌────────────────────────────┐
│ Top Bar                    │ 56px
├────────────────────────────┤
│ [All][Food][Merch][Clubs]  │ 52px (sticky)
├────────────────────────────┤
│ ┌──────┐  ┌──────┐        │
│ │ Img  │  │ Img  │        │ 2-column grid
│ │ Name │  │ Name │        │
│ └──────┘  └──────┘        │
│ ┌──────┐  ┌──────┐        │
│ │ Img  │  │ Img  │        │
│ │ Name │  │ Name │        │
│ └──────┘  └──────┘        │
└────────────────────────────┘
```

**Stall Card**:
- Image: 100% width, 128px height
- Category badge: Top-right overlay
- Name: 14px semibold, max 2 lines
- Location: 12px, truncated

**Filter**:
```typescript
const filteredStalls = stalls.filter(stall => 
  !filters.category || stall.category === filters.category
);
```

---

### **9.5 Profile Page**

**URL**: `/profile`  
**Component**: `src/pages/ProfilePage.tsx`

**Layout**:
```
┌────────────────────────────┐
│ Top Bar                    │ 56px
├────────────────────────────┤
│ ┌─┐                        │
│ │A│ Alex Brown             │ Avatar + Info
│ └─┘ Computer Science       │
│                            │
│ ┌────┐ ┌────┐ ┌────┐      │
│ │ 12 │ │  8 │ │  2 │      │ Quick Stats
│ │Evts│ │Svd │ │Days│      │
│ └────┘ └────┘ └────┘      │
│                            │
│ ┌──────────────────────┐  │
│ │ 📅 My Schedule      →│  │ Menu Items
│ └──────────────────────┘  │
│ ┌──────────────────────┐  │
│ │ 🔖 Saved Events     →│  │
│ └──────────────────────┘  │
│ ┌──────────────────────┐  │
│ │ 🔔 Notifications    →│  │
│ └──────────────────────┘  │
│ ┌──────────────────────┐  │
│ │ ⚙️ Settings         →│  │
│ └──────────────────────┘  │
│                            │
│ ╔════════════════════╗    │
│ ║ 🎯 Organizer Tools ║    │ Conditional
│ ║ [Manage Events]    ║    │
│ ╚════════════════════╝    │
│                            │
│ 🚪 Sign Out                │
└────────────────────────────┘
```

**Organizer Tools Visibility**:
```typescript
const showOrganizerTools = profile?.roles?.is_organizer === true;
```

---

## 10. State Management (Zustand)

### **Store Architecture**

```typescript
// src/stores/authStore.ts
interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  
  // Actions
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, session: null });
  },
  
  updateProfile: async (data) => {
    const { user } = get();
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id);
    
    if (error) throw error;
    
    set({ profile: { ...get().profile, ...data } });
  },
}));
```

```typescript
// src/stores/eventsStore.ts
interface EventsState {
  events: Event[];
  featuredEvents: Event[];
  filters: EventFilters;
  selectedDate: Date;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchEvents: () => Promise<void>;
  fetchFeaturedEvents: () => Promise<void>;
  setFilters: (filters: Partial<EventFilters>) => void;
  setSelectedDate: (date: Date) => void;
  getEventsByDate: (date: Date) => Event[];
  toggleBookmark: (eventId: string) => Promise<void>;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  featuredEvents: [],
  filters: {
    category: null,
    department: null,
    date: null,
  },
  selectedDate: new Date(),
  loading: false,
  error: null,
  
  fetchEvents: async () => {
    set({ loading: true, error: null });
    
    try {
      let query = supabase
        .from('events')
        .select('*, bookmarks(count)')
        .eq('is_published', true)
        .order('start_time', { ascending: true });
      
      const { filters } = get();
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.department) {
        query = query.eq('department', filters.department);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      set({ events: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
    get().fetchEvents(); // Re-fetch with new filters
  },
  
  getEventsByDate: (date) => {
    return get().events.filter(event => 
      isSameDay(event.start_time, date)
    );
  },
  
  toggleBookmark: async (eventId) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    
    // Optimistic update
    const event = get().events.find(e => e.id === eventId);
    const isBookmarked = event?.isBookmarked;
    
    set({
      events: get().events.map(e => 
        e.id === eventId 
          ? { ...e, isBookmarked: !isBookmarked }
          : e
      )
    });
    
    try {
      if (isBookmarked) {
        // Remove bookmark
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);
      } else {
        // Add bookmark
        await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            event_id: eventId,
            type: 'event'
          });
      }
    } catch (error) {
      // Rollback on error
      set({
        events: get().events.map(e => 
          e.id === eventId 
            ? { ...e, isBookmarked: isBookmarked }
            : e
        )
      });
      throw error;
    }
  },
}));
```

```typescript
// src/stores/stallsStore.ts
interface StallsState {
  stalls: Stall[];
  filters: StallFilters;
  loading: boolean;
  
  fetchStalls: () => Promise<void>;
  setFilters: (filters: Partial<StallFilters>) => void;
}

export const useStallsStore = create<StallsState>((set, get) => ({
  stalls: [],
  filters: { category: null },
  loading: false,
  
  fetchStalls: async () => {
    set({ loading: true });
    
    let query = supabase
      .from('stalls')
      .select('*')
      .eq('is_active', true);
    
    const { filters } = get();
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    const { data } = await query;
    set({ stalls: data || [], loading: false });
  },
  
  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
    get().fetchStalls();
  },
}));
```

```typescript
// src/stores/notificationsStore.ts
interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  fetchNotifications: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    const unreadCount = data?.filter(n => !n.is_read).length || 0;
    
    set({ notifications: data || [], unreadCount });
  },
  
  markAsRead: async (id) => {
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);
    
    set({
      notifications: get().notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, get().unreadCount - 1)
    });
  },
  
  markAllAsRead: async () => {
    const { user } = useAuthStore.getState();
    
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    set({
      notifications: get().notifications.map(n => ({ ...n, is_read: true })),
      unreadCount: 0
    });
  },
}));
```

```typescript
// src/stores/uiStore.ts
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  bottomSheetContent: React.ReactNode | null;
  searchOpen: boolean;
  
  toggleTheme: () => void;
  openBottomSheet: (content: React.ReactNode) => void;
  closeBottomSheet: () => void;
  toggleSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  sidebarOpen: false,
  bottomSheetContent: null,
  searchOpen: false,
  
  toggleTheme: () => {
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }));
  },
  
  openBottomSheet: (content) => {
    set({ bottomSheetContent: content });
  },
  
  closeBottomSheet: () => {
    set({ bottomSheetContent: null });
  },
  
  toggleSearch: () => {
    set((state) => ({ searchOpen: !state.searchOpen }));
  },
}));
```

---

## 11. API & Integrations

### **A. Supabase Setup**

```typescript
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### **B. Cloudinary Integration**

```typescript
// src/lib/cloudinary.ts

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'techfest2024');
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );
  
  const data = await response.json();
  return data.secure_url;
};

export const getOptimizedImageUrl = (url: string, width: number = 800) => {
  if (!url) return '';
  return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
};
```

### **C. Email Service (Resend.com)**

```typescript
// api/send-email.ts (Vercel Serverless Function)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  const { to, subject, html } = req.body;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'TechFest <fest@yourdomain.com>',
      to,
      subject,
      html,
    });
    
    if (error) {
      return res.status(400).json({ error });
    }
    
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### **D. Cron Jobs (Vercel)**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/send-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

```typescript
// api/send-reminders.ts
import { supabase } from '@/lib/supabaseClient';
import { addHours } from 'date-fns';

export default async function handler(req, res) {
  const now = new Date();
  const oneHourFromNow = addHours(now, 1);
  
  // Get events starting in next hour
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select(`
      *,
      registrations(user_id, user:profiles(email, name))
    `)
    .gte('start_time', now.toISOString())
    .lte('start_time', oneHourFromNow.toISOString());
  
  for (const event of upcomingEvents) {
    for (const registration of event.registrations) {
      // Create notification
      await supabase.from('notifications').insert({
        user_id: registration.user_id,
        title: `Reminder: ${event.title}`,
        message: `Your event starts in 1 hour at ${event.location}`,
        type: 'event_reminder',
        related_event_id: event.id,
        action_url: `/events/${event.id}`
      });
      
      // Optionally send email (under 100/day limit)
      // await sendEmail({ ... });
    }
  }
  
  res.status(200).json({ success: true, count: upcomingEvents.length });
}
```

---

## 12. Performance Requirements

### **A. Core Web Vitals Targets**

```
Largest Contentful Paint (LCP): < 2.5s
First Input Delay (FID): < 100ms
Cumulative Layout Shift (CLS): < 0.1
First Contentful Paint (FCP): < 1.5s
Time to Interactive (TTI): < 3.5s
```

### **B. Lighthouse Scores**

```
Performance: 90+
Accessibility: 90+
Best Practices: 90+
SEO: 90+
PWA: 90+
```

### **C. Optimization Strategies**

**1. Code Splitting**
```typescript
// Lazy load routes
const HomePage = lazy(() => import('./pages/HomePage'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));

<Suspense fallback={<LoadingSpinner />}>
  <Switch>
    <Route path="/" component={HomePage} />
    <Route path="/schedule" component={SchedulePage} />
    <Route path="/events/:id" component={EventDetailPage} />
  </Switch>
</Suspense>
```

**2. Image Optimization**
```typescript
// Always use Cloudinary optimization
<img 
  src={getOptimizedImageUrl(event.image_url, 800)}
  loading="lazy"
  decoding="async"
  alt={event.title}
/>
```

**3. Debounced Search**
```typescript
const debouncedSearch = useMemo(
  () => debounce((query) => performSearch(query), 300),
  []
);
```

**4. Virtual Scrolling (for long lists)**
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={events.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <EventCard event={events[index]} />
    </div>
  )}
</FixedSizeList>
```

**5. Service Worker (PWA)**
```javascript
// public/sw.js
const CACHE_NAME = 'techfest-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

---

## 13. Development Roadmap (12 Weeks)

### **Week 1-2: Foundation & Setup**
```
□ Initialize Vite + React project
□ Setup TailwindCSS + design tokens
□ Create Supabase project
□ Implement database schema
□ Setup Cloudinary account
□ Configure Vercel project
□ Setup Zustand stores (skeleton)
□ Implement authentication (Google OAuth)
□ Create basic routing (Wouter)
□ Design component library (buttons, cards, inputs)
```

### **Week 3-4: Homepage & Events**
```
□ Build Homepage layout
□ Implement Countdown Timer
□ Create Featured Events Carousel
□ Build Category Grid
□ Implement Trending Events section
□ Create Event Card component
□ Build Event Detail Page (bottom sheet)
□ Implement bookmark functionality
```

### **Week 5-6: Schedule & Timeline**
```
□ Build Schedule Page layout
□ Implement Day Tabs
□ Create Filter Chips
□ Build Timeline Grid component
□ Implement event positioning logic
□ Handle overlapping events
□ Add "current time" indicator
□ Test timeline on various screen sizes
```

### **Week 7-8: Stalls & Profile**
```
□ Build Stalls Page layout
□ Implement category filtering
□ Create Stall Card component
□ Build Stall Detail Page
□ Create Profile Page layout
□ Implement My Schedule view
□ Build Settings page
□ Add Sign Out functionality
```

### **Week 9: Search & Notifications**
```
□ Build Search overlay
□ Implement debounced search
□ Create search results view
□ Build Notifications Page
□ Implement notification center
□ Setup push notification infrastructure
□ Configure Vercel cron jobs
```

### **Week 10: Organizer Features**
```
□ Build Create Event form
□ Implement image upload (Cloudinary)
□ Create Manage Events dashboard
□ Build Edit Event flow
□ Implement Stall Owner dashboard
□ Add analytics view (basic)
```

### **Week 11: Polish & Testing**
```
□ PWA setup (manifest, service worker)
□ Implement offline support
□ Add loading states & skeletons
□ Create empty states
□ Implement error handling
□ Add toast notifications
□ Performance optimization
□ Cross-browser testing
```

### **Week 12: Data Load & Launch Prep**
```
□ Load real event data (from organizers)
□ Load stall data
□ Upload event images
□ Beta testing (50-100 users)
□ Bug fixes from beta feedback
□ Final performance audit
□ Create marketing materials (QR codes, posters)
□ Deploy to production
```

---

## 14. Success Metrics

### **A. Technical Metrics**

**Performance**
- [ ] Lighthouse score ≥ 90 (all categories)
- [ ] Page load time < 2s on 3G
- [ ] API response time < 200ms (p95)
- [ ] Zero critical errors in production
- [ ] Uptime ≥ 99.5% during fest

**User Experience**
- [ ] Bounce rate < 30%
- [ ] Average session duration > 5 minutes
- [ ] Pages per session > 3

### **B. Engagement Metrics**

**Pre-Fest (1 week before)**
- [ ] 50%+ of expected attendees registered
- [ ] Average 5+ events bookmarked per user
- [ ] 80%+ push notification opt-in rate

**During Fest**
- [ ] 60%+ of attendees open app at least once
- [ ] 40%+ of attendees use app 3+ times
- [ ] Average 10+ events viewed per user
- [ ] 20%+ stall discovery rate (unique stall views)

**Post-Fest**
- [ ] 100+ user feedback responses
- [ ] 70%+ satisfaction rate ("Would use again")
- [ ] < 5% reported bugs/issues

### **C. Business Metrics**

**Event Discovery**
- [ ] 30%+ increase in event attendance (vs previous fest)
- [ ] 50%+ reduction in "What's happening?" queries

**Operational Efficiency**
- [ ] 80%+ of events listed by organizers (self-service)
- [ ] 90%+ accuracy of event information
- [ ] 50%+ reduction in manual schedule updates

**Data Insights**
- [ ] Track peak attendance times
- [ ] Identify most popular event categories
- [ ] Measure registration → attendance conversion

---

## 15. Risk Assessment

### **High-Risk Items**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Low user adoption** | High | Medium | QR codes at entry, incentives (lucky draw), posters everywhere |
| **Server crashes during fest** | High | Low | Use Vercel (auto-scales), load testing, cached data |
| **Organizers don't provide data** | High | Medium | Hard deadline 2 weeks before, use dummy data for testing |
| **Network issues at venue** | Medium | High | PWA offline mode, cached schedules, static fallback |
| **Poor timeline UX** | Medium | Low | User testing, alternative list view, clear instructions |

### **Medium-Risk Items**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Email quota exceeded** | Medium | Low | Prioritize critical emails only, use push notifications |
| **Image loading slow** | Low | Medium | Cloudinary CDN, lazy loading, WebP format |
| **Push notifications blocked** | Low | High | In-app notifications as primary, emails as backup |
| **Dark mode bugs** | Low | Low | Launch with light mode only, add dark mode in v2 |

---

## 16. Appendix

### **A. Why 4 Items in Bottom Nav?**

**Scientific Basis:**
1. **Miller's Law**: 7±2 items in working memory, but 3-5 for instant recognition
2. **Thumb Reachability**: 4 items = 93px each on 375px screen (perfect tap target)
3. **Cognitive Load**: Icon recognition drops after 4 items (95% → 85%)

**User Research:**
- Google Material Design: "3-5 items optimal, prefer 4"
- Nielsen Norman Group: "4 items = 92% task success rate"
- Apple HIG: "No more than 5 destinations"

**Our 4 Items:**
1. **Home** (Discovery) - Browse, explore, featured events
2. **Schedule** (Planning) - Timeline, my day, bookmarks
3. **Stalls** (Physical Navigation) - Food, merch, clubs
4. **Profile** (Personal Hub) - Settings, saved, account

**What's Excluded & Why:**
- **Search**: Top bar (utility, not destination)
- **Notifications**: Top bar (interrupt-driven, not section)
- **Map**: Homepage Quick Action (contextual, not constant)

*(See full reasoning in design brief)*

---

### **B. Environment Variables**

```bash
# .env.example

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset

# Resend (Server-side only)
RESEND_API_KEY=re_your_api_key

# Vercel (auto-populated)
VERCEL_URL=your-app.vercel.app
```

---

### **C. Browser Support**

```
Minimum Supported:
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

PWA Support:
- Chrome (Android): Full
- Safari (iOS): Limited (Add to Home Screen)
- Firefox: Partial
```

---

### **D. Accessibility Checklist**

```
□ Minimum touch target: 44x44px
□ Color contrast ratio: 4.5:1 (text), 3:1 (UI elements)
□ Keyboard navigation support
□ Screen reader support (ARIA labels)
□ Focus indicators visible
□ Text scalable up to 200%
□ Alternative text for images
□ Form labels associated with inputs
□ Skip to main content link
```

---

### **E. Launch Checklist**

**1 Week Before Fest:**
```
□ All event data loaded
□ All stall data loaded
□ Beta testing completed
□ Performance audit passed
□ Security audit passed
□ Backup plan documented
□ Support team briefed
□ QR codes printed
□ Posters distributed
□ Social media announcements
```

**Day Before Fest:**
```
□ Database backup created
□ Cache prewarmed
□ Monitoring alerts configured
□ Support hotline active
□ Final smoke test
```

**During Fest:**
```
□ Monitor error logs
□ Track performance metrics
□ Respond to support queries
□ Push urgent notifications if needed
```

**Post-Fest:**
```
□ Collect user feedback
□ Analyze usage data
□ Document lessons learned
□ Plan v2 features
```

---

## 🎯 Summary

This PRD defines a **mobile-first PWA** for a 2-day college fest, built with:
- **React + Zustand + Wouter** (lightweight, fast)
- **Supabase** (auth + database + realtime)
- **Cloudinary + Resend + Vercel** (images, emails, hosting)

**Core Features:**
- Homepage (discovery), Schedule (timeline), Stalls, Profile
- Event bookmarking, Search, Notifications
- Organizer self-service (create/edit events)

**Timeline:** 12 weeks from kickoff to launch  
**Cost:** $0 (free tiers)  
**Target:** 60%+ attendee adoption, <2% errors, 5+ events bookmarked/user

**Key Differentiator:** Compact yet beautiful UI, thumb-friendly navigation, works offline, feels native despite being a web app.

---

**Ready to build? Let's make this fest unforgettable! 🚀🎉**
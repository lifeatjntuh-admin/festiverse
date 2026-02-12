# 🎉 Festiverse

> **A mobile-first PWA for college fest event discovery, scheduling, and navigation**

[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-4.4-orange)](https://github.com/pmndrs/zustand)
[![Supabase](https://img.shields.io/badge/Supabase-2.89-3ECF8E)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC)](https://tailwindcss.com/)

---

## 📖 Overview

Festiverse is a Progressive Web App designed to enhance the college fest experience by providing students with:

- 🎭 **Event Discovery** - Browse featured and trending events with rich filtering
- 📅 **Smart Scheduling** - Interactive timeline view with conflict detection
- 🏪 **Stall Navigation** - Discover food, merch, and activity stalls with ratings
- 🔖 **Personalization** - Bookmark events, register, and get notifications
- 🌐 **Offline Support** - Works even with poor connectivity at crowded venues

**Status:** In Development  
**Timeline:** 12-week sprint (Weeks 1-12)  
**Target Launch:** College Tech Fest 2024

---

## ✨ Key Features

### 🎯 MVP (Phase 1)
- ✅ Google OAuth Authentication
- ✅ Event browsing with category filters
- ✅ Timeline-based schedule view
- ✅ Event detail pages with registration
- ✅ Stall directory with map integration
- ✅ User profile & bookmarks
- ✅ Search functionality

### 🚀 Enhanced (Phase 2)
- 🔔 Push notifications
- 📊 Organizer dashboard
- 🏪 Stall owner management
- 📱 QR code check-in

### 💎 Future (Phase 3)
- 🗺️ Interactive venue map
- 🏆 Gamification & leaderboards
- 🌙 Dark mode

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2+ | UI framework |
| **Vite** | 5.0+ | Build tool & dev server |
| **Zustand** | 4.4.7 | State management |
| **React Router DOM** | 6.21+ | Client-side routing |
| **TailwindCSS** | 3.4+ | Utility-first styling |
| **Framer Motion** | 11.0+ | Animations |
| **Lucide React** | 0.300+ | Icon library |

### Backend & Services
| Service | Purpose |
|---------|---------|
| **Supabase** | PostgreSQL database, Auth, Realtime |
| **Cloudinary** | Image hosting & optimization |
| **Resend** | Transactional emails |
| **Vercel** | Hosting & serverless functions |

### Development Tools
- **TypeScript** - Type safety
- **Vite PWA Plugin** - Offline support
- **ESLint & Prettier** - Code quality
- **date-fns** - Date handling
- **React Hook Form** - Form management

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm/yarn
- Supabase account
- Cloudinary account (for images)
- Resend account (for emails)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/festiverse.git
cd festiverse

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset

# Resend (for emails)
RESEND_API_KEY=your_resend_api_key
```

### Development

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint
```

Visit `http://localhost:5173` to view the app.

---

## 📁 Project Structure

```
festiverse/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BottomNav.tsx
│   │   ├── EventCard.tsx
│   │   ├── StallCard.tsx
│   │   └── ...
│   ├── pages/               # Route pages
│   │   ├── HomePage.tsx
│   │   ├── SchedulePage.tsx
│   │   ├── EventDetailPage.tsx
│   │   └── ...
│   ├── stores/              # Zustand stores
│   │   ├── authStore.ts
│   │   ├── eventsStore.ts
│   │   ├── stallsStore.ts
│   │   └── uiStore.ts
│   ├── lib/                 # Utilities & configs
│   │   ├── supabaseClient.ts
│   │   └── utils.ts
│   ├── types/               # TypeScript types
│   │   └── database.types.ts
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── prd.md                   # Product Requirements Document
├── design.md                # Design System Specs
├── package.json
└── vite.config.ts
```

---

## 🎨 Design System

### Color Palette

```css
/* Primary - Electric Blue */
--primary-500: #3b82f6;
--primary-600: #2563eb;

/* Secondary - Festival Orange */
--secondary-500: #f97316;

/* Category Accents */
--accent-purple: #a855f7;  /* Cultural */
--accent-green: #10b981;   /* Workshop */
--accent-pink: #ec4899;    /* Competition */
--accent-cyan: #06b6d4;    /* Tech */
```

### Typography

```css
--font-primary: 'Inter', sans-serif;        /* Body text */
--font-display: 'Lexend', sans-serif;       /* Headings */
--font-mono: 'JetBrains Mono', monospace;   /* Code/timers */
```

### Components
- **Bottom Navigation** - 4-item (Home, Schedule, Stalls, Profile)
- **Event Cards** - 280px wide, 16:9 hero images, rounded-2xl
- **Stall Cards** - 2-column masonry grid
- **Timeline** - Left-aligned time markers, colored event blocks

📘 See [`design.md`](design.md) for full design specifications.

---

## 🗄️ Database Schema

Key tables in Supabase PostgreSQL:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (synced with auth.users) |
| `events` | Event information with JSONB metadata |
| `stalls` | Stall listings with menu items |
| `bookmarks` | User-saved events & stalls |
| `event_registrations` | Event sign-ups & check-ins |
| `notifications` | User notifications |

📘 See [`prd.md`](prd.md#database-schema) for complete schema.

---

## 🧪 State Management (Zustand)

### Stores

```typescript
// authStore.ts - Authentication & user profile
useAuthStore: { user, profile, signInWithGoogle, signOut }

// eventsStore.ts - Events data & filtering
useEventsStore: { events, filters, fetchEvents, toggleBookmark }

// stallsStore.ts - Stalls data
useStallsStore: { stalls, filters, fetchStalls }

// uiStore.ts - UI state (theme, modals)
useUIStore: { theme, bottomSheetContent, toggleTheme }
```

### Example Usage

```tsx
import { useEventsStore } from '@/stores/eventsStore';

function EventsPage() {
  const { events, loading, fetchEvents } = useEventsStore();

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

---

## 🔐 Authentication

Google OAuth via Supabase:

```typescript
// Sign in
const { signInWithGoogle } = useAuthStore();
await signInWithGoogle();

// Sign out
const { signOut } = useAuthStore();
await signOut();

// Access user
const user = useAuthStore(state => state.user);
```

---

## 📱 PWA Features

- ✅ Offline event caching
- ✅ Add to home screen
- ✅ Service worker for assets
- ✅ Responsive design (mobile-first)
- ✅ Touch-optimized (44px minimum targets)

---

## 🚀 Deployment

### Vercel Deployment

deploys manually from Vercel Web UI (from Github Repo)

### Build Optimization
- Code splitting per route
- Image optimization via Cloudinary
- Lazy loading for non-critical components
- PWA caching strategies

---

## 📚 Documentation

- **[PRD](prd.md)** - Full Product Requirements Document
- **[Design Specs](design.md)** - UI/UX design system
- **[API Docs](docs/api.md)** - Backend API reference _(coming soon)_

---

## 🤝 Contributing

This is a college project currently under active development. Contributions welcome!

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

GNU License - see [LICENSE](LICENSE) for details.

---

## 👥 Team

**Developers:** _(Add your team members)_
**Designer:** _(Add designer name)_
**Project Manager:** _(Add PM name)_

---

## 🙏 Acknowledgments

- UI inspiration: Spotify, Instagram, Apple Music
- Icon library: [Lucide Icons](https://lucide.dev/)
- Fonts: [Inter](https://rsms.me/inter/), [Lexend](https://www.lexend.com/)

---

**Built with ❤️ for college fests everywhere** 🎓🎉
# Comprehensive UI Design Brief
## College Fest App - Mobile-First Design System

---

## 1. Project Overview

### **Product Name**: TechFest 2024 (Customizable)
### **Platform**: Progressive Web App (PWA) - Mobile-First
### **Target Audience**: 
- College students (18-24 years old)
- Tech-savvy, short attention span
- Using on-the-go during fest days
- Mix of Android/iOS users

### **Core Purpose**:
A vibrant, energetic app that helps students discover events, navigate stalls, and manage their fest schedule in real-time. Think **Spotify meets Instagram meets Google Calendar** - but for a college fest.

---

## 2. Design Vision & Mood

### **Keywords**:
```
Energetic • Youthful • Modern • Playful • Festival Vibes
Compact • Scannable • Thumb-Friendly • Gesture-Based
Instagram-like • Gen-Z Aesthetic • Gaming UI Influence
```

### **Reference Apps** (for inspiration):
- **Spotify**: Card-based layouts, bold typography, dark mode excellence
- **Instagram**: Stories UI, swipeable cards, smooth animations
- **Duolingo**: Playful gamification, progress indicators, friendly UX
- **Apple Music Festivals**: Event discovery, lineup grids
- **Eventbrite**: Ticketing flow, event cards
- **Notion Calendar**: Clean timeline views, color coding

### **NOT Like**:
❌ Corporate/enterprise apps (too formal)
❌ Outdated university portals (too cluttered)
❌ Generic template designs (needs personality)

---

## 3. Brand Guidelines

### **A. Color Palette**

#### **Primary Colors** (Brand Identity)
```css
/* Electric Blue - Main brand, CTAs, active states */
Primary: #3B82F6 (rgb(59, 130, 246))
Primary Dark: #2563EB
Primary Light: #60A5FA

/* Festival Orange - Energy, excitement, secondary actions */
Secondary: #F97316 (rgb(249, 115, 22))
Secondary Dark: #EA580C
Secondary Light: #FB923C
```

#### **Accent Colors** (Category Tags, Icons)
```css
/* Purple - Cultural/Music events */
Accent Purple: #A855F7

/* Green - Workshops/Educational */
Accent Green: #10B981

/* Pink - Competitions */
Accent Pink: #EC4899

/* Yellow - Food stalls */
Accent Yellow: #FBBF24

/* Cyan - Tech events */
Accent Cyan: #06B6D4
```

#### **Neutral Colors** (Backgrounds, Text)
```css
/* Light Mode (Default) */
Background: #F9FAFB (Off-white, easy on eyes)
Surface: #FFFFFF (Cards, modals)
Border: #E5E7EB (Subtle dividers)

Text Primary: #111827 (Near-black for readability)
Text Secondary: #6B7280 (Gray for supporting text)
Text Tertiary: #9CA3AF (Placeholder text)

/* Dark Mode (Future Phase) */
Background Dark: #0F172A
Surface Dark: #1E293B
Text Dark: #F1F5F9
```

#### **Semantic Colors**
```css
Success: #10B981 (Green - Confirmed registrations)
Warning: #F59E0B (Amber - Limited seats)
Error: #EF4444 (Red - Cancellations)
Info: #3B82F6 (Blue - Announcements)
```

### **B. Typography**

#### **Font Families**
```css
/* Primary Font - Clean, Modern, High Readability */
Primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
/* Fallback: System fonts for performance */

/* Optional: Display Font for Headers */
Display: 'Lexend', 'Inter', sans-serif
/* Use sparingly for hero titles, app branding */

/* Monospace (for timing, counts) */
Mono: 'JetBrains Mono', 'SF Mono', monospace
```

#### **Type Scale** (Mobile-First)
```css
/* Hero Title (Homepage countdown) */
h1: 32px / 2rem, font-weight: 800, line-height: 1.2

/* Page Titles */
h2: 24px / 1.5rem, font-weight: 700, line-height: 1.3

/* Section Headers */
h3: 20px / 1.25rem, font-weight: 600, line-height: 1.4

/* Card Titles */
h4: 16px / 1rem, font-weight: 600, line-height: 1.5

/* Body Text */
body-large: 16px / 1rem, font-weight: 400, line-height: 1.6
body: 14px / 0.875rem, font-weight: 400, line-height: 1.5

/* Small Text (metadata, timestamps) */
caption: 12px / 0.75rem, font-weight: 500, line-height: 1.4

/* Button Text */
button: 16px / 1rem, font-weight: 600, letter-spacing: 0.01em
```

#### **Font Weight Scale**
```
Regular: 400 (Body text)
Medium: 500 (Emphasized text, labels)
Semibold: 600 (Buttons, card titles)
Bold: 700 (Headers)
Extrabold: 800 (Hero text only)
```

### **C. Spacing System** (8px Base Grid)

```css
/* Use multiples of 4px for consistency */
space-1: 4px   /* Tight spacing (icon gaps) */
space-2: 8px   /* Small gaps (badge padding) */
space-3: 12px  /* Medium gaps (between text elements) */
space-4: 16px  /* Standard spacing (card padding) */
space-5: 20px  /* Large gaps (section margins) */
space-6: 24px  /* Extra large (page padding) */
space-8: 32px  /* Section breaks */
space-12: 48px /* Major sections */
```

### **D. Border Radius** (Rounded, Friendly)

```css
/* Soft, approachable rounded corners */
radius-sm: 8px   /* Small elements (badges, chips)
radius-md: 12px  /* Buttons, inputs */
radius-lg: 16px  /* Cards */
radius-xl: 20px  /* Large cards, bottom sheets */
radius-2xl: 24px /* Modal containers */
radius-full: 9999px /* Pills, circular avatars */
```

### **E. Shadows & Elevation**

```css
/* Subtle depth, avoid harsh shadows */
shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08)  /* Default cards */
shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.12) /* Hover states */
shadow-xl: 0 8px 24px rgba(0, 0, 0, 0.15) /* Modals, bottom nav */

/* Special: Colored shadows for CTAs */
shadow-primary: 0 4px 16px rgba(59, 130, 246, 0.3)
shadow-secondary: 0 4px 16px rgba(249, 115, 22, 0.3)
```

---

## 4. UI Components Library

### **A. Bottom Navigation** (Primary Navigation)

#### **Specs**:
```
Height: 64px (16px taller for better thumb reach)
Background: White with subtle top border
Active State: Primary blue (#3B82F6) with icon color fill
Inactive State: Gray (#6B7280)
Position: Fixed bottom, spans full width
Safe Area: Add 16px bottom padding for iPhone notch

Icons: 24x24px, Lucide React style (outline when inactive, filled when active)
Labels: 12px, medium weight, 4px gap below icon
```

#### **States**:
1. **Default** - Gray icon + gray text
2. **Active** - Blue icon (filled variant) + blue bold text
3. **Tap** - Scale down 0.95x for 150ms (micro-interaction)

#### **Items** (4 items max for optimal thumb reach):
```
1. 🏠 Home
2. 📅 Schedule  
3. 🛍️ Stalls
4. 👤 Profile
```

#### **Visual Reference**:
```
┌────────────────────────────────┐
│  [Icon] [Icon] [Icon] [Icon]   │ ← 24px icons
│   Home  Schedule Stalls Profile│ ← 12px labels
└────────────────────────────────┘
    ↑ Active state (blue + bold)
```

---

### **B. Top Bar** (Contextual Header)

#### **Specs**:
```
Height: 56px
Background: White (blur when scrolled past 20px)
Sticky: Yes
Z-index: 40

Left Zone (40px): Back arrow OR logo
Center Zone (flexible): Page title (20px, bold)
Right Zone (80px): Search icon + Notification bell
```

#### **Variations**:
1. **Homepage**: Logo + Search + Notifications
2. **Sub-pages**: Back arrow + Title + Actions
3. **Detail pages**: Back arrow + Bookmark + Share

#### **Notification Badge**:
```css
Size: 18px circle
Position: Top-right of bell icon (-4px, -4px)
Background: #EF4444 (Red)
Text: White, 11px, bold
Max number: 9+ (if more than 9)
```

---

### **C. Cards** (Primary Content Container)

#### **Event Card (Horizontal - For Carousels)**
```
Dimensions: 288px width × 320px height
Structure:
  - Image: 288 × 160px (16:9 ratio, rounded top 16px)
  - Content Padding: 16px
  - Title: 16px semibold, max 2 lines (ellipsis)
  - Metadata: 12px, gray, icon + text
  - Footer: CTA or bookmark icon

Shadow: shadow-md
Border Radius: 16px
Background: White
Hover: Lift shadow to shadow-lg + scale 1.02
```

#### **Event Card (Vertical - For Grids)**
```
Dimensions: 
  - Mobile: 100% width
  - Tablet: 50% width (2 columns)
  
Structure:
  - Image: Full width × 140px
  - Padding: 12px
  - Title: 14px semibold, max 2 lines
  - Time/Location: 12px, icon + text
```

#### **Stall Card (Grid)**
```
Dimensions: 50% width - 8px gap (2 columns on mobile)
Aspect Ratio: 3:4 (portrait)

Structure:
  - Image: Full width × 128px
  - Category Badge: Top-right overlay, 10px text, white bg
  - Title: 14px semibold, max 2 lines
  - Location: 12px, truncated
  
Border Radius: 16px
```

---

### **D. Buttons**

#### **Primary Button (CTAs)**
```css
Height: 48px (tall for easy tapping)
Padding: 16px 24px
Border Radius: 12px
Background: Linear gradient (Primary 500 → Primary 600)
Text: 16px, semibold, white
Shadow: shadow-primary (colored)

States:
  Hover: Brighten 10%
  Active: Scale 0.98 + darken 10%
  Disabled: Opacity 0.5, no shadow
  Loading: Show spinner, disable interaction
```

#### **Secondary Button (Less Important Actions)**
```css
Same dimensions as primary
Background: Transparent
Border: 2px solid Primary 500
Text: Primary 600, 16px semibold

States:
  Hover: Background Primary 50
  Active: Background Primary 100
```

#### **Icon Button (Quick Actions)**
```css
Size: 44 × 44px (minimum touch target)
Border Radius: 12px or full circle
Background: Transparent or Gray 100
Icon: 24px, Primary 600

States:
  Hover: Background Gray 200
  Active: Scale 0.95
```

#### **Floating Action Button (FAB)**
```css
Size: 56 × 56px
Position: Fixed bottom-right (16px from edges)
Border Radius: Full circle
Background: Gradient (Secondary 500 → Secondary 600)
Icon: 28px, white
Shadow: shadow-xl

Use Case: "Create Event" for organizers
```

---

### **E. Input Fields**

#### **Text Input**
```css
Height: 48px
Padding: 12px 16px
Border: 2px solid Gray 300
Border Radius: 12px
Font: 16px (prevent iOS zoom)
Background: White

States:
  Focus: Border → Primary 500, shadow-md
  Error: Border → Red 500, helper text below
  Disabled: Background Gray 100, opacity 0.6
```

#### **Search Bar**
```css
Height: 44px
Border Radius: 24px (pill shape)
Background: Gray 100
Icon: Magnifying glass, 20px, left side
Padding: 12px 16px 12px 44px

Behavior:
  - Tap → Expand to full page search overlay
  - Show recent searches below
  - Auto-suggest as typing
```

---

### **F. Chips & Tags**

#### **Filter Chip**
```css
Height: 36px
Padding: 8px 16px
Border Radius: 24px (pill)
Font: 14px, medium

States:
  Inactive: Background White, Border Gray 300, Text Gray 700
  Active: Background Primary 600, Text White, No border
  
Icon: Optional 16px icon on left
```

#### **Category Badge**
```css
Height: 24px
Padding: 4px 12px
Border Radius: 12px
Font: 11px, semibold, uppercase
Background: Translucent (rgba(0,0,0,0.6) with backdrop blur)
Text: White

Use: Overlay on event/stall images
```

---

### **G. Bottom Sheet / Modal**

#### **Bottom Sheet (Mobile)**
```css
Entry Animation: Slide up from bottom (300ms ease-out)
Background: White
Border Radius: 24px 24px 0 0
Max Height: 90vh
Handle: 4px × 32px gray pill, centered, 12px from top

Shadow: shadow-xl upward
Backdrop: rgba(0, 0, 0, 0.4) with blur

Gesture: Swipe down to dismiss
```

#### **Modal (Tablet/Desktop)**
```css
Max Width: 480px
Border Radius: 20px
Background: White
Padding: 24px
Shadow: shadow-2xl
Backdrop: rgba(0, 0, 0, 0.5) with blur

Close Button: Top-right, 40px circle, gray icon
```

---

### **H. Timeline View**

#### **Hour Slot**
```css
Structure:
  - Time Label (Left): 64px width, 14px semibold, gray
  - Event Lane (Right): Flexible width, 8px left border
  - Min Height: 60px per hour
  
Divider: 1px solid Gray 200 between hours
```

#### **Timeline Event Card**
```css
Padding: 12px
Border Left: 4px solid (category color)
Background: Tinted (category color at 5% opacity)
Border Radius: 0 8px 8px 0 (right side rounded)
Shadow: shadow-sm

Content:
  - Title: 14px semibold, max 1 line
  - Time: 12px, gray, icon + text
  - Location: 12px, gray, truncated
  
Interaction: Tap → Open detail bottom sheet
```

---

## 5. Page Layouts & User Flows

### **A. Homepage Layout**

```
┌────────────────────────────────┐
│ 🎉 Logo    [🔍] [🔔]          │ ← Top Bar (56px)
├────────────────────────────────┤
│                                │
│  ⏰ FEST STARTS IN             │ ← Countdown Hero
│     2 Days 14h 32m             │   (Gradient card)
│                                │
├────────────────────────────────┤
│ ✨ Featured Events             │ ← Section Header
│ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │ Img │ │ Img │ │ Img │  →    │ ← Horizontal Scroll
│ │Event│ │Event│ │Event│       │   (Snap points)
│ └─────┘ └─────┘ └─────┘       │
├────────────────────────────────┤
│ 📍 Quick Actions               │
│ ┌──────────┐  ┌──────────┐    │
│ │ 📅 My    │  │ 🗺️ Venue│    │ ← 2-column grid
│ │ Schedule │  │ Map      │    │
│ └──────────┘  └──────────┘    │
├────────────────────────────────┤
│ 🎯 Explore                     │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐      │
│ │🎵 │ │💻 │ │🍔 │ │🏆 │      │ ← 4-column grid
│ └───┘ └───┘ └───┘ └───┘      │
│ Music Tech  Food  Games        │
├────────────────────────────────┤
│ 🔥 Trending Now         See All│
│ ┌─────────────────┐            │
│ │ Event Card      │            │ ← Vertical list
│ └─────────────────┘            │
│ ┌─────────────────┐            │
│ │ Event Card      │            │
│ └─────────────────┘            │
│                                │
│                (Padding 80px)  │ ← Space for bottom nav
└────────────────────────────────┘
│  🏠   📅   🛍️   👤           │ ← Bottom Nav (64px)
└────────────────────────────────┘
```

### **Spacing Guide for Homepage**:
```
Top Bar: 56px height
Content Padding: 16px horizontal
Section Gaps: 24px vertical
Bottom Nav: 64px height
Safe Area Bottom: 80px total padding
```

---

### **B. Schedule Page Layout**

```
┌────────────────────────────────┐
│ ← Schedule       [🔍] [🔔]     │ ← Top Bar
├────────────────────────────────┤
│   Day 1    │    Day 2          │ ← Date Tabs (Sticky)
│  Mar 15    │   Mar 16          │   (48px height)
│  ───────   │                   │
├────────────────────────────────┤
│ [All] [Tech] [Cultural] [Food] │ ← Filter Chips
├────────────────────────────────┤
│ 8 AM │                         │
│      │ ┌──────────────────┐   │
│      │ │ Event Card       │   │
│ 9 AM │ └──────────────────┘   │
│      │                         │
│10 AM │ ┌──────────────────┐   │
│      │ │ Event Card       │   │
│      │ └──────────────────┘   │
│      │ ┌──────────────────┐   │
│      │ │ Event Card       │   │
│11 AM │ └──────────────────┘   │
│      │                         │
│ ...  │                         │
│      │                         │
└────────────────────────────────┘
```

### **Timeline Design Details**:
- Time labels: 64px fixed width, right-aligned
- Event cards: 4px colored left border (category)
- Overlapping events: Stack horizontally with 50% width each
- Empty slots: 60px minimum height (breathable)

---

### **C. Event Detail Page** (Bottom Sheet)

```
┌────────────────────────────────┐
│           ━━━━━                 │ ← Handle (swipe down)
│                                │
│ ┌────────────────────────────┐ │
│ │                            │ │
│ │     Event Hero Image       │ │ ← Full-width image
│ │       (1200 × 630)         │ │   (16:9 ratio)
│ │                            │ │
│ │  [X]             [Tech]    │ │ ← Close + Badge
│ └────────────────────────────┘ │
│                                │
│  Hackathon 2024                │ ← Title (24px, bold)
│  Build innovative solutions... │ ← Description (14px)
│                                │
│  ┌─────────┐  ┌──────────┐    │
│  │📅 Mar 15│  │🕐 9:00 AM│    │ ← Info Grid (2×2)
│  └─────────┘  └──────────┘    │
│  ┌─────────┐  ┌──────────┐    │
│  │📍 Lab 3 │  │👥 CSE    │    │
│  └─────────┘  └──────────┘    │
│                                │
│  Rules & Guidelines            │ ← Expandable Section
│  • Team size: 2-4 members...  │
│                                │
│  ┌────────────┐  ┌───┐        │
│  │ Register   │  │🔖 │        │ ← CTA + Bookmark
│  └────────────┘  └───┘        │
│                                │
└────────────────────────────────┘
```

---

### **D. Stalls Page Layout**

```
┌────────────────────────────────┐
│ ← Stalls         [🔍] [🔔]     │ ← Top Bar
├────────────────────────────────┤
│ [All] [Food] [Merch] [Clubs]   │ ← Category Filter
├────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐      │
│ │  Image  │  │  Image  │      │
│ │         │  │         │      │ ← 2-column grid
│ │  Stall  │  │  Stall  │      │   (8px gap)
│ │  Name   │  │  Name   │      │
│ └─────────┘  └─────────┘      │
│ ┌─────────┐  ┌─────────┐      │
│ │  Image  │  │  Image  │      │
│ │         │  │         │      │
│ │  Stall  │  │  Stall  │      │
│ │  Name   │  │  Name   │      │
│ └─────────┘  └─────────┘      │
│                                │
└────────────────────────────────┘
```

---

### **E. Profile Page Layout**

```
┌────────────────────────────────┐
│ ← Profile              [⚙️]    │ ← Top Bar
├────────────────────────────────┤
│  ┌──┐                          │
│  │AB│ Alex Brown               │ ← Avatar + Name
│  └──┘ Computer Science         │   (Department)
│                                │
│  ┌────┐  ┌────┐  ┌────┐       │
│  │ 12 │  │  8 │  │  2 │       │ ← Stats Grid
│  │Evnt│  │Svd │  │Days│       │
│  └────┘  └────┘  └────┘       │
│                                │
│  ┌──────────────────────────┐  │
│  │ 📅 My Schedule          →│  │ ← Menu Items
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ 🔖 Saved Events         →│  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ 🔔 Notifications        →│  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ ⚙️ Settings             →│  │
│  └──────────────────────────┘  │
│                                │
│  ╔══════════════════════════╗  │
│  ║ 🎯 Organizer Tools       ║  │ ← Gradient Card
│  ║ [Manage Events]          ║  │   (If role exists)
│  ╚══════════════════════════╝  │
│                                │
│  🚪 Sign Out                   │
│                                │
└────────────────────────────────┘
```

---

## 6. Micro-Interactions & Animations

### **A. Page Transitions**
```javascript
// Slide animations for page navigation
Entry: Slide from right (300ms ease-out)
Exit: Fade out (200ms) + slight scale down (0.95)

// Bottom sheet
Entry: Slide up from bottom (300ms ease-out)
Exit: Slide down (250ms ease-in)
```

### **B. Button Interactions**
```javascript
Tap: Scale down to 0.95 (100ms)
Release: Scale back to 1.0 (150ms ease-out)
Ripple: Circular wave from tap point (400ms fade)
```

### **C. Card Hover/Tap**
```javascript
Hover (Desktop): 
  - Lift shadow from md → lg
  - Scale up to 1.02
  - Duration: 200ms ease-out

Tap (Mobile):
  - Scale down to 0.98 (100ms)
  - Briefly darken background (5% opacity black overlay)
```

### **D. Loading States**
```javascript
// Skeleton screens (shimmer effect)
Background: Gray 200
Shimmer: White gradient sweeping left to right
Duration: 1.5s infinite

// Spinner
Size: 24px or 32px
Color: Primary 600
Animation: Rotation 1s linear infinite

// Progressive image loading
1. Show gray placeholder
2. Load low-res blur (10% size)
3. Fade in full image (300ms)
```

### **E. Pull to Refresh**
```javascript
Pull Down Threshold: 80px
Indicator: Circular spinner grows as pulled
Release: Snap animation (200ms) + trigger refresh
Success: Checkmark icon (500ms) → fade to content
```

### **F. Toast Notifications**
```javascript
Entry: Slide down from top (300ms ease-out)
Duration: 3000ms on screen
Exit: Fade out + slide up (200ms)

Types:
  - Success: Green background, checkmark icon
  - Error: Red background, X icon
  - Info: Blue background, i icon
  - Warning: Amber background, ! icon
```

---

## 7. Iconography

### **Icon Style**: Lucide React (Outline/Stroke)
- **Stroke Width**: 2px (standard), 2.5px (active/bold)
- **Size**: 20px (small), 24px (standard), 28px (large)
- **Color**: Inherit from parent (for easy theming)

### **Key Icons to Use**:
```
Home: home
Calendar: calendar
Map Pin: map-pin
Clock: clock
Users: users
Search: search
Bell: bell
Bookmark: bookmark (outline) / bookmark (filled when saved)
Filter: sliders-horizontal
Share: share-2
Arrow Left: arrow-left
Arrow Right: arrow-right
Plus: plus
X (Close): x
Check: check
Info: info
Alert: alert-circle
Settings: settings
Log Out: log-out
```

### **Custom Icons** (If needed):
- Festival stage/microphone
- Food stall/truck
- Workshop/tools
- Competition trophy
- QR code scanner

---

## 8. Accessibility Requirements

### **A. Touch Targets**
```
Minimum: 44 × 44px (Apple HIG)
Recommended: 48 × 48px
Spacing: Minimum 8px between tappable elements
```

### **B. Color Contrast** (WCAG AA)
```
Text on Background: Minimum 4.5:1 ratio
Large Text (18px+): Minimum 3:1 ratio
Interactive Elements: Minimum 3:1 against background

Test Tools: 
  - Primary Blue (#3B82F6) on White: 5.47:1 ✅
  - Text Primary (#111827) on White: 16.07:1 ✅
```

### **C. Focus States**
```
Keyboard Navigation: 
  - 2px solid Primary 600 outline
  - 4px offset from element
  - No outline removal (maintain accessibility)

Skip Link: "Skip to main content" (hidden until focused)
```

### **D. Text Sizing**
```
Minimum Body Text: 14px (0.875rem)
Input Fields: 16px minimum (prevents iOS zoom)
Scalable: Support browser zoom up to 200%
```

---

## 9. Responsive Breakpoints

### **Mobile-First Approach**
```css
/* Base styles for mobile (320px - 640px) */
Default: Single column, full-width cards, bottom nav

/* Large phones / Small tablets (640px+) */
@media (min-width: 640px) {
  - 2-column grid for stalls
  - Larger touch targets (56px buttons)
  - More horizontal padding (24px)
}

/* Tablets (768px+) */
@media (min-width: 768px) {
  - 3-column grid for events
  - Side navigation + bottom nav
  - Max width: 768px (centered)
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  - 4-column grid
  - Sidebar navigation (left)
  - Max width: 1200px (centered)
  - Hover states enabled
}
```

### **Safe Area Handling** (iOS Notch)
```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);

/* Bottom nav specifically */
.bottom-nav {
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}
```

---

## 10. Design Deliverables Checklist

### **Phase 1: Core Screens** (Priority)
- [ ] Splash Screen / Loading State
- [ ] Homepage (with all sections)
- [ ] Schedule Page (Day view with timeline)
- [ ] Event Detail Page (Bottom sheet)
- [ ] Stalls Page (Grid view)
- [ ] Stall Detail Page
- [ ] Profile Page
- [ ] Login/Signup Page

### **Phase 2: Secondary Screens**
- [ ] Search Overlay
- [ ] Notifications Page
- [ ] My Schedule Page
- [ ] Saved Events Page
- [ ] Settings Page
- [ ] Event Registration Flow
- [ ] Organizer Dashboard

### **Phase 3: Components Library**
- [ ] Bottom Navigation (all states)
- [ ] Top Bar (all variations)
- [ ] Buttons (Primary, Secondary, Icon, FAB)
- [ ] Cards (Event, Stall, Timeline)
- [ ] Input Fields (Text, Search, Dropdown)
- [ ] Chips & Badges
- [ ] Modals & Bottom Sheets
- [ ] Toast Notifications
- [ ] Loading States (Skeletons, Spinners)

### **Phase 4: States & Edge Cases**
- [ ] Empty States (No events, No connection)
- [ ] Error States (Failed load, 404)
- [ ] Loading States (Skeleton screens)
- [ ] Success States (Confirmation modals)

### **File Formats to Deliver**:
```
Figma File (Preferred):
  - Organized pages by screen type
  - Component library included
  - Auto-layout enabled
  - Design tokens documented
  - Prototype with interactions

Export Assets:
  - Icons: SVG (individual files)
  - Images: 1x, 2x, 3x PNG for placeholders
  - Style Guide: PDF
  - Developer Handoff: Figma Dev Mode
```

---

## 11. Design Principles to Follow

### **1. Progressive Disclosure**
Show only essential information first. Details on demand.
```
Event Card → Title + Time + Location
Event Detail → Full description + Rules + Registration
```

### **2. Thumb-Friendly Design**
Place primary actions in the bottom 60% of the screen.
```
Bottom Nav: Always accessible
CTA Buttons: Large (48px height)
Swipe Gestures: Horizontal scrolling
```

### **3. Scannable Content**
Users should grasp information in <3 seconds per card.
```
- Bold titles
- Icon + text pairs
- Color-coded categories
- Clear visual hierarchy
```

### **4. Instant Feedback**
Every interaction should have immediate visual response.
```
- Button press: Scale down
- Bookmark: Heart fill animation
- Loading: Spinner or skeleton
- Success: Checkmark + haptic
```

### **5. Consistent Patterns**
Reuse components across the app.
```
- All event cards look identical
- All CTAs use same button style
- All icons same stroke width
```

---

## 12. Branding & Personality

### **Voice & Tone**:
```
Energetic: "Let's go! 🎉"
Helpful: "Here's what's happening now"
Casual: "Your fest, your schedule"
Encouraging: "You're all set!"

NOT:
  Formal: "You have successfully registered"
  Robotic: "Operation completed"
  Cutesy: "Yaaaas queen! 💅"
```

### **Illustrations** (Optional, if budget allows):
- Empty states (e.g., no saved events → illustration of person browsing)
- 404 page (lost person at fest)
- Success confirmations (confetti, checkmarks)

**Style**: Flat, geometric, 2-3 colors max, playful but not childish

---

## 13. Performance Considerations

### **Image Optimization**:
```
Format: WebP (with JPG fallback)
Sizes:
  - Event Cards: 800px width
  - Hero Images: 1200px width
  - Stall Thumbnails: 400px width
  
Compression: 80% quality
Loading: Lazy load (native browser)
```

### **Animation Budget**:
```
60 FPS Target: All animations <300ms
GPU Acceleration: Use transform/opacity only
Reduced Motion: Respect prefers-reduced-motion
```

---

## 14. Dark Mode (Future Phase)

### **Color Adaptations**:
```css
Dark Background: #0F172A (Navy)
Dark Surface: #1E293B (Lighter navy)
Dark Text: #F1F5F9 (Off-white)

Primary Colors: Keep same (vibrant on dark)
Shadows: Reduce opacity (lighter shadows)
Borders: Lighter (#334155 instead of #E5E7EB)
```

### **Toggle Placement**:
```
Settings Page: Theme Preference
  - Light
  - Dark
  - System (follow OS)
```

---

## 15. Special Considerations for Fest Context

### **A. Low Connectivity Design**
```
- Offline mode badge (top bar)
- Cached event data (show timestamp)
- Progressive enhancement (works without images)
- Retry buttons on failed loads
```

### **B. Battery-Conscious**
```
- Reduce animation complexity
- Lazy load images aggressively
- Debounce search inputs (300ms)
- Use CSS instead of JS animations
```

### **C. Crowded Venue UX**
```
- High contrast text (outdoor sunlight)
- Large touch targets (fumbling hands)
- Quick actions (one-tap bookmark)
- QR code scanner (fast check-in)
```

---

## 16. Inspiration Gallery

### **Study These Apps**:
1. **Spotify** - Card layouts, vibrant colors, smooth animations
2. **Instagram** - Stories UI, profile layout, bottom navigation
3. **Airbnb** - Search filters, map integration, detail pages
4. **Duolingo** - Gamification, progress indicators, friendly tone
5. **Apple Music Festival** - Lineup grids, artist cards, schedule view

### **Design Systems to Reference**:
- **Material Design 3** (Google) - Color theming, motion
- **Apple Human Interface Guidelines** - Touch targets, typography
- **Ant Design** - Component patterns, spacing
- **Shadcn/ui** - Modern component aesthetics

---

## 17. Final Notes for Designer

### **What We Value Most**:
✅ **Compact yet breathable** - Information density without clutter
✅ **Playful but professional** - Fun vibe, serious functionality  
✅ **Fast-feeling** - Optimistic UI, instant feedback
✅ **Youth-oriented** - Gen-Z aesthetics, modern patterns
✅ **Thumb-friendly** - One-handed operation on phones

### **Common Pitfalls to Avoid**:
❌ **Overly minimalist** - Don't sacrifice clarity for whitespace
❌ **Too many colors** - Stick to the palette (5 accent colors max)
❌ **Tiny text** - Minimum 14px body text
❌ **Hidden navigation** - No hamburger menus on mobile
❌ **Slow animations** - Keep under 300ms

### **Questions to Ask Yourself**:
1. Can a user complete this task with one hand?
2. Is this readable in bright sunlight?
3. Does this work offline or with slow internet?
4. Can someone find an event in <10 seconds?
5. Would a college student find this cool?

---

## 18. Contact & Collaboration

### **Feedback Loop**:
```
Week 1: Wireframes + Moodboard
Week 2: High-fidelity mockups (3 key screens)
Week 3: Full design system + all screens
Week 4: Prototype + developer handoff
```

### **Tools**:
- **Design**: Figma (collaborative)
- **Prototyping**: Figma Interactive Components
- **Handoff**: Figma Dev Mode
- **Communication**: Slack / Discord

### **Design Review Criteria**:
- Visual hierarchy clear?
- All touch targets 44px+?
- Color contrast passing WCAG AA?
- Animations smooth (60fps)?
- Works on 375px width (iPhone SE)?

---

## 🎨 Summary: The Design in 3 Sentences

Create a **vibrant, compact mobile app** with bold colors (electric blue + festival orange), playful gradients, and smooth animations that feels like **Instagram meets Spotify** for college events. Everything should be **thumb-friendly with bottom navigation**, large cards, and one-tap interactions. The UI must be **scannable in 3 seconds**, work great in sunlight, and make students feel excited about their fest! 🎉📱

---

**Good luck! Can't wait to see what you create!** 🚀
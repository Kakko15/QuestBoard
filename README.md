# QuestBoard

**An Enterprise-Grade Gamified Student Engagement Ecosystem with Behavioral Predictive Analytics for Isabela State University (Echague Campus)**

## Overview

QuestBoard transforms the university experience into an MMORPG-style adventure. Students complete quests (campus activities), earn XP and Gold, and compete with their department guilds for the top spot on the leaderboard.

## The 11 Guilds of ISU-Echague

| Acronym | College Name | Guild Name | Focus |
|---------|--------------|------------|-------|
| CCSICT | College of Computing Studies, ICT | The Technomancers | Intelligence |
| COE | College of Engineering | The Artificers | Strength |
| CA | College of Agriculture | The Druids | Nature |
| CON | College of Nursing | The Vitalists | Vitality |
| CBAPA | Business Admin & Public Admin | The Tycoons | Charisma |
| CCJE | Criminal Justice Education | The Wardens | Defense |
| CED | College of Education | The Sages | Wisdom |
| CAS | Arts and Sciences | The Alchemists | Agility |
| SVM | School of Veterinary Medicine | The Beastmasters | Spirit |
| IOF | Institute of Fisheries | The Tidemasters | Dexterity |
| COM | College of Medicine | The Clerics | Recovery |

## Tech Stack

### Frontend
- **Next.js 14** (App Router) - Server-Side Rendering
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component Library
- **Framer Motion** - Animations

### Backend & Infrastructure
- **Supabase** - Database (PostgreSQL), Authentication, Storage
- **Upstash Redis** - Caching for Leaderboards

### Data Mining
- **Python 3.10+**
- **Pandas** - Data Processing
- **Scikit-Learn** - K-Means Clustering, Random Forest Classification

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Upstash Redis account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/questboard.git
cd questboard
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

5. Set up the database:
   - Go to your Supabase dashboard
   - Run the SQL from `supabase/schema.sql`

6. Start the development server:
```bash
npm run dev
```

## Project Structure

```
questboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── admin/             # Admin dashboard
│   │   ├── auth/              # Authentication pages
│   │   ├── leaderboard/       # Leaderboard page
│   │   ├── profile/           # User profile page
│   │   ├── quests/            # Quests listing page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── game/              # Game-specific components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Shadcn UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions and configs
│   │   ├── supabase/         # Supabase clients
│   │   ├── constants.ts      # App constants (Guilds, etc.)
│   │   ├── redis.ts          # Redis configuration
│   │   └── utils.ts          # Utility functions
│   └── types/                 # TypeScript type definitions
├── python/                    # Data Mining scripts
│   ├── data_mining.py        # Main analysis pipeline
│   └── requirements.txt      # Python dependencies
├── public/                    # Static assets
└── supabase/
    └── schema.sql            # Database schema
```

## User Roles

1. **Player (Student)** - Complete quests, earn rewards, compete in leaderboards
2. **Quest Giver (Faculty/SSC)** - Create and manage quests, verify submissions
3. **Game Master (Admin/OSA)** - Full system access, view analytics, manage users

## Quest Verification Methods

- **GPS** - Location-based verification
- **QR Code** - Scan event QR codes
- **Evidence Upload** - Submit photo proof
- **Manual** - Requires Quest Giver approval

## Data Mining Features

- **K-Means Clustering** - Segment students into behavioral profiles
- **Random Forest Classification** - Predict student disengagement risk
- **Activity Analysis** - Track engagement patterns

## Naming Conventions

- **Variables, Functions, Methods**: camelCase
- **Classes, Interfaces, Types**: PascalCase
- **File Names**: kebab-case

## License

This project is developed for Isabela State University - Echague Campus.

## Contact

Office of Student Affairs (OSA) & Supreme Student Council (SSC)
Isabela State University - Echague Campus





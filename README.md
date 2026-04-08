# MindMate AI Companion Platform

> Create personalized AI companions with unique personalities, have meaningful conversations, and get help with everyday tasks.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-green?style=flat-square&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-blue?style=flat-square&logo=tailwindcss)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-black?style=flat-square)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Pages & Components](#pages--components)
- [Deployment](#deployment)

---

## Overview

MindMate is a full-stack AI companion platform built with Next.js and Supabase. Users can create multiple AI companions, each with a custom name, personality, communication style, and backstory. Companions remember users across sessions using a persistent memory system, assist with notes and to-dos, and provide a natural conversational experience powered by LLMs.

---

## Features

### Implemented (MVP)

| Feature | Description |
|---|---|
| **Authentication** | Email/password signup, login, logout via Supabase Auth |
| **Companion Creation** | Name, avatar, personality traits, communication style, expertise, system prompt |
| **Real-time Chat** | Optimistic UI, typing indicator, auto-scroll, Enter to send |
| **Conversation Memory** | Persistent memory summarized every 10 messages |
| **Conversation History** | Sidebar with past chats, click to reload, delete |
| **Notes** | Create, edit, delete, search notes via chat or dashboard |
| **To-Dos** | Create, toggle, inline edit, delete, filter by status |
| **Dashboard** | Stats overview  companions, conversations, messages, notes, tasks |
| **Analytics** | Frequency chart, per-companion breakdown, most active companion |
| **History Page** | Search, filter by companion, paginated, export conversations |
| **Export** | Download conversations as TXT, JSON, or PDF |
| **Landing Page** | Dark futuristic design with hero, features, how it works, FAQ, footer |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Server Components) |
| **Language** | JavaScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Storage** | Supabase Storage (avatars) |
| **LLM** | Groq (llama-3.1-8b-instant) |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **PDF Export** | jsPDF |
| **Icons** | Lucide React |

---

## Project Structure

```
src/
├── app/
│   ├── page.js                          # Landing page
│   ├── (auth)/
│   │   ├── login/page.js
│   │   └── signup/page.js
│   ├── (dashboard)/
│   │   ├── layout.js                    # Sidebar + main layout
│   │   ├── dashboard/page.js            # Stats + quick access
│   │   ├── companions/
│   │   │   ├── new/page.js              # Create companion
│   │   │   └── [id]/edit/page.js        # Edit companion
│   │   ├── chat/[companionId]/page.js   # Chat interface
│   │   ├── tasks/page.js                # Notes + Todos tabs
│   │   ├── history/page.js              # Conversation history
│   │   └── analytics/page.js           # Analytics dashboard
│   └── api/
│       ├── companions/route.js
│       ├── companions/[id]/route.js
│       ├── chat/route.js                # Core LLM integration
│       ├── conversations/route.js
│       ├── conversations/[id]/route.js
│       ├── notes/route.js
│       ├── notes/[id]/route.js
│       ├── todos/route.js
│       ├── todos/[id]/route.js
│       ├── dashboard/route.js
│       ├── analytics/route.js
│       └── history/route.js
├── components/
│   ├── layout/
│   │   ├── Sidebar.js
│   │   └── Header.js
│   ├── companions/
│   │   ├── CompanionCard.js
│   │   └── CompanionForm.jsx
│   ├── chat/
│   │   ├── ChatWindow.js
│   │   ├── MessageBubble.js
│   │   ├── ChatInput.js
│   │   └── ConversationSidebar.js
│   ├── tasks/
│   │   ├── NotesTab.js
│   │   ├── TodosTab.js
│   │   ├── NoteCard.js
│   │   ├── NoteDialog.js
│   │   └── TodoItem.js
│   ├── dashboard/
│   │   ├── StatsCard.js
│   │   ├── RecentConversations.js
│   │   └── CompanionsGrid.js
│   ├── analytics/
│   │   ├── StatsSummary.js
│   │   ├── FrequencyChart.js
│   │   └── CompanionMetrics.js
│   └── history/
│       ├── ConversationTable.js
│       └── ExportMenu.js
└── lib/
    ├── supabase/
    │   ├── client.js                    # Browser client
    │   └── server.js                    # Server client
    ├── openai.js                        # LLM client (Groq)
    └── utils.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://groq.com) API key (free)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/mindmate.git
cd mindmate

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your keys (see Environment Variables section)

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file in the root of your project:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# LLM — Groq 
GROQ_API_KEY=your-groq-api-key

# OR OpenAI
OPENAI_API_KEY=your-openai-api-key
```

---

## Database Schema

Run the following SQL in your **Supabase SQL Editor** to set up all tables:

```sql
-- Companions
create table companions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  avatar_url text,
  personality_traits text[],
  communication_style text,
  expertise_area text,
  system_prompt text,
  background_story text,
  relationship_type text,
  created_at timestamptz default now()
);

-- Conversations
create table conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  companion_id uuid references companions(id) on delete cascade,
  title text default 'New Conversation',
  created_at timestamptz default now()
);

-- Messages
create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Memory
create table user_memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  companion_id uuid references companions(id) on delete cascade,
  memory_text text,
  updated_at timestamptz default now(),
  unique(user_id, companion_id)
);

-- Notes
create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Todos
create table todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  task text not null,
  completed boolean default false,
  created_at timestamptz default now()
);

-- RLS policies (enable on all tables)
alter table companions enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table user_memories enable row level security;
alter table notes enable row level security;
alter table todos enable row level security;

-- Policies
create policy "Users manage own companions" on companions for all using (auth.uid() = user_id);
create policy "Users manage own conversations" on conversations for all using (auth.uid() = user_id);
create policy "Users manage own memories" on user_memories for all using (auth.uid() = user_id);
create policy "Users manage own notes" on notes for all using (auth.uid() = user_id);
create policy "Users manage own todos" on todos for all using (auth.uid() = user_id);
create policy "Users access own messages" on messages for all
  using (conversation_id in (select id from conversations where user_id = auth.uid()));
```

---

## API Routes

| Method | Route | Description |
|---|---|---|
| `GET/POST` | `/api/companions` | List all / create companion |
| `PUT/DELETE` | `/api/companions/[id]` | Update / delete companion |
| `POST` | `/api/chat` | Send message, get AI response |
| `GET/POST` | `/api/conversations` | List all / create conversation |
| `GET/DELETE` | `/api/conversations/[id]` | Get messages / delete conversation |
| `GET/POST` | `/api/notes` | List all / create note |
| `PUT/DELETE` | `/api/notes/[id]` | Update / delete note |
| `GET/POST` | `/api/todos` | List all / create todo |
| `PUT/DELETE` | `/api/todos/[id]` | Toggle / update / delete todo |
| `GET` | `/api/dashboard` | Aggregated dashboard stats |
| `GET` | `/api/analytics` | Full analytics data |
| `GET` | `/api/history` | Paginated, searchable conversation history |

---

## Pages & Components

| Route | Description |
|---|---|
| `/` | Landing page |
| `/auth/signup` | Create account |
| `/auth/login` | Sign in |
| `/dashboard` | Stats, recent conversations, companion grid |
| `/companions/new` | Create a new companion |
| `/companions/[id]/edit` | Edit existing companion |
| `/chat/[companionId]` | Chat interface with conversation sidebar |
| `/tasks` | Notes and To-Dos in tabbed layout |
| `/history` | Full conversation history with search + export |
| `/analytics` | Charts and per-companion metrics |

---

## Roadmap

- [ ] Voice input and text-to-speech responses
- [ ] Companion sharing and discovery
- [ ] Advanced memory management UI
- [ ] Mobile app (React Native)
- [ ] Calendar and reminder integrations
---

<p align="center">Built with ❤️ using Next.js, Supabase, and Groq</p>
# Drum Chart Creator

A modern Next.js application for creating, editing, and practicing drum charts synchronized with YouTube videos. Users can tap bars in real time, group bars into sections, and manage their charts with a clean, accessible UI.

## Features

- Unified custom YouTube video player with timeline and bar markers
- Interactive chart editing: tap bars, group into sections, edit titles
- Responsive, accessible design system (Tailwind CSS, Shadcn UI, Radix UI)
- Supabase integration for authentication and data storage
- Secure row-level security (RLS) for user data
- Modern, mobile-first UI with dark mode support

## Prerequisites

- Node.js (v18.0.0 or higher)
- npm, yarn, or pnpm
- Supabase account (for database)

## Installation

1. Clone the repository:

```bash
git clone [your-repository-url]
cd [your-project-name]
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file in the root directory and add your environment variables:

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

This project uses Supabase as its database. Follow these steps to set up your database:

1. Create a new project on [Supabase](https://supabase.com)

2. Run the following SQL commands in your Supabase SQL editor:

```sql
-- Create charts table
CREATE TABLE charts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  video_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  user_id UUID REFERENCES auth.users(id)
);

-- Create bars table
CREATE TABLE bars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chart_id UUID REFERENCES charts(id) ON DELETE CASCADE,
  start_time DECIMAL NOT NULL,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bars ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own charts"
ON charts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own charts"
ON charts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add more policies as needed for update/delete
```

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/
│   ├── charts/            # Chart-related components (BarsList, SectionManager, TapBarManager, etc.)
│   ├── ui/                # UI primitives (modal, button, input, etc.)
│   └── VideoPlayer.tsx    # Unified YouTube video player
├── types/                 # TypeScript type definitions
├── lib/                   # Library code (supabase client, etc.)
└── utils/                 # Utility functions
```

## Key Components

- `VideoPlayer`: Unified YouTube video player with custom controls and timeline
- `TapBarManager`: Tap bars in real time while video plays
- `SectionManager`: Group bars into labeled sections
- `BarsList`: Displays and manages chart bars
- `ChartActions`: Controls for chart management (edit, delete, etc.)
- `Modal`, `Button`, `Input`: Accessible UI primitives (Shadcn UI, Radix UI)

## Design System

- **Tailwind CSS**: Utility-first styling for rapid, maintainable UI
- **Shadcn UI**: Accessible, composable React UI components
- **Radix UI**: Low-level UI primitives for accessibility and customization
- **Dark mode**: Fully supported, with accessible color contrast
- **Mobile-first**: Responsive layouts for all devices

## License

[Your License] - See LICENSE file for details

## Acknowledgments

- Next.js team for the framework
- YouTube API for video integration
- Supabase for backend and authentication
- Shadcn UI and Radix UI for accessible components

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

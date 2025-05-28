# Chart Tapping Application

A Next.js application for creating and practicing rhythm charts with YouTube video integration. This application allows users to create, edit, and practice rhythm patterns synchronized with YouTube videos.

## Features

- YouTube video integration and synchronization
- Interactive rhythm chart creation and editing
- Real-time tapping practice with scoring
- Responsive design for desktop and mobile devices

## Prerequisites

Before you begin, ensure you have installed:

- Node.js (v18.0.0 or higher)
- npm, yarn, or pnpm package manager
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
  duration DECIMAL NOT NULL,
  taps DECIMAL[] DEFAULT '{}',
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
│   ├── charts/            # Chart-related components
│   └── ...                # Other components
├── types/                 # TypeScript type definitions
├── lib/                   # Library code
│   └── supabase/         # Supabase client and utilities
└── utils/                 # Utility functions
```

## Key Components

- `YouTubePlayer`: Handles YouTube video playback and synchronization
- `VideoPlayerWithTapping`: Manages user input for rhythm tapping
- `BarsList`: Displays and manages rhythm chart bars
- `ChartActions`: Controls for chart playback and editing

## Design
- Swatches: https://huemint.com/brand-3/#palette=272b2d-fffffe-b5b7af-d22c56

## License

[Your License] - See LICENSE file for details

## Acknowledgments

- Next.js team for the framework
- YouTube API for video integration

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

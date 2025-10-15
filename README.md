# PowerRanking

A modern Progressive Web App (PWA) for tracking fitness progress and competing with friends. Built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Features

- 🔐 **Authentication**: Secure email/password login with Supabase
- 📱 **PWA Support**: Install on mobile devices, works offline
- 👥 **Group Management**: Create and join fitness groups
- 🏆 **Rankings**: Track and compare fitness records
- 📊 **Dashboard**: View your stats and group activities
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd powerranking
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env` to `.env.local`
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url_here
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Navbar.tsx      # Navigation component
├── lib/                # Utility libraries
│   └── supabaseClient.ts # Supabase configuration
├── pages/              # Page components
│   ├── Login.tsx       # Authentication page
│   ├── Dashboard.tsx   # Main dashboard
│   └── Ranking.tsx     # Rankings table
├── App.tsx             # Main app component with routing
└── main.tsx            # App entry point
```

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Routing**: React Router DOM
- **PWA**: Vite PWA Plugin

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your preferred hosting service (Vercel, Netlify, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

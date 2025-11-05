<<<<<<< HEAD
# ThreadSpace Frontend

A modern React-based frontend application built with Next.js 15, TypeScript, and Tailwind CSS for the ThreadSpace discussion platform.

## 🚀 Features

- **Modern UI/UX** - Built with Next.js 15, React 19, and Tailwind CSS
- **Component Library** - Reusable UI components with Chakra UI
- **Type Safety** - Full TypeScript support throughout the application
- **Real-time Updates** - GraphQL subscriptions for live data
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Authentication** - Secure user authentication and authorization
- **State Management** - Apollo Client for GraphQL state management
- **Performance** - Optimized with Next.js features and Turbopack

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Chakra UI
- **State Management**: Apollo Client
- **GraphQL**: GraphQL with subscriptions
- **Icons**: Lucide React + React Icons
- **Animations**: Framer Motion
- **Build Tool**: Turbopack (Next.js)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for full-stack development)

## 🚀 Quick Start

### Using Docker (Recommended)

From the project root:

```bash
# Start all services including frontend
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
```

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
threadspace-frontend/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── auth/               # Authentication pages
│   │   │   ├── login/          # Login page
│   │   │   └── register/       # Registration page
│   │   ├── main/               # Main application pages
│   │   │   ├── create/         # Create post page
│   │   │   ├── post/           # Individual post pages
│   │   │   ├── topic/          # Topic/category pages
│   │   │   └── user/           # User profile pages
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── auth/               # Authentication components
│   │   ├── comments/           # Comment-related components
│   │   ├── layout/             # Layout components
│   │   ├── posts/              # Post-related components
│   │   └── ui/                 # Reusable UI components
│   ├── graphql/                # GraphQL operations
│   │   ├── fragments/          # GraphQL fragments
│   │   ├── mutations/          # GraphQL mutations
│   │   ├── queries/            # GraphQL queries
│   │   └── subscriptions/      # GraphQL subscriptions
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and configurations
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── tailwind.config.js          # Tailwind CSS configuration
├── next.config.ts              # Next.js configuration
└── package.json
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🌐 Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# GraphQL Configuration
NEXT_PUBLIC_GRAPHQL_URI=http://localhost:8080/graphql
NEXT_PUBLIC_WS_URI=ws://localhost:8080/graphql

# Application URLs
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Optional: Analytics, Sentry, etc.
# NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
# NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## 🎨 Styling

The application uses a combination of Tailwind CSS and Chakra UI:

- **Tailwind CSS**: Utility-first CSS framework for custom styling
- **Chakra UI**: Component library for consistent UI elements
- **Custom Components**: Reusable components in `src/components/ui/`

### Tailwind Configuration

The Tailwind configuration is located in `tailwind.config.js` and includes:
- Custom color palette
- Typography settings
- Component variants
- Responsive breakpoints

## 🔌 GraphQL Integration

The frontend uses Apollo Client for GraphQL integration:

- **Queries**: Data fetching with caching
- **Mutations**: Data modifications
- **Subscriptions**: Real-time updates
- **Fragments**: Reusable query parts

### GraphQL Structure

```
src/graphql/
├── fragments/          # Reusable GraphQL fragments
├── mutations/          # GraphQL mutations
│   └── index.ts        # Export all mutations
├── queries/            # GraphQL queries
│   └── index.ts        # Export all queries
└── subscriptions/      # GraphQL subscriptions
    └── index.ts        # Export all subscriptions
```

## 🧩 Component Architecture

### UI Components (`src/components/ui/`)

Reusable, styled components:
- `Button.tsx` - Various button styles and states
- `Card.tsx` - Card container component
- `Input.tsx` - Form input component
- `Modal.tsx` - Modal dialog component
- `Avatar.tsx` - User avatar component
- `VoteButtons.tsx` - Voting interface component

### Feature Components

Organized by feature area:
- **Auth**: Login, registration, protected routes
- **Posts**: Post creation, display, editing
- **Comments**: Comment system with threading
- **Layout**: Header, footer, navigation, sidebar

## 🔐 Authentication

Authentication is handled through:
- JWT tokens stored in HTTP-only cookies
- Apollo Client authentication state
- Protected route components
- Automatic token refresh

### Auth Components

- `LoginForm.tsx` - User login interface
- `RegisterForm.tsx` - User registration interface
- `ProtectedRoute.tsx` - Route protection wrapper

## 📱 Responsive Design

The application is built mobile-first with:
- Responsive breakpoints (sm, md, lg, xl, 2xl)
- Touch-friendly interfaces
- Optimized layouts for different screen sizes
- Progressive enhancement

## 🚀 Performance Optimizations

- **Next.js 15**: Latest Next.js features and optimizations
- **Turbopack**: Fast bundling and hot reloading
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Apollo Client Caching**: Intelligent GraphQL caching
- **Lazy Loading**: Component and route lazy loading

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Docker Deployment

The frontend is containerized and can be deployed using Docker:

```bash
# Build Docker image
docker build -t threadspace-frontend .

# Run container
docker run -p 3000:3000 threadspace-frontend
```

### Environment-Specific Builds

For different environments, update the environment variables:

```env
# Production
NEXT_PUBLIC_GRAPHQL_URI=https://api.threadspace.com/graphql
NEXT_PUBLIC_WS_URI=wss://api.threadspace.com/graphql
NEXT_PUBLIC_FRONTEND_URL=https://threadspace.com
```

## 🔧 Development Tips

### Hot Reloading

The development server supports hot reloading for:
- React components
- CSS changes
- TypeScript files
- GraphQL operations

### Debugging

- Use React Developer Tools
- Apollo Client DevTools
- Next.js built-in debugging
- Browser DevTools

### Code Organization

- Keep components small and focused
- Use TypeScript interfaces for props
- Follow Next.js conventions
- Organize by feature, not file type

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Write meaningful commit messages
4. Test your changes thoroughly
5. Update documentation as needed

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Chakra UI Documentation](https://chakra-ui.com)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
=======
# threadspace_FE
>>>>>>> a601b59e88cf607dadfa191c5408ec4a8e765a3b

# MyDigipal Website

Modern, AI-powered digital marketing agency website built with Astro.

## Tech Stack

- **Framework**: [Astro](https://astro.build/) v5
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v3.4
- **Interactive Components**: React 18
- **Content**: MDX with Astro Content Collections
- **CMS**: Decap CMS (visual editor)
- **Deployment**: Render (Static Site)

## Features

- Multi-language support (EN/FR)
- SEO optimized with automatic sitemaps
- View Transitions for smooth navigation
- Modular Finance Calculator
- Contact form with N8N integration
- Analytics with UTM tracking
- AI-powered chat widget

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── ui/             # Base UI components
│   ├── sections/       # Page sections
│   ├── layout/         # Header, Footer, Navigation
│   └── interactive/    # React islands
├── content/            # MDX content collections
│   ├── services/       # Service pages
│   ├── case-studies/   # Case study pages
│   ├── blog/           # Blog posts
│   └── training/       # Training pages
├── layouts/            # Page layouts
├── pages/              # Route pages
├── styles/             # Global styles
├── i18n/               # Translations
└── lib/                # Utilities
```

## Content Management

### Via Claude (Chat)
Edit MDX files directly through conversation with Claude.

### Via Decap CMS (Visual)
Access `/admin` for a visual content editor.

## Deployment

The site is automatically deployed to Render on push to main branch.

## License

Private - MyDigipal Agency

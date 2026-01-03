# Mind & Muscle Website

A modern, high-performance website for Mind & Muscle featuring Apple's **Liquid Glass** design language. Built with Next.js 15, TypeScript, and Tailwind CSS.

## ✨ Features

- 🎨 **Liquid Glass Design** - Apple's latest design language with translucent materials and dynamic blur effects
- 💳 **RevenueCat Integration** - Seamless team licensing payment processing
- 📱 **Fully Responsive** - Optimized for all devices
- ⚡ **Performance Optimized** - Fast loading with Next.js 15
- 🎯 **SEO Ready** - Metadata and structured data for search engines
- 🔥 **Modern Stack** - TypeScript, Tailwind CSS, React 18

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- RevenueCat account (for payment processing)

### Installation

1. **Clone and navigate to the website directory**:
   ```bash
   cd /Users/jbb/Downloads/Mind-Muscle/website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` and add your RevenueCat Web API key:
   ```env
   NEXT_PUBLIC_REVENUECAT_API_KEY=your_actual_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## 📦 Project Structure

```
website/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Home page
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   ├── team-licensing/    # Team licensing page
│   │   └── affiliate/         # Affiliate program page
│   ├── components/            # Reusable components
│   │   ├── LiquidGlass.tsx   # Liquid Glass container
│   │   ├── LiquidButton.tsx  # Liquid Glass button
│   │   └── Navigation.tsx    # Navigation bar
│   └── lib/                   # Utilities
│       └── revenuecat.ts     # RevenueCat integration
├── public/                    # Static assets
├── tailwind.config.ts        # Tailwind configuration
├── next.config.ts            # Next.js configuration
└── package.json              # Dependencies
```

## 🎨 Design System

### Liquid Glass Components

The website uses custom Liquid Glass components that implement Apple's design language:

```tsx
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';

// Glass container
<LiquidGlass variant="blue" intensity="strong" glow={true}>
  Content here
</LiquidGlass>

// Glass button
<LiquidButton variant="orange" size="lg" href="/team-licensing">
  Get Started
</LiquidButton>
```

### Color Palette

- **Primary Blue**: `#0C6AD3` (Neon Cortex Blue)
- **Primary Orange**: `#C6771A` (Solar Surge Orange)
- **Mind Training**: `#00A3FF` (Mind Primary)
- **Muscle Training**: `#FF6B00` (Muscle Primary)
- **Background**: `#02124A` (Deep Orbit Navy)

### Typography

- **Headings**: Poppins (800 weight)
- **Body**: Inter (400-600 weight)

## 💳 RevenueCat Setup

### 1. Create RevenueCat Account

1. Go to [RevenueCat](https://www.revenuecat.com/)
2. Sign up for a free account
3. Create a new project

### 2. Configure Products

1. In the RevenueCat dashboard, go to **Products**
2. Create three products:
   - `team-basic` - $199/month
   - `team-pro` - $399/month
   - `team-elite` - $799/month

3. Create an **Offering** called "Team Licensing" and add all three products

### 3. Get API Key

1. Go to **API Keys** in the RevenueCat dashboard
2. Copy your **Web Public API Key**
3. Add it to `.env.local`:
   ```env
   NEXT_PUBLIC_REVENUECAT_API_KEY=your_key_here
   ```

### 4. Test Payments

RevenueCat automatically provides a sandbox environment for testing. Use test credit cards provided by your payment processor (Stripe/Apple Pay).

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Initial website setup"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - Add `NEXT_PUBLIC_REVENUECAT_API_KEY`
   - Click "Deploy"

3. **Connect your Namecheap domain**:
   - In Vercel, go to **Settings** > **Domains**
   - Add your custom domain (e.g., `mindandmuscle.com`)
   - In Namecheap, update DNS records with Vercel's nameservers

### Deploy to Other Platforms

#### Netlify
```bash
npm run build
# Upload the .next folder to Netlify
```

#### Self-Hosted
```bash
npm run build
npm start
# Runs on port 3000
```

## 🔧 Configuration

### Custom Domain Setup (Namecheap)

1. In **Vercel Dashboard**:
   - Go to your project settings
   - Navigate to **Domains**
   - Add your domain (e.g., `mindandmuscle.com`)

2. In **Namecheap Dashboard**:
   - Go to **Domain List** > **Manage**
   - Select **Advanced DNS**
   - Add these records:
     ```
     Type: A Record
     Host: @
     Value: 76.76.21.21

     Type: CNAME
     Host: www
     Value: cname.vercel-dns.com
     ```

3. Wait for DNS propagation (5-48 hours)

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Key Pages

- **/** - Home page with feature overview
- **/team-licensing** - Team subscription plans with RevenueCat checkout
- **/affiliate** - Affiliate program application

## 🤝 Contributing

This is a private project for Mind & Muscle. For any changes or updates, contact the development team.

## 📄 License

Proprietary - Mind & Muscle © 2026

## 🐛 Troubleshooting

### Issue: RevenueCat not working

**Solution**:
1. Verify your API key in `.env.local`
2. Check browser console for errors
3. Ensure products are set up in RevenueCat dashboard

### Issue: Styles not loading

**Solution**:
```bash
rm -rf .next
npm run dev
```

### Issue: Build fails

**Solution**:
```bash
rm -rf node_modules
npm install
npm run build
```

## 📞 Support

For technical support or questions:
- Email: dev@mindandmuscle.com
- Documentation: [RevenueCat Docs](https://docs.revenuecat.com/docs/web)

---

Built with ❤️ using Next.js 15 and Apple's Liquid Glass design language.

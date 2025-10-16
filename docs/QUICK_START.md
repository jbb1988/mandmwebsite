# Mind & Muscle Website - Quick Start Guide

## 🎉 Your Website is Ready!

Your modern, Liquid Glass-styled website is built and ready to deploy. Here's everything you need to know to get it running.

## 🚀 Run Locally (Right Now)

```bash
cd /Users/jbb/Downloads/Mind-Muscle/website
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 What's Included

✅ **3 Pages:**
- `/` - Home page with Mind & Muscle showcase
- `/team-licensing` - Team subscription plans with pricing
- `/affiliate` - Affiliate program signup

✅ **Apple Liquid Glass Design:**
- Ultra-translucent materials
- Dynamic backdrop blur effects
- Specular highlights
- Real-time color adaptation
- Smooth animations

✅ **Your Brand Colors:**
- Neon Cortex Blue (#0C6AD3)
- Solar Surge Orange (#C6771A)
- Mind Primary (#00A3FF)
- Muscle Primary (#FF6B00)

✅ **RevenueCat Integration:**
- Payment processing ready
- Just needs your API key

## ⚡ Deploy to Vercel (5 Minutes)

### 1. Push to GitHub (if not already)
```bash
cd /Users/jbb/Downloads/Mind-Muscle
git add website/
git commit -m "Add Mind & Muscle website with Liquid Glass design"
git push
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Root Directory: `website`
5. Add environment variable:
   - Name: `NEXT_PUBLIC_REVENUECAT_API_KEY`
   - Value: (Your RevenueCat Web API key)
6. Click "Deploy"

### 3. Connect Your Domain (Namecheap)

**In Vercel:**
- Settings → Domains
- Add `your domain.com`

**In Namecheap:**
- Domain List → Manage → Advanced DNS
- Add these records:
  ```
  Type: A Record
  Host: @
  Value: 76.76.21.21

  Type: CNAME
  Host: www
  Value: cname.vercel-dns.com
  ```

Wait 5-48 hours for DNS propagation.

## 💳 Setup RevenueCat Payments

### 1. Create Account
- Go to [revenuecat.com](https://www.revenuecat.com/)
- Sign up (free tier available)

### 2. Create Products
In RevenueCat Dashboard → Products:
- `team-basic` - $199/month
- `team-pro` - $399/month
- `team-elite` - $799/month

### 3. Create Offering
- Name: "Team Licensing"
- Add all three products

### 4. Get API Key
- Dashboard → API Keys
- Copy **Web Public API Key**
- Add to `.env.local`:
  ```
  NEXT_PUBLIC_REVENUECAT_API_KEY=your_key_here
  ```

## 🎨 Customization

### Change Colors
Edit `tailwind.config.ts` - all brand colors are defined there

### Add Pages
Create new file in `src/app/[page-name]/page.tsx`

### Modify Components
All reusable components are in `src/components/`

## 📁 Project Structure

```
website/
├── src/
│   ├── app/              # Pages
│   ├── components/       # Reusable UI components
│   └── lib/             # Utilities (RevenueCat)
├── public/              # Static assets
└── README.md            # Full documentation
```

## 🔧 Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Check code quality
```

## ✨ Key Features

- **Responsive Design** - Works on all devices
- **SEO Optimized** - Meta tags included
- **Performance** - Fast loading with Next.js 15
- **Type Safe** - Full TypeScript support
- **Modern Stack** - Latest React & Tailwind

## 🆘 Need Help?

### Website not loading?
```bash
rm -rf .next
npm run dev
```

### Build failing?
```bash
rm -rf node_modules
npm install
npm run build
```

### RevenueCat not working?
1. Check API key in `.env.local`
2. Verify products in RevenueCat dashboard
3. Check browser console for errors

## 📞 Support

- RevenueCat Docs: https://docs.revenuecat.com/docs/web
- Next.js Docs: https://nextjs.org/docs
- Vercel Support: https://vercel.com/support

---

**Built with:**
- Next.js 15
- TypeScript
- Tailwind CSS
- Apple's Liquid Glass Design Language

**Your website is production-ready!** 🚀

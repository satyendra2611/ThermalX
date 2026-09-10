# THERMAL-X · Heat Risk Intelligence

A modern web application converting localized weather data into predictive human thermal-stress indices, 120-hour forecast risk curves, ward vulnerability intelligence, and automated emergency action protocols.

## Tech Stack
- **Framework**: React 19 + Vite
- **Visualizations**: Recharts
- **Icons**: Lucide React
- **Live Data**: Open-Meteo API (weather & geocoding)
- **Deployment**: Vercel

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## Deploy to Vercel

### Option 1: Deploy via GitHub (Recommended)
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: initial commit - THERMAL-X dashboard"
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import your GitHub repository.
4. Vercel will automatically detect **Vite** preset:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.

### Option 2: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## Environment Variables (Optional)
The application works immediately out of the box with zero configuration. You can optionally configure these variables in `.env` or Vercel Project Settings:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_DEFAULT_CITY` | `Gonda` | Default city loaded on initial startup |
| `VITE_GEO_API_URL` | `https://geocoding-api.open-meteo.com/v1/search` | Open-Meteo geocoding endpoint |
| `VITE_WEATHER_API_URL` | `https://api.open-meteo.com/v1/forecast` | Open-Meteo forecast endpoint |

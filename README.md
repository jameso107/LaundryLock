# LaundryLock

A demo website showcasing smart laundry machine locking — lock while running, unlock via QR scan, then unload.

## Demo Flow

1. **Empty** → Tap "Put laundry in machine" to load
2. **Full** → Machine shows laundry and auto-starts wash cycle
3. **Running** → Machine is **locked**, drum spins, countdown timer runs (~15 sec for demo)
4. **Complete & locked** → Cycle done, still locked until you scan QR
5. **Scan QR** → Tap "Scan QR code" to simulate unlock
6. **Ready to unload** → Machine unlocks, tap "Unload laundry" to clear

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Leave defaults (no build command, output directory `.`)
5. Deploy

Each push to `main` will trigger a new deployment.

## Run Locally

```bash
npx serve .
# or
python3 -m http.server 8000
```

Open `http://localhost:3000` (or 8000) in your browser.

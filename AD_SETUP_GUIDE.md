# 💰 Ad Revenue & Earn Platform Setup Guide

## Ad Networks to Apply For

| Network        | Requirements          | Avg CPM (India) | Best For              |
|---------------|-----------------------|------------------|-----------------------|
| **Google AdSense** | Approved site, original content | ₹30–80/1k views | Best payouts, most trusted |
| **Media.net**  | 50k+ monthly visits  | ₹20–50/1k views  | Education/tech sites  |
| **PropellerAds** | None (instant)      | ₹5–20/1k views   | Quick start, no approval |
| **Ezoic**      | 10k+ monthly visits  | ₹40–100/1k views | AI-optimised, best UX |
| **Adsterra**   | None                 | ₹10–30/1k views  | Good backup network   |

## Recommended Strategy

1. **Start with PropellerAds** — No approval needed, instant setup
2. **Apply for Google AdSense** — Takes 2–4 weeks approval
3. **Move to Ezoic** — Once you hit 10k+ visits/month

## Revenue Share Model

Your platform shares **20% of ad revenue** with users:

```
Ad earns ₹2.50 CPM → Platform keeps ₹2.00 → User gets ₹0.50 per rewarded view
Monthly estimate (1000 active users, 2 ads/day): ₹15,000 ad revenue → ₹3,000 to users
```

## Setup Steps

### 1. Google AdSense
```html
<!-- Add to public/index.html <head> -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID" crossorigin="anonymous"></script>
```

Then in `AdReward.js`, replace:
- `ca-pub-YOUR_ADSENSE_PUBLISHER_ID` → your Publisher ID
- `YOUR_AD_SLOT_ID` → your ad unit slot IDs

### 2. PropellerAds (Quick Start)
```html
<script>(function(s,u,z,p){s.src=u,s.setAttribute('data-zone',z),p.appendChild(s);})(document.createElement('script'),'https://czttgu.com/tag.min.js', YOUR_ZONE_ID, document.body||document.documentElement)</script>
```

### 3. Backend: Track ad revenue (earnRoutes.js)
The `/earn/ad-reward` endpoint is ready — connect it to your ad network's postback/conversion URL.

## Privacy & Compliance
- Ads shown only to logged-in users (18+, students)
- No behavioural tracking without consent
- Compliant with Google AdSense content policies
- No ads on exam/test pages (distracting to students)

## Where to Place Ads (Non-intrusive)
- ✅ Dashboard sidebar (right column)
- ✅ Below problem list (CodingPlatform)  
- ✅ After completing a mock test
- ✅ VTU Resources page (between sections)
- ❌ Never on: exam pages, coding editor, login/register

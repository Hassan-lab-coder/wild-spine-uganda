# Search Engine Setup Beyond Google

This project is prepared for Bing, Yahoo, DuckDuckGo, Yandex, and IndexNow discovery.

## 1. Add verification codes

Add these environment variables in Vercel, then redeploy:

```bash
BING_SITE_VERIFICATION=
YANDEX_SITE_VERIFICATION=
INDEXNOW_KEY=
INDEXNOW_SECRET=
```

Use the Bing HTML meta tag value for `BING_SITE_VERIFICATION`. It renders as:

```html
<meta name="msvalidate.01" content="..." />
```

Use the Yandex HTML meta tag value for `YANDEX_SITE_VERIFICATION`. It renders as:

```html
<meta name="yandex-verification" content="..." />
```

## 2. Submit the sitemap

Submit this sitemap in Bing Webmaster Tools and Yandex Webmaster:

```text
https://www.wildspineuganda.com/sitemap.xml
```

Bing visibility also helps Yahoo. DuckDuckGo sources many traditional web links from Bing, so Bing indexing is the most important non-Google setup.

## 3. Submit updated URLs with IndexNow

After `INDEXNOW_KEY` and `INDEXNOW_SECRET` are live, this route submits all public sitemap URLs:

```bash
curl -X POST https://www.wildspineuganda.com/api/indexnow \
  -H "Authorization: Bearer $INDEXNOW_SECRET"
```

To submit only specific pages:

```bash
curl -X POST https://www.wildspineuganda.com/api/indexnow \
  -H "Authorization: Bearer $INDEXNOW_SECRET" \
  -H "Content-Type: application/json" \
  -d "{\"urls\":[\"https://www.wildspineuganda.com/guide\",\"https://www.wildspineuganda.com/gorilla-trekking-uganda\"]}"
```

The IndexNow key is served at:

```text
https://www.wildspineuganda.com/indexnow-key.txt
```

## 4. Protect the guide funnel

The landing page remains indexable:

```text
https://www.wildspineuganda.com/guide
```

The raw PDF is protected with an `X-Robots-Tag` response header:

```text
X-Robots-Tag: noindex, nofollow, noarchive
```

This lets search engines find the email capture page instead of sending visitors directly to the file.

## 5. Build authority signals

Create or improve consistent listings for Wild Spine Uganda on:

- Bing Places
- Apple Business Connect
- TripAdvisor
- SafariBookings
- Uganda tourism and travel directories
- Partner lodges and conservation partner pages
- Relevant travel blogs and expedition articles

Use the same business name, domain, email, phone, and Uganda office details everywhere.

## 6. Publish exact-answer pages

Prioritize content that directly answers travel intent:

- gorilla trekking Uganda cost 2026
- Bwindi permit help
- best time to visit Bwindi
- Uganda luxury safari itinerary
- Rwenzori hiking tour cost

Each page should include a clear answer near the top, updated dates, route context, internal links to booking pages, and proof of local expertise.

## Official references

- Bing Webmaster Guidelines: https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a
- Bing Sitemaps: https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed
- IndexNow setup: https://www.bing.com/indexnow/getstarted
- DuckDuckGo result sources: https://duckduckgo.com/duckduckgo-help-pages/results/sources/
- Yahoo submission via Bing: https://in.help.yahoo.com/kb/SLN2217.html
- Yandex sitemap docs: https://webmaster.yandex.com/site/indexing/sitemap/

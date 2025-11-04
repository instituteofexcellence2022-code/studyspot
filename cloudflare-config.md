# 🌐 Cloudflare Configuration Guide

## **Step 1: Add Site to Cloudflare**

1. Sign up/Login: https://cloudflare.com
2. Click "Add a Site"
3. Enter your domain (e.g., `studyspot.com`)
4. Choose Free plan
5. Update nameservers at your domain registrar

## **Step 2: DNS Records**

Add these DNS records in Cloudflare:

```
Type    Name    Value                           Proxy
CNAME   api     studyspot-api.railway.app      ✓ (Orange Cloud)
CNAME   student studyspot-student.vercel.app   ✓
CNAME   owner   studyspot-owner.vercel.app     ✓
CNAME   admin   studyspot-admin.vercel.app      ✓
CNAME   www     studyspot-student.vercel.app   ✓
```

**Proxy Status:** Orange Cloud (✓) = Enabled (CDN + DDoS Protection)

## **Step 3: SSL/TLS Settings**

1. Go to **SSL/TLS** → **Overview**
2. Set mode to: **Full (strict)**
3. Enable: **Always Use HTTPS**
4. Enable: **Automatic HTTPS Rewrites**

## **Step 4: Speed Optimization**

Go to **Speed** → **Optimization**:

- ✅ **Auto Minify:** JavaScript, CSS, HTML
- ✅ **Brotli:** Enabled
- ✅ **HTTP/2:** Enabled
- ✅ **HTTP/3 (with QUIC):** Enabled
- ✅ **0-RTT Connection Resumption:** Enabled
- ✅ **Early Hints:** Enabled

## **Step 5: Caching**

Go to **Caching** → **Configuration**:

- **Browser Cache TTL:** 4 hours
- **Caching Level:** Standard
- **Always Online:** On
- **Development Mode:** Off (in production)

**Page Rules:**
```
URL Pattern: *api/*
Cache Level: Bypass
```

```
URL Pattern: */static/*
Cache Level: Cache Everything
Edge Cache TTL: 1 month
```

## **Step 6: Security**

Go to **Security** → **Settings**:

- ✅ **Security Level:** Medium
- ✅ **Challenge Passage:** 30 minutes
- ✅ **Browser Integrity Check:** On
- ✅ **Privacy Pass Support:** On

**WAF (Web Application Firewall):**
- ✅ **Managed Rules:** ON
- ✅ **Bot Fight Mode:** ON
- ✅ **DDoS Protection:** ON

**Rate Limiting:**
- Create rule: 100 requests per minute per IP
- Action: Block

## **Step 7: Workers (Optional - Advanced)**

For API routing and edge computing:

```javascript
// workers/api-router.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  if (url.pathname.startsWith('/api/')) {
    return fetch('https://studyspot-api.railway.app' + url.pathname, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
  }
  
  return fetch(request)
}
```

## **Step 8: Analytics**

Go to **Analytics** → **Web Analytics**:

- Enable Web Analytics (free)
- Track page views, performance, errors

## **Step 9: Transform Rules (URL Rewriting)**

Go to **Rules** → **Transform Rules**:

**API Rewrite:**
- **Name:** API Rewrite
- **When:** `http.request.uri.path starts_with "/api"`
- **Then:** Rewrite to `https://studyspot-api.railway.app/api`

## **Step 10: Custom Domain in Vercel**

After Cloudflare DNS is set:

1. Go to Vercel project settings
2. Add domain: `student.studyspot.com`
3. Vercel will auto-configure SSL via Cloudflare

## **Verification Checklist**

- [ ] Domain added to Cloudflare
- [ ] Nameservers updated
- [ ] DNS records configured
- [ ] SSL/TLS set to Full (strict)
- [ ] Always Use HTTPS enabled
- [ ] Auto Minify enabled
- [ ] Brotli compression enabled
- [ ] Security settings configured
- [ ] WAF enabled
- [ ] Analytics enabled
- [ ] All frontends accessible via custom domain

## **Performance Tips**

1. **Enable Argo Smart Routing** (paid, but worth it for global users)
2. **Use Cloudflare Images** for automatic image optimization
3. **Enable Cloudflare Stream** for video content
4. **Use Workers for edge caching** of API responses

---

**Your site is now protected by Cloudflare's global CDN! 🚀**


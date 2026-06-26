# fairitaly_website

## WordPress/Oxygen recovery support

If your current site is stuck because of buggy custom snippets (WPCode), Oxygen template issues, or server config problems, this repository is now set up to track a safe recovery workflow.

### How I can help

I can help you fix the site **step by step** if you provide:

1. A list of urgent bugs (what is broken, and where).
2. Access details needed for troubleshooting (WordPress admin, staging URL, plugin list, and recent code snippets you added in WPCode).
3. Your redesign requirements (homepage first, then inner pages).

### Recommended recovery flow

1. **Clone to staging first** (never edit production directly).
2. **Export current Oxygen templates** and back up database/files.
3. **Disable custom WPCode snippets one by one** to isolate breakages.
4. **Fix critical layout/runtime errors** (PHP/JS/CSS conflicts).
5. **Rebuild homepage sections with clean components** and test responsive behavior.
6. **Promote changes to production only after validation**.

### Next action

Share your top 3 blocking issues and I can propose exact fixes and implementation order.

## fairitaly.org specific issue: design + www redirect

You reported problems on `fairitaly.org`, especially design stability and redirecting from `www.fairitaly.org`.

### Redirect target (recommended)

Use one canonical domain and force all traffic to it:

- `https://fairitaly.org` (recommended), or
- `https://www.fairitaly.org`

### Quick redirect checks

1. Verify DNS has records for both apex and `www`.
2. Add a single redirect rule at server level (LiteSpeed/Apache/Nginx), not in multiple plugins.
3. Keep WordPress Address + Site Address aligned with canonical domain.
4. Clear all caches (plugin, LiteSpeed, CDN, browser) after changes.
5. Test all 4 variants:
   - `http://fairitaly.org`
   - `https://fairitaly.org`
   - `http://www.fairitaly.org`
   - `https://www.fairitaly.org`

### WordPress/LiteSpeed example (.htaccess)

If your canonical is non-www, this rule pattern is commonly used:

```apacheconf
RewriteEngine On
RewriteCond %{HTTP_HOST} ^www\.fairitaly\.org$ [NC]
RewriteRule ^(.*)$ https://fairitaly.org/$1 [R=301,L]
```

Apply only once in the active redirect layer to avoid loops.

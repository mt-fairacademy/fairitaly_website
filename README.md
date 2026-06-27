# fairitaly_website

## WordPress / Oxygen recovery – Homepage WPCode snippet

### Fixed snippet

The file **[`wpcode-homepage.js`](wpcode-homepage.js)** is the corrected version of the
homepage WPCode JavaScript snippet.  It is a drop-in replacement for the original.

#### Bugs fixed

| # | Bug | Impact |
|---|-----|--------|
| 1 | `setTimeout(function(){` opener was accidentally deleted | **Runtime syntax error – entire script failed silently** |
| 2 | FOUC `visibility:hidden` style was injected inside `showSlide()` – i.e. on every 4-second slide change | Column flickered invisible on each slide transition |
| 3 | Identical block-builder code existed in both a 1000 ms and a 1500 ms `setTimeout` | Double DOM manipulation, duplicate elements on slow connections |
| 4 | `_rich_text-30-20` partially hidden in `go()`, then fully removed later | Inconsistent state, redundant code |
| 5 | `link-208-20` set to `display:none` in `go()`, then `.remove()`d in the timeout | Inconsistent cleanup |
| 6 | `link_button-47-20` removed at IIFE level instead of inside `go()` | Inconsistent structure, hard to maintain |
| 7 | `fair-academy-section` created in `go()` and destroyed 1 s later in the timeout | Visible 1-second flash of incorrectly styled content |
| 8 | `var el` re-declared 11 times in a row | Variable shadowing, unpredictable order of writes |

#### How to deploy

1. Open **WP Admin → WPCode → Snippets → Homepage snippet**.
2. Replace the entire code body with the contents of `wpcode-homepage.js`.
3. Save and test on a staging URL before pushing to production.

### Recovery workflow (general)

1. **Stage first** – never edit the live site directly.
2. **Back up DB + files** before any change.
3. **Disable WPCode snippets one by one** to isolate breakages.
4. **Fix CSS/JS conflicts** from Oxygen + plugin interactions.
5. **Promote to production** only after visual validation on mobile and desktop.

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

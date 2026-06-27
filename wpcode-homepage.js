/**
 * fairitaly.org – Homepage WPCode snippet (fixed & refactored)
 *
 * Bugs fixed vs. original:
 *  1. Missing setTimeout(function(){ opener caused a runtime syntax error.
 *  2. FOUC visibility:hidden style was re-injected on every slide change; moved
 *     to a one-time injection at startup.
 *  3. Duplicate setTimeout blocks at 1000 ms and 1500 ms ran the identical
 *     block-builder code twice; consolidated into a single 800 ms retry.
 *  4. _rich_text-30-20 was partially hidden inside go() then fully removed
 *     outside it; now removed once, in go().
 *  5. link-208-20 was hidden (display:none) in go() and then .remove()'d in
 *     the setTimeout; consolidated to a single remove() in go().
 *  6. link_button-47-20 was removed at IIFE level outside go(); moved inside.
 *  7. fair-academy-section was created in go() and then destroyed 1 s later
 *     in the setTimeout block, causing a visible flash; removed the create step
 *     and the Academy button is now built directly in buildBlocks().
 *  8. var el was re-declared 11 times in sequence; replaced with unique names.
 *
 * Structure:
 *  – injectStyles()   : all <style> injections (runs synchronously on load)
 *  – go()             : DOM manipulations that are safe on DOMContentLoaded
 *  – buildBlocks()    : moves/creates the WC and AC card blocks;
 *                       called from go() and retried after 800 ms for slow
 *                       Oxygen renders
 */
(function () {

  /* ─── 1. LATO FONT ────────────────────────────────────────────────────── */
  if (!document.getElementById('fair-lato-style')) {
    var stLato = document.createElement('style');
    stLato.id = 'fair-lato-style';
    stLato.textContent =
      "@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;500;600;700;900&display=swap');" +
      "body,body *{font-family:'Lato',sans-serif !important;}" +
      "h1,h2,h3,h4,h5,h6{font-weight:600 !important;}" +
      "p,li,td,span,div{font-weight:400 !important;}" +
      "nav a,.menu a,.nav a{font-weight:500 !important;}";
    document.head.appendChild(stLato);
  }

  /* ─── 2. ALL STATIC CSS ───────────────────────────────────────────────── */
  function injectStyles() {
    // FOUC guard: hide the left column while JS rearranges it.
    // Removed in buildBlocks() once the blocks are ready.
    // FIX #2: injected ONCE here, not inside the slide-change animation.
    if (!document.getElementById('fair-fouc')) {
      var sFouc = document.createElement('style');
      sFouc.id = 'fair-fouc';
      sFouc.textContent = '#div_block-8-20{visibility:hidden !important}';
      document.head.appendChild(sFouc);
    }

    var defs = [
      {
        id: 'fair-hero-style',
        css:
          "#section-70-20{background-image:linear-gradient(rgba(12,25,55,0.85),rgba(12,25,55,0.85)),url('https://fairitaly.org/fair/wp-content/uploads/2026/04/sfondo-fairi-web-site.jpg') !important;background-size:auto,cover !important;}" +
          "#headline-71-20{font-family:'Lato',sans-serif !important;font-size:38px !important;font-weight:700 !important;color:#fff !important;line-height:1.15 !important;text-transform:none !important;letter-spacing:normal !important;}" +
          "#_rich_text-72-20,#_rich_text-72-20 p{font-family:'Lato',sans-serif !important;font-size:20px !important;font-weight:300 !important;color:rgba(255,255,255,0.65) !important;}"
      },
      {
        id: 'fair-blue-unify',
        css:
          "#link-20-20,#link-13-20,#link-243-20,#link-199-20,#link-96-20,#link-98-20,#link-316-20,#link-261-20,#link-347-20,#link-351-20," +
          "#link-199-20 *,#link-96-20 *,#link-98-20 *,#link-316-20 *{color:#1B3F6E !important;}" +
          "#link-199-20 a:hover,#link-96-20 a:hover,#link-98-20 a:hover,#link-316-20 a:hover{color:#F7941D !important;}" +
          "#link-20-20:hover,#link-13-20:hover,#link-261-20:hover{color:#F7941D !important;}" +
          "#link-134-20,#div_block-8-20 a{color:#fff !important;}"
      },
      {
        id: 'fair-no-gray',
        css:
          "#div_block-7-20,#_posts_grid-127-20,#headline-21-20,#div_block-9-20" +
          "{background:transparent !important;background-color:transparent !important;}"
      },
      {
        id: 'fair-news7',
        css: "#_posts_grid-127-20 .ct-div-block:nth-child(n+8){display:none !important;}"
      },
      {
        id: 'fair-news-style',
        css:
          "#headline-21-20{color:#F7941D !important;}" +
          "#_posts_grid-127-20 h1,#_posts_grid-127-20 h2,#_posts_grid-127-20 h3," +
          "#_posts_grid-127-20 h4,#_posts_grid-127-20 a{color:#1B3F6E !important;}"
      },
      {
        id: 'fair-menu-style',
        css:
          "nav a,.ct-menu a,.menu-item a{color:#1B3F6E !important;}" +
          "nav a:hover,.ct-menu a:hover,.menu-item a:hover{color:#F7941D !important;}" +
          ".current-menu-item a,.current_page_item a{color:#F7941D !important;background:rgba(247,148,29,0.12) !important;}"
      },
      {
        id: 'fair-header-style',
        css:
          "#_header_row-51-23{min-height:110px !important;border-bottom:2px solid #1B3F6E !important;}" +
          "#_header_left-52-23{min-height:110px !important;display:flex !important;align-items:center !important;border-bottom:none !important;}" +
          "#div_block-56-23{width:100% !important;}" +
          "#-pro-menu-61-23{background:#FFFFFF !important;}" +
          "#-pro-menu-61-23 .oxy-pro-menu-list-item a{font-size:13px !important;font-weight:600 !important;letter-spacing:0.4px !important;}" +
          "#_header_left-52-23 img{display:none !important;}" +
          "#_social_icons-95-23{display:none !important;}" +
          "#section-123-23{position:fixed !important;top:-9999px !important;left:-9999px !important;width:1px !important;height:1px !important;overflow:hidden !important;}"
      },
      {
        id: 'fair-btn-style',
        css:
          "#link_button-41-20{font-size:13px !important;font-weight:600 !important;font-family:'Lato',sans-serif !important;background:#F7941D !important;color:#fff !important;border:none !important;border-radius:6px !important;padding:10px 22px !important;display:inline-block !important;text-align:center !important;letter-spacing:0.3px !important;align-self:center !important;width:fit-content !important;margin:0 auto !important;}" +
          "#link_button-41-20:hover{background:#d97a0f !important;}" +
          "#link_button-41-20::after{content:none !important;display:none !important;}" +
          "#div_block-7-20{justify-content:center !important;align-items:center !important;padding-right:20px !important;}" +
          "#fair-scopri-btn a{font-size:13px !important;font-weight:600 !important;font-family:'Lato',sans-serif !important;letter-spacing:0.3px !important;padding:10px 22px !important;border-radius:6px !important;background:#F7941D !important;color:#fff !important;border:none !important;}" +
          "#fair-scopri-btn a:hover{background:#d97a0f !important;}" +
          ".oxy-read-more{transition:color 0.2s,background-color 0.2s !important;}" +
          ".oxy-read-more:hover{color:#F7941D !important;}" +
          "#_posts_grid-127-20 .oxy-read-more:hover{color:#F7941D !important;background-color:rgb(220,222,223) !important;text-decoration:none !important;}" +
          "#fair-wcsbi-btn{font-size:13px !important;font-weight:600 !important;font-family:'Lato',sans-serif !important;background:#F7941D !important;color:#fff !important;border:none !important;border-radius:6px !important;padding:10px 22px !important;display:inline-block !important;text-align:center !important;letter-spacing:0.3px !important;text-decoration:none !important;cursor:pointer !important;margin:12px auto 0 !important;}" +
          "#fair-wcsbi-btn:hover{background:#d97a0f !important;}" +
          "#div_block-8-20{background:transparent !important;padding:0 !important;gap:16px !important;}" +
          "#fair-wc-block,#fair-ac-block{background:rgb(27,63,110) !important;border-radius:12px !important;padding:20px 18px 18px !important;display:flex !important;flex-direction:column !important;align-items:center !important;justify-content:flex-start !important;gap:14px !important;width:100% !important;box-sizing:border-box !important;text-align:center !important;}" +
          "#fair-ac-btn{font-size:13px !important;font-weight:600 !important;font-family:'Lato',sans-serif !important;background:#F7941D !important;color:#fff !important;border:none !important;border-radius:6px !important;padding:10px 22px !important;display:inline-block !important;text-align:center !important;letter-spacing:0.3px !important;text-decoration:none !important;cursor:pointer !important;}" +
          "#fair-ac-btn:hover{background:#d97a0f !important;}" +
          "#fair-ac-logo{display:block !important;width:100% !important;text-align:center !important;margin:0 !important;}" +
          "#fair-ac-logo img{max-width:180px !important;height:auto !important;display:block !important;margin:0 auto !important;}" +
          "#fair-ac-btn{margin:0 !important;align-self:center !important;}" +
          "#fair-ac-text{width:100% !important;margin:0 !important;padding-top:0 !important;text-align:center !important;}" +
          "#fair-ac-text p{margin:0 !important;line-height:1.6 !important;text-align:center !important;color:#fff !important;}"
      }
    ];

    defs.forEach(function (d) {
      if (!document.getElementById(d.id)) {
        var s = document.createElement('style');
        s.id = d.id;
        s.textContent = d.css;
        document.head.appendChild(s);
      }
    });
  }

  /* ─── 3. MAIN DOM MANIPULATION ────────────────────────────────────────── */
  function go() {
    // Fix WCSBI links
    var wcsbiLink = document.getElementById('link-134-20');
    if (wcsbiLink) wcsbiLink.setAttribute('href', 'https://wcsbi.org');
    document.querySelectorAll('[id="link-243-20"]').forEach(function (el) {
      el.setAttribute('href', 'https://wcsbi.org');
    });

    // FIX #4 + #5 + #6: remove all unwanted elements in one place
    ['link_button-312-20', 'link-208-20', 'video-209-20',
      '_rich_text-30-20', 'link_button-47-20'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });

    // Hide SDG elements
    var sdgLink = document.getElementById('link-247-20');
    if (sdgLink) sdgLink.setAttribute('style',
      'display:none !important;height:0 !important;overflow:hidden !important;margin:0 !important;padding:0 !important;');
    var sdgCode = document.getElementById('code_block-340-20');
    if (sdgCode) sdgCode.setAttribute('style', 'display:none !important;');

    // Hide newsletter form
    var nlForm = document.getElementById('div_block-113-23');
    if (nlForm) nlForm.setAttribute('style', 'display:none !important;');

    // FIX #8: unique variable names instead of repeated `var el`
    var elOrder199 = document.getElementById('link-199-20');
    if (elOrder199) { elOrder199.style.order = '1'; elOrder199.style.marginTop = '22px'; }
    var elOrder96 = document.getElementById('link-96-20');
    if (elOrder96) elOrder96.style.order = '2';
    var elOrder334 = document.getElementById('code_block-334-20');
    if (elOrder334) elOrder334.style.order = '2';
    var elOrder98 = document.getElementById('link-98-20');
    if (elOrder98) elOrder98.style.order = '3';
    var elOrder336 = document.getElementById('code_block-336-20');
    if (elOrder336) elOrder336.style.order = '3';
    var elOrder316 = document.getElementById('link-316-20');
    if (elOrder316) elOrder316.style.order = '4';
    var elOrder172 = document.getElementById('code_block-172-20');
    if (elOrder172) elOrder172.style.order = '4';

    // Style section headlines
    ['headline-21-20', 'headline-14-20', 'headline-308-20'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.setAttribute('style',
        "font-size:26px !important;font-weight:700 !important;font-family:'Lato',sans-serif !important;text-transform:uppercase !important;");
    });

    // Stretch main columns container
    var mainCols = document.getElementById('new_columns-6-20');
    if (mainCols) mainCols.style.alignItems = 'stretch';

    /* ── Slideshow ────────────────────────────────────────────────────── */
    var origImg = document.getElementById('image-133-20');
    if (origImg && !document.getElementById('fair-slideshow')) {
      var slides = [
        'https://fairitaly.org/fair/wp-content/uploads/2025/11/FAIR-WCSBI2025v2-1.jpg',
        'https://fairitaly.org/fair/wp-content/uploads/2025/11/FAIR-WCSBI2025-LOCANDINA-1.jpg',
        'https://fairitaly.org/fair/wp-content/uploads/2025/12/FAIR-12WCSBI2025-Thanks.jpg'
      ];
      var slideIdx = 0;
      var ssWrap = document.createElement('div');
      ssWrap.id = 'fair-slideshow';
      ssWrap.style.cssText = 'position:relative;border-radius:8px;overflow:hidden;margin-bottom:10px;aspect-ratio:16/9;background:#0d2a4e';
      var ssImg = document.createElement('img');
      ssImg.src = slides[0];
      ssImg.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;transition:opacity .6s';
      ssWrap.appendChild(ssImg);
      var ssDots = document.createElement('div');
      ssDots.style.cssText = 'position:absolute;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:6px';
      slides.forEach(function (_, i) {
        var dot = document.createElement('span');
        dot.style.cssText = 'width:7px;height:7px;border-radius:50%;cursor:pointer;background:' +
          (i ? 'rgba(255,255,255,.5)' : '#F7941D');
        dot.onclick = (function (j) { return function () { slideIdx = j; showSlide(); }; })(i);
        ssDots.appendChild(dot);
      });
      ssWrap.appendChild(ssDots);

      function showSlide() {
        // FIX #2: NO FOUC injection here – FOUC is injected once in injectStyles()
        ssImg.style.opacity = 0;
        setTimeout(function () { ssImg.src = slides[slideIdx]; ssImg.style.opacity = 1; }, 300);
        [].forEach.call(ssDots.children, function (d, i) {
          d.style.background = i === slideIdx ? '#F7941D' : 'rgba(255,255,255,.5)';
        });
      }

      setInterval(function () { slideIdx = (slideIdx + 1) % slides.length; showSlide(); }, 4000);
      origImg.parentNode.insertBefore(ssWrap, origImg);
      origImg.style.display = 'none';
    }

    /* ── Hero orange separator line ──────────────────────────────────── */
    var heroSub = document.getElementById('_rich_text-72-20');
    if (heroSub && !document.getElementById('hero-orange-line')) {
      var oLine = document.createElement('div');
      oLine.id = 'hero-orange-line';
      oLine.style.cssText = 'height:2px;background:#F7941D;width:100%;margin-top:14px;border-radius:1px;';
      heroSub.after(oLine);
    }

    /* ── Footer separator ────────────────────────────────────────────── */
    var footerCols = document.getElementById('new_columns-111-23');
    if (footerCols && !document.getElementById('fair-footer-sep')) {
      var sep = document.createElement('div');
      sep.id = 'fair-footer-sep';
      sep.style.cssText = 'height:4px;background:#1B3F6E;width:100%;display:block;';
      footerCols.parentNode.insertBefore(sep, footerCols);
    }

    /* ── Footer LinkedIn link ────────────────────────────────────────── */
    var footerCols2 = document.getElementById('new_columns-111-23');
    if (footerCols2 && !document.getElementById('fair-footer-links')) {
      var fLinks = document.createElement('div');
      fLinks.id = 'fair-footer-links';
      fLinks.style.cssText =
        'width:100%;text-align:center;padding:10px 0 6px;display:flex;align-items:center;justify-content:center;';
      var liLink = document.createElement('a');
      liLink.href = 'https://www.linkedin.com/company/fairitaly/';
      liLink.target = '_blank';
      liLink.rel = 'noopener';
      liLink.style.cssText =
        'color:#1B3F6E;font-size:13px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:6px;';
      var svgNS = 'http://www.w3.org/2000/svg';
      var liSvg = document.createElementNS(svgNS, 'svg');
      liSvg.setAttribute('width', '18'); liSvg.setAttribute('height', '18');
      liSvg.setAttribute('viewBox', '0 0 24 24'); liSvg.setAttribute('fill', '#1B3F6E');
      var liPath = document.createElementNS(svgNS, 'path');
      liPath.setAttribute('d',
        'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z');
      liSvg.appendChild(liPath);
      liLink.appendChild(liSvg);
      liLink.appendChild(document.createTextNode('LinkedIn'));
      fLinks.appendChild(liLink);
      footerCols2.parentNode.insertBefore(fLinks, footerCols2.nextSibling);
    }

    /* ── "Scopri FAIR" button in right column ────────────────────────── */
    var rightCol = document.getElementById('div_block-9-20');
    if (rightCol) {
      rightCol.setAttribute('style',
        (rightCol.getAttribute('style') || '') + ';padding-bottom:20px !important;');
      if (!document.getElementById('fair-scopri-btn')) {
        var scopriWrap = document.createElement('div');
        scopriWrap.id = 'fair-scopri-btn';
        scopriWrap.style.cssText = 'margin-top:auto;order:10;padding:20px 0 8px;width:100%;text-align:center;';
        var scopriBtn = document.createElement('a');
        scopriBtn.href = 'https://fairitaly.org/fair/associazione/';
        scopriBtn.style.cssText =
          "display:inline-block;background:#1B3F6E;color:#fff !important;font-family:'Lato',sans-serif;font-size:14px;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;letter-spacing:0.5px;";
        scopriBtn.textContent = 'Scopri FAIR \u2192';
        scopriBtn.onmouseover = function () { this.style.background = '#F7941D'; };
        scopriBtn.onmouseout = function () { this.style.background = '#1B3F6E'; };
        scopriWrap.appendChild(scopriBtn);
        rightCol.appendChild(scopriWrap);
      }
    }

    /* ── GRI block ───────────────────────────────────────────────────── */
    var griBlock = document.getElementById('link-316-20');
    var griHeadline = document.getElementById('headline-326-20');
    if (griBlock && griHeadline && !document.getElementById('gri-logo-img')) {
      var griLogo = document.createElement('img');
      griLogo.id = 'gri-logo-img';
      griLogo.src = 'https://fairitaly.org/fair/wp-content/uploads/2026/06/community-member-mark-2026.png';
      griLogo.style.cssText = 'width:100%;max-width:240px;height:auto;display:block;margin:0 auto 12px;';
      griBlock.insertBefore(griLogo, griHeadline);
    }
    var griText = document.getElementById('text_block-288-20');
    if (griText) griText.setAttribute('style',
      'font-size:13px !important;font-weight:400 !important;font-style:normal !important;text-transform:none !important;');
    if (griBlock && !document.getElementById('gri-quote')) {
      var griQuote = document.createElement('div');
      griQuote.id = 'gri-quote';
      griQuote.style.cssText = 'margin-top:12px;font-size:13px;font-style:italic;line-height:1.6;color:inherit;';
      griQuote.textContent =
        '\u201cGRI is grateful for FAIR Italy\u2019s contribution to our mission through membership of the GRI Community. ' +
        'Our members are vital in helping us advance the knowledge and practice of the GRI Standards to improve the quality ' +
        'and application of sustainability reporting worldwide. This influential global network is committed to using corporate ' +
        'transparency to foster innovation and advance responsible business practices in support of a sustainable future.\u201d';
      var griSig = document.createElement('p');
      griSig.style.cssText = 'margin-top:8px;font-style:normal;';
      griSig.innerHTML = '<strong>Eelco van der Enden</strong>, Chief Executive Officer, GRI';
      griBlock.appendChild(griQuote);
      griBlock.appendChild(griSig);
    }
    if (griHeadline) griHeadline.setAttribute('style',
      "font-size:14px !important;font-weight:500 !important;font-family:'Lato',sans-serif !important;text-transform:none !important;");

    /* ── Partner block paragraph colors ─────────────────────────────── */
    ['link-199-20', 'link-96-20', 'link-98-20'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.querySelectorAll('p').forEach(function (p) {
        p.style.setProperty('color', '#666666', 'important');
      });
    });

    /* ── News grid: inline colour fix ───────────────────────────────── */
    var newsGrid = document.getElementById('_posts_grid-127-20');
    if (newsGrid) {
      newsGrid.querySelectorAll('h1,h2,h3,h4,a').forEach(function (el) {
        el.style.setProperty('color', '#1B3F6E', 'important');
      });
    }

    /* ── "Leggi gli articoli" button ─────────────────────────────────── */
    var newsBtn = document.getElementById('link_button-41-20');
    if (newsBtn) {
      newsBtn.innerHTML = 'Leggi gli articoli \u2192';
      newsBtn.style.setProperty('font-size', '13px', 'important');
      newsBtn.style.setProperty('color', '#ffffff', 'important');
      newsBtn.style.setProperty('background', '#F7941D', 'important');
      newsBtn.style.setProperty('border', 'none', 'important');
      newsBtn.style.setProperty('border-radius', '6px', 'important');
      newsBtn.style.setProperty('width', 'fit-content', 'important');
      newsBtn.style.setProperty('margin', '0 auto', 'important');
      newsBtn.addEventListener('mouseenter', function () {
        this.style.setProperty('background', '#d97a0f', 'important');
      });
      newsBtn.addEventListener('mouseleave', function () {
        this.style.setProperty('background', '#F7941D', 'important');
      });
    }

    /* ── Read-more button label ──────────────────────────────────────── */
    document.querySelectorAll('#_posts_grid-127-20 .oxy-read-more').forEach(function (b) {
      b.textContent = 'Leggi \u2192';
    });

    /* ── WCSBI button ────────────────────────────────────────────────── */
    if (!document.getElementById('fair-wcsbi-btn')) {
      var wb = document.createElement('a');
      wb.id = 'fair-wcsbi-btn';
      wb.href = 'https://wcsbi.org';
      wb.target = '_blank';
      wb.textContent = 'WCSBI';
      wb.style.cssText =
        "font-size:13px;font-weight:600;font-family:Lato,sans-serif;color:#fff;background:#F7941D;" +
        "border:none;border-radius:6px;padding:10px 22px;display:inline-block;text-align:center;" +
        "letter-spacing:0.3px;text-decoration:none;cursor:pointer;margin:12px auto 0;";
      wb.addEventListener('mouseenter', function () {
        this.style.setProperty('background', '#d97a0f', 'important');
      });
      wb.addEventListener('mouseleave', function () {
        this.style.setProperty('background', '#F7941D', 'important');
      });
      var anc134 = document.getElementById('link-134-20');
      if (anc134 && anc134.parentElement) {
        anc134.parentElement.insertBefore(wb, anc134);
      }
    }

    // Try to build blocks immediately; a retry fires after 800 ms for slow renders
    buildBlocks();
  }

  /* ─── 4. BUILD WC / AC CARD BLOCKS ───────────────────────────────────── */
  // FIX #3: single function, called directly + one delayed retry (not two
  //         separate setTimeouts with identical bodies).
  // FIX #7: Academy button built here directly; no more fair-academy-section
  //         create-then-destroy cycle.
  function buildBlocks() {
    if (document.getElementById('fair-wc-block')) {
      // Already built; remove FOUC guard and exit
      var fouc = document.getElementById('fair-fouc');
      if (fouc) fouc.remove();
      return;
    }

    var col2 = document.getElementById('div_block-8-20');
    if (!col2) return; // Oxygen hasn't rendered this column yet; retry will fire

    col2.style.setProperty('background', 'transparent', 'important');
    col2.style.setProperty('padding', '0', 'important');
    col2.style.setProperty('gap', '16px', 'important');

    /* WCSBI card */
    var wcB = document.createElement('div');
    wcB.id = 'fair-wc-block';
    wcB.style.cssText =
      'background:rgb(27,63,110);border-radius:12px;padding:20px 18px 18px;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:14px;width:100%;box-sizing:border-box;text-align:center;';
    ['link-13-20'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) wcB.appendChild(el);
    });

    /* Academy card */
    var acB = document.createElement('div');
    acB.id = 'fair-ac-block';
    acB.style.cssText =
      'background:rgb(27,63,110);border-radius:12px;padding:20px 18px 18px;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:14px;width:100%;box-sizing:border-box;text-align:center;';

    // Academy logo
    var acLogoWrap = document.getElementById('link-243-20');
    if (acLogoWrap) {
      acLogoWrap.id = 'fair-ac-logo';
      acLogoWrap.style.cssText = 'display:block;width:100%;text-align:center;margin:0;';
      var acLogoImg = acLogoWrap.querySelector('img');
      if (acLogoImg) {
        acLogoImg.style.cssText = 'max-width:180px;height:auto;display:block;margin:0 auto;';
      }
      acB.appendChild(acLogoWrap);
    }

    // Academy button – built directly, no intermediate fair-academy-section (FIX #7)
    var acA = document.createElement('a');
    acA.id = 'fair-ac-btn';
    acA.href = 'https://fair-academy.org';
    acA.target = '_blank';
    acA.textContent = 'Vai al sito FAIR Academy \u2192';
    acA.addEventListener('mouseenter', function () {
      this.style.setProperty('background', '#d97a0f', 'important');
    });
    acA.addEventListener('mouseleave', function () {
      this.style.setProperty('background', '#F7941D', 'important');
    });
    acB.appendChild(acA);

    // Academy rich text
    var acText = document.getElementById('div_block-244-20');
    if (acText) {
      acText.id = 'fair-ac-text';
      acText.style.setProperty('color', '#fff', 'important');
      acText.style.setProperty('text-align', 'center', 'important');
      Array.from(acText.querySelectorAll('*')).forEach(function (el) {
        el.style.setProperty('color', '#fff', 'important');
        el.style.setProperty('text-align', 'center', 'important');
      });
      acB.appendChild(acText);
    }

    // Clean up any leftover stale element
    var lk208 = document.getElementById('link-208-20');
    if (lk208) lk208.remove();

    col2.appendChild(wcB);
    col2.appendChild(acB);

    // Remove FOUC guard now that the blocks are ready
    var fouc = document.getElementById('fair-fouc');
    if (fouc) fouc.remove();
  }

  /* ─── 5. BOOT ─────────────────────────────────────────────────────────── */
  injectStyles(); // runs synchronously – CSS is applied before first paint

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', go);
  } else {
    go();
  }

  // FIX #1 + #3: single delayed retry (was missing its opener, and was duplicated)
  setTimeout(function () {
    buildBlocks(); // safe to call again; guard inside prevents double-build
  }, 800);

}());

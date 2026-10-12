// Markdown Preview Wheel Zoom
// Injected into VS Code's built-in Markdown preview via the `markdown.previewScripts`
// contribution point. Ctrl + mouse wheel (or trackpad pinch) zooms the preview content.
// The zoom level is kept per preview origin in localStorage and survives content updates.
(function () {
  'use strict';

  // The preview may re-run contributed scripts on some updates. Reuse existing state when present.
  if (window.__mdWheelZoom) {
    window.__mdWheelZoom.apply(false);
    return;
  }

  var STORAGE_KEY = 'markdown-preview-wheel-zoom.level';
  var MIN = 0.5;
  var MAX = 3.0;
  var STEP = 0.1;
  var WHEEL_NOTCH = 50; // accumulated |deltaY| that counts as one step (trackpads send small deltas)
  var BADGE_MS = 1500;

  var level = load();
  var accumulated = 0;
  var badge = null;
  var badgeTimer = null;

  function round(v) {
    return Math.round(v * 10) / 10;
  }

  function load() {
    try {
      var v = parseFloat(localStorage.getItem(STORAGE_KEY));
      if (v >= MIN && v <= MAX) {
        return round(v);
      }
    } catch (e) { /* storage unavailable */ }
    return 1;
  }

  function save() {
    try {
      if (level === 1) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, String(level));
      }
    } catch (e) { /* storage unavailable */ }
  }

  function apply(showBadge) {
    document.body.style.zoom = level === 1 ? '' : String(level);
    if (showBadge || level !== 1) {
      updateBadge(showBadge);
    }
  }

  function setLevel(next) {
    var clamped = round(Math.min(MAX, Math.max(MIN, next)));
    if (clamped === level) {
      return;
    }
    // Keep the same relative position in the document while the layout rescales.
    var doc = document.documentElement;
    var ratio = doc.scrollHeight > 0 ? window.scrollY / doc.scrollHeight : 0;
    level = clamped;
    save();
    apply(true);
    window.scrollTo(0, ratio * doc.scrollHeight);
  }

  function ensureBadge() {
    if (badge && document.body.contains(badge)) {
      return badge;
    }
    badge = document.createElement('button');
    badge.id = 'md-wheel-zoom-badge';
    badge.type = 'button';
    badge.title = 'Markdown preview zoom. Click to reset. Ctrl + mouse wheel to zoom.';
    var s = badge.style;
    s.position = 'fixed';
    s.right = '12px';
    s.bottom = '12px';
    s.zIndex = '1000';
    s.padding = '2px 8px';
    s.border = '1px solid var(--vscode-widget-border, rgba(128, 128, 128, 0.4))';
    s.borderRadius = '4px';
    s.background = 'var(--vscode-editorWidget-background, #333)';
    s.color = 'var(--vscode-editorWidget-foreground, #ccc)';
    s.font = '12px var(--vscode-font-family, sans-serif)';
    s.cursor = 'pointer';
    s.opacity = '0';
    s.pointerEvents = 'none';
    s.transition = 'opacity 0.2s';
    badge.addEventListener('click', function () {
      setLevel(1);
    });
    document.body.appendChild(badge);
    return badge;
  }

  function updateBadge(show) {
    var b = ensureBadge();
    b.textContent = Math.round(level * 100) + '%' + (level !== 1 ? '  ↺' : '');
    b.style.zoom = String(1 / level); // counter the body zoom so the badge keeps its size
    if (!show) {
      return;
    }
    b.style.opacity = '1';
    b.style.pointerEvents = 'auto';
    clearTimeout(badgeTimer);
    badgeTimer = setTimeout(function () {
      b.style.opacity = '0';
      b.style.pointerEvents = 'none';
    }, BADGE_MS);
  }

  function onWheel(e) {
    if (!e.ctrlKey || e.altKey || e.shiftKey) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    accumulated += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY; // deltaMode 1 = lines
    if (Math.abs(accumulated) < WHEEL_NOTCH) {
      return;
    }
    var direction = accumulated < 0 ? 1 : -1; // wheel up = zoom in
    accumulated = 0;
    setLevel(level + direction * STEP);
  }

  window.addEventListener('wheel', onWheel, { passive: false, capture: true });

  window.__mdWheelZoom = {
    apply: apply,
    setLevel: setLevel,
    getLevel: function () { return level; }
  };

  apply(false);
})();

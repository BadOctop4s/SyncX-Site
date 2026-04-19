/* ═══════════════════════════════════════════════
   SyncX — gradualblur.js  v1.0
   Gradual Blur — vanilla JS port of ReactBits GradualBlur
   Zero dependencies.

   Usage:
     GradualBlur.create(targetEl, options?)
     GradualBlur.create('#my-section', { position: 'bottom', strength: 3 })

   Options:
     position      'bottom' | 'top' | 'left' | 'right'  (default: 'bottom')
     strength       number   blur multiplier              (default: 2)
     height        '6rem'   CSS height string            (default: '6rem')
     divCount       number   how many blur layers         (default: 6)
     curve         'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bezier'
     opacity        0–1                                   (default: 1)
     zIndex         number                                (default: 10)
     exponential    bool     exponential blur growth      (default: false)

   Returns: destroy() function to remove the element.
═══════════════════════════════════════════════ */

'use strict';

window.GradualBlur = (function () {

  /* ── CSS injected once ── */
  var _cssInjected = false;
  function injectCSS() {
    if (_cssInjected || typeof document === 'undefined') return;
    _cssInjected = true;
    var s = document.createElement('style');
    s.id = 'syncx-gradualblur-css';
    s.textContent = [
      '.gb-wrap{pointer-events:none;isolation:isolate;overflow:hidden;}',
      '.gb-inner{position:relative;width:100%;height:100%;}',
      '.gb-inner>div{-webkit-backdrop-filter:inherit;backdrop-filter:inherit;}',
      '@supports not (backdrop-filter:blur(1px)){.gb-inner>div{background:rgba(0,0,0,0.3);opacity:0.5;}}',
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Curve functions (maps 0-1 progress → 0-1 output) ── */
  var CURVES = {
    linear:       function(p){ return p; },
    bezier:       function(p){ return p*p*(3-2*p); },
    'ease-in':    function(p){ return p*p; },
    'ease-out':   function(p){ return 1-Math.pow(1-p,2); },
    'ease-in-out':function(p){ return p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2; },
  };

  /* ── Direction → CSS gradient direction ── */
  var DIRS = {
    top:'to top', bottom:'to bottom', left:'to left', right:'to right'
  };

  /* ── Build and attach ── */
  function create(target, opts) {
    injectCSS();

    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) { console.warn('[GradualBlur] target not found:', target); return function(){}; }

    opts = opts || {};
    var position   = opts.position   || 'bottom';
    var strength   = opts.strength   != null ? opts.strength   : 2;
    var height     = opts.height     || '6rem';
    var divCount   = opts.divCount   != null ? opts.divCount   : 6;
    var curve      = opts.curve      || 'ease-out';
    var opacity    = opts.opacity    != null ? opts.opacity    : 1;
    var zIndex     = opts.zIndex     != null ? opts.zIndex     : 10;
    var exponential= opts.exponential|| false;
    var className  = opts.className  || '';

    var curveFunc = CURVES[curve] || CURVES.linear;
    var direction = DIRS[position] || 'to bottom';
    var isVertical = position === 'top' || position === 'bottom';

    /* ── Wrapper ── */
    var wrap = document.createElement('div');
    wrap.className = 'gb-wrap' + (className ? ' ' + className : '');

    var wrapStyle = wrap.style;
    wrapStyle.position = 'absolute';
    wrapStyle.zIndex   = zIndex;
    wrapStyle.opacity  = opacity;

    if (isVertical) {
      wrapStyle.left  = '0';
      wrapStyle.right = '0';
      wrapStyle.height = height;
      if (position === 'bottom') { wrapStyle.bottom = '0'; }
      else                       { wrapStyle.top    = '0'; }
    } else {
      wrapStyle.top    = '0';
      wrapStyle.bottom = '0';
      wrapStyle.width  = height; /* reuse 'height' prop as width for horizontal */
      if (position === 'right') { wrapStyle.right = '0'; }
      else                      { wrapStyle.left  = '0'; }
    }

    /* ── Inner container ── */
    var inner = document.createElement('div');
    inner.className = 'gb-inner';

    /* ── Blur layers ── */
    var increment = 100 / divCount;

    for (var i = 1; i <= divCount; i++) {
      var progress = i / divCount;
      progress = curveFunc(progress);

      var blurValue;
      if (exponential) {
        blurValue = Math.pow(2, progress * 4) * 0.0625 * strength;
      } else {
        blurValue = 0.0625 * (progress * divCount + 1) * strength;
      }

      /* Gradient mask — creates the feathered edge */
      var p1 = Math.round((increment * i - increment) * 10) / 10;
      var p2 = Math.round((increment * i)             * 10) / 10;
      var p3 = Math.round((increment * i + increment) * 10) / 10;
      var p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      var gradientStops = 'transparent ' + p1 + '%, black ' + p2 + '%';
      if (p3 <= 100) gradientStops += ', black ' + p3 + '%';
      if (p4 <= 100) gradientStops += ', transparent ' + p4 + '%';

      var maskValue = 'linear-gradient(' + direction + ', ' + gradientStops + ')';
      var blurStr   = 'blur(' + blurValue.toFixed(3) + 'rem)';

      var layer      = document.createElement('div');
      var ls         = layer.style;
      ls.position    = 'absolute';
      ls.inset       = '0';
      ls.backdropFilter         = blurStr;
      ls.webkitBackdropFilter   = blurStr;
      ls.maskImage              = maskValue;
      ls.webkitMaskImage        = maskValue;

      inner.appendChild(layer);
    }

    wrap.appendChild(inner);

    /* The target must have position:relative (or absolute/sticky/fixed) for
       the absolutely-positioned wrap to sit inside it correctly.
       We set it only if it's currently 'static'. */
    var computed = window.getComputedStyle(el).position;
    if (computed === 'static') {
      el.style.position = 'relative';
    }
    el.style.overflow = el.style.overflow || 'hidden';
    el.appendChild(wrap);

    /* ── Cleanup ── */
    return function destroy() {
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    };
  }

  /* ── Convenience: apply to multiple targets ── */
  function createAll(selector, opts) {
    var destroyers = [];
    document.querySelectorAll(selector).forEach(function(el) {
      destroyers.push(create(el, opts));
    });
    return function() { destroyers.forEach(function(d){ d(); }); };
  }

  return { create: create, createAll: createAll };

})();

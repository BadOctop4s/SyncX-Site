/* ═══════════════════════════════════════════════
   SyncX — evileye.js  v1.1
   Evil Eye WebGL background — zero dependencies
   Fix: scroll flicker removed (canvas uses position:fixed,
   resize only on actual size change, no duplicate visibilitychange)
═══════════════════════════════════════════════ */
'use strict';

window.SyncXEye = (function () {

  function buildNoise(size) {
    var d = new Uint8Array(size * size * 4);
    function hash(x, y, s) {
      var n = (x * 374761393 + y * 668265263 + s * 1274126177) | 0;
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
    }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function noise(px, py, freq, seed) {
      var fx = (px / size) * freq, fy = (py / size) * freq;
      var ix = Math.floor(fx), iy = Math.floor(fy);
      var tx = fx - ix, ty = fy - iy, w = freq | 0;
      return lerp(
        lerp(hash(((ix%w)+w)%w,((iy%w)+w)%w,seed), hash((((ix+1)%w)+w)%w,((iy%w)+w)%w,seed), tx),
        lerp(hash(((ix%w)+w)%w,(((iy+1)%w)+w)%w,seed), hash((((ix+1)%w)+w)%w,(((iy+1)%w)+w)%w,seed), tx),
        ty
      );
    }
    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        var v = 0, amp = 0.4, tot = 0;
        for (var o = 0; o < 8; o++) {
          var f = 32 * (1 << o);
          v += amp * noise(x, y, f, o * 31);
          tot += amp; amp *= 0.65;
        }
        v = Math.max(0, Math.min(1, (v / tot - 0.5) * 2.2 + 0.5));
        var val = Math.round(v * 255), i = (y * size + x) * 4;
        d[i] = d[i+1] = d[i+2] = val; d[i+3] = 255;
      }
    }
    return d;
  }

  var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}';

  var FRAG = [
    'precision highp float;',
    'uniform float uT,uPup,uIris,uGlo,uInt,uSc,uNSc,uFol,uSpd;',
    'uniform vec3 uRes,uEye,uBg;',
    'uniform vec2 uMou;',
    'uniform sampler2D uNoi;',
    'void main(){',
    '  vec2 uv=(gl_FragCoord.xy*2.-uRes.xy)/uRes.y/uSc;',
    '  float ft=uT*uSpd,r=length(uv)*2.,a=(2.*atan(uv.x,uv.y))/6.2832*.3;',
    '  vec2 pv=vec2(r,a);',
    '  vec4 nA=texture2D(uNoi,pv*vec2(.2,7.)*uNSc+vec2(-ft*.1,0.));',
    '  vec4 nB=texture2D(uNoi,pv*vec2(.3,4.)*uNSc+vec2(-ft*.2,0.));',
    '  vec4 nC=texture2D(uNoi,pv*vec2(.1,5.)*uNSc+vec2(-ft*.1,0.));',
    '  float dm=1.-length(uv);',
    '  float iR=clamp((-( (dm-.7)/uIris)),0.,1.);',
    '  iR=clamp((iR*dm-.2)/.28+nA.r-.5,0.,1.)*1.3;',
    '  float oR=clamp((-((dm-.5)/.2)),0.,1.);',
    '  oR=clamp((oR*dm-.1)/.38+nC.r-.5,0.,1.)*1.3;',
    '  iR=clamp(iR+oR,0.,1.);',
    '  float iE=(dm-.2)*nB.r*2.;',
    '  vec2 pu=uv-uMou*uFol*.12;',
    '  float pup=clamp((1.-length(pu*vec2(9.,2.3)))*uPup,0.,1.)/.35;',
    '  float og=clamp(1.-length(uv*vec2(.5,1.5))+.5,0.,1.)+nC.r-.5;',
    '  float bg2=og;',
    '  og=clamp((pow(og,2.)+dm)*uGlo,0.,1.)*pow(1.-dm,2.)*2.5;',
    '  bg2=pow(bg2+dm,.5)*.15;',
    '  vec3 col=uEye*uInt*clamp(max(iR+iE,og+bg2)-pup,0.,3.)+uBg;',
    '  gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  function hex3(h) {
    h = h.replace('#','');
    return [parseInt(h.slice(0,2),16)/255, parseInt(h.slice(2,4),16)/255, parseInt(h.slice(4,6),16)/255];
  }

  function mkShader(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      console.error('[SyncXEye] shader error:', gl.getShaderInfoLog(s));
    return s;
  }

  function init(canvasId, opts) {
    opts = opts || {};
    var canvas = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
    if (!canvas) { console.warn('[SyncXEye] canvas not found:', canvasId); return null; }

    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) { console.warn('[SyncXEye] WebGL not supported'); return null; }

    var prog = gl.createProgram();
    gl.attachShader(prog, mkShader(gl, gl.VERTEX_SHADER,   VERT));
    gl.attachShader(prog, mkShader(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    var vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var pLoc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(pLoc);
    gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, buildNoise(256));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(prog, 'uNoi'), 0);

    var U = {};
    'uT,uPup,uIris,uGlo,uInt,uSc,uNSc,uFol,uSpd'.split(',').forEach(function(n){ U[n]=gl.getUniformLocation(prog,n); });
    'uRes,uMou,uEye,uBg'.split(',').forEach(function(n){ U[n]=gl.getUniformLocation(prog,n); });

    var eyeC = hex3(opts.eyeColor      || '#e02020');
    var bgC  = hex3(opts.bgColor       || '#000000');
    var INT  = opts.intensity    != null ? opts.intensity    : 1.5;
    var PUP  = opts.pupilSize    != null ? opts.pupilSize    : 0.6;
    var IRIS = opts.irisWidth    != null ? opts.irisWidth    : 0.25;
    var GLO  = opts.glowIntensity!= null ? opts.glowIntensity: 0.35;
    var SC   = opts.scale        != null ? opts.scale        : 0.85;
    var NSC  = opts.noiseScale   != null ? opts.noiseScale   : 1.0;
    var FOL  = opts.pupilFollow  != null ? opts.pupilFollow  : 1.0;
    var SPD  = opts.flameSpeed   != null ? opts.flameSpeed   : 1.0;

    /* mouse — track on window so it works even when canvas is fixed */
    var mx=0,my=0,tx=0,ty=0;
    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width)  * 2 - 1;
      ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
    }
    window.addEventListener('mousemove', onMove, {passive:true});

    /* resize — only update when dimensions actually change to avoid flicker */
    var lastW = 0, lastH = 0;
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.round(canvas.offsetWidth  * dpr);
      var h = Math.round(canvas.offsetHeight * dpr);
      if (w === lastW && h === lastH) return;
      lastW = w; lastH = h;
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    /* Use window resize (not ResizeObserver) for fixed canvases — avoids
       layout-triggered redraws that cause the scroll flicker */
    window.addEventListener('resize', resize, {passive:true});
    resize();

    var raf, running = true;
    function loop(t) {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      mx += (tx - mx) * 0.05;
      my += (ty - my) * 0.05;
      gl.uniform1f(U.uT,   t * 0.001);
      gl.uniform3f(U.uRes, canvas.width, canvas.height, canvas.width / canvas.height);
      gl.uniform2f(U.uMou, mx, my);
      gl.uniform1f(U.uPup,  PUP);  gl.uniform1f(U.uIris, IRIS);
      gl.uniform1f(U.uGlo,  GLO);  gl.uniform1f(U.uInt,  INT);
      gl.uniform1f(U.uSc,   SC);   gl.uniform1f(U.uNSc,  NSC);
      gl.uniform1f(U.uFol,  FOL);  gl.uniform1f(U.uSpd,  SPD);
      gl.uniform3fv(U.uEye, eyeC); gl.uniform3fv(U.uBg,  bgC);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    /* Pause/resume on tab visibility — single listener per instance */
    function onVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        requestAnimationFrame(loop);
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    requestAnimationFrame(loop);

    return {
      destroy: function() {
        running = false;
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', onMove);
        document.removeEventListener('visibilitychange', onVisibility);
        var ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }
    };
  }

  return { init: init };
})();

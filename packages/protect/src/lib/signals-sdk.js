/*
 *
 * Copyright © 2026 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

if (typeof window !== 'undefined') {
  var _POSignalsEntities;
  ((function (l, f) {
    'use strict';
    typeof l.CustomEvent != 'function' && (l.CustomEvent = f());
  })(window, function () {
    function l(f, E) {
      E = E || { bubbles: !1, cancelable: !1, detail: null };
      var i = document.createEvent('CustomEvent');
      return (i.initCustomEvent(f, E.bubbles, E.cancelable, E.detail), i);
    }
    return l;
  }),
    (function () {
      'use strict';
      var l = 'PING-SDK-VERSION-PLACEHOLDER',
        f = 'st-ping-div',
        E = /(console|auth)((\w|\d|-)*)\.pingone\.(eu|asia|ca|com\.au|com|sg)/,
        i = /(console|auth)-(test|staging)((\w|\d|-)*)\.pingone.com/,
        r = /(console|auth)((\w|\d|-)*)\.test-(one|two)-pingone\.com/,
        a = /(console|auth)((\w|\d|-)*)\.ort-(one|two)-pingone\.com/,
        c = /localhost/,
        t = window.location.hostname;
      function n(_) {
        window['enable-logs-pingOneSignals'] && console.log(_);
      }
      function e(_) {
        function L(he) {
          he = he.replace(
            /\r\n/g,
            `
`,
          );
          for (var Y = '', ye = 0; ye < he.length; ye++) {
            var be = he.charCodeAt(ye);
            be < 128
              ? (Y += String.fromCharCode(be))
              : be > 127 && be < 2048
                ? ((Y += String.fromCharCode((be >> 6) | 192)),
                  (Y += String.fromCharCode((be & 63) | 128)))
                : ((Y += String.fromCharCode((be >> 12) | 224)),
                  (Y += String.fromCharCode(((be >> 6) & 63) | 128)),
                  (Y += String.fromCharCode((be & 63) | 128)));
          }
          return Y;
        }
        var y = '',
          O,
          M,
          R,
          k,
          B,
          D,
          G,
          N = 0,
          ne = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        for (_ = L(_); N < _.length; )
          ((O = _.charCodeAt(N++)),
            (M = _.charCodeAt(N++)),
            (R = _.charCodeAt(N++)),
            (k = O >> 2),
            (B = ((O & 3) << 4) | (M >> 4)),
            (D = ((M & 15) << 2) | (R >> 6)),
            (G = R & 63),
            isNaN(M) ? (D = G = 64) : isNaN(R) && (G = 64),
            (y = y + ne.charAt(k) + ne.charAt(B) + ne.charAt(D) + ne.charAt(G)));
        return y;
      }
      function o() {
        var _ = document.getElementById(f);
        return (
          _ ||
          ((_ = document.createElement('div')),
          (_.style.border = 'none'),
          (_.style.position = 'absolute'),
          (_.style.top = '-999px'),
          (_.style.left = '-999px'),
          (_.style.width = '0'),
          (_.style.height = '0'),
          (_.style.visibility = 'hidden'),
          (_.style.overflow = 'hidden'),
          (_.id = f),
          document.body.appendChild(_),
          _)
        );
      }
      function s(_) {
        document.readyState !== 'loading' ? _() : document.addEventListener('DOMContentLoaded', _);
      }
      function x(_) {
        s(function () {
          if (_) {
            var L = o();
            ((window._pingOneSignalsToken = getComputedStyle(L, '::after').content.replace(
              /['"]+/g,
              '',
            )),
              document.dispatchEvent(new CustomEvent('PingOneSignalsTokenReadyEvent')));
          }
          var y = _ ? 'success' : 'failure';
          n('Finished - ' + y);
        });
      }
      function m(_, L) {
        for (var y = [], O = 0; O < _.length; O++) {
          var M = _.charCodeAt(O) ^ L.charCodeAt(O % L.length);
          y.push(String.fromCharCode(M));
        }
        return y.join('');
      }
      function p(_) {
        var L = { sdkVersion: l, platform: navigator.platform || '' },
          y = 'dkiBm42',
          O = encodeURIComponent(e(m(JSON.stringify(L), y))),
          M = document.createElement('link');
        ((M.type = 'text/css'),
          (M.rel = 'stylesheet'),
          (M.href = 'https://' + _ + '/signals/sdk/pong.css?body=' + O + '&e=2'));
        var R = document.head || document.getElementsByTagName('head')[0];
        (R.appendChild(M),
          (M.onload = function () {
            x(!0);
          }),
          (M.onerror = function () {
            x(!1);
          }));
      }
      var I = document.querySelector('script[data-pingOneSignalsSkipToken]');
      if (I && I.getAttribute('data-pingOneSignalsSkipToken') === 'true') {
        ((window._pingOneSignalsToken = 'skipped_token_' + new Date().getTime()),
          s(function () {
            document.dispatchEvent(new CustomEvent('PingOneSignalsTokenSkippedEvent'));
          }));
        return;
      }
      window._pingOneSignalsToken ||
        (window._pingOneSignalsToken = 'uninitialized_token_' + new Date().getTime());
      var g = window._pingOneSignalsCustomHost,
        v = g || 'apps.test-one-pingone.com',
        A = g || 'apps.ort-one-pingone.com',
        S = g || 'apps.pingone.com',
        d = g || (c.test(t) || r.test(t) || i.test(t) ? v : a.test(t) ? A : S);
      p(d);
    })(),
    (function (l) {
      (l._POSignalsEntities || (l._POSignalsEntities = {}),
        l._pingOneSignals && console.warn('PingOne Signals script was imported multiple times'));
    })(window),
    (function (l, f) {
      f(l);
    })(window, function (l) {
      'use strict';
      function f(m) {
        var p = this.constructor;
        return this.then(
          function (I) {
            return p.resolve(m()).then(function () {
              return I;
            });
          },
          function (I) {
            return p.resolve(m()).then(function () {
              return p.reject(I);
            });
          },
        );
      }
      var E = setTimeout;
      function i(m) {
        return !!(m && typeof m.length != 'undefined');
      }
      function r() {}
      function a(m, p) {
        return function () {
          m.apply(p, arguments);
        };
      }
      function c(m) {
        if (!(this instanceof c)) throw new TypeError('Promises must be constructed via new');
        if (typeof m != 'function') throw new TypeError('not a function');
        ((this._state = 0),
          (this._handled = !1),
          (this._value = void 0),
          (this._deferreds = []),
          x(m, this));
      }
      function t(m, p) {
        for (; m._state === 3; ) m = m._value;
        if (m._state === 0) {
          m._deferreds.push(p);
          return;
        }
        ((m._handled = !0),
          c._immediateFn(function () {
            var I = m._state === 1 ? p.onFulfilled : p.onRejected;
            if (I === null) {
              (m._state === 1 ? n : e)(p.promise, m._value);
              return;
            }
            var g;
            try {
              g = I(m._value);
            } catch (v) {
              e(p.promise, v);
              return;
            }
            n(p.promise, g);
          }));
      }
      function n(m, p) {
        try {
          if (p === m) throw new TypeError('A promise cannot be resolved with itself.');
          if (p && (typeof p == 'object' || typeof p == 'function')) {
            var I = p.then;
            if (p instanceof c) {
              ((m._state = 3), (m._value = p), o(m));
              return;
            } else if (typeof I == 'function') {
              x(a(I, p), m);
              return;
            }
          }
          ((m._state = 1), (m._value = p), o(m));
        } catch (g) {
          e(m, g);
        }
      }
      function e(m, p) {
        ((m._state = 2), (m._value = p), o(m));
      }
      function o(m) {
        m._state === 2 &&
          m._deferreds.length === 0 &&
          c._immediateFn(function () {
            m._handled || c._unhandledRejectionFn(m._value);
          });
        for (var p = 0, I = m._deferreds.length; p < I; p++) t(m, m._deferreds[p]);
        m._deferreds = null;
      }
      function s(m, p, I) {
        ((this.onFulfilled = typeof m == 'function' ? m : null),
          (this.onRejected = typeof p == 'function' ? p : null),
          (this.promise = I));
      }
      function x(m, p) {
        var I = !1;
        try {
          m(
            function (g) {
              I || ((I = !0), n(p, g));
            },
            function (g) {
              I || ((I = !0), e(p, g));
            },
          );
        } catch (g) {
          if (I) return;
          ((I = !0), e(p, g));
        }
      }
      ((c.prototype.catch = function (m) {
        return this.then(null, m);
      }),
        (c.prototype.then = function (m, p) {
          var I = new this.constructor(r);
          return (t(this, new s(m, p, I)), I);
        }),
        (c.prototype.finally = f),
        (c.all = function (m) {
          return new c(function (p, I) {
            if (!i(m)) return I(new TypeError('Promise.all accepts an array'));
            var g = Array.prototype.slice.call(m);
            if (g.length === 0) return p([]);
            var v = g.length;
            function A(d, _) {
              try {
                if (_ && (typeof _ == 'object' || typeof _ == 'function')) {
                  var L = _.then;
                  if (typeof L == 'function') {
                    L.call(
                      _,
                      function (y) {
                        A(d, y);
                      },
                      I,
                    );
                    return;
                  }
                }
                ((g[d] = _), --v === 0 && p(g));
              } catch (y) {
                I(y);
              }
            }
            for (var S = 0; S < g.length; S++) A(S, g[S]);
          });
        }),
        (c.resolve = function (m) {
          return m && typeof m == 'object' && m.constructor === c
            ? m
            : new c(function (p) {
                p(m);
              });
        }),
        (c.reject = function (m) {
          return new c(function (p, I) {
            I(m);
          });
        }),
        (c.race = function (m) {
          return new c(function (p, I) {
            if (!i(m)) return I(new TypeError('Promise.race accepts an array'));
            for (var g = 0, v = m.length; g < v; g++) c.resolve(m[g]).then(p, I);
          });
        }),
        (c._immediateFn =
          (typeof setImmediate == 'function' &&
            function (m) {
              setImmediate(m);
            }) ||
          function (m) {
            E(m, 0);
          }),
        (c._unhandledRejectionFn = function (p) {
          typeof console != 'undefined' &&
            console &&
            console.warn('Possible Unhandled Promise Rejection:', p);
        }),
        typeof l.Promise != 'function'
          ? (l.Promise = c)
          : l.Promise.prototype.finally || (l.Promise.prototype.finally = f));
    }),
    (function (l, f) {
      'use strict';
      l.PromiseQueue = f();
    })(_POSignalsEntities || (_POSignalsEntities = {}), function () {
      'use strict';
      var l = function () {},
        f = function (i) {
          return i && typeof i.then == 'function'
            ? i
            : new Promise(function (r) {
                r(i);
              });
        };
      function E(i, r, a) {
        ((this.options = a = a || {}),
          (this.pendingPromises = 0),
          (this.maxPendingPromises = typeof i != 'undefined' ? i : 1 / 0),
          (this.maxQueuedPromises = typeof r != 'undefined' ? r : 1 / 0),
          (this.queue = []));
      }
      return (
        (E.prototype.add = function (i) {
          var r = this;
          return new Promise(function (a, c, t) {
            if (r.queue.length >= r.maxQueuedPromises) {
              c(new Error('Queue limit reached'));
              return;
            }
            (r.queue.push({ promiseGenerator: i, resolve: a, reject: c, notify: t || l }),
              r._dequeue());
          });
        }),
        (E.prototype.getPendingLength = function () {
          return this.pendingPromises;
        }),
        (E.prototype.getQueueLength = function () {
          return this.queue.length;
        }),
        (E.prototype._dequeue = function () {
          var i = this;
          if (this.pendingPromises >= this.maxPendingPromises) return !1;
          var r = this.queue.shift();
          if (!r) return (this.options.onEmpty && this.options.onEmpty(), !1);
          try {
            (this.pendingPromises++,
              f(r.promiseGenerator()).then(
                function (a) {
                  (i.pendingPromises--, r.resolve(a), i._dequeue());
                },
                function (a) {
                  (i.pendingPromises--, r.reject(a), i._dequeue());
                },
                function (a) {
                  r.notify(a);
                },
              ));
          } catch (a) {
            (i.pendingPromises--, r.reject(a), i._dequeue());
          }
          return !0;
        }),
        E
      );
    }));
  ((function (l) {
    'use strict';
    var f = 'input is invalid type',
      E = !l.JS_SHA256_NO_ARRAY_BUFFER && typeof ArrayBuffer != 'undefined',
      i = '0123456789abcdef'.split(''),
      r = [-2147483648, 8388608, 32768, 128],
      a = [24, 16, 8, 0],
      c = [
        1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748,
        2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206,
        2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122,
        1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891,
        3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700,
        1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771,
        3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877,
        958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452,
        2361852424, 2428436474, 2756734187, 3204031479, 3329325298,
      ],
      t = ['hex', 'array', 'digest', 'arrayBuffer'],
      n = [];
    ((l.JS_SHA256_NO_NODE_JS || !Array.isArray) &&
      (Array.isArray = function (g) {
        return Object.prototype.toString.call(g) === '[object Array]';
      }),
      E &&
        (l.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView) &&
        (ArrayBuffer.isView = function (g) {
          return typeof g == 'object' && g.buffer && g.buffer.constructor === ArrayBuffer;
        }));
    var e = function (g, v) {
        return function (A) {
          return new m(v, !0).update(A)[g]();
        };
      },
      o = function (g) {
        var v = e('hex', g);
        ((v.create = function () {
          return new m(g);
        }),
          (v.update = function (d) {
            return v.create().update(d);
          }));
        for (var A = 0; A < t.length; ++A) {
          var S = t[A];
          v[S] = e(S, g);
        }
        return v;
      },
      s = function (g, v) {
        return function (A, S) {
          return new p(A, v, !0).update(S)[g]();
        };
      },
      x = function (g) {
        var v = s('hex', g);
        ((v.create = function (d) {
          return new p(d, g);
        }),
          (v.update = function (d, _) {
            return v.create(d).update(_);
          }));
        for (var A = 0; A < t.length; ++A) {
          var S = t[A];
          v[S] = s(S, g);
        }
        return v;
      };
    function m(g, v) {
      (v
        ? ((n[0] =
            n[16] =
            n[1] =
            n[2] =
            n[3] =
            n[4] =
            n[5] =
            n[6] =
            n[7] =
            n[8] =
            n[9] =
            n[10] =
            n[11] =
            n[12] =
            n[13] =
            n[14] =
            n[15] =
              0),
          (this.blocks = n))
        : (this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
        g
          ? ((this.h0 = 3238371032),
            (this.h1 = 914150663),
            (this.h2 = 812702999),
            (this.h3 = 4144912697),
            (this.h4 = 4290775857),
            (this.h5 = 1750603025),
            (this.h6 = 1694076839),
            (this.h7 = 3204075428))
          : ((this.h0 = 1779033703),
            (this.h1 = 3144134277),
            (this.h2 = 1013904242),
            (this.h3 = 2773480762),
            (this.h4 = 1359893119),
            (this.h5 = 2600822924),
            (this.h6 = 528734635),
            (this.h7 = 1541459225)),
        (this.block = this.start = this.bytes = this.hBytes = 0),
        (this.finalized = this.hashed = !1),
        (this.first = !0),
        (this.is224 = g));
    }
    ((m.prototype.update = function (g) {
      if (!this.finalized) {
        var v,
          A = typeof g;
        if (A !== 'string') {
          if (A === 'object') {
            if (g === null) throw new Error(f);
            if (E && g.constructor === ArrayBuffer) g = new Uint8Array(g);
            else if (!Array.isArray(g) && (!E || !ArrayBuffer.isView(g))) throw new Error(f);
          } else throw new Error(f);
          v = !0;
        }
        for (var S, d = 0, _, L = g.length, y = this.blocks; d < L; ) {
          if (
            (this.hashed &&
              ((this.hashed = !1),
              (y[0] = this.block),
              (y[16] =
                y[1] =
                y[2] =
                y[3] =
                y[4] =
                y[5] =
                y[6] =
                y[7] =
                y[8] =
                y[9] =
                y[10] =
                y[11] =
                y[12] =
                y[13] =
                y[14] =
                y[15] =
                  0)),
            v)
          )
            for (_ = this.start; d < L && _ < 64; ++d) y[_ >> 2] |= g[d] << a[_++ & 3];
          else
            for (_ = this.start; d < L && _ < 64; ++d)
              ((S = g.charCodeAt(d)),
                S < 128
                  ? (y[_ >> 2] |= S << a[_++ & 3])
                  : S < 2048
                    ? ((y[_ >> 2] |= (192 | (S >> 6)) << a[_++ & 3]),
                      (y[_ >> 2] |= (128 | (S & 63)) << a[_++ & 3]))
                    : S < 55296 || S >= 57344
                      ? ((y[_ >> 2] |= (224 | (S >> 12)) << a[_++ & 3]),
                        (y[_ >> 2] |= (128 | ((S >> 6) & 63)) << a[_++ & 3]),
                        (y[_ >> 2] |= (128 | (S & 63)) << a[_++ & 3]))
                      : ((S = 65536 + (((S & 1023) << 10) | (g.charCodeAt(++d) & 1023))),
                        (y[_ >> 2] |= (240 | (S >> 18)) << a[_++ & 3]),
                        (y[_ >> 2] |= (128 | ((S >> 12) & 63)) << a[_++ & 3]),
                        (y[_ >> 2] |= (128 | ((S >> 6) & 63)) << a[_++ & 3]),
                        (y[_ >> 2] |= (128 | (S & 63)) << a[_++ & 3])));
          ((this.lastByteIndex = _),
            (this.bytes += _ - this.start),
            _ >= 64
              ? ((this.block = y[16]), (this.start = _ - 64), this.hash(), (this.hashed = !0))
              : (this.start = _));
        }
        return (
          this.bytes > 4294967295 &&
            ((this.hBytes += (this.bytes / 4294967296) << 0),
            (this.bytes = this.bytes % 4294967296)),
          this
        );
      }
    }),
      (m.prototype.finalize = function () {
        if (!this.finalized) {
          this.finalized = !0;
          var g = this.blocks,
            v = this.lastByteIndex;
          ((g[16] = this.block),
            (g[v >> 2] |= r[v & 3]),
            (this.block = g[16]),
            v >= 56 &&
              (this.hashed || this.hash(),
              (g[0] = this.block),
              (g[16] =
                g[1] =
                g[2] =
                g[3] =
                g[4] =
                g[5] =
                g[6] =
                g[7] =
                g[8] =
                g[9] =
                g[10] =
                g[11] =
                g[12] =
                g[13] =
                g[14] =
                g[15] =
                  0)),
            (g[14] = (this.hBytes << 3) | (this.bytes >>> 29)),
            (g[15] = this.bytes << 3),
            this.hash());
        }
      }),
      (m.prototype.hash = function () {
        var g = this.h0,
          v = this.h1,
          A = this.h2,
          S = this.h3,
          d = this.h4,
          _ = this.h5,
          L = this.h6,
          y = this.h7,
          O = this.blocks,
          M,
          R,
          k,
          B,
          D,
          G,
          N,
          ne,
          he,
          Y,
          ye;
        for (M = 16; M < 64; ++M)
          ((D = O[M - 15]),
            (R = ((D >>> 7) | (D << 25)) ^ ((D >>> 18) | (D << 14)) ^ (D >>> 3)),
            (D = O[M - 2]),
            (k = ((D >>> 17) | (D << 15)) ^ ((D >>> 19) | (D << 13)) ^ (D >>> 10)),
            (O[M] = (O[M - 16] + R + O[M - 7] + k) << 0));
        for (ye = v & A, M = 0; M < 64; M += 4)
          (this.first
            ? (this.is224
                ? ((ne = 300032),
                  (D = O[0] - 1413257819),
                  (y = (D - 150054599) << 0),
                  (S = (D + 24177077) << 0))
                : ((ne = 704751109),
                  (D = O[0] - 210244248),
                  (y = (D - 1521486534) << 0),
                  (S = (D + 143694565) << 0)),
              (this.first = !1))
            : ((R = ((g >>> 2) | (g << 30)) ^ ((g >>> 13) | (g << 19)) ^ ((g >>> 22) | (g << 10))),
              (k = ((d >>> 6) | (d << 26)) ^ ((d >>> 11) | (d << 21)) ^ ((d >>> 25) | (d << 7))),
              (ne = g & v),
              (B = ne ^ (g & A) ^ ye),
              (N = (d & _) ^ (~d & L)),
              (D = y + k + N + c[M] + O[M]),
              (G = R + B),
              (y = (S + D) << 0),
              (S = (D + G) << 0)),
            (R = ((S >>> 2) | (S << 30)) ^ ((S >>> 13) | (S << 19)) ^ ((S >>> 22) | (S << 10))),
            (k = ((y >>> 6) | (y << 26)) ^ ((y >>> 11) | (y << 21)) ^ ((y >>> 25) | (y << 7))),
            (he = S & g),
            (B = he ^ (S & v) ^ ne),
            (N = (y & d) ^ (~y & _)),
            (D = L + k + N + c[M + 1] + O[M + 1]),
            (G = R + B),
            (L = (A + D) << 0),
            (A = (D + G) << 0),
            (R = ((A >>> 2) | (A << 30)) ^ ((A >>> 13) | (A << 19)) ^ ((A >>> 22) | (A << 10))),
            (k = ((L >>> 6) | (L << 26)) ^ ((L >>> 11) | (L << 21)) ^ ((L >>> 25) | (L << 7))),
            (Y = A & S),
            (B = Y ^ (A & g) ^ he),
            (N = (L & y) ^ (~L & d)),
            (D = _ + k + N + c[M + 2] + O[M + 2]),
            (G = R + B),
            (_ = (v + D) << 0),
            (v = (D + G) << 0),
            (R = ((v >>> 2) | (v << 30)) ^ ((v >>> 13) | (v << 19)) ^ ((v >>> 22) | (v << 10))),
            (k = ((_ >>> 6) | (_ << 26)) ^ ((_ >>> 11) | (_ << 21)) ^ ((_ >>> 25) | (_ << 7))),
            (ye = v & A),
            (B = ye ^ (v & S) ^ Y),
            (N = (_ & L) ^ (~_ & y)),
            (D = d + k + N + c[M + 3] + O[M + 3]),
            (G = R + B),
            (d = (g + D) << 0),
            (g = (D + G) << 0));
        ((this.h0 = (this.h0 + g) << 0),
          (this.h1 = (this.h1 + v) << 0),
          (this.h2 = (this.h2 + A) << 0),
          (this.h3 = (this.h3 + S) << 0),
          (this.h4 = (this.h4 + d) << 0),
          (this.h5 = (this.h5 + _) << 0),
          (this.h6 = (this.h6 + L) << 0),
          (this.h7 = (this.h7 + y) << 0));
      }),
      (m.prototype.hex = function () {
        this.finalize();
        var g = this.h0,
          v = this.h1,
          A = this.h2,
          S = this.h3,
          d = this.h4,
          _ = this.h5,
          L = this.h6,
          y = this.h7,
          O =
            i[(g >> 28) & 15] +
            i[(g >> 24) & 15] +
            i[(g >> 20) & 15] +
            i[(g >> 16) & 15] +
            i[(g >> 12) & 15] +
            i[(g >> 8) & 15] +
            i[(g >> 4) & 15] +
            i[g & 15] +
            i[(v >> 28) & 15] +
            i[(v >> 24) & 15] +
            i[(v >> 20) & 15] +
            i[(v >> 16) & 15] +
            i[(v >> 12) & 15] +
            i[(v >> 8) & 15] +
            i[(v >> 4) & 15] +
            i[v & 15] +
            i[(A >> 28) & 15] +
            i[(A >> 24) & 15] +
            i[(A >> 20) & 15] +
            i[(A >> 16) & 15] +
            i[(A >> 12) & 15] +
            i[(A >> 8) & 15] +
            i[(A >> 4) & 15] +
            i[A & 15] +
            i[(S >> 28) & 15] +
            i[(S >> 24) & 15] +
            i[(S >> 20) & 15] +
            i[(S >> 16) & 15] +
            i[(S >> 12) & 15] +
            i[(S >> 8) & 15] +
            i[(S >> 4) & 15] +
            i[S & 15] +
            i[(d >> 28) & 15] +
            i[(d >> 24) & 15] +
            i[(d >> 20) & 15] +
            i[(d >> 16) & 15] +
            i[(d >> 12) & 15] +
            i[(d >> 8) & 15] +
            i[(d >> 4) & 15] +
            i[d & 15] +
            i[(_ >> 28) & 15] +
            i[(_ >> 24) & 15] +
            i[(_ >> 20) & 15] +
            i[(_ >> 16) & 15] +
            i[(_ >> 12) & 15] +
            i[(_ >> 8) & 15] +
            i[(_ >> 4) & 15] +
            i[_ & 15] +
            i[(L >> 28) & 15] +
            i[(L >> 24) & 15] +
            i[(L >> 20) & 15] +
            i[(L >> 16) & 15] +
            i[(L >> 12) & 15] +
            i[(L >> 8) & 15] +
            i[(L >> 4) & 15] +
            i[L & 15];
        return (
          this.is224 ||
            (O +=
              i[(y >> 28) & 15] +
              i[(y >> 24) & 15] +
              i[(y >> 20) & 15] +
              i[(y >> 16) & 15] +
              i[(y >> 12) & 15] +
              i[(y >> 8) & 15] +
              i[(y >> 4) & 15] +
              i[y & 15]),
          O
        );
      }),
      (m.prototype.toString = m.prototype.hex),
      (m.prototype.digest = function () {
        this.finalize();
        var g = this.h0,
          v = this.h1,
          A = this.h2,
          S = this.h3,
          d = this.h4,
          _ = this.h5,
          L = this.h6,
          y = this.h7,
          O = [
            (g >> 24) & 255,
            (g >> 16) & 255,
            (g >> 8) & 255,
            g & 255,
            (v >> 24) & 255,
            (v >> 16) & 255,
            (v >> 8) & 255,
            v & 255,
            (A >> 24) & 255,
            (A >> 16) & 255,
            (A >> 8) & 255,
            A & 255,
            (S >> 24) & 255,
            (S >> 16) & 255,
            (S >> 8) & 255,
            S & 255,
            (d >> 24) & 255,
            (d >> 16) & 255,
            (d >> 8) & 255,
            d & 255,
            (_ >> 24) & 255,
            (_ >> 16) & 255,
            (_ >> 8) & 255,
            _ & 255,
            (L >> 24) & 255,
            (L >> 16) & 255,
            (L >> 8) & 255,
            L & 255,
          ];
        return (this.is224 || O.push((y >> 24) & 255, (y >> 16) & 255, (y >> 8) & 255, y & 255), O);
      }),
      (m.prototype.array = m.prototype.digest),
      (m.prototype.arrayBuffer = function () {
        this.finalize();
        var g = new ArrayBuffer(this.is224 ? 28 : 32),
          v = new DataView(g);
        return (
          v.setUint32(0, this.h0),
          v.setUint32(4, this.h1),
          v.setUint32(8, this.h2),
          v.setUint32(12, this.h3),
          v.setUint32(16, this.h4),
          v.setUint32(20, this.h5),
          v.setUint32(24, this.h6),
          this.is224 || v.setUint32(28, this.h7),
          g
        );
      }));
    function p(g, v, A) {
      var S,
        d = typeof g;
      if (d === 'string') {
        var _ = [],
          L = g.length,
          y = 0,
          O;
        for (S = 0; S < L; ++S)
          ((O = g.charCodeAt(S)),
            O < 128
              ? (_[y++] = O)
              : O < 2048
                ? ((_[y++] = 192 | (O >> 6)), (_[y++] = 128 | (O & 63)))
                : O < 55296 || O >= 57344
                  ? ((_[y++] = 224 | (O >> 12)),
                    (_[y++] = 128 | ((O >> 6) & 63)),
                    (_[y++] = 128 | (O & 63)))
                  : ((O = 65536 + (((O & 1023) << 10) | (g.charCodeAt(++S) & 1023))),
                    (_[y++] = 240 | (O >> 18)),
                    (_[y++] = 128 | ((O >> 12) & 63)),
                    (_[y++] = 128 | ((O >> 6) & 63)),
                    (_[y++] = 128 | (O & 63))));
        g = _;
      } else if (d === 'object') {
        if (g === null) throw new Error(f);
        if (E && g.constructor === ArrayBuffer) g = new Uint8Array(g);
        else if (!Array.isArray(g) && (!E || !ArrayBuffer.isView(g))) throw new Error(f);
      } else throw new Error(f);
      g.length > 64 && (g = new m(v, !0).update(g).array());
      var M = [],
        R = [];
      for (S = 0; S < 64; ++S) {
        var k = g[S] || 0;
        ((M[S] = 92 ^ k), (R[S] = 54 ^ k));
      }
      (m.call(this, v, A),
        this.update(R),
        (this.oKeyPad = M),
        (this.inner = !0),
        (this.sharedMemory = A));
    }
    ((p.prototype = new m()),
      (p.prototype.finalize = function () {
        if ((m.prototype.finalize.call(this), this.inner)) {
          this.inner = !1;
          var g = this.array();
          (m.call(this, this.is224, this.sharedMemory),
            this.update(this.oKeyPad),
            this.update(g),
            m.prototype.finalize.call(this));
        }
      }));
    var I = o();
    ((I.sha256 = I),
      (I.sha224 = o(!0)),
      (I.sha256.hmac = x()),
      (I.sha224.hmac = x(!0)),
      (l.sha256 = I.sha256),
      (l.sha224 = I.sha224));
  })(_POSignalsEntities || (_POSignalsEntities = {})),
    (function (l) {
      l.FingerprintJS = (function (f) {
        'use strict';
        var E = '5.0.1';
        function i(h, w) {
          return new Promise((C) => setTimeout(C, h, w));
        }
        function r() {
          return new Promise((h) => {
            const w = new MessageChannel();
            ((w.port1.onmessage = () => h()), w.port2.postMessage(null));
          });
        }
        function a(h, w = 1 / 0) {
          const { requestIdleCallback: C } = window;
          return C
            ? new Promise((U) => C.call(window, () => U(), { timeout: w }))
            : i(Math.min(h, w));
        }
        function c(h) {
          return !!h && typeof h.then == 'function';
        }
        function t(h, w) {
          try {
            const C = h();
            c(C)
              ? C.then(
                  (U) => w(!0, U),
                  (U) => w(!1, U),
                )
              : w(!0, C);
          } catch (C) {
            w(!1, C);
          }
        }
        async function n(h, w, C = 16) {
          const U = Array(h.length);
          let K = Date.now();
          for (let ie = 0; ie < h.length; ++ie) {
            U[ie] = w(h[ie], ie);
            const q = Date.now();
            q >= K + C && ((K = q), await r());
          }
          return U;
        }
        function e(h) {
          return (h.then(void 0, () => {}), h);
        }
        function o(h, w) {
          for (let C = 0, U = h.length; C < U; ++C) if (h[C] === w) return !0;
          return !1;
        }
        function s(h, w) {
          return !o(h, w);
        }
        function x(h) {
          return parseInt(h);
        }
        function m(h) {
          return parseFloat(h);
        }
        function p(h, w) {
          return typeof h == 'number' && isNaN(h) ? w : h;
        }
        function I(h) {
          return h.reduce((w, C) => w + (C ? 1 : 0), 0);
        }
        function g(h, w = 1) {
          if (Math.abs(w) >= 1) return Math.round(h / w) * w;
          {
            const C = 1 / w;
            return Math.round(h * C) / C;
          }
        }
        function v(h) {
          var w, C;
          const U = `Unexpected syntax '${h}'`,
            K = /^\s*([a-z-]*)(.*)$/i.exec(h),
            ie = K[1] || void 0,
            q = {},
            Q = /([.:#][\w-]+|\[.+?\])/gi,
            oe = (xe, J) => {
              ((q[xe] = q[xe] || []), q[xe].push(J));
            };
          for (;;) {
            const xe = Q.exec(K[2]);
            if (!xe) break;
            const J = xe[0];
            switch (J[0]) {
              case '.':
                oe('class', J.slice(1));
                break;
              case '#':
                oe('id', J.slice(1));
                break;
              case '[': {
                const z = /^\[([\w-]+)([~|^$*]?=("(.*?)"|([\w-]+)))?(\s+[is])?\]$/.exec(J);
                if (z)
                  oe(
                    z[1],
                    (C = (w = z[4]) !== null && w !== void 0 ? w : z[5]) !== null && C !== void 0
                      ? C
                      : '',
                  );
                else throw new Error(U);
                break;
              }
              default:
                throw new Error(U);
            }
          }
          return [ie, q];
        }
        function A(h) {
          const w = new Uint8Array(h.length);
          for (let C = 0; C < h.length; C++) {
            const U = h.charCodeAt(C);
            if (U > 127) return new TextEncoder().encode(h);
            w[C] = U;
          }
          return w;
        }
        function S(h, w) {
          const C = h[0] >>> 16,
            U = h[0] & 65535,
            K = h[1] >>> 16,
            ie = h[1] & 65535,
            q = w[0] >>> 16,
            Q = w[0] & 65535,
            oe = w[1] >>> 16,
            xe = w[1] & 65535;
          let J = 0,
            z = 0,
            De = 0,
            we = 0;
          ((we += ie + xe),
            (De += we >>> 16),
            (we &= 65535),
            (De += K + oe),
            (z += De >>> 16),
            (De &= 65535),
            (z += U + Q),
            (J += z >>> 16),
            (z &= 65535),
            (J += C + q),
            (J &= 65535),
            (h[0] = (J << 16) | z),
            (h[1] = (De << 16) | we));
        }
        function d(h, w) {
          const C = h[0] >>> 16,
            U = h[0] & 65535,
            K = h[1] >>> 16,
            ie = h[1] & 65535,
            q = w[0] >>> 16,
            Q = w[0] & 65535,
            oe = w[1] >>> 16,
            xe = w[1] & 65535;
          let J = 0,
            z = 0,
            De = 0,
            we = 0;
          ((we += ie * xe),
            (De += we >>> 16),
            (we &= 65535),
            (De += K * xe),
            (z += De >>> 16),
            (De &= 65535),
            (De += ie * oe),
            (z += De >>> 16),
            (De &= 65535),
            (z += U * xe),
            (J += z >>> 16),
            (z &= 65535),
            (z += K * oe),
            (J += z >>> 16),
            (z &= 65535),
            (z += ie * Q),
            (J += z >>> 16),
            (z &= 65535),
            (J += C * xe + U * oe + K * Q + ie * q),
            (J &= 65535),
            (h[0] = (J << 16) | z),
            (h[1] = (De << 16) | we));
        }
        function _(h, w) {
          const C = h[0];
          ((w %= 64),
            w === 32
              ? ((h[0] = h[1]), (h[1] = C))
              : w < 32
                ? ((h[0] = (C << w) | (h[1] >>> (32 - w))), (h[1] = (h[1] << w) | (C >>> (32 - w))))
                : ((w -= 32),
                  (h[0] = (h[1] << w) | (C >>> (32 - w))),
                  (h[1] = (C << w) | (h[1] >>> (32 - w)))));
        }
        function L(h, w) {
          ((w %= 64),
            w !== 0 &&
              (w < 32
                ? ((h[0] = h[1] >>> (32 - w)), (h[1] = h[1] << w))
                : ((h[0] = h[1] << (w - 32)), (h[1] = 0))));
        }
        function y(h, w) {
          ((h[0] ^= w[0]), (h[1] ^= w[1]));
        }
        const O = [4283543511, 3981806797],
          M = [3301882366, 444984403];
        function R(h) {
          const w = [0, h[0] >>> 1];
          (y(h, w), d(h, O), (w[1] = h[0] >>> 1), y(h, w), d(h, M), (w[1] = h[0] >>> 1), y(h, w));
        }
        const k = [2277735313, 289559509],
          B = [1291169091, 658871167],
          D = [0, 5],
          G = [0, 1390208809],
          N = [0, 944331445];
        function ne(h, w) {
          const C = A(h);
          w = w || 0;
          const U = [0, C.length],
            K = U[1] % 16,
            ie = U[1] - K,
            q = [0, w],
            Q = [0, w],
            oe = [0, 0],
            xe = [0, 0];
          let J;
          for (J = 0; J < ie; J = J + 16)
            ((oe[0] = C[J + 4] | (C[J + 5] << 8) | (C[J + 6] << 16) | (C[J + 7] << 24)),
              (oe[1] = C[J] | (C[J + 1] << 8) | (C[J + 2] << 16) | (C[J + 3] << 24)),
              (xe[0] = C[J + 12] | (C[J + 13] << 8) | (C[J + 14] << 16) | (C[J + 15] << 24)),
              (xe[1] = C[J + 8] | (C[J + 9] << 8) | (C[J + 10] << 16) | (C[J + 11] << 24)),
              d(oe, k),
              _(oe, 31),
              d(oe, B),
              y(q, oe),
              _(q, 27),
              S(q, Q),
              d(q, D),
              S(q, G),
              d(xe, B),
              _(xe, 33),
              d(xe, k),
              y(Q, xe),
              _(Q, 31),
              S(Q, q),
              d(Q, D),
              S(Q, N));
          ((oe[0] = 0), (oe[1] = 0), (xe[0] = 0), (xe[1] = 0));
          const z = [0, 0];
          switch (K) {
            case 15:
              ((z[1] = C[J + 14]), L(z, 48), y(xe, z));
            case 14:
              ((z[1] = C[J + 13]), L(z, 40), y(xe, z));
            case 13:
              ((z[1] = C[J + 12]), L(z, 32), y(xe, z));
            case 12:
              ((z[1] = C[J + 11]), L(z, 24), y(xe, z));
            case 11:
              ((z[1] = C[J + 10]), L(z, 16), y(xe, z));
            case 10:
              ((z[1] = C[J + 9]), L(z, 8), y(xe, z));
            case 9:
              ((z[1] = C[J + 8]), y(xe, z), d(xe, B), _(xe, 33), d(xe, k), y(Q, xe));
            case 8:
              ((z[1] = C[J + 7]), L(z, 56), y(oe, z));
            case 7:
              ((z[1] = C[J + 6]), L(z, 48), y(oe, z));
            case 6:
              ((z[1] = C[J + 5]), L(z, 40), y(oe, z));
            case 5:
              ((z[1] = C[J + 4]), L(z, 32), y(oe, z));
            case 4:
              ((z[1] = C[J + 3]), L(z, 24), y(oe, z));
            case 3:
              ((z[1] = C[J + 2]), L(z, 16), y(oe, z));
            case 2:
              ((z[1] = C[J + 1]), L(z, 8), y(oe, z));
            case 1:
              ((z[1] = C[J]), y(oe, z), d(oe, k), _(oe, 31), d(oe, B), y(q, oe));
          }
          return (
            y(q, U),
            y(Q, U),
            S(q, Q),
            S(Q, q),
            R(q),
            R(Q),
            S(q, Q),
            S(Q, q),
            ('00000000' + (q[0] >>> 0).toString(16)).slice(-8) +
              ('00000000' + (q[1] >>> 0).toString(16)).slice(-8) +
              ('00000000' + (Q[0] >>> 0).toString(16)).slice(-8) +
              ('00000000' + (Q[1] >>> 0).toString(16)).slice(-8)
          );
        }
        function he(h) {
          var w;
          return {
            name: h.name,
            message: h.message,
            stack:
              (w = h.stack) === null || w === void 0
                ? void 0
                : w.split(`
`),
            ...h,
          };
        }
        function Y(h) {
          return /^function\s.*?\{\s*\[native code]\s*}$/.test(String(h));
        }
        function ye(h) {
          return typeof h != 'function';
        }
        function be(h, w) {
          const C = e(
            new Promise((U) => {
              const K = Date.now();
              t(h.bind(null, w), (...ie) => {
                const q = Date.now() - K;
                if (!ie[0]) return U(() => ({ error: ie[1], duration: q }));
                const Q = ie[1];
                if (ye(Q)) return U(() => ({ value: Q, duration: q }));
                U(
                  () =>
                    new Promise((oe) => {
                      const xe = Date.now();
                      t(Q, (...J) => {
                        const z = q + Date.now() - xe;
                        if (!J[0]) return oe({ error: J[1], duration: z });
                        oe({ value: J[1], duration: z });
                      });
                    }),
                );
              });
            }),
          );
          return function () {
            return C.then((K) => K());
          };
        }
        function Ne(h, w, C, U) {
          const K = Object.keys(h).filter((q) => s(C, q)),
            ie = e(n(K, (q) => be(h[q], w), U));
          return async function () {
            const Q = await ie,
              oe = await n(Q, (z) => e(z()), U),
              xe = await Promise.all(oe),
              J = {};
            for (let z = 0; z < K.length; ++z) J[K[z]] = xe[z];
            return J;
          };
        }
        function P(h, w) {
          const C = (U) =>
            ye(U)
              ? w(U)
              : () => {
                  const K = U();
                  return c(K) ? K.then(w) : w(K);
                };
          return (U) => {
            const K = h(U);
            return c(K) ? K.then(C) : C(K);
          };
        }
        function X() {
          const h = window,
            w = navigator;
          return (
            I([
              'MSCSSMatrix' in h,
              'msSetImmediate' in h,
              'msIndexedDB' in h,
              'msMaxTouchPoints' in w,
              'msPointerEnabled' in w,
            ]) >= 4
          );
        }
        function re() {
          const h = window,
            w = navigator;
          return (
            I([
              'msWriteProfilerMark' in h,
              'MSStream' in h,
              'msLaunchUri' in w,
              'msSaveBlob' in w,
            ]) >= 3 && !X()
          );
        }
        function ae() {
          const h = window,
            w = navigator;
          return (
            I([
              'webkitPersistentStorage' in w,
              'webkitTemporaryStorage' in w,
              (w.vendor || '').indexOf('Google') === 0,
              'webkitResolveLocalFileSystemURL' in h,
              'BatteryManager' in h,
              'webkitMediaStream' in h,
              'webkitSpeechGrammar' in h,
            ]) >= 5
          );
        }
        function se() {
          const h = window,
            w = navigator;
          return (
            I([
              'ApplePayError' in h,
              'CSSPrimitiveValue' in h,
              'Counter' in h,
              w.vendor.indexOf('Apple') === 0,
              'RGBColor' in h,
              'WebKitMediaKeys' in h,
            ]) >= 4
          );
        }
        function Ae() {
          const h = window,
            { HTMLElement: w, Document: C } = h;
          return (
            I([
              'safari' in h,
              !('ongestureend' in h),
              !('TouchEvent' in h),
              !('orientation' in h),
              w && !('autocapitalize' in w.prototype),
              C && 'pointerLockElement' in C.prototype,
            ]) >= 4
          );
        }
        function Ie() {
          const h = window;
          return Y(h.print) && String(h.browser) === '[object WebPageNamespace]';
        }
        function Fe() {
          var h, w;
          const C = window;
          return (
            I([
              'buildID' in navigator,
              'MozAppearance' in
                ((w =
                  (h = document.documentElement) === null || h === void 0 ? void 0 : h.style) !==
                  null && w !== void 0
                  ? w
                  : {}),
              'onmozfullscreenchange' in C,
              'mozInnerScreenX' in C,
              'CSSMozDocumentRule' in C,
              'CanvasCaptureMediaStream' in C,
            ]) >= 4
          );
        }
        function ze() {
          const h = window;
          return (
            I([
              !('MediaSettingsRange' in h),
              'RTCEncodedAudioFrame' in h,
              '' + h.Intl == '[object Intl]',
              '' + h.Reflect == '[object Reflect]',
            ]) >= 3
          );
        }
        function Oe() {
          const h = window,
            { URLPattern: w } = h;
          return (
            I([
              'union' in Set.prototype,
              'Iterator' in h,
              w && 'hasRegExpGroups' in w.prototype,
              'RGB8' in WebGLRenderingContext.prototype,
            ]) >= 3
          );
        }
        function Re() {
          const h = window;
          return (
            I([
              'DOMRectList' in h,
              'RTCPeerConnectionIceEvent' in h,
              'SVGGeometryElement' in h,
              'ontransitioncancel' in h,
            ]) >= 3
          );
        }
        function He() {
          const h = window,
            w = navigator,
            { CSS: C, HTMLButtonElement: U } = h;
          return (
            I([
              !('getStorageUpdates' in w),
              U && 'popover' in U.prototype,
              'CSSCounterStyleRule' in h,
              C.supports('font-size-adjust: ex-height 0.5'),
              C.supports('text-transform: full-width'),
            ]) >= 4
          );
        }
        function je() {
          if (navigator.platform === 'iPad') return !0;
          const h = screen,
            w = h.width / h.height;
          return (
            I([
              'MediaSource' in window,
              !!Element.prototype.webkitRequestFullscreen,
              w > 0.65 && w < 1.53,
            ]) >= 2
          );
        }
        function dt() {
          const h = document;
          return (
            h.fullscreenElement ||
            h.msFullscreenElement ||
            h.mozFullScreenElement ||
            h.webkitFullscreenElement ||
            null
          );
        }
        function Je() {
          const h = document;
          return (
            h.exitFullscreen ||
            h.msExitFullscreen ||
            h.mozCancelFullScreen ||
            h.webkitExitFullscreen
          ).call(h);
        }
        function We() {
          const h = ae(),
            w = Fe(),
            C = window,
            U = navigator,
            K = 'connection';
          return h
            ? I([
                !('SharedWorker' in C),
                U[K] && 'ontypechange' in U[K],
                !('sinkId' in new Audio()),
              ]) >= 2
            : w
              ? I([
                  'onorientationchange' in C,
                  'orientation' in C,
                  /android/i.test(U.appVersion),
                ]) >= 2
              : !1;
        }
        function Ze() {
          const h = navigator,
            w = window,
            C = Audio.prototype,
            { visualViewport: U } = w;
          return (
            I([
              'srLatency' in C,
              'srChannelCount' in C,
              'devicePosture' in h,
              U && 'segments' in U,
              'getTextInformation' in Image.prototype,
            ]) >= 3
          );
        }
        function _e() {
          return Qe() ? -4 : Be();
        }
        function Be() {
          const h = window,
            w = h.OfflineAudioContext || h.webkitOfflineAudioContext;
          if (!w) return -2;
          if (Ve()) return -1;
          const C = 4500,
            U = 5e3,
            K = new w(1, U, 44100),
            ie = K.createOscillator();
          ((ie.type = 'triangle'), (ie.frequency.value = 1e4));
          const q = K.createDynamicsCompressor();
          ((q.threshold.value = -50),
            (q.knee.value = 40),
            (q.ratio.value = 12),
            (q.attack.value = 0),
            (q.release.value = 0.25),
            ie.connect(q),
            q.connect(K.destination),
            ie.start(0));
          const [Q, oe] = $e(K),
            xe = e(
              Q.then(
                (J) => et(J.getChannelData(0).subarray(C)),
                (J) => {
                  if (J.name === 'timeout' || J.name === 'suspended') return -3;
                  throw J;
                },
              ),
            );
          return () => (oe(), xe);
        }
        function Ve() {
          return se() && !Ae() && !Re();
        }
        function Qe() {
          return (se() && He() && Ie()) || (ae() && Ze() && Oe());
        }
        function $e(h) {
          let ie = () => {};
          return [
            new Promise((Q, oe) => {
              let xe = !1,
                J = 0,
                z = 0;
              h.oncomplete = (ke) => Q(ke.renderedBuffer);
              const De = () => {
                  setTimeout(() => oe(qe('timeout')), Math.min(500, z + 5e3 - Date.now()));
                },
                we = () => {
                  try {
                    const ke = h.startRendering();
                    switch ((c(ke) && e(ke), h.state)) {
                      case 'running':
                        ((z = Date.now()), xe && De());
                        break;
                      case 'suspended':
                        (document.hidden || J++,
                          xe && J >= 3 ? oe(qe('suspended')) : setTimeout(we, 500));
                        break;
                    }
                  } catch (ke) {
                    oe(ke);
                  }
                };
              (we(),
                (ie = () => {
                  xe || ((xe = !0), z > 0 && De());
                }));
            }),
            ie,
          ];
        }
        function et(h) {
          let w = 0;
          for (let C = 0; C < h.length; ++C) w += Math.abs(h[C]);
          return w;
        }
        function qe(h) {
          const w = new Error(h);
          return ((w.name = h), w);
        }
        async function Ke(h, w, C = 50) {
          var U, K, ie;
          const q = document;
          for (; !q.body; ) await i(C);
          const Q = q.createElement('iframe');
          try {
            for (
              await new Promise((oe, xe) => {
                let J = !1;
                const z = () => {
                    ((J = !0), oe());
                  },
                  De = (Ye) => {
                    ((J = !0), xe(Ye));
                  };
                ((Q.onload = z), (Q.onerror = De));
                const { style: we } = Q;
                (we.setProperty('display', 'block', 'important'),
                  (we.position = 'absolute'),
                  (we.top = '0'),
                  (we.left = '0'),
                  (we.visibility = 'hidden'),
                  w && ('srcdoc' in Q) ? (Q.srcdoc = w) : (Q.src = 'about:blank'),
                  q.body.appendChild(Q));
                const ke = () => {
                  var Ye, Lt;
                  J ||
                    (((Lt =
                      (Ye = Q.contentWindow) === null || Ye === void 0 ? void 0 : Ye.document) ===
                      null || Lt === void 0
                      ? void 0
                      : Lt.readyState) === 'complete'
                      ? z()
                      : setTimeout(ke, 10));
                };
                ke();
              });
              !(
                !(
                  (K = (U = Q.contentWindow) === null || U === void 0 ? void 0 : U.document) ===
                    null || K === void 0
                ) && K.body
              );

            )
              await i(C);
            return await h(Q, Q.contentWindow);
          } finally {
            (ie = Q.parentNode) === null || ie === void 0 || ie.removeChild(Q);
          }
        }
        function b(h) {
          const [w, C] = v(h),
            U = document.createElement(w != null ? w : 'div');
          for (const K of Object.keys(C)) {
            const ie = C[K].join(' ');
            K === 'style' ? V(U.style, ie) : U.setAttribute(K, ie);
          }
          return U;
        }
        function V(h, w) {
          for (const C of w.split(';')) {
            const U = /^\s*([\w-]+)\s*:\s*(.+?)(\s*!([\w-]+))?\s*$/.exec(C);
            if (U) {
              const [, K, ie, , q] = U;
              h.setProperty(K, ie, q || '');
            }
          }
        }
        function j() {
          let h = window;
          for (;;) {
            const w = h.parent;
            if (!w || w === h) return !1;
            try {
              if (w.location.origin !== h.location.origin) return !0;
            } catch (C) {
              if (C instanceof Error && C.name === 'SecurityError') return !0;
              throw C;
            }
            h = w;
          }
        }
        const W = 'mmMwWLliI0O&1',
          $ = '48px',
          ee = ['monospace', 'sans-serif', 'serif'],
          me = [
            'sans-serif-thin',
            'ARNO PRO',
            'Agency FB',
            'Arabic Typesetting',
            'Arial Unicode MS',
            'AvantGarde Bk BT',
            'BankGothic Md BT',
            'Batang',
            'Bitstream Vera Sans Mono',
            'Calibri',
            'Century',
            'Century Gothic',
            'Clarendon',
            'EUROSTILE',
            'Franklin Gothic',
            'Futura Bk BT',
            'Futura Md BT',
            'GOTHAM',
            'Gill Sans',
            'HELV',
            'Haettenschweiler',
            'Helvetica Neue',
            'Humanst521 BT',
            'Leelawadee',
            'Letter Gothic',
            'Levenim MT',
            'Lucida Bright',
            'Lucida Sans',
            'Menlo',
            'MS Mincho',
            'MS Outlook',
            'MS Reference Specialty',
            'MS UI Gothic',
            'MT Extra',
            'MYRIAD PRO',
            'Marlett',
            'Meiryo UI',
            'Microsoft Uighur',
            'Minion Pro',
            'Monotype Corsiva',
            'PMingLiU',
            'Pristina',
            'SCRIPTINA',
            'Segoe UI Light',
            'Serifa',
            'SimHei',
            'Small Fonts',
            'Staccato222 BT',
            'TRAJAN PRO',
            'Univers CE 55 Medium',
            'Vrinda',
            'ZWAdobeF',
          ];
        function Se() {
          return Ke(async (h, { document: w }) => {
            const C = w.body;
            C.style.fontSize = $;
            const U = w.createElement('div');
            U.style.setProperty('visibility', 'hidden', 'important');
            const K = {},
              ie = {},
              q = (we) => {
                const ke = w.createElement('span'),
                  { style: Ye } = ke;
                return (
                  (Ye.position = 'absolute'),
                  (Ye.top = '0'),
                  (Ye.left = '0'),
                  (Ye.fontFamily = we),
                  (ke.textContent = W),
                  U.appendChild(ke),
                  ke
                );
              },
              Q = (we, ke) => q(`'${we}',${ke}`),
              oe = () => ee.map(q),
              xe = () => {
                const we = {};
                for (const ke of me) we[ke] = ee.map((Ye) => Q(ke, Ye));
                return we;
              },
              J = (we) =>
                ee.some((ke, Ye) => we[Ye].offsetWidth !== K[ke] || we[Ye].offsetHeight !== ie[ke]),
              z = oe(),
              De = xe();
            C.appendChild(U);
            for (let we = 0; we < ee.length; we++)
              ((K[ee[we]] = z[we].offsetWidth), (ie[ee[we]] = z[we].offsetHeight));
            return me.filter((we) => J(De[we]));
          });
        }
        function u() {
          const h = navigator.plugins;
          if (!h) return;
          const w = [];
          for (let C = 0; C < h.length; ++C) {
            const U = h[C];
            if (!U) continue;
            const K = [];
            for (let ie = 0; ie < U.length; ++ie) {
              const q = U[ie];
              K.push({ type: q.type, suffixes: q.suffixes });
            }
            w.push({ name: U.name, description: U.description, mimeTypes: K });
          }
          return w;
        }
        function F() {
          return H(tt());
        }
        function H(h) {
          let w = !1,
            C,
            U;
          const [K, ie] = T();
          return (
            te(K, ie)
              ? ((w = ce(ie)), h ? (C = U = 'skipped') : ([C, U] = le(K, ie)))
              : (C = U = 'unsupported'),
            { winding: w, geometry: C, text: U }
          );
        }
        function T() {
          const h = document.createElement('canvas');
          return ((h.width = 1), (h.height = 1), [h, h.getContext('2d')]);
        }
        function te(h, w) {
          return !!(w && h.toDataURL);
        }
        function ce(h) {
          return (h.rect(0, 0, 10, 10), h.rect(2, 2, 6, 6), !h.isPointInPath(5, 5, 'evenodd'));
        }
        function le(h, w) {
          fe(h, w);
          const C = ve(h),
            U = ve(h);
          return C !== U ? ['unstable', 'unstable'] : (Ge(h, w), [ve(h), C]);
        }
        function fe(h, w) {
          ((h.width = 240),
            (h.height = 60),
            (w.textBaseline = 'alphabetic'),
            (w.fillStyle = '#f60'),
            w.fillRect(100, 1, 62, 20),
            (w.fillStyle = '#069'),
            (w.font = '11pt "Times New Roman"'));
          const C = 'Cwm fjordbank gly \u{1F603}';
          (w.fillText(C, 2, 15),
            (w.fillStyle = 'rgba(102, 204, 0, 0.2)'),
            (w.font = '18pt Arial'),
            w.fillText(C, 4, 45));
        }
        function Ge(h, w) {
          ((h.width = 122), (h.height = 110), (w.globalCompositeOperation = 'multiply'));
          for (const [C, U, K] of [
            ['#f2f', 40, 40],
            ['#2ff', 80, 40],
            ['#ff2', 60, 80],
          ])
            ((w.fillStyle = C),
              w.beginPath(),
              w.arc(U, K, 40, 0, Math.PI * 2, !0),
              w.closePath(),
              w.fill());
          ((w.fillStyle = '#f9c'),
            w.arc(60, 60, 60, 0, Math.PI * 2, !0),
            w.arc(60, 60, 20, 0, Math.PI * 2, !0),
            w.fill('evenodd'));
        }
        function ve(h) {
          return h.toDataURL();
        }
        function tt() {
          return se() && He() && Ie();
        }
        function ft() {
          const h = navigator;
          let w = 0,
            C;
          h.maxTouchPoints !== void 0
            ? (w = x(h.maxTouchPoints))
            : h.msMaxTouchPoints !== void 0 && (w = h.msMaxTouchPoints);
          try {
            (document.createEvent('TouchEvent'), (C = !0));
          } catch {
            C = !1;
          }
          const U = 'ontouchstart' in window;
          return { maxTouchPoints: w, touchEvent: C, touchStart: U };
        }
        function ut() {
          return navigator.oscpu;
        }
        function ht() {
          const h = navigator,
            w = [],
            C = h.language || h.userLanguage || h.browserLanguage || h.systemLanguage;
          if ((C !== void 0 && w.push([C]), Array.isArray(h.languages)))
            (ae() && ze()) || w.push(h.languages);
          else if (typeof h.languages == 'string') {
            const U = h.languages;
            U && w.push(U.split(','));
          }
          return w;
        }
        function nt() {
          return window.screen.colorDepth;
        }
        function It() {
          return p(m(navigator.deviceMemory), void 0);
        }
        function it() {
          if (!(se() && He() && Ie())) return _t();
        }
        function _t() {
          const h = screen,
            w = (U) => p(x(U), null),
            C = [w(h.width), w(h.height)];
          return (C.sort().reverse(), C);
        }
        const rt = 2500,
          gt = 10;
        let lt, xt;
        function Tt() {
          if (xt !== void 0) return;
          const h = () => {
            const w = bt();
            vt(w) ? (xt = setTimeout(h, rt)) : ((lt = w), (xt = void 0));
          };
          h();
        }
        function at() {
          return (
            Tt(),
            async () => {
              let h = bt();
              if (vt(h)) {
                if (lt) return [...lt];
                dt() && (await Je(), (h = bt()));
              }
              return (vt(h) || (lt = h), h);
            }
          );
        }
        function Ct() {
          if (se() && He() && Ie()) return () => Promise.resolve(void 0);
          const h = at();
          return async () => {
            const w = await h(),
              C = (U) => (U === null ? null : g(U, gt));
            return [C(w[0]), C(w[1]), C(w[2]), C(w[3])];
          };
        }
        function bt() {
          const h = screen;
          return [
            p(m(h.availTop), null),
            p(m(h.width) - m(h.availWidth) - p(m(h.availLeft), 0), null),
            p(m(h.height) - m(h.availHeight) - p(m(h.availTop), 0), null),
            p(m(h.availLeft), null),
          ];
        }
        function vt(h) {
          for (let w = 0; w < 4; ++w) if (h[w]) return !1;
          return !0;
        }
        function wt() {
          return p(x(navigator.hardwareConcurrency), void 0);
        }
        function Ut() {
          var h;
          const w = (h = window.Intl) === null || h === void 0 ? void 0 : h.DateTimeFormat;
          if (w) {
            const U = new w().resolvedOptions().timeZone;
            if (U) return U;
          }
          const C = -Mt();
          return `UTC${C >= 0 ? '+' : ''}${C}`;
        }
        function Mt() {
          const h = new Date().getFullYear();
          return Math.max(
            m(new Date(h, 0, 1).getTimezoneOffset()),
            m(new Date(h, 6, 1).getTimezoneOffset()),
          );
        }
        function Ot() {
          try {
            return !!window.sessionStorage;
          } catch {
            return !0;
          }
        }
        function st() {
          try {
            return !!window.localStorage;
          } catch {
            return !0;
          }
        }
        function Z() {
          if (!(X() || re()))
            try {
              return !!window.indexedDB;
            } catch {
              return !0;
            }
        }
        function de() {
          return !!window.openDatabase;
        }
        function ue() {
          return navigator.cpuClass;
        }
        function Te() {
          const { platform: h } = navigator;
          return h === 'MacIntel' && se() && !Ae() ? (je() ? 'iPad' : 'iPhone') : h;
        }
        function pe() {
          return navigator.vendor || '';
        }
        function Me() {
          const h = [];
          for (const w of [
            'chrome',
            'safari',
            '__crWeb',
            '__gCrWeb',
            'yandex',
            '__yb',
            '__ybro',
            '__firefox__',
            '__edgeTrackingPreventionStatistics',
            'webkit',
            'oprt',
            'samsungAr',
            'ucweb',
            'UCShellJava',
            'puffinDevice',
          ]) {
            const C = window[w];
            C && typeof C == 'object' && h.push(w);
          }
          return h.sort();
        }
        function ge() {
          const h = document;
          try {
            h.cookie = 'cookietest=1; SameSite=Strict;';
            const w = h.cookie.indexOf('cookietest=') !== -1;
            return (
              (h.cookie = 'cookietest=1; SameSite=Strict; expires=Thu, 01-Jan-1970 00:00:01 GMT'),
              w
            );
          } catch {
            return !1;
          }
        }
        function Le() {
          const h = atob;
          return {
            abpIndo: [
              '#Iklan-Melayang',
              '#Kolom-Iklan-728',
              '#SidebarIklan-wrapper',
              '[title="ALIENBOLA" i]',
              h('I0JveC1CYW5uZXItYWRz'),
            ],
            abpvn: [
              '.quangcao',
              '#mobileCatfish',
              h('LmNsb3NlLWFkcw=='),
              '[id^="bn_bottom_fixed_"]',
              '#pmadv',
            ],
            adBlockFinland: [
              '.mainostila',
              h('LnNwb25zb3JpdA=='),
              '.ylamainos',
              h('YVtocmVmKj0iL2NsaWNrdGhyZ2guYXNwPyJd'),
              h('YVtocmVmXj0iaHR0cHM6Ly9hcHAucmVhZHBlYWsuY29tL2FkcyJd'),
            ],
            adBlockPersian: [
              '#navbar_notice_50',
              '.kadr',
              'TABLE[width="140px"]',
              '#divAgahi',
              h('YVtocmVmXj0iaHR0cDovL2cxLnYuZndtcm0ubmV0L2FkLyJd'),
            ],
            adBlockWarningRemoval: [
              '#adblock-honeypot',
              '.adblocker-root',
              '.wp_adblock_detect',
              h('LmhlYWRlci1ibG9ja2VkLWFk'),
              h('I2FkX2Jsb2NrZXI='),
            ],
            adGuardAnnoyances: [
              '.hs-sosyal',
              '#cookieconsentdiv',
              'div[class^="app_gdpr"]',
              '.as-oil',
              '[data-cypress="soft-push-notification-modal"]',
            ],
            adGuardBase: [
              '.BetterJsPopOverlay',
              h('I2FkXzMwMFgyNTA='),
              h('I2Jhbm5lcmZsb2F0MjI='),
              h('I2NhbXBhaWduLWJhbm5lcg=='),
              h('I0FkLUNvbnRlbnQ='),
            ],
            adGuardChinese: [
              h('LlppX2FkX2FfSA=='),
              h('YVtocmVmKj0iLmh0aGJldDM0LmNvbSJd'),
              '#widget-quan',
              h('YVtocmVmKj0iLzg0OTkyMDIwLnh5eiJd'),
              h('YVtocmVmKj0iLjE5NTZobC5jb20vIl0='),
            ],
            adGuardFrench: [
              '#pavePub',
              h('LmFkLWRlc2t0b3AtcmVjdGFuZ2xl'),
              '.mobile_adhesion',
              '.widgetadv',
              h('LmFkc19iYW4='),
            ],
            adGuardGerman: ['aside[data-portal-id="leaderboard"]'],
            adGuardJapanese: [
              '#kauli_yad_1',
              h('YVtocmVmXj0iaHR0cDovL2FkMi50cmFmZmljZ2F0ZS5uZXQvIl0='),
              h('Ll9wb3BJbl9pbmZpbml0ZV9hZA=='),
              h('LmFkZ29vZ2xl'),
              h('Ll9faXNib29zdFJldHVybkFk'),
            ],
            adGuardMobile: [
              h('YW1wLWF1dG8tYWRz'),
              h('LmFtcF9hZA=='),
              'amp-embed[type="24smi"]',
              '#mgid_iframe1',
              h('I2FkX2ludmlld19hcmVh'),
            ],
            adGuardRussian: [
              h('YVtocmVmXj0iaHR0cHM6Ly9hZC5sZXRtZWFkcy5jb20vIl0='),
              h('LnJlY2xhbWE='),
              'div[id^="smi2adblock"]',
              h('ZGl2W2lkXj0iQWRGb3hfYmFubmVyXyJd'),
              '#psyduckpockeball',
            ],
            adGuardSocial: [
              h('YVtocmVmXj0iLy93d3cuc3R1bWJsZXVwb24uY29tL3N1Ym1pdD91cmw9Il0='),
              h('YVtocmVmXj0iLy90ZWxlZ3JhbS5tZS9zaGFyZS91cmw/Il0='),
              '.etsy-tweet',
              '#inlineShare',
              '.popup-social',
            ],
            adGuardSpanishPortuguese: [
              '#barraPublicidade',
              '#Publicidade',
              '#publiEspecial',
              '#queTooltip',
              '.cnt-publi',
            ],
            adGuardTrackingProtection: [
              '#qoo-counter',
              h('YVtocmVmXj0iaHR0cDovL2NsaWNrLmhvdGxvZy5ydS8iXQ=='),
              h('YVtocmVmXj0iaHR0cDovL2hpdGNvdW50ZXIucnUvdG9wL3N0YXQucGhwIl0='),
              h('YVtocmVmXj0iaHR0cDovL3RvcC5tYWlsLnJ1L2p1bXAiXQ=='),
              '#top100counter',
            ],
            adGuardTurkish: [
              '#backkapat',
              h('I3Jla2xhbWk='),
              h('YVtocmVmXj0iaHR0cDovL2Fkc2Vydi5vbnRlay5jb20udHIvIl0='),
              h('YVtocmVmXj0iaHR0cDovL2l6bGVuemkuY29tL2NhbXBhaWduLyJd'),
              h('YVtocmVmXj0iaHR0cDovL3d3dy5pbnN0YWxsYWRzLm5ldC8iXQ=='),
            ],
            bulgarian: [
              h('dGQjZnJlZW5ldF90YWJsZV9hZHM='),
              '#ea_intext_div',
              '.lapni-pop-over',
              '#xenium_hot_offers',
            ],
            easyList: [
              '.yb-floorad',
              h('LndpZGdldF9wb19hZHNfd2lkZ2V0'),
              h('LnRyYWZmaWNqdW5reS1hZA=='),
              '.textad_headline',
              h('LnNwb25zb3JlZC10ZXh0LWxpbmtz'),
            ],
            easyListChina: [
              h('LmFwcGd1aWRlLXdyYXBbb25jbGljayo9ImJjZWJvcy5jb20iXQ=='),
              h('LmZyb250cGFnZUFkdk0='),
              '#taotaole',
              '#aafoot.top_box',
              '.cfa_popup',
            ],
            easyListCookie: [
              '.ezmob-footer',
              '.cc-CookieWarning',
              '[data-cookie-number]',
              h('LmF3LWNvb2tpZS1iYW5uZXI='),
              '.sygnal24-gdpr-modal-wrap',
            ],
            easyListCzechSlovak: [
              '#onlajny-stickers',
              h('I3Jla2xhbW5pLWJveA=='),
              h('LnJla2xhbWEtbWVnYWJvYXJk'),
              '.sklik',
              h('W2lkXj0ic2tsaWtSZWtsYW1hIl0='),
            ],
            easyListDutch: [
              h('I2FkdmVydGVudGll'),
              h('I3ZpcEFkbWFya3RCYW5uZXJCbG9jaw=='),
              '.adstekst',
              h('YVtocmVmXj0iaHR0cHM6Ly94bHR1YmUubmwvY2xpY2svIl0='),
              '#semilo-lrectangle',
            ],
            easyListGermany: [
              '#SSpotIMPopSlider',
              h('LnNwb25zb3JsaW5rZ3J1ZW4='),
              h('I3dlcmJ1bmdza3k='),
              h('I3Jla2xhbWUtcmVjaHRzLW1pdHRl'),
              h('YVtocmVmXj0iaHR0cHM6Ly9iZDc0Mi5jb20vIl0='),
            ],
            easyListItaly: [
              h('LmJveF9hZHZfYW5udW5jaQ=='),
              '.sb-box-pubbliredazionale',
              h('YVtocmVmXj0iaHR0cDovL2FmZmlsaWF6aW9uaWFkcy5zbmFpLml0LyJd'),
              h('YVtocmVmXj0iaHR0cHM6Ly9hZHNlcnZlci5odG1sLml0LyJd'),
              h('YVtocmVmXj0iaHR0cHM6Ly9hZmZpbGlhemlvbmlhZHMuc25haS5pdC8iXQ=='),
            ],
            easyListLithuania: [
              h('LnJla2xhbW9zX3RhcnBhcw=='),
              h('LnJla2xhbW9zX251b3JvZG9z'),
              h('aW1nW2FsdD0iUmVrbGFtaW5pcyBza3lkZWxpcyJd'),
              h('aW1nW2FsdD0iRGVkaWt1b3RpLmx0IHNlcnZlcmlhaSJd'),
              h('aW1nW2FsdD0iSG9zdGluZ2FzIFNlcnZlcmlhaS5sdCJd'),
            ],
            estonian: [h('QVtocmVmKj0iaHR0cDovL3BheTRyZXN1bHRzMjQuZXUiXQ==')],
            fanboyAnnoyances: [
              '#ac-lre-player',
              '.navigate-to-top',
              '#subscribe_popup',
              '.newsletter_holder',
              '#back-top',
            ],
            fanboyAntiFacebook: ['.util-bar-module-firefly-visible'],
            fanboyEnhancedTrackers: [
              '.open.pushModal',
              '#issuem-leaky-paywall-articles-zero-remaining-nag',
              '#sovrn_container',
              'div[class$="-hide"][zoompage-fontsize][style="display: block;"]',
              '.BlockNag__Card',
            ],
            fanboySocial: [
              '#FollowUs',
              '#meteored_share',
              '#social_follow',
              '.article-sharer',
              '.community__social-desc',
            ],
            frellwitSwedish: [
              h('YVtocmVmKj0iY2FzaW5vcHJvLnNlIl1bdGFyZ2V0PSJfYmxhbmsiXQ=='),
              h('YVtocmVmKj0iZG9rdG9yLXNlLm9uZWxpbmsubWUiXQ=='),
              'article.category-samarbete',
              h('ZGl2LmhvbGlkQWRz'),
              'ul.adsmodern',
            ],
            greekAdBlock: [
              h('QVtocmVmKj0iYWRtYW4ub3RlbmV0LmdyL2NsaWNrPyJd'),
              h('QVtocmVmKj0iaHR0cDovL2F4aWFiYW5uZXJzLmV4b2R1cy5nci8iXQ=='),
              h('QVtocmVmKj0iaHR0cDovL2ludGVyYWN0aXZlLmZvcnRobmV0LmdyL2NsaWNrPyJd'),
              'DIV.agores300',
              'TABLE.advright',
            ],
            hungarian: [
              '#cemp_doboz',
              '.optimonk-iframe-container',
              h('LmFkX19tYWlu'),
              h('W2NsYXNzKj0iR29vZ2xlQWRzIl0='),
              '#hirdetesek_box',
            ],
            iDontCareAboutCookies: [
              '.alert-info[data-block-track*="CookieNotice"]',
              '.ModuleTemplateCookieIndicator',
              '.o--cookies--container',
              '#cookies-policy-sticky',
              '#stickyCookieBar',
            ],
            icelandicAbp: [h('QVtocmVmXj0iL2ZyYW1ld29yay9yZXNvdXJjZXMvZm9ybXMvYWRzLmFzcHgiXQ==')],
            latvian: [
              h(
                'YVtocmVmPSJodHRwOi8vd3d3LnNhbGlkemluaS5sdi8iXVtzdHlsZT0iZGlzcGxheTogYmxvY2s7IHdpZHRoOiAxMjBweDsgaGVpZ2h0OiA0MHB4OyBvdmVyZmxvdzogaGlkZGVuOyBwb3NpdGlvbjogcmVsYXRpdmU7Il0=',
              ),
              h(
                'YVtocmVmPSJodHRwOi8vd3d3LnNhbGlkemluaS5sdi8iXVtzdHlsZT0iZGlzcGxheTogYmxvY2s7IHdpZHRoOiA4OHB4OyBoZWlnaHQ6IDMxcHg7IG92ZXJmbG93OiBoaWRkZW47IHBvc2l0aW9uOiByZWxhdGl2ZTsiXQ==',
              ),
            ],
            listKr: [
              h('YVtocmVmKj0iLy9hZC5wbGFuYnBsdXMuY28ua3IvIl0='),
              h('I2xpdmVyZUFkV3JhcHBlcg=='),
              h('YVtocmVmKj0iLy9hZHYuaW1hZHJlcC5jby5rci8iXQ=='),
              h('aW5zLmZhc3R2aWV3LWFk'),
              '.revenue_unit_item.dable',
            ],
            listeAr: [
              h('LmdlbWluaUxCMUFk'),
              '.right-and-left-sponsers',
              h('YVtocmVmKj0iLmFmbGFtLmluZm8iXQ=='),
              h('YVtocmVmKj0iYm9vcmFxLm9yZyJd'),
              h('YVtocmVmKj0iZHViaXp6bGUuY29tL2FyLz91dG1fc291cmNlPSJd'),
            ],
            listeFr: [
              h('YVtocmVmXj0iaHR0cDovL3Byb21vLnZhZG9yLmNvbS8iXQ=='),
              h('I2FkY29udGFpbmVyX3JlY2hlcmNoZQ=='),
              h('YVtocmVmKj0id2Vib3JhbWEuZnIvZmNnaS1iaW4vIl0='),
              '.site-pub-interstitiel',
              'div[id^="crt-"][data-criteo-id]',
            ],
            officialPolish: [
              '#ceneo-placeholder-ceneo-12',
              h('W2hyZWZePSJodHRwczovL2FmZi5zZW5kaHViLnBsLyJd'),
              h('YVtocmVmXj0iaHR0cDovL2Fkdm1hbmFnZXIudGVjaGZ1bi5wbC9yZWRpcmVjdC8iXQ=='),
              h('YVtocmVmXj0iaHR0cDovL3d3dy50cml6ZXIucGwvP3V0bV9zb3VyY2UiXQ=='),
              h('ZGl2I3NrYXBpZWNfYWQ='),
            ],
            ro: [
              h('YVtocmVmXj0iLy9hZmZ0cmsuYWx0ZXgucm8vQ291bnRlci9DbGljayJd'),
              h('YVtocmVmXj0iaHR0cHM6Ly9ibGFja2ZyaWRheXNhbGVzLnJvL3Ryay9zaG9wLyJd'),
              h('YVtocmVmXj0iaHR0cHM6Ly9ldmVudC4ycGVyZm9ybWFudC5jb20vZXZlbnRzL2NsaWNrIl0='),
              h('YVtocmVmXj0iaHR0cHM6Ly9sLnByb2ZpdHNoYXJlLnJvLyJd'),
              'a[href^="/url/"]',
            ],
            ruAd: [
              h('YVtocmVmKj0iLy9mZWJyYXJlLnJ1LyJd'),
              h('YVtocmVmKj0iLy91dGltZy5ydS8iXQ=='),
              h('YVtocmVmKj0iOi8vY2hpa2lkaWtpLnJ1Il0='),
              '#pgeldiz',
              '.yandex-rtb-block',
            ],
            thaiAds: [
              'a[href*=macau-uta-popup]',
              h('I2Fkcy1nb29nbGUtbWlkZGxlX3JlY3RhbmdsZS1ncm91cA=='),
              h('LmFkczMwMHM='),
              '.bumq',
              '.img-kosana',
            ],
            webAnnoyancesUltralist: [
              '#mod-social-share-2',
              '#social-tools',
              h('LmN0cGwtZnVsbGJhbm5lcg=='),
              '.zergnet-recommend',
              '.yt.btn-link.btn-md.btn',
            ],
          };
        }
        async function Ee({ debug: h } = {}) {
          if (!Pe()) return;
          const w = Le(),
            C = Object.keys(w),
            U = [].concat(...C.map((q) => w[q])),
            K = await ot(U);
          h && mt(w, K);
          const ie = C.filter((q) => {
            const Q = w[q];
            return I(Q.map((xe) => K[xe])) > Q.length * 0.6;
          });
          return (ie.sort(), ie);
        }
        function Pe() {
          return se() || We();
        }
        async function ot(h) {
          var w;
          const C = document,
            U = C.createElement('div'),
            K = new Array(h.length),
            ie = {};
          ct(U);
          for (let q = 0; q < h.length; ++q) {
            const Q = b(h[q]);
            Q.tagName === 'DIALOG' && Q.show();
            const oe = C.createElement('div');
            (ct(oe), oe.appendChild(Q), U.appendChild(oe), (K[q] = Q));
          }
          for (; !C.body; ) await i(50);
          C.body.appendChild(U);
          try {
            for (let q = 0; q < h.length; ++q) K[q].offsetParent || (ie[h[q]] = !0);
          } finally {
            (w = U.parentNode) === null || w === void 0 || w.removeChild(U);
          }
          return ie;
        }
        function ct(h) {
          (h.style.setProperty('visibility', 'hidden', 'important'),
            h.style.setProperty('display', 'block', 'important'));
        }
        function mt(h, w) {
          let C = 'DOM blockers debug:\n```';
          for (const U of Object.keys(h)) {
            C += `
${U}:`;
            for (const K of h[U])
              C += `
  ${w[K] ? '\u{1F6AB}' : '\u27A1\uFE0F'} ${K}`;
          }
          console.log(`${C}
\`\`\``);
        }
        function yt() {
          for (const h of ['rec2020', 'p3', 'srgb'])
            if (matchMedia(`(color-gamut: ${h})`).matches) return h;
        }
        function Dt() {
          if (Et('inverted')) return !0;
          if (Et('none')) return !1;
        }
        function Et(h) {
          return matchMedia(`(inverted-colors: ${h})`).matches;
        }
        function At() {
          if (Rt('active')) return !0;
          if (Rt('none')) return !1;
        }
        function Rt(h) {
          return matchMedia(`(forced-colors: ${h})`).matches;
        }
        const pt = 100;
        function kt() {
          if (matchMedia('(min-monochrome: 0)').matches) {
            for (let h = 0; h <= pt; ++h)
              if (matchMedia(`(max-monochrome: ${h})`).matches) return h;
            throw new Error('Too high value');
          }
        }
        function $t() {
          if (St('no-preference')) return 0;
          if (St('high') || St('more')) return 1;
          if (St('low') || St('less')) return -1;
          if (St('forced')) return 10;
        }
        function St(h) {
          return matchMedia(`(prefers-contrast: ${h})`).matches;
        }
        function Qt() {
          if (Ht('reduce')) return !0;
          if (Ht('no-preference')) return !1;
        }
        function Ht(h) {
          return matchMedia(`(prefers-reduced-motion: ${h})`).matches;
        }
        function en() {
          if (Vt('reduce')) return !0;
          if (Vt('no-preference')) return !1;
        }
        function Vt(h) {
          return matchMedia(`(prefers-reduced-transparency: ${h})`).matches;
        }
        function tn() {
          if (Gt('high')) return !0;
          if (Gt('standard')) return !1;
        }
        function Gt(h) {
          return matchMedia(`(dynamic-range: ${h})`).matches;
        }
        const Ce = Math,
          Xe = () => 0;
        function nn() {
          const h = Ce.acos || Xe,
            w = Ce.acosh || Xe,
            C = Ce.asin || Xe,
            U = Ce.asinh || Xe,
            K = Ce.atanh || Xe,
            ie = Ce.atan || Xe,
            q = Ce.sin || Xe,
            Q = Ce.sinh || Xe,
            oe = Ce.cos || Xe,
            xe = Ce.cosh || Xe,
            J = Ce.tan || Xe,
            z = Ce.tanh || Xe,
            De = Ce.exp || Xe,
            we = Ce.expm1 || Xe,
            ke = Ce.log1p || Xe,
            Ye = (Ue) => Ce.pow(Ce.PI, Ue),
            Lt = (Ue) => Ce.log(Ue + Ce.sqrt(Ue * Ue - 1)),
            Nn = (Ue) => Ce.log(Ue + Ce.sqrt(Ue * Ue + 1)),
            Fn = (Ue) => Ce.log((1 + Ue) / (1 - Ue)) / 2,
            Pn = (Ue) => Ce.exp(Ue) - 1 / Ce.exp(Ue) / 2,
            Bn = (Ue) => (Ce.exp(Ue) + 1 / Ce.exp(Ue)) / 2,
            Hn = (Ue) => Ce.exp(Ue) - 1,
            Vn = (Ue) => (Ce.exp(2 * Ue) - 1) / (Ce.exp(2 * Ue) + 1),
            Gn = (Ue) => Ce.log(1 + Ue);
          return {
            acos: h(0.12312423423423424),
            acosh: w(1e308),
            acoshPf: Lt(1e154),
            asin: C(0.12312423423423424),
            asinh: U(1),
            asinhPf: Nn(1),
            atanh: K(0.5),
            atanhPf: Fn(0.5),
            atan: ie(0.5),
            sin: q(-1e300),
            sinh: Q(1),
            sinhPf: Pn(1),
            cos: oe(10.000000000123),
            cosh: xe(1),
            coshPf: Bn(1),
            tan: J(-1e300),
            tanh: z(1),
            tanhPf: Vn(1),
            exp: De(1),
            expm1: we(1),
            expm1Pf: Hn(1),
            log1p: ke(10),
            log1pPf: Gn(10),
            powPI: Ye(-100),
          };
        }
        const rn = 'mmMwWLliI0fiflO&1',
          Nt = {
            default: [],
            apple: [{ font: '-apple-system-body' }],
            serif: [{ fontFamily: 'serif' }],
            sans: [{ fontFamily: 'sans-serif' }],
            mono: [{ fontFamily: 'monospace' }],
            min: [{ fontSize: '1px' }],
            system: [{ fontFamily: 'system-ui' }],
          };
        function an() {
          return sn((h, w) => {
            const C = {},
              U = {};
            for (const K of Object.keys(Nt)) {
              const [ie = {}, q = rn] = Nt[K],
                Q = h.createElement('span');
              ((Q.textContent = q), (Q.style.whiteSpace = 'nowrap'));
              for (const oe of Object.keys(ie)) {
                const xe = ie[oe];
                xe !== void 0 && (Q.style[oe] = xe);
              }
              ((C[K] = Q), w.append(h.createElement('br'), Q));
            }
            for (const K of Object.keys(Nt)) U[K] = C[K].getBoundingClientRect().width;
            return U;
          });
        }
        function sn(h, w = 4e3) {
          return Ke((C, U) => {
            const K = U.document,
              ie = K.body,
              q = ie.style;
            ((q.width = `${w}px`),
              (q.webkitTextSizeAdjust = q.textSizeAdjust = 'none'),
              ae()
                ? (ie.style.zoom = `${1 / U.devicePixelRatio}`)
                : se() && (ie.style.zoom = 'reset'));
            const Q = K.createElement('div');
            return (
              (Q.textContent = [...Array((w / 20) << 0)].map(() => 'word').join(' ')),
              ie.appendChild(Q),
              h(K, ie)
            );
          }, '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">');
        }
        function on() {
          return navigator.pdfViewerEnabled;
        }
        function cn() {
          const h = new Float32Array(1),
            w = new Uint8Array(h.buffer);
          return ((h[0] = 1 / 0), (h[0] = h[0] - h[0]), w[3]);
        }
        function ln() {
          const { ApplePaySession: h } = window;
          if (typeof (h == null ? void 0 : h.canMakePayments) != 'function') return -1;
          if (dn()) return -3;
          try {
            return h.canMakePayments() ? 1 : 0;
          } catch (w) {
            return un(w);
          }
        }
        const dn = j;
        function un(h) {
          if (
            h instanceof Error &&
            h.name === 'InvalidAccessError' &&
            /\bfrom\b.*\binsecure\b/i.test(h.message)
          )
            return -2;
          throw h;
        }
        function hn() {
          var h;
          const w = document.createElement('a'),
            C = (h = w.attributionSourceId) !== null && h !== void 0 ? h : w.attributionsourceid;
          return C === void 0 ? void 0 : String(C);
        }
        const Wt = -1,
          zt = -2,
          xn = new Set([
            10752, 2849, 2884, 2885, 2886, 2928, 2929, 2930, 2931, 2932, 2960, 2961, 2962, 2963,
            2964, 2965, 2966, 2967, 2968, 2978, 3024, 3042, 3088, 3089, 3106, 3107, 32773, 32777,
            32777, 32823, 32824, 32936, 32937, 32938, 32939, 32968, 32969, 32970, 32971, 3317,
            33170, 3333, 3379, 3386, 33901, 33902, 34016, 34024, 34076, 3408, 3410, 3411, 3412,
            3413, 3414, 3415, 34467, 34816, 34817, 34818, 34819, 34877, 34921, 34930, 35660, 35661,
            35724, 35738, 35739, 36003, 36004, 36005, 36347, 36348, 36349, 37440, 37441, 37443,
            7936, 7937, 7938,
          ]),
          fn = new Set([34047, 35723, 36063, 34852, 34853, 34854, 34229, 36392, 36795, 38449]),
          gn = ['FRAGMENT_SHADER', 'VERTEX_SHADER'],
          mn = ['LOW_FLOAT', 'MEDIUM_FLOAT', 'HIGH_FLOAT', 'LOW_INT', 'MEDIUM_INT', 'HIGH_INT'],
          Kt = 'WEBGL_debug_renderer_info',
          pn = 'WEBGL_polygon_mode';
        function _n({ cache: h }) {
          var w, C, U, K, ie, q;
          const Q = Ft(h);
          if (!Q) return Wt;
          if (!jt(Q)) return zt;
          const oe = Xt() ? null : Q.getExtension(Kt);
          return {
            version:
              ((w = Q.getParameter(Q.VERSION)) === null || w === void 0 ? void 0 : w.toString()) ||
              '',
            vendor:
              ((C = Q.getParameter(Q.VENDOR)) === null || C === void 0 ? void 0 : C.toString()) ||
              '',
            vendorUnmasked: oe
              ? (U = Q.getParameter(oe.UNMASKED_VENDOR_WEBGL)) === null || U === void 0
                ? void 0
                : U.toString()
              : '',
            renderer:
              ((K = Q.getParameter(Q.RENDERER)) === null || K === void 0 ? void 0 : K.toString()) ||
              '',
            rendererUnmasked: oe
              ? (ie = Q.getParameter(oe.UNMASKED_RENDERER_WEBGL)) === null || ie === void 0
                ? void 0
                : ie.toString()
              : '',
            shadingLanguageVersion:
              ((q = Q.getParameter(Q.SHADING_LANGUAGE_VERSION)) === null || q === void 0
                ? void 0
                : q.toString()) || '',
          };
        }
        function bn({ cache: h }) {
          const w = Ft(h);
          if (!w) return Wt;
          if (!jt(w)) return zt;
          const C = w.getSupportedExtensions(),
            U = w.getContextAttributes(),
            K = [],
            ie = [],
            q = [],
            Q = [],
            oe = [];
          if (U) for (const J of Object.keys(U)) ie.push(`${J}=${U[J]}`);
          const xe = Yt(w);
          for (const J of xe) {
            const z = w[J];
            q.push(`${J}=${z}${xn.has(z) ? `=${w.getParameter(z)}` : ''}`);
          }
          if (C)
            for (const J of C) {
              if ((J === Kt && Xt()) || (J === pn && yn())) continue;
              const z = w.getExtension(J);
              if (!z) {
                K.push(J);
                continue;
              }
              for (const De of Yt(z)) {
                const we = z[De];
                Q.push(`${De}=${we}${fn.has(we) ? `=${w.getParameter(we)}` : ''}`);
              }
            }
          for (const J of gn)
            for (const z of mn) {
              const De = vn(w, J, z);
              oe.push(`${J}.${z}=${De.join(',')}`);
            }
          return (
            Q.sort(),
            q.sort(),
            {
              contextAttributes: ie,
              parameters: q,
              shaderPrecisions: oe,
              extensions: C,
              extensionParameters: Q,
              unsupportedExtensions: K,
            }
          );
        }
        function Ft(h) {
          if (h.webgl) return h.webgl.context;
          const w = document.createElement('canvas');
          let C;
          w.addEventListener('webglCreateContextError', () => (C = void 0));
          for (const U of ['webgl', 'experimental-webgl']) {
            try {
              C = w.getContext(U);
            } catch {}
            if (C) break;
          }
          return ((h.webgl = { context: C }), C);
        }
        function vn(h, w, C) {
          const U = h.getShaderPrecisionFormat(h[w], h[C]);
          return U ? [U.rangeMin, U.rangeMax, U.precision] : [];
        }
        function Yt(h) {
          return Object.keys(h.__proto__).filter(wn);
        }
        function wn(h) {
          return typeof h == 'string' && !h.match(/[^A-Z0-9_x]/);
        }
        function Xt() {
          return Fe();
        }
        function yn() {
          return ae() || se();
        }
        function jt(h) {
          return typeof h.getParameter == 'function';
        }
        function En() {
          if (!(We() || se())) return -2;
          if (!window.AudioContext) return -1;
          const w = new AudioContext().baseLatency;
          return w == null ? -1 : isFinite(w) ? w : -3;
        }
        function Sn() {
          if (!window.Intl) return -1;
          const h = window.Intl.DateTimeFormat;
          if (!h) return -2;
          const w = h().resolvedOptions().locale;
          return !w && w !== '' ? -3 : w;
        }
        const Jt = {
          fonts: Se,
          domBlockers: Ee,
          fontPreferences: an,
          audio: _e,
          screenFrame: Ct,
          canvas: F,
          osCpu: ut,
          languages: ht,
          colorDepth: nt,
          deviceMemory: It,
          screenResolution: it,
          hardwareConcurrency: wt,
          timezone: Ut,
          sessionStorage: Ot,
          localStorage: st,
          indexedDB: Z,
          openDatabase: de,
          cpuClass: ue,
          platform: Te,
          plugins: u,
          touchSupport: ft,
          vendor: pe,
          vendorFlavors: Me,
          cookiesEnabled: ge,
          colorGamut: yt,
          invertedColors: Dt,
          forcedColors: At,
          monochrome: kt,
          contrast: $t,
          reducedMotion: Qt,
          reducedTransparency: en,
          hdr: tn,
          math: nn,
          pdfViewerEnabled: on,
          architecture: cn,
          applePay: ln,
          privateClickMeasurement: hn,
          audioBaseLatency: En,
          dateTimeLocale: Sn,
          webGlBasics: _n,
          webGlExtensions: bn,
        };
        function In(h) {
          return Ne(Jt, h, []);
        }
        const Tn = '$ if upgrade to Pro: https://fpjs.dev/pro';
        function An(h) {
          const w = Ln(h),
            C = Cn(w);
          return { score: w, comment: Tn.replace(/\$/g, `${C}`) };
        }
        function Ln(h) {
          if (We()) return 0.4;
          if (se()) return Ae() && !(He() && Ie()) ? 0.5 : 0.3;
          const w = 'value' in h.platform ? h.platform.value : '';
          return /^Win/.test(w) ? 0.6 : /^Mac/.test(w) ? 0.5 : 0.7;
        }
        function Cn(h) {
          return g(0.99 + 0.01 * h, 1e-4);
        }
        function Mn(h) {
          let w = '';
          for (const C of Object.keys(h).sort()) {
            const U = h[C],
              K = 'error' in U ? 'error' : JSON.stringify(U.value);
            w += `${w ? '|' : ''}${C.replace(/([:|\\])/g, '\\$1')}:${K}`;
          }
          return w;
        }
        function Pt(h) {
          return JSON.stringify(h, (w, C) => (C instanceof Error ? he(C) : C), 2);
        }
        function Bt(h) {
          return ne(Mn(h));
        }
        function On(h) {
          let w;
          const C = An(h);
          return {
            get visitorId() {
              return (w === void 0 && (w = Bt(this.components)), w);
            },
            set visitorId(U) {
              w = U;
            },
            confidence: C,
            components: h,
            version: E,
          };
        }
        function qt(h = 50) {
          return a(h, h * 2);
        }
        function Dn(h, w) {
          const C = Date.now();
          return {
            async get(U) {
              const K = Date.now(),
                ie = await h(),
                q = On(ie);
              return (
                (w || (U != null && U.debug)) &&
                  console.log(`Copy the text below to get the debug data:

\`\`\`
version: ${q.version}
userAgent: ${navigator.userAgent}
timeBetweenLoadAndGet: ${K - C}
visitorId: ${q.visitorId}
components: ${Pt(ie)}
\`\`\``),
                q
              );
            },
          };
        }
        function Rn() {
          if (!(window.__fpjs_d_m || Math.random() >= 0.001))
            try {
              const h = new XMLHttpRequest();
              (h.open('get', `https://m1.openfpcdn.io/fingerprintjs/v${E}/npm-monitoring`, !0),
                h.send());
            } catch (h) {
              console.error(h);
            }
        }
        async function Zt(h = {}) {
          var w;
          (!((w = h.monitoring) !== null && w !== void 0) || w) && Rn();
          const { delayFallback: C, debug: U } = h;
          await qt(C);
          const K = In({ cache: {}, debug: U });
          return Dn(K, U);
        }
        var Un = { load: Zt, hashComponents: Bt, componentsToDebugString: Pt };
        const kn = ne;
        return (
          (f.componentsToDebugString = Pt),
          (f.default = Un),
          (f.getFullscreenElement = dt),
          (f.getUnstableAudioFingerprint = Be),
          (f.getUnstableCanvasFingerprint = H),
          (f.getUnstableScreenFrame = at),
          (f.getUnstableScreenResolution = _t),
          (f.getWebGLContext = Ft),
          (f.hashComponents = Bt),
          (f.isAndroid = We),
          (f.isChromium = ae),
          (f.isDesktopWebKit = Ae),
          (f.isEdgeHTML = re),
          (f.isGecko = Fe),
          (f.isSamsungInternet = Ze),
          (f.isTrident = X),
          (f.isWebKit = se),
          (f.load = Zt),
          (f.loadSources = Ne),
          (f.murmurX64Hash128 = kn),
          (f.prepareForSources = qt),
          (f.sources = Jt),
          (f.transformSource = P),
          (f.withIframe = Ke),
          Object.defineProperty(f, '__esModule', { value: !0 }),
          f
        );
      })({});
    })(_POSignalsEntities || (_POSignalsEntities = {})),
    (function (l) {
      l.BroprintJS = (function (f) {
        'use strict';
        const E = function (t, n = 0) {
            let e = 3735928559 ^ n,
              o = 1103547991 ^ n;
            for (let s = 0, x; s < t.length; s++)
              ((x = t.charCodeAt(s)),
                (e = Math.imul(e ^ x, 2654435761)),
                (o = Math.imul(o ^ x, 1597334677)));
            return (
              (e = Math.imul(e ^ (e >>> 16), 2246822507) ^ Math.imul(o ^ (o >>> 13), 3266489909)),
              (o = Math.imul(o ^ (o >>> 16), 2246822507) ^ Math.imul(e ^ (e >>> 13), 3266489909)),
              4294967296 * (2097151 & o) + (e >>> 0)
            );
          },
          i = () => {
            const t = document.createElement('canvas');
            return !!(t.getContext && t.getContext('2d'));
          },
          r = () => {
            if (!i()) return 'canvas not supported';
            var t = document.createElement('canvas'),
              n = t.getContext('2d'),
              e = 'BroPrint.65@345876';
            return (
              (n.textBaseline = 'top'),
              (n.font = "14px 'Arial'"),
              (n.textBaseline = 'alphabetic'),
              (n.fillStyle = '#f60'),
              n.fillRect(125, 1, 62, 20),
              (n.fillStyle = '#069'),
              n.fillText(e, 2, 15),
              (n.fillStyle = 'rgba(102, 204, 0, 0.7)'),
              n.fillText(e, 4, 17),
              t.toDataURL()
            );
          },
          a = (function () {
            let t = null,
              n = null,
              e = null,
              o = null,
              s = null,
              x = null;
            function m(_, L = !1) {
              x = _;
              try {
                (p(),
                  e.connect(o),
                  o.connect(t.destination),
                  e.start(0),
                  t.startRendering(),
                  (t.oncomplete = S));
              } catch (y) {
                if (L) throw y;
              }
            }
            function p() {
              (I(), (n = t.currentTime), g(), v());
            }
            function I() {
              let _ = window.OfflineAudioContext || window.webkitOfflineAudioContext;
              t = new _(1, 44100, 44100);
            }
            function g() {
              ((e = t.createOscillator()),
                (e.type = 'triangle'),
                e.frequency.setValueAtTime(1e4, n));
            }
            function v() {
              ((o = t.createDynamicsCompressor()),
                A('threshold', -50),
                A('knee', 40),
                A('ratio', 12),
                A('reduction', -20),
                A('attack', 0),
                A('release', 0.25));
            }
            function A(_, L) {
              o[_] !== void 0 &&
                typeof o[_].setValueAtTime == 'function' &&
                o[_].setValueAtTime(L, t.currentTime);
            }
            function S(_) {
              (d(_), o.disconnect());
            }
            function d(_) {
              let L = null;
              for (var y = 4500; 5e3 > y; y++) {
                var O = _.renderedBuffer.getChannelData(0)[y];
                L += Math.abs(O);
              }
              if (((s = L.toString()), typeof x == 'function')) return x(s);
            }
            return { run: m };
          })();
        function c() {
          const t = new Promise((n, e) => {
            a.run(function (o) {
              n(o);
            });
          });
          return new Promise((n, e) => {
            t.then(async (o) => {
              let s = '';
              (navigator.brave && (await navigator.brave.isBrave()),
                (s = window.btoa(o) + r()),
                n(E(s, 0)));
            }).catch(() => {
              try {
                n(E(r()).toString());
              } catch {
                e('Failed to generate the finger print of this browser');
              }
            });
          });
        }
        return (
          (f.getCurrentBrowserFingerPrint = c),
          Object.defineProperty(f, '__esModule', { value: !0 }),
          f
        );
      })({});
    })(_POSignalsEntities || (_POSignalsEntities = {})),
    (function (l, f) {
      f(l);
    })(_POSignalsEntities || (_POSignalsEntities = {}), function (l) {
      'use strict';
      var f,
        E,
        i = function (O, M) {
          var R = typeof Symbol == 'function' && O[Symbol.iterator];
          if (!R) return O;
          var k,
            B,
            D = R.call(O),
            G = [];
          try {
            for (; (M === void 0 || M-- > 0) && !(k = D.next()).done; ) G.push(k.value);
          } catch (N) {
            B = { error: N };
          } finally {
            try {
              k && !k.done && (R = D.return) && R.call(D);
            } finally {
              if (B) throw B.error;
            }
          }
          return G;
        },
        r = function (O, M, R) {
          if (R || arguments.length === 2)
            for (var k, B = 0, D = M.length; B < D; B++)
              (!k && B in M) || (k || (k = Array.prototype.slice.call(M, 0, B)), (k[B] = M[B]));
          return O.concat(k || Array.prototype.slice.call(M));
        },
        a = new WeakMap(),
        c = new WeakMap(),
        t = new WeakMap(),
        n = new WeakMap(),
        e = new WeakMap(),
        o = {
          get: function (O, M, R) {
            if (O instanceof IDBTransaction) {
              if (M === 'done') return c.get(O);
              if (M === 'objectStoreNames') return O.objectStoreNames || t.get(O);
              if (M === 'store')
                return R.objectStoreNames[1] ? void 0 : R.objectStore(R.objectStoreNames[0]);
            }
            return m(O[M]);
          },
          set: function (O, M, R) {
            return ((O[M] = R), !0);
          },
          has: function (O, M) {
            return (O instanceof IDBTransaction && (M === 'done' || M === 'store')) || M in O;
          },
        };
      function s(O) {
        return O !== IDBDatabase.prototype.transaction ||
          'objectStoreNames' in IDBTransaction.prototype
          ? (
              E ||
              (E = [
                IDBCursor.prototype.advance,
                IDBCursor.prototype.continue,
                IDBCursor.prototype.continuePrimaryKey,
              ])
            ).includes(O)
            ? function () {
                for (var M = [], R = 0; R < arguments.length; R++) M[R] = arguments[R];
                return (O.apply(p(this), M), m(a.get(this)));
              }
            : function () {
                for (var M = [], R = 0; R < arguments.length; R++) M[R] = arguments[R];
                return m(O.apply(p(this), M));
              }
          : function (M) {
              for (var R = [], k = 1; k < arguments.length; k++) R[k - 1] = arguments[k];
              var B = O.call.apply(O, r([p(this), M], i(R), !1));
              return (t.set(B, M.sort ? M.sort() : [M]), m(B));
            };
      }
      function x(O) {
        return typeof O == 'function'
          ? s(O)
          : (O instanceof IDBTransaction &&
              (function (R) {
                if (!c.has(R)) {
                  var k = new Promise(function (B, D) {
                    var G = function () {
                        (R.removeEventListener('complete', N),
                          R.removeEventListener('error', ne),
                          R.removeEventListener('abort', ne));
                      },
                      N = function () {
                        (B(), G());
                      },
                      ne = function () {
                        (D(R.error || new DOMException('AbortError', 'AbortError')), G());
                      };
                    (R.addEventListener('complete', N),
                      R.addEventListener('error', ne),
                      R.addEventListener('abort', ne));
                  });
                  c.set(R, k);
                }
              })(O),
            (M = O),
            (f || (f = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction])).some(
              function (R) {
                return M instanceof R;
              },
            )
              ? new Proxy(O, o)
              : O);
        var M;
      }
      function m(O) {
        if (O instanceof IDBRequest)
          return (
            (M = O),
            (R = new Promise(function (B, D) {
              var G = function () {
                  (M.removeEventListener('success', N), M.removeEventListener('error', ne));
                },
                N = function () {
                  (B(m(M.result)), G());
                },
                ne = function () {
                  (D(M.error), G());
                };
              (M.addEventListener('success', N), M.addEventListener('error', ne));
            }))
              .then(function (B) {
                B instanceof IDBCursor && a.set(B, M);
              })
              .catch(function () {}),
            e.set(R, M),
            R
          );
        var M, R;
        if (n.has(O)) return n.get(O);
        var k = x(O);
        return (k !== O && (n.set(O, k), e.set(k, O)), k);
      }
      var p = function (O) {
          return e.get(O);
        },
        I = function () {
          return (
            (I =
              Object.assign ||
              function (O) {
                for (var M, R = 1, k = arguments.length; R < k; R++)
                  for (var B in (M = arguments[R]))
                    Object.prototype.hasOwnProperty.call(M, B) && (O[B] = M[B]);
                return O;
              }),
            I.apply(this, arguments)
          );
        },
        g = function (O, M, R, k) {
          return new (R || (R = Promise))(function (B, D) {
            function G(he) {
              try {
                ne(k.next(he));
              } catch (Y) {
                D(Y);
              }
            }
            function N(he) {
              try {
                ne(k.throw(he));
              } catch (Y) {
                D(Y);
              }
            }
            function ne(he) {
              var Y;
              he.done
                ? B(he.value)
                : ((Y = he.value),
                  Y instanceof R
                    ? Y
                    : new R(function (ye) {
                        ye(Y);
                      })).then(G, N);
            }
            ne((k = k.apply(O, M || [])).next());
          });
        },
        v = function (O, M) {
          var R,
            k,
            B,
            D,
            G = {
              label: 0,
              sent: function () {
                if (1 & B[0]) throw B[1];
                return B[1];
              },
              trys: [],
              ops: [],
            };
          return (
            (D = { next: N(0), throw: N(1), return: N(2) }),
            typeof Symbol == 'function' &&
              (D[Symbol.iterator] = function () {
                return this;
              }),
            D
          );
          function N(ne) {
            return function (he) {
              return (function (Y) {
                if (R) throw new TypeError('Generator is already executing.');
                for (; G; )
                  try {
                    if (
                      ((R = 1),
                      k &&
                        (B =
                          2 & Y[0]
                            ? k.return
                            : Y[0]
                              ? k.throw || ((B = k.return) && B.call(k), 0)
                              : k.next) &&
                        !(B = B.call(k, Y[1])).done)
                    )
                      return B;
                    switch (((k = 0), B && (Y = [2 & Y[0], B.value]), Y[0])) {
                      case 0:
                      case 1:
                        B = Y;
                        break;
                      case 4:
                        return (G.label++, { value: Y[1], done: !1 });
                      case 5:
                        (G.label++, (k = Y[1]), (Y = [0]));
                        continue;
                      case 7:
                        ((Y = G.ops.pop()), G.trys.pop());
                        continue;
                      default:
                        if (
                          ((B = G.trys),
                          !((B = B.length > 0 && B[B.length - 1]) || (Y[0] !== 6 && Y[0] !== 2)))
                        ) {
                          G = 0;
                          continue;
                        }
                        if (Y[0] === 3 && (!B || (Y[1] > B[0] && Y[1] < B[3]))) {
                          G.label = Y[1];
                          break;
                        }
                        if (Y[0] === 6 && G.label < B[1]) {
                          ((G.label = B[1]), (B = Y));
                          break;
                        }
                        if (B && G.label < B[2]) {
                          ((G.label = B[2]), G.ops.push(Y));
                          break;
                        }
                        (B[2] && G.ops.pop(), G.trys.pop());
                        continue;
                    }
                    Y = M.call(O, G);
                  } catch (ye) {
                    ((Y = [6, ye]), (k = 0));
                  } finally {
                    R = B = 0;
                  }
                if (5 & Y[0]) throw Y[1];
                return { value: Y[0] ? Y[1] : void 0, done: !0 };
              })([ne, he]);
            };
          }
        },
        A = function (O, M) {
          var R = typeof Symbol == 'function' && O[Symbol.iterator];
          if (!R) return O;
          var k,
            B,
            D = R.call(O),
            G = [];
          try {
            for (; (M === void 0 || M-- > 0) && !(k = D.next()).done; ) G.push(k.value);
          } catch (N) {
            B = { error: N };
          } finally {
            try {
              k && !k.done && (R = D.return) && R.call(D);
            } finally {
              if (B) throw B.error;
            }
          }
          return G;
        },
        S = function (O, M, R) {
          if (R || arguments.length === 2)
            for (var k, B = 0, D = M.length; B < D; B++)
              (!k && B in M) || (k || (k = Array.prototype.slice.call(M, 0, B)), (k[B] = M[B]));
          return O.concat(k || Array.prototype.slice.call(M));
        },
        d = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'],
        _ = ['put', 'add', 'delete', 'clear'],
        L = new Map();
      function y(O, M) {
        if (O instanceof IDBDatabase && !(M in O) && typeof M == 'string') {
          if (L.get(M)) return L.get(M);
          var R = M.replace(/FromIndex$/, ''),
            k = M !== R,
            B = _.includes(R);
          if (R in (k ? IDBIndex : IDBObjectStore).prototype && (B || d.includes(R))) {
            var D = function (G) {
              for (var N = [], ne = 1; ne < arguments.length; ne++) N[ne - 1] = arguments[ne];
              return g(this, void 0, void 0, function () {
                var he, Y, ye;
                return v(this, function (be) {
                  switch (be.label) {
                    case 0:
                      return (
                        (he = this.transaction(G, B ? 'readwrite' : 'readonly')),
                        (Y = he.store),
                        k && (Y = Y.index(N.shift())),
                        [4, Promise.all([(ye = Y)[R].apply(ye, S([], A(N), !1)), B && he.done])]
                      );
                    case 1:
                      return [2, be.sent()[0]];
                  }
                });
              });
            };
            return (L.set(M, D), D);
          }
        }
      }
      ((o = (function (O) {
        return I(I({}, O), {
          get: function (M, R, k) {
            return y(M, R) || O.get(M, R, k);
          },
          has: function (M, R) {
            return !!y(M, R) || O.has(M, R);
          },
        });
      })(o)),
        (l.deleteDB = function (O, M) {
          var R = (M === void 0 ? {} : M).blocked,
            k = indexedDB.deleteDatabase(O);
          return (
            R &&
              k.addEventListener('blocked', function (B) {
                return R(B.oldVersion, B);
              }),
            m(k).then(function () {})
          );
        }),
        (l.openDB = function (O, M, R) {
          var k = R === void 0 ? {} : R,
            B = k.blocked,
            D = k.upgrade,
            G = k.blocking,
            N = k.terminated,
            ne = indexedDB.open(O, M),
            he = m(ne);
          return (
            D &&
              ne.addEventListener('upgradeneeded', function (Y) {
                D(m(ne.result), Y.oldVersion, Y.newVersion, m(ne.transaction), Y);
              }),
            B &&
              ne.addEventListener('blocked', function (Y) {
                return B(Y.oldVersion, Y.newVersion, Y);
              }),
            he
              .then(function (Y) {
                (N &&
                  Y.addEventListener('close', function () {
                    return N();
                  }),
                  G &&
                    Y.addEventListener('versionchange', function (ye) {
                      return G(ye.oldVersion, ye.newVersion, ye);
                    }));
              })
              .catch(function () {}),
            he
          );
        }),
        (l.unwrap = p),
        (l.wrap = m));
    }),
    (function () {
      'use strict';
      typeof Object.assign != 'function' &&
        Object.defineProperty(Object, 'assign', {
          value: function (f, E) {
            'use strict';
            if (f == null) throw new TypeError('Cannot convert undefined or null to object');
            for (var i = Object(f), r = 1; r < arguments.length; r++) {
              var a = arguments[r];
              if (a != null)
                for (var c in a) Object.prototype.hasOwnProperty.call(a, c) && (i[c] = a[c]);
            }
            return i;
          },
          writable: !0,
          configurable: !0,
        });
    })(),
    Array.from ||
      (Array.from = (function () {
        var l = Object.prototype.toString,
          f = function (a) {
            return typeof a == 'function' || l.call(a) === '[object Function]';
          },
          E = function (a) {
            var c = Number(a);
            return isNaN(c)
              ? 0
              : c === 0 || !isFinite(c)
                ? c
                : (c > 0 ? 1 : -1) * Math.floor(Math.abs(c));
          },
          i = Math.pow(2, 53) - 1,
          r = function (a) {
            var c = E(a);
            return Math.min(Math.max(c, 0), i);
          };
        return function (c) {
          var t = this,
            n = Object(c);
          if (c == null)
            throw new TypeError('Array.from requires an array-like object - not null or undefined');
          var e = arguments.length > 1 ? arguments[1] : void 0,
            o;
          if (typeof e != 'undefined') {
            if (!f(e))
              throw new TypeError(
                'Array.from: when provided, the second argument must be a function',
              );
            arguments.length > 2 && (o = arguments[2]);
          }
          for (var s = r(n.length), x = f(t) ? Object(new t(s)) : new Array(s), m = 0, p; m < s; )
            ((p = n[m]),
              e ? (x[m] = typeof o == 'undefined' ? e(p, m) : e.call(o, p, m)) : (x[m] = p),
              (m += 1));
          return ((x.length = s), x);
        };
      })()),
    (function () {
      'use strict';
      String.prototype.endsWith ||
        (String.prototype.endsWith = function (l, f) {
          return (
            (f === void 0 || f > this.length) && (f = this.length),
            this.substring(f - l.length, f) === l
          );
        });
    })(),
    (function () {
      'use strict';
      Promise.allSettled =
        Promise.allSettled ||
        function (l) {
          return Promise.all(
            l.map(function (f) {
              return f
                .then(function (E) {
                  return { status: 'fulfilled', value: E };
                })
                .catch(function (E) {
                  return { status: 'rejected', reason: E };
                });
            }),
          );
        };
    })(),
    (function (l, f) {
      'use strict';
      var E = '2.0.2',
        i = 500,
        r = 'user-agent',
        a = '',
        c = '?',
        t = 'function',
        n = 'undefined',
        e = 'object',
        o = 'string',
        s = 'browser',
        x = 'cpu',
        m = 'device',
        p = 'engine',
        I = 'os',
        g = 'result',
        v = 'name',
        A = 'type',
        S = 'vendor',
        d = 'version',
        _ = 'architecture',
        L = 'major',
        y = 'model',
        O = 'console',
        M = 'mobile',
        R = 'tablet',
        k = 'smarttv',
        B = 'wearable',
        D = 'xr',
        G = 'embedded',
        N = 'inapp',
        ne = 'brands',
        he = 'formFactors',
        Y = 'fullVersionList',
        ye = 'platform',
        be = 'platformVersion',
        Ne = 'bitness',
        P = 'sec-ch-ua',
        X = P + '-full-version-list',
        re = P + '-arch',
        ae = P + '-' + Ne,
        se = P + '-form-factors',
        Ae = P + '-' + M,
        Ie = P + '-' + y,
        Fe = P + '-' + ye,
        ze = Fe + '-version',
        Oe = [ne, Y, M, y, ye, be, _, he, Ne],
        Re = 'Amazon',
        He = 'Apple',
        je = 'ASUS',
        dt = 'BlackBerry',
        Je = 'Google',
        We = 'Huawei',
        Ze = 'Lenovo',
        _e = 'Honor',
        Be = 'LG',
        Ve = 'Microsoft',
        Qe = 'Motorola',
        $e = 'Nvidia',
        et = 'OnePlus',
        qe = 'OPPO',
        Ke = 'Samsung',
        b = 'Sharp',
        V = 'Sony',
        j = 'Xiaomi',
        W = 'Zebra',
        $ = 'Chrome',
        ee = 'Chromium',
        me = 'Chromecast',
        Se = 'Edge',
        u = 'Firefox',
        F = 'Opera',
        H = 'Facebook',
        T = 'Sogou',
        te = 'Mobile ',
        ce = ' Browser',
        le = 'Windows',
        fe = typeof window !== n,
        Ge = fe && window.navigator ? window.navigator : f,
        ve = Ge && Ge.userAgentData ? Ge.userAgentData : f,
        tt = function (Z, de) {
          var ue = {},
            Te = de;
          if (!ht(de)) {
            Te = {};
            for (var pe in de)
              for (var Me in de[pe]) Te[Me] = de[pe][Me].concat(Te[Me] ? Te[Me] : []);
          }
          for (var ge in Z)
            ue[ge] = Te[ge] && Te[ge].length % 2 === 0 ? Te[ge].concat(Z[ge]) : Z[ge];
          return ue;
        },
        ft = function (Z) {
          for (var de = {}, ue = 0; ue < Z.length; ue++) de[Z[ue].toUpperCase()] = Z[ue];
          return de;
        },
        ut = function (Z, de) {
          if (typeof Z === e && Z.length > 0) {
            for (var ue in Z) if (it(Z[ue]) == it(de)) return !0;
            return !1;
          }
          return nt(Z) ? it(de).indexOf(it(Z)) !== -1 : !1;
        },
        ht = function (Z, de) {
          for (var ue in Z)
            return /^(browser|cpu|device|engine|os)$/.test(ue) || (de ? ht(Z[ue]) : !1);
        },
        nt = function (Z) {
          return typeof Z === o;
        },
        It = function (Z) {
          if (!Z) return f;
          for (var de = [], ue = gt(/\\?\"/g, Z).split(','), Te = 0; Te < ue.length; Te++)
            if (ue[Te].indexOf(';') > -1) {
              var pe = xt(ue[Te]).split(';v=');
              de[Te] = { brand: pe[0], version: pe[1] };
            } else de[Te] = xt(ue[Te]);
          return de;
        },
        it = function (Z) {
          return nt(Z) ? Z.toLowerCase() : Z;
        },
        _t = function (Z) {
          return nt(Z) ? gt(/[^\d\.]/g, Z).split('.')[0] : f;
        },
        rt = function (Z) {
          for (var de in Z) {
            var ue = Z[de];
            typeof ue == e && ue.length == 2 ? (this[ue[0]] = ue[1]) : (this[ue] = f);
          }
          return this;
        },
        gt = function (Z, de) {
          return nt(de) ? de.replace(Z, a) : de;
        },
        lt = function (Z) {
          return gt(/\\?\"/g, Z);
        },
        xt = function (Z, de) {
          if (nt(Z)) return ((Z = gt(/^\s\s*/, Z)), typeof de === n ? Z : Z.substring(0, i));
        },
        Tt = function (Z, de) {
          if (!(!Z || !de))
            for (var ue = 0, Te, pe, Me, ge, Le, Ee; ue < de.length && !Le; ) {
              var Pe = de[ue],
                ot = de[ue + 1];
              for (Te = pe = 0; Te < Pe.length && !Le && Pe[Te]; )
                if (((Le = Pe[Te++].exec(Z)), Le))
                  for (Me = 0; Me < ot.length; Me++)
                    ((Ee = Le[++pe]),
                      (ge = ot[Me]),
                      typeof ge === e && ge.length > 0
                        ? ge.length === 2
                          ? typeof ge[1] == t
                            ? (this[ge[0]] = ge[1].call(this, Ee))
                            : (this[ge[0]] = ge[1])
                          : ge.length === 3
                            ? typeof ge[1] === t && !(ge[1].exec && ge[1].test)
                              ? (this[ge[0]] = Ee ? ge[1].call(this, Ee, ge[2]) : f)
                              : (this[ge[0]] = Ee ? Ee.replace(ge[1], ge[2]) : f)
                            : ge.length === 4 &&
                              (this[ge[0]] = Ee ? ge[3].call(this, Ee.replace(ge[1], ge[2])) : f)
                        : (this[ge] = Ee || f));
              ue += 2;
            }
        },
        at = function (Z, de) {
          for (var ue in de)
            if (typeof de[ue] === e && de[ue].length > 0) {
              for (var Te = 0; Te < de[ue].length; Te++)
                if (ut(de[ue][Te], Z)) return ue === c ? f : ue;
            } else if (ut(de[ue], Z)) return ue === c ? f : ue;
          return de.hasOwnProperty('*') ? de['*'] : Z;
        },
        Ct = {
          ME: '4.90',
          'NT 3.11': 'NT3.51',
          'NT 4.0': 'NT4.0',
          2e3: 'NT 5.0',
          XP: ['NT 5.1', 'NT 5.2'],
          Vista: 'NT 6.0',
          7: 'NT 6.1',
          8: 'NT 6.2',
          8.1: 'NT 6.3',
          10: ['NT 6.4', 'NT 10.0'],
          RT: 'ARM',
        },
        bt = {
          embedded: 'Automotive',
          mobile: 'Mobile',
          tablet: ['Tablet', 'EInk'],
          smarttv: 'TV',
          wearable: 'Watch',
          xr: ['VR', 'XR'],
          '?': ['Desktop', 'Unknown'],
          '*': f,
        },
        vt = {
          browser: [
            [/\b(?:crmo|crios)\/([\w\.]+)/i],
            [d, [v, te + 'Chrome']],
            [/edg(?:e|ios|a)?\/([\w\.]+)/i],
            [d, [v, 'Edge']],
            [
              /(opera mini)\/([-\w\.]+)/i,
              /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,
              /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i,
            ],
            [v, d],
            [/opios[\/ ]+([\w\.]+)/i],
            [d, [v, F + ' Mini']],
            [/\bop(?:rg)?x\/([\w\.]+)/i],
            [d, [v, F + ' GX']],
            [/\bopr\/([\w\.]+)/i],
            [d, [v, F]],
            [/\bb[a]*d(?:uhd|[ub]*[aekoprswx]{5,6})[\/ ]?([\w\.]+)/i],
            [d, [v, 'Baidu']],
            [/\b(?:mxbrowser|mxios|myie2)\/?([-\w\.]*)\b/i],
            [d, [v, 'Maxthon']],
            [
              /(kindle)\/([\w\.]+)/i,
              /(lunascape|maxthon|netfront|jasmine|blazer|sleipnir)[\/ ]?([\w\.]*)/i,
              /(avant|iemobile|slim(?:browser|boat|jet))[\/ ]?([\d\.]*)/i,
              /(?:ms|\()(ie) ([\w\.]+)/i,
              /(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|duckduckgo|klar|helio|(?=comodo_)?dragon)\/([-\w\.]+)/i,
              /(heytap|ovi|115)browser\/([\d\.]+)/i,
              /(weibo)__([\d\.]+)/i,
            ],
            [v, d],
            [/quark(?:pc)?\/([-\w\.]+)/i],
            [d, [v, 'Quark']],
            [/\bddg\/([\w\.]+)/i],
            [d, [v, 'DuckDuckGo']],
            [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i],
            [d, [v, 'UCBrowser']],
            [
              /microm.+\bqbcore\/([\w\.]+)/i,
              /\bqbcore\/([\w\.]+).+microm/i,
              /micromessenger\/([\w\.]+)/i,
            ],
            [d, [v, 'WeChat']],
            [/konqueror\/([\w\.]+)/i],
            [d, [v, 'Konqueror']],
            [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i],
            [d, [v, 'IE']],
            [/ya(?:search)?browser\/([\w\.]+)/i],
            [d, [v, 'Yandex']],
            [/slbrowser\/([\w\.]+)/i],
            [d, [v, 'Smart ' + Ze + ce]],
            [/(avast|avg)\/([\w\.]+)/i],
            [[v, /(.+)/, '$1 Secure' + ce], d],
            [/\bfocus\/([\w\.]+)/i],
            [d, [v, u + ' Focus']],
            [/\bopt\/([\w\.]+)/i],
            [d, [v, F + ' Touch']],
            [/coc_coc\w+\/([\w\.]+)/i],
            [d, [v, 'Coc Coc']],
            [/dolfin\/([\w\.]+)/i],
            [d, [v, 'Dolphin']],
            [/coast\/([\w\.]+)/i],
            [d, [v, F + ' Coast']],
            [/miuibrowser\/([\w\.]+)/i],
            [d, [v, 'MIUI' + ce]],
            [/fxios\/([\w\.-]+)/i],
            [d, [v, te + u]],
            [/\bqihoobrowser\/?([\w\.]*)/i],
            [d, [v, '360']],
            [/\b(qq)\/([\w\.]+)/i],
            [[v, /(.+)/, '$1Browser'], d],
            [/(oculus|sailfish|huawei|vivo|pico)browser\/([\w\.]+)/i],
            [[v, /(.+)/, '$1' + ce], d],
            [/samsungbrowser\/([\w\.]+)/i],
            [d, [v, Ke + ' Internet']],
            [/metasr[\/ ]?([\d\.]+)/i],
            [d, [v, T + ' Explorer']],
            [/(sogou)mo\w+\/([\d\.]+)/i],
            [[v, T + ' Mobile'], d],
            [
              /(electron)\/([\w\.]+) safari/i,
              /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,
              /m?(qqbrowser|2345(?=browser|chrome|explorer))\w*[\/ ]?v?([\w\.]+)/i,
            ],
            [v, d],
            [/(lbbrowser|rekonq)/i],
            [v],
            [/ome\/([\w\.]+) \w* ?(iron) saf/i, /ome\/([\w\.]+).+qihu (360)[es]e/i],
            [d, v],
            [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i],
            [[v, H], d, [A, N]],
            [
              /(Klarna)\/([\w\.]+)/i,
              /(kakao(?:talk|story))[\/ ]([\w\.]+)/i,
              /(naver)\(.*?(\d+\.[\w\.]+).*\)/i,
              /(daum)apps[\/ ]([\w\.]+)/i,
              /safari (line)\/([\w\.]+)/i,
              /\b(line)\/([\w\.]+)\/iab/i,
              /(alipay)client\/([\w\.]+)/i,
              /(twitter)(?:and| f.+e\/([\w\.]+))/i,
              /(instagram|snapchat)[\/ ]([-\w\.]+)/i,
            ],
            [v, d, [A, N]],
            [/\bgsa\/([\w\.]+) .*safari\//i],
            [d, [v, 'GSA'], [A, N]],
            [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i],
            [d, [v, 'TikTok'], [A, N]],
            [/\[(linkedin)app\]/i],
            [v, [A, N]],
            [/(chromium)[\/ ]([-\w\.]+)/i],
            [v, d],
            [/headlesschrome(?:\/([\w\.]+)| )/i],
            [d, [v, $ + ' Headless']],
            [/ wv\).+(chrome)\/([\w\.]+)/i],
            [[v, $ + ' WebView'], d],
            [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i],
            [d, [v, 'Android' + ce]],
            [/chrome\/([\w\.]+) mobile/i],
            [d, [v, te + 'Chrome']],
            [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i],
            [v, d],
            [/version\/([\w\.\,]+) .*mobile(?:\/\w+ | ?)safari/i],
            [d, [v, te + 'Safari']],
            [/iphone .*mobile(?:\/\w+ | ?)safari/i],
            [[v, te + 'Safari']],
            [/version\/([\w\.\,]+) .*(safari)/i],
            [d, v],
            [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i],
            [v, [d, '1']],
            [/(webkit|khtml)\/([\w\.]+)/i],
            [v, d],
            [/(?:mobile|tablet);.*(firefox)\/([\w\.-]+)/i],
            [[v, te + u], d],
            [/(navigator|netscape\d?)\/([-\w\.]+)/i],
            [[v, 'Netscape'], d],
            [/(wolvic|librewolf)\/([\w\.]+)/i],
            [v, d],
            [/mobile vr; rv:([\w\.]+)\).+firefox/i],
            [d, [v, u + ' Reality']],
            [
              /ekiohf.+(flow)\/([\w\.]+)/i,
              /(swiftfox)/i,
              /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror)[\/ ]?([\w\.\+]+)/i,
              /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
              /(firefox)\/([\w\.]+)/i,
              /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,
              /(amaya|dillo|doris|icab|ladybird|lynx|mosaic|netsurf|obigo|polaris|w3m|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
              /\b(links) \(([\w\.]+)/i,
            ],
            [v, [d, /_/g, '.']],
            [/(cobalt)\/([\w\.]+)/i],
            [v, [d, /[^\d\.]+./, a]],
          ],
          cpu: [
            [/\b((amd|x|x86[-_]?|wow|win)64)\b/i],
            [[_, 'amd64']],
            [/(ia32(?=;))/i, /\b((i[346]|x)86)(pc)?\b/i],
            [[_, 'ia32']],
            [/\b(aarch64|arm(v?[89]e?l?|_?64))\b/i],
            [[_, 'arm64']],
            [/\b(arm(v[67])?ht?n?[fl]p?)\b/i],
            [[_, 'armhf']],
            [/( (ce|mobile); ppc;|\/[\w\.]+arm\b)/i],
            [[_, 'arm']],
            [/((ppc|powerpc)(64)?)( mac|;|\))/i],
            [[_, /ower/, a, it]],
            [/ sun4\w[;\)]/i],
            [[_, 'sparc']],
            [
              /\b(avr32|ia64(?=;)|68k(?=\))|\barm(?=v([1-7]|[5-7]1)l?|;|eabi)|(irix|mips|sparc)(64)?\b|pa-risc)/i,
            ],
            [[_, it]],
          ],
          device: [
            [/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i],
            [y, [S, Ke], [A, R]],
            [
              /\b((?:s[cgp]h|gt|sm)-(?![lr])\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,
              /samsung[- ]((?!sm-[lr])[-\w]+)/i,
              /sec-(sgh\w+)/i,
            ],
            [y, [S, Ke], [A, M]],
            [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i],
            [y, [S, He], [A, M]],
            [
              /\((ipad);[-\w\),; ]+apple/i,
              /applecoremedia\/[\w\.]+ \((ipad)/i,
              /\b(ipad)\d\d?,\d\d?[;\]].+ios/i,
            ],
            [y, [S, He], [A, R]],
            [/(macintosh);/i],
            [y, [S, He]],
            [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i],
            [y, [S, b], [A, M]],
            [
              /\b((?:brt|eln|hey2?|gdi|jdn)-a?[lnw]09|(?:ag[rm]3?|jdn2|kob2)-a?[lw]0[09]hn)(?: bui|\)|;)/i,
            ],
            [y, [S, _e], [A, R]],
            [/honor([-\w ]+)[;\)]/i],
            [y, [S, _e], [A, M]],
            [
              /\b((?:ag[rs][2356]?k?|bah[234]?|bg[2o]|bt[kv]|cmr|cpn|db[ry]2?|jdn2|got|kob2?k?|mon|pce|scm|sht?|[tw]gr|vrd)-[ad]?[lw][0125][09]b?|605hw|bg2-u03|(?:gem|fdr|m2|ple|t1)-[7a]0[1-4][lu]|t1-a2[13][lw]|mediapad[\w\. ]*(?= bui|\)))\b(?!.+d\/s)/i,
            ],
            [y, [S, We], [A, R]],
            [
              /(?:huawei)([-\w ]+)[;\)]/i,
              /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i,
            ],
            [y, [S, We], [A, M]],
            [
              /oid[^\)]+; (2[\dbc]{4}(182|283|rp\w{2})[cgl]|m2105k81a?c)(?: bui|\))/i,
              /\b((?:red)?mi[-_ ]?pad[\w- ]*)(?: bui|\))/i,
            ],
            [
              [y, /_/g, ' '],
              [S, j],
              [A, R],
            ],
            [
              /\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i,
              /\b; (\w+) build\/hm\1/i,
              /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,
              /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,
              /oid[^\)]+; (m?[12][0-389][01]\w{3,6}[c-y])( bui|; wv|\))/i,
              /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite|pro)?)(?: bui|\))/i,
              / ([\w ]+) miui\/v?\d/i,
            ],
            [
              [y, /_/g, ' '],
              [S, j],
              [A, M],
            ],
            [
              /; (\w+) bui.+ oppo/i,
              /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i,
            ],
            [y, [S, qe], [A, M]],
            [/\b(opd2(\d{3}a?))(?: bui|\))/i],
            [y, [S, at, { OnePlus: ['304', '403', '203'], '*': qe }], [A, R]],
            [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i],
            [y, [S, 'Vivo'], [A, M]],
            [/\b(rmx[1-3]\d{3})(?: bui|;|\))/i],
            [y, [S, 'Realme'], [A, M]],
            [
              /\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
              /\bmot(?:orola)?[- ](\w*)/i,
              /((?:moto(?! 360)[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i,
            ],
            [y, [S, Qe], [A, M]],
            [/\b(mz60\d|xoom[2 ]{0,2}) build\//i],
            [y, [S, Qe], [A, R]],
            [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i],
            [y, [S, Be], [A, R]],
            [
              /(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,
              /\blg[-e;\/ ]+((?!browser|netcast|android tv|watch)\w+)/i,
              /\blg-?([\d\w]+) bui/i,
            ],
            [y, [S, Be], [A, M]],
            [
              /(ideatab[-\w ]+|602lv|d-42a|a101lv|a2109a|a3500-hv|s[56]000|pb-6505[my]|tb-?x?\d{3,4}(?:f[cu]|xu|[av])|yt\d?-[jx]?\d+[lfmx])( bui|;|\)|\/)/i,
              /lenovo ?(b[68]0[08]0-?[hf]?|tab(?:[\w- ]+?)|tb[\w-]{6,7})( bui|;|\)|\/)/i,
            ],
            [y, [S, Ze], [A, R]],
            [/(nokia) (t[12][01])/i],
            [S, y, [A, R]],
            [/(?:maemo|nokia).*(n900|lumia \d+|rm-\d+)/i, /nokia[-_ ]?(([-\w\. ]*))/i],
            [
              [y, /_/g, ' '],
              [A, M],
              [S, 'Nokia'],
            ],
            [/(pixel (c|tablet))\b/i],
            [y, [S, Je], [A, R]],
            [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i],
            [y, [S, Je], [A, M]],
            [
              /droid.+; (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i,
            ],
            [y, [S, V], [A, M]],
            [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i],
            [
              [y, 'Xperia Tablet'],
              [S, V],
              [A, R],
            ],
            [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i],
            [y, [S, et], [A, M]],
            [
              /(alexa)webm/i,
              /(kf[a-z]{2}wi|aeo(?!bc)\w\w)( bui|\))/i,
              /(kf[a-z]+)( bui|\)).+silk\//i,
            ],
            [y, [S, Re], [A, R]],
            [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i],
            [
              [y, /(.+)/g, 'Fire Phone $1'],
              [S, Re],
              [A, M],
            ],
            [/(playbook);[-\w\),; ]+(rim)/i],
            [y, S, [A, R]],
            [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i],
            [y, [S, dt], [A, M]],
            [/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i],
            [y, [S, je], [A, R]],
            [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i],
            [y, [S, je], [A, M]],
            [/(nexus 9)/i],
            [y, [S, 'HTC'], [A, R]],
            [
              /(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,
              /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
              /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i,
            ],
            [S, [y, /_/g, ' '], [A, M]],
            [
              /tcl (xess p17aa)/i,
              /droid [\w\.]+; ((?:8[14]9[16]|9(?:0(?:48|60|8[01])|1(?:3[27]|66)|2(?:6[69]|9[56])|466))[gqswx])(_\w(\w|\w\w))?(\)| bui)/i,
            ],
            [y, [S, 'TCL'], [A, R]],
            [
              /droid [\w\.]+; (418(?:7d|8v)|5087z|5102l|61(?:02[dh]|25[adfh]|27[ai]|56[dh]|59k|65[ah])|a509dl|t(?:43(?:0w|1[adepqu])|50(?:6d|7[adju])|6(?:09dl|10k|12b|71[efho]|76[hjk])|7(?:66[ahju]|67[hw]|7[045][bh]|71[hk]|73o|76[ho]|79w|81[hks]?|82h|90[bhsy]|99b)|810[hs]))(_\w(\w|\w\w))?(\)| bui)/i,
            ],
            [y, [S, 'TCL'], [A, M]],
            [/(itel) ((\w+))/i],
            [[S, it], y, [A, at, { tablet: ['p10001l', 'w7001'], '*': 'mobile' }]],
            [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i],
            [y, [S, 'Acer'], [A, R]],
            [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i],
            [y, [S, 'Meizu'], [A, M]],
            [/; ((?:power )?armor(?:[\w ]{0,8}))(?: bui|\))/i],
            [y, [S, 'Ulefone'], [A, M]],
            [/; (energy ?\w+)(?: bui|\))/i, /; energizer ([\w ]+)(?: bui|\))/i],
            [y, [S, 'Energizer'], [A, M]],
            [/; cat (b35);/i, /; (b15q?|s22 flip|s48c|s62 pro)(?: bui|\))/i],
            [y, [S, 'Cat'], [A, M]],
            [/((?:new )?andromax[\w- ]+)(?: bui|\))/i],
            [y, [S, 'Smartfren'], [A, M]],
            [/droid.+; (a(?:015|06[35]|142p?))/i],
            [y, [S, 'Nothing'], [A, M]],
            [/(imo) (tab \w+)/i, /(infinix) (x1101b?)/i],
            [S, y, [A, R]],
            [
              /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus(?! zenw)|dell|jolla|meizu|motorola|polytron|infinix|tecno|micromax|advan)[-_ ]?([-\w]*)/i,
              /; (hmd|imo) ([\w ]+?)(?: bui|\))/i,
              /(hp) ([\w ]+\w)/i,
              /(microsoft); (lumia[\w ]+)/i,
              /(lenovo)[-_ ]?([-\w ]+?)(?: bui|\)|\/)/i,
              /(oppo) ?([\w ]+) bui/i,
            ],
            [S, y, [A, M]],
            [
              /(kobo)\s(ereader|touch)/i,
              /(archos) (gamepad2?)/i,
              /(hp).+(touchpad(?!.+tablet)|tablet)/i,
              /(kindle)\/([\w\.]+)/i,
            ],
            [S, y, [A, R]],
            [/(surface duo)/i],
            [y, [S, Ve], [A, R]],
            [/droid [\d\.]+; (fp\du?)(?: b|\))/i],
            [y, [S, 'Fairphone'], [A, M]],
            [/((?:tegranote|shield t(?!.+d tv))[\w- ]*?)(?: b|\))/i],
            [y, [S, $e], [A, R]],
            [/(sprint) (\w+)/i],
            [S, y, [A, M]],
            [/(kin\.[onetw]{3})/i],
            [
              [y, /\./g, ' '],
              [S, Ve],
              [A, M],
            ],
            [/droid.+; ([c6]+|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i],
            [y, [S, W], [A, R]],
            [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i],
            [y, [S, W], [A, M]],
            [/smart-tv.+(samsung)/i],
            [S, [A, k]],
            [/hbbtv.+maple;(\d+)/i],
            [
              [y, /^/, 'SmartTV'],
              [S, Ke],
              [A, k],
            ],
            [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i],
            [
              [S, Be],
              [A, k],
            ],
            [/(apple) ?tv/i],
            [S, [y, He + ' TV'], [A, k]],
            [/crkey.*devicetype\/chromecast/i],
            [
              [y, me + ' Third Generation'],
              [S, Je],
              [A, k],
            ],
            [/crkey.*devicetype\/([^/]*)/i],
            [
              [y, /^/, 'Chromecast '],
              [S, Je],
              [A, k],
            ],
            [/fuchsia.*crkey/i],
            [
              [y, me + ' Nest Hub'],
              [S, Je],
              [A, k],
            ],
            [/crkey/i],
            [
              [y, me],
              [S, Je],
              [A, k],
            ],
            [/droid.+aft(\w+)( bui|\))/i],
            [y, [S, Re], [A, k]],
            [/(shield \w+ tv)/i],
            [y, [S, $e], [A, k]],
            [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i],
            [y, [S, b], [A, k]],
            [/(bravia[\w ]+)( bui|\))/i],
            [y, [S, V], [A, k]],
            [/(mi(tv|box)-?\w+) bui/i],
            [y, [S, j], [A, k]],
            [/Hbbtv.*(technisat) (.*);/i],
            [S, y, [A, k]],
            [
              /\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,
              /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i,
            ],
            [
              [S, xt],
              [y, xt],
              [A, k],
            ],
            [/droid.+; ([\w- ]+) (?:android tv|smart[- ]?tv)/i],
            [y, [A, k]],
            [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i],
            [[A, k]],
            [/(ouya)/i, /(nintendo) (\w+)/i],
            [S, y, [A, O]],
            [/droid.+; (shield)( bui|\))/i],
            [y, [S, $e], [A, O]],
            [/(playstation \w+)/i],
            [y, [S, V], [A, O]],
            [/\b(xbox(?: one)?(?!; xbox))[\); ]/i],
            [y, [S, Ve], [A, O]],
            [/\b(sm-[lr]\d\d[0156][fnuw]?s?|gear live)\b/i],
            [y, [S, Ke], [A, B]],
            [/((pebble))app/i, /(asus|google|lg|oppo) ((pixel |zen)?watch[\w ]*)( bui|\))/i],
            [S, y, [A, B]],
            [/(ow(?:19|20)?we?[1-3]{1,3})/i],
            [y, [S, qe], [A, B]],
            [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i],
            [y, [S, He], [A, B]],
            [/(opwwe\d{3})/i],
            [y, [S, et], [A, B]],
            [/(moto 360)/i],
            [y, [S, Qe], [A, B]],
            [/(smartwatch 3)/i],
            [y, [S, V], [A, B]],
            [/(g watch r)/i],
            [y, [S, Be], [A, B]],
            [/droid.+; (wt63?0{2,3})\)/i],
            [y, [S, W], [A, B]],
            [/droid.+; (glass) \d/i],
            [y, [S, Je], [A, D]],
            [/(pico) (4|neo3(?: link|pro)?)/i],
            [S, y, [A, D]],
            [/; (quest( \d| pro)?)/i],
            [y, [S, H], [A, D]],
            [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i],
            [S, [A, G]],
            [/(aeobc)\b/i],
            [y, [S, Re], [A, G]],
            [/(homepod).+mac os/i],
            [y, [S, He], [A, G]],
            [/windows iot/i],
            [[A, G]],
            [/droid .+?; ([^;]+?)(?: bui|; wv\)|\) applew).+?(mobile|vr|\d) safari/i],
            [y, [A, at, { mobile: 'Mobile', xr: 'VR', '*': R }]],
            [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i],
            [[A, R]],
            [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i],
            [[A, M]],
            [/droid .+?; ([\w\. -]+)( bui|\))/i],
            [y, [S, 'Generic']],
          ],
          engine: [
            [/windows.+ edge\/([\w\.]+)/i],
            [d, [v, Se + 'HTML']],
            [/(arkweb)\/([\w\.]+)/i],
            [v, d],
            [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i],
            [d, [v, 'Blink']],
            [
              /(presto)\/([\w\.]+)/i,
              /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna|servo)\/([\w\.]+)/i,
              /ekioh(flow)\/([\w\.]+)/i,
              /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,
              /(icab)[\/ ]([23]\.[\d\.]+)/i,
              /\b(libweb)/i,
            ],
            [v, d],
            [/ladybird\//i],
            [[v, 'LibWeb']],
            [/rv\:([\w\.]{1,9})\b.+(gecko)/i],
            [d, v],
          ],
          os: [
            [/microsoft (windows) (vista|xp)/i],
            [v, d],
            [/(windows (?:phone(?: os)?|mobile|iot))[\/ ]?([\d\.\w ]*)/i],
            [v, [d, at, Ct]],
            [
              /windows nt 6\.2; (arm)/i,
              /windows[\/ ]([ntce\d\. ]+\w)(?!.+xbox)/i,
              /(?:win(?=3|9|n)|win 9x )([nt\d\.]+)/i,
            ],
            [
              [d, at, Ct],
              [v, le],
            ],
            [
              /[adehimnop]{4,7}\b(?:.*os ([\w]+) like mac|; opera)/i,
              /(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i,
              /cfnetwork\/.+darwin/i,
            ],
            [
              [d, /_/g, '.'],
              [v, 'iOS'],
            ],
            [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i],
            [
              [v, 'macOS'],
              [d, /_/g, '.'],
            ],
            [/android ([\d\.]+).*crkey/i],
            [d, [v, me + ' Android']],
            [/fuchsia.*crkey\/([\d\.]+)/i],
            [d, [v, me + ' Fuchsia']],
            [/crkey\/([\d\.]+).*devicetype\/smartspeaker/i],
            [d, [v, me + ' SmartSpeaker']],
            [/linux.*crkey\/([\d\.]+)/i],
            [d, [v, me + ' Linux']],
            [/crkey\/([\d\.]+)/i],
            [d, [v, me]],
            [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i],
            [d, v],
            [/(ubuntu) ([\w\.]+) like android/i],
            [[v, /(.+)/, '$1 Touch'], d],
            [
              /(android|bada|blackberry|kaios|maemo|meego|openharmony|qnx|rim tablet os|sailfish|series40|symbian|tizen|webos)\w*[-\/; ]?([\d\.]*)/i,
            ],
            [v, d],
            [/\(bb(10);/i],
            [d, [v, dt]],
            [/(?:symbian ?os|symbos|s60(?=;)|series ?60)[-\/ ]?([\w\.]*)/i],
            [d, [v, 'Symbian']],
            [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i],
            [d, [v, u + ' OS']],
            [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i],
            [d, [v, 'webOS']],
            [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i],
            [d, [v, 'watchOS']],
            [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i],
            [[v, 'Chrome OS'], d],
            [
              /panasonic;(viera)/i,
              /(netrange)mmh/i,
              /(nettv)\/(\d+\.[\w\.]+)/i,
              /(nintendo|playstation) (\w+)/i,
              /(xbox); +xbox ([^\);]+)/i,
              /(pico) .+os([\w\.]+)/i,
              /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,
              /(mint)[\/\(\) ]?(\w*)/i,
              /(mageia|vectorlinux)[; ]/i,
              /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
              /(hurd|linux)(?: arm\w*| x86\w*| ?)([\w\.]*)/i,
              /(gnu) ?([\w\.]*)/i,
              /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i,
              /(haiku) (\w+)/i,
            ],
            [v, d],
            [/(sunos) ?([\w\.\d]*)/i],
            [[v, 'Solaris'], d],
            [
              /((?:open)?solaris)[-\/ ]?([\w\.]*)/i,
              /(aix) ((\d)(?=\.|\)| )[\w\.])*/i,
              /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i,
              /(unix) ?([\w\.]*)/i,
            ],
            [v, d],
          ],
        },
        wt = (function () {
          var Z = { init: {}, isIgnore: {}, isIgnoreRgx: {}, toString: {} };
          return (
            rt.call(Z.init, [
              [s, [v, d, L, A]],
              [x, [_]],
              [m, [A, y, S]],
              [p, [v, d]],
              [I, [v, d]],
            ]),
            rt.call(Z.isIgnore, [
              [s, [d, L]],
              [p, [d]],
              [I, [d]],
            ]),
            rt.call(Z.isIgnoreRgx, [
              [s, / ?browser$/i],
              [I, / ?os$/i],
            ]),
            rt.call(Z.toString, [
              [s, [v, d]],
              [x, [_]],
              [m, [S, y]],
              [p, [v, d]],
              [I, [v, d]],
            ]),
            Z
          );
        })(),
        Ut = function (Z, de) {
          var ue = wt.init[de],
            Te = wt.isIgnore[de] || 0,
            pe = wt.isIgnoreRgx[de] || 0,
            Me = wt.toString[de] || 0;
          function ge() {
            rt.call(this, ue);
          }
          return (
            (ge.prototype.getItem = function () {
              return Z;
            }),
            (ge.prototype.withClientHints = function () {
              return ve
                ? ve.getHighEntropyValues(Oe).then(function (Le) {
                    return Z.setCH(new Mt(Le, !1)).parseCH().get();
                  })
                : Z.parseCH().get();
            }),
            (ge.prototype.withFeatureCheck = function () {
              return Z.detectFeature().get();
            }),
            de != g &&
              ((ge.prototype.is = function (Le) {
                var Ee = !1;
                for (var Pe in this)
                  if (
                    this.hasOwnProperty(Pe) &&
                    !ut(Te, Pe) &&
                    it(pe ? gt(pe, this[Pe]) : this[Pe]) == it(pe ? gt(pe, Le) : Le)
                  ) {
                    if (((Ee = !0), Le != n)) break;
                  } else if (Le == n && Ee) {
                    Ee = !Ee;
                    break;
                  }
                return Ee;
              }),
              (ge.prototype.toString = function () {
                var Le = a;
                for (var Ee in Me)
                  typeof this[Me[Ee]] !== n && (Le += (Le ? ' ' : a) + this[Me[Ee]]);
                return Le || n;
              })),
            ve ||
              (ge.prototype.then = function (Le) {
                var Ee = this,
                  Pe = function () {
                    for (var ct in Ee) Ee.hasOwnProperty(ct) && (this[ct] = Ee[ct]);
                  };
                Pe.prototype = { is: ge.prototype.is, toString: ge.prototype.toString };
                var ot = new Pe();
                return (Le(ot), ot);
              }),
            new ge()
          );
        };
      function Mt(Z, de) {
        if (((Z = Z || {}), rt.call(this, Oe), de))
          rt.call(this, [
            [ne, It(Z[P])],
            [Y, It(Z[X])],
            [M, /\?1/.test(Z[Ae])],
            [y, lt(Z[Ie])],
            [ye, lt(Z[Fe])],
            [be, lt(Z[ze])],
            [_, lt(Z[re])],
            [he, It(Z[se])],
            [Ne, lt(Z[ae])],
          ]);
        else for (var ue in Z) this.hasOwnProperty(ue) && typeof Z[ue] !== n && (this[ue] = Z[ue]);
      }
      function Ot(Z, de, ue, Te) {
        return (
          (this.get = function (pe) {
            return pe ? (this.data.hasOwnProperty(pe) ? this.data[pe] : f) : this.data;
          }),
          (this.set = function (pe, Me) {
            return ((this.data[pe] = Me), this);
          }),
          (this.setCH = function (pe) {
            return ((this.uaCH = pe), this);
          }),
          (this.detectFeature = function () {
            if (Ge && Ge.userAgent == this.ua)
              switch (this.itemType) {
                case s:
                  Ge.brave && typeof Ge.brave.isBrave == t && this.set(v, 'Brave');
                  break;
                case m:
                  (!this.get(A) && ve && ve[M] && this.set(A, M),
                    this.get(y) == 'Macintosh' &&
                      Ge &&
                      typeof Ge.standalone !== n &&
                      Ge.maxTouchPoints &&
                      Ge.maxTouchPoints > 2 &&
                      this.set(y, 'iPad').set(A, R));
                  break;
                case I:
                  !this.get(v) && ve && ve[ye] && this.set(v, ve[ye]);
                  break;
                case g:
                  var pe = this.data,
                    Me = function (ge) {
                      return pe[ge].getItem().detectFeature().get();
                    };
                  this.set(s, Me(s)).set(x, Me(x)).set(m, Me(m)).set(p, Me(p)).set(I, Me(I));
              }
            return this;
          }),
          (this.parseUA = function () {
            return (
              this.itemType != g && Tt.call(this.data, this.ua, this.rgxMap),
              this.itemType == s && this.set(L, _t(this.get(d))),
              this
            );
          }),
          (this.parseCH = function () {
            var pe = this.uaCH,
              Me = this.rgxMap;
            switch (this.itemType) {
              case s:
              case p:
                var ge = pe[Y] || pe[ne],
                  Le;
                if (ge)
                  for (var Ee in ge) {
                    var Pe = ge[Ee].brand || ge[Ee],
                      ot = ge[Ee].version;
                    (this.itemType == s &&
                      !/not.a.brand/i.test(Pe) &&
                      (!Le || (/chrom/i.test(Le) && Pe != ee)) &&
                      ((Pe = at(Pe, {
                        Chrome: 'Google Chrome',
                        Edge: 'Microsoft Edge',
                        'Chrome WebView': 'Android WebView',
                        'Chrome Headless': 'HeadlessChrome',
                      })),
                      this.set(v, Pe).set(d, ot).set(L, _t(ot)),
                      (Le = Pe)),
                      this.itemType == p && Pe == ee && this.set(d, ot));
                  }
                break;
              case x:
                var ct = pe[_];
                ct && (ct && pe[Ne] == '64' && (ct += '64'), Tt.call(this.data, ct + ';', Me));
                break;
              case m:
                if (
                  (pe[M] && this.set(A, M),
                  pe[y] && (this.set(y, pe[y]), !this.get(A) || !this.get(S)))
                ) {
                  var mt = {};
                  (Tt.call(mt, 'droid 9; ' + pe[y] + ')', Me),
                    !this.get(A) && mt.type && this.set(A, mt.type),
                    !this.get(S) && mt.vendor && this.set(S, mt.vendor));
                }
                if (pe[he]) {
                  var yt;
                  if (typeof pe[he] != 'string')
                    for (var Dt = 0; !yt && Dt < pe[he].length; ) yt = at(pe[he][Dt++], bt);
                  else yt = at(pe[he], bt);
                  this.set(A, yt);
                }
                break;
              case I:
                var Et = pe[ye];
                if (Et) {
                  var At = pe[be];
                  (Et == le && (At = parseInt(_t(At), 10) >= 13 ? '11' : '10'),
                    this.set(v, Et).set(d, At));
                }
                this.get(v) == le && pe[y] == 'Xbox' && this.set(v, 'Xbox').set(d, f);
                break;
              case g:
                var Rt = this.data,
                  pt = function (kt) {
                    return Rt[kt].getItem().setCH(pe).parseCH().get();
                  };
                this.set(s, pt(s)).set(x, pt(x)).set(m, pt(m)).set(p, pt(p)).set(I, pt(I));
            }
            return this;
          }),
          rt.call(this, [
            ['itemType', Z],
            ['ua', de],
            ['uaCH', Te],
            ['rgxMap', ue],
            ['data', Ut(this, Z)],
          ]),
          this
        );
      }
      function st(Z, de, ue) {
        if (
          (typeof Z === e
            ? (ht(Z, !0) ? (typeof de === e && (ue = de), (de = Z)) : ((ue = Z), (de = f)), (Z = f))
            : typeof Z === o && !ht(de, !0) && ((ue = de), (de = f)),
          ue && typeof ue.append === t)
        ) {
          var Te = {};
          (ue.forEach(function (Ee, Pe) {
            Te[Pe] = Ee;
          }),
            (ue = Te));
        }
        if (!(this instanceof st)) return new st(Z, de, ue).getResult();
        var pe = typeof Z === o ? Z : ue && ue[r] ? ue[r] : Ge && Ge.userAgent ? Ge.userAgent : a,
          Me = new Mt(ue, !0),
          ge = de ? tt(vt, de) : vt,
          Le = function (Ee) {
            return Ee == g
              ? function () {
                  return new Ot(Ee, pe, ge, Me)
                    .set('ua', pe)
                    .set(s, this.getBrowser())
                    .set(x, this.getCPU())
                    .set(m, this.getDevice())
                    .set(p, this.getEngine())
                    .set(I, this.getOS())
                    .get();
                }
              : function () {
                  return new Ot(Ee, pe, ge[Ee], Me).parseUA().get();
                };
          };
        return (
          rt
            .call(this, [
              ['getBrowser', Le(s)],
              ['getCPU', Le(x)],
              ['getDevice', Le(m)],
              ['getEngine', Le(p)],
              ['getOS', Le(I)],
              ['getResult', Le(g)],
              [
                'getUA',
                function () {
                  return pe;
                },
              ],
              [
                'setUA',
                function (Ee) {
                  return (nt(Ee) && (pe = Ee.length > i ? xt(Ee, i) : Ee), this);
                },
              ],
            ])
            .setUA(pe),
          this
        );
      }
      ((st.VERSION = E),
        (st.BROWSER = ft([v, d, L, A])),
        (st.CPU = ft([_])),
        (st.DEVICE = ft([y, S, A, O, M, k, R, B, G])),
        (st.ENGINE = st.OS = ft([v, d])),
        (l.UAParser = st));
    })(_POSignalsEntities || (_POSignalsEntities = {})),
    ((_POSignalsEntities || (_POSignalsEntities = {})).evaluateModernizr = function () {
      (function (l, f, E, i) {
        function r(P, X) {
          return typeof P === X;
        }
        function a() {
          return typeof E.createElement != 'function'
            ? E.createElement(arguments[0])
            : y
              ? E.createElementNS.call(E, 'http://www.w3.org/2000/svg', arguments[0])
              : E.createElement.apply(E, arguments);
        }
        function c(P, X) {
          return !!~('' + P).indexOf(X);
        }
        function t() {
          var P = E.body;
          return (P || ((P = a(y ? 'svg' : 'body')), (P.fake = !0)), P);
        }
        function n(P, X, re, ae) {
          var se,
            Ae,
            Ie,
            Fe,
            ze = 'modernizr',
            Oe = a('div'),
            Re = t();
          if (parseInt(re, 10))
            for (; re--; )
              ((Ie = a('div')), (Ie.id = ae ? ae[re] : ze + (re + 1)), Oe.appendChild(Ie));
          return (
            (se = a('style')),
            (se.type = 'text/css'),
            (se.id = 's' + ze),
            (Re.fake ? Re : Oe).appendChild(se),
            Re.appendChild(Oe),
            se.styleSheet ? (se.styleSheet.cssText = P) : se.appendChild(E.createTextNode(P)),
            (Oe.id = ze),
            Re.fake &&
              ((Re.style.background = ''),
              (Re.style.overflow = 'hidden'),
              (Fe = L.style.overflow),
              (L.style.overflow = 'hidden'),
              L.appendChild(Re)),
            (Ae = X(Oe, P)),
            Re.fake && Re.parentNode
              ? (Re.parentNode.removeChild(Re), (L.style.overflow = Fe), L.offsetHeight)
              : Oe.parentNode.removeChild(Oe),
            !!Ae
          );
        }
        function e(P) {
          return P.replace(/([A-Z])/g, function (X, re) {
            return '-' + re.toLowerCase();
          }).replace(/^ms-/, '-ms-');
        }
        function o(P, X, re) {
          var ae;
          if ('getComputedStyle' in f) {
            ae = getComputedStyle.call(f, P, X);
            var se = f.console;
            if (ae !== null) re && (ae = ae.getPropertyValue(re));
            else if (se) {
              var Ae = se.error ? 'error' : 'log';
              se[Ae].call(
                se,
                'getComputedStyle returning null, its possible modernizr test results are inaccurate',
              );
            }
          } else ae = !X && P.currentStyle && P.currentStyle[re];
          return ae;
        }
        function s(P, X) {
          var re = P.length;
          if (f && f.CSS && 'supports' in f.CSS) {
            for (; re--; ) if (f.CSS.supports(e(P[re]), X)) return !0;
            return !1;
          }
          if ('CSSSupportsRule' in f) {
            for (var ae = []; re--; ) ae.push('(' + e(P[re]) + ':' + X + ')');
            return (
              (ae = ae.join(' or ')),
              n('@supports (' + ae + ') { #modernizr { position: absolute; } }', function (se) {
                return o(se, null, 'position') === 'absolute';
              })
            );
          }
          return i;
        }
        function x(P) {
          return P.replace(/([a-z])-([a-z])/g, function (X, re, ae) {
            return re + ae.toUpperCase();
          }).replace(/^-/, '');
        }
        function m(P, X, re, ae) {
          function se() {
            Ie && (delete B.style, delete B.modElem);
          }
          if (((ae = !r(ae, 'undefined') && ae), !r(re, 'undefined'))) {
            var Ae = s(P, re);
            if (!r(Ae, 'undefined')) return Ae;
          }
          for (var Ie, Fe, ze, Oe, Re, He = ['modernizr', 'tspan', 'samp']; !B.style && He.length; )
            ((Ie = !0), (B.modElem = a(He.shift())), (B.style = B.modElem.style));
          for (ze = P.length, Fe = 0; Fe < ze; Fe++)
            if (((Oe = P[Fe]), (Re = B.style[Oe]), c(Oe, '-') && (Oe = x(Oe)), B.style[Oe] !== i)) {
              if (ae || r(re, 'undefined')) return (se(), X !== 'pfx' || Oe);
              try {
                B.style[Oe] = re;
              } catch {}
              if (B.style[Oe] !== Re) return (se(), X !== 'pfx' || Oe);
            }
          return (se(), !1);
        }
        function p(P, X) {
          return function () {
            return P.apply(X, arguments);
          };
        }
        function I(P, X, re) {
          var ae;
          for (var se in P)
            if (P[se] in X)
              return re === !1 ? P[se] : ((ae = X[P[se]]), r(ae, 'function') ? p(ae, re || X) : ae);
          return !1;
        }
        function g(P, X, re, ae, se) {
          var Ae = P.charAt(0).toUpperCase() + P.slice(1),
            Ie = (P + ' ' + R.join(Ae + ' ') + Ae).split(' ');
          return r(X, 'string') || r(X, 'undefined')
            ? m(Ie, X, ae, se)
            : ((Ie = (P + ' ' + D.join(Ae + ' ') + Ae).split(' ')), I(Ie, X, re));
        }
        function v(P, X, re) {
          return g(P, i, i, X, re);
        }
        var A = [],
          S = {
            _version: '3.13.0',
            _config: { classPrefix: '', enableClasses: !0, enableJSClass: !0, usePrefixes: !0 },
            _q: [],
            on: function (P, X) {
              var re = this;
              setTimeout(function () {
                X(re[P]);
              }, 0);
            },
            addTest: function (P, X, re) {
              A.push({ name: P, fn: X, options: re });
            },
            addAsyncTest: function (P) {
              A.push({ name: null, fn: P });
            },
          },
          d = function () {};
        ((d.prototype = S), (d = new d()));
        var _ = [],
          L = E.documentElement,
          y = L.nodeName.toLowerCase() === 'svg',
          O = (function () {
            function P(re, ae) {
              var se;
              return (
                !!re &&
                ((ae && typeof ae != 'string') || (ae = a(ae || 'div')),
                (re = 'on' + re),
                (se = re in ae),
                !se &&
                  X &&
                  (ae.setAttribute || (ae = a('div')),
                  ae.setAttribute(re, ''),
                  (se = typeof ae[re] == 'function'),
                  ae[re] !== i && (ae[re] = i),
                  ae.removeAttribute(re)),
                se)
              );
            }
            var X = !('onblur' in L);
            return P;
          })();
        ((S.hasEvent = O),
          d.addTest('ambientlight', O('devicelight', f)),
          d.addTest('applicationcache', 'applicationCache' in f),
          (function () {
            var P = a('audio');
            d.addTest('audio', function () {
              var X = !1;
              try {
                ((X = !!P.canPlayType), X && (X = new Boolean(X)));
              } catch {}
              return X;
            });
            try {
              P.canPlayType &&
                (d.addTest(
                  'audio.ogg',
                  P.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
                ),
                d.addTest(
                  'audio.mp3',
                  P.canPlayType('audio/mpeg; codecs="mp3"').replace(/^no$/, ''),
                ),
                d.addTest(
                  'audio.opus',
                  P.canPlayType('audio/ogg; codecs="opus"') ||
                    P.canPlayType('audio/webm; codecs="opus"').replace(/^no$/, ''),
                ),
                d.addTest('audio.wav', P.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '')),
                d.addTest(
                  'audio.m4a',
                  (P.canPlayType('audio/x-m4a;') || P.canPlayType('audio/aac;')).replace(
                    /^no$/,
                    '',
                  ),
                ));
            } catch {}
          })());
        var M = 'Moz O ms Webkit',
          R = S._config.usePrefixes ? M.split(' ') : [];
        S._cssomPrefixes = R;
        var k = { elem: a('modernizr') };
        d._q.push(function () {
          delete k.elem;
        });
        var B = { style: k.elem.style };
        d._q.unshift(function () {
          delete B.style;
        });
        var D = S._config.usePrefixes ? M.toLowerCase().split(' ') : [];
        ((S._domPrefixes = D), (S.testAllProps = g));
        var G = function (P) {
          var X,
            re = Y.length,
            ae = f.CSSRule;
          if (ae === void 0) return i;
          if (!P) return !1;
          if (((P = P.replace(/^@/, '')), (X = P.replace(/-/g, '_').toUpperCase() + '_RULE') in ae))
            return '@' + P;
          for (var se = 0; se < re; se++) {
            var Ae = Y[se];
            if (Ae.toUpperCase() + '_' + X in ae) return '@-' + Ae.toLowerCase() + '-' + P;
          }
          return !1;
        };
        S.atRule = G;
        var N = (S.prefixed = function (P, X, re) {
          return P.indexOf('@') === 0
            ? G(P)
            : (P.indexOf('-') !== -1 && (P = x(P)), X ? g(P, X, re) : g(P, 'pfx'));
        });
        (d.addTest('batteryapi', !!N('battery', navigator) || !!N('getBattery', navigator), {
          aliases: ['battery-api'],
        }),
          d.addTest(
            'blobconstructor',
            function () {
              try {
                return !!new Blob();
              } catch {
                return !1;
              }
            },
            { aliases: ['blob-constructor'] },
          ),
          d.addTest('contextmenu', 'contextMenu' in L && 'HTMLMenuItemElement' in f),
          d.addTest('cors', 'XMLHttpRequest' in f && 'withCredentials' in new XMLHttpRequest()));
        var ne = N('crypto', f);
        (d.addTest('crypto', !!N('subtle', ne)),
          d.addTest('customelements', 'customElements' in f),
          d.addTest('customprotocolhandler', function () {
            if (!navigator.registerProtocolHandler) return !1;
            try {
              navigator.registerProtocolHandler('thisShouldFail');
            } catch (P) {
              return P instanceof TypeError;
            }
            return !1;
          }),
          d.addTest('customevent', 'CustomEvent' in f && typeof f.CustomEvent == 'function'),
          d.addTest('dart', !!N('startDart', navigator)),
          d.addTest(
            'dataview',
            typeof DataView != 'undefined' && 'getFloat64' in DataView.prototype,
          ),
          d.addTest('eventlistener', 'addEventListener' in f),
          d.addTest('forcetouch', function () {
            return (
              !!O(N('mouseforcewillbegin', f, !1), f) &&
              MouseEvent.WEBKIT_FORCE_AT_MOUSE_DOWN &&
              MouseEvent.WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN
            );
          }),
          d.addTest('fullscreen', !(!N('exitFullscreen', E, !1) && !N('cancelFullScreen', E, !1))),
          d.addTest('gamepads', !!N('getGamepads', navigator)),
          d.addTest('geolocation', 'geolocation' in navigator),
          d.addTest('ie8compat', !f.addEventListener && !!E.documentMode && E.documentMode === 7),
          d.addTest('intl', !!N('Intl', f)),
          d.addTest('json', 'JSON' in f && 'parse' in JSON && 'stringify' in JSON),
          (S.testAllProps = v),
          d.addTest('ligatures', v('fontFeatureSettings', '"liga" 1')),
          d.addTest('messagechannel', 'MessageChannel' in f),
          d.addTest('notification', function () {
            if (!f.Notification || !f.Notification.requestPermission) return !1;
            if (f.Notification.permission === 'granted') return !0;
            try {
              new f.Notification('');
            } catch (P) {
              if (P.name === 'TypeError') return !1;
            }
            return !0;
          }),
          d.addTest('pagevisibility', !!N('hidden', E, !1)),
          d.addTest('performance', !!N('performance', f)));
        var he = [''].concat(D);
        ((S._domPrefixesAll = he),
          d.addTest('pointerevents', function () {
            for (var P = 0, X = he.length; P < X; P++) if (O(he[P] + 'pointerdown')) return !0;
            return !1;
          }),
          d.addTest('pointerlock', !!N('exitPointerLock', E)),
          d.addTest('queryselector', 'querySelector' in E && 'querySelectorAll' in E),
          d.addTest('quotamanagement', function () {
            var P = N('temporaryStorage', navigator),
              X = N('persistentStorage', navigator);
            return !(!P || !X);
          }),
          d.addTest('requestanimationframe', !!N('requestAnimationFrame', f), { aliases: ['raf'] }),
          d.addTest('serviceworker', 'serviceWorker' in navigator));
        var Y = S._config.usePrefixes ? ' -webkit- -moz- -o- -ms- '.split(' ') : ['', ''];
        S._prefixes = Y;
        var ye = (function () {
          var P = f.matchMedia || f.msMatchMedia;
          return P
            ? function (X) {
                var re = P(X);
                return (re && re.matches) || !1;
              }
            : function (X) {
                var re = !1;
                return (
                  n('@media ' + X + ' { #modernizr { position: absolute; } }', function (ae) {
                    re = o(ae, null, 'position') === 'absolute';
                  }),
                  re
                );
              };
        })();
        ((S.mq = ye),
          d.addTest('touchevents', function () {
            if (
              'ontouchstart' in f ||
              f.TouchEvent ||
              (f.DocumentTouch && E instanceof DocumentTouch)
            )
              return !0;
            var P = ['(', Y.join('touch-enabled),('), 'heartz', ')'].join('');
            return ye(P);
          }),
          d.addTest('typedarrays', 'ArrayBuffer' in f),
          d.addTest('vibrate', !!N('vibrate', navigator)),
          (function () {
            var P = a('video');
            d.addTest('video', function () {
              var X = !1;
              try {
                ((X = !!P.canPlayType), X && (X = new Boolean(X)));
              } catch {}
              return X;
            });
            try {
              P.canPlayType &&
                (d.addTest(
                  'video.ogg',
                  P.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, ''),
                ),
                d.addTest(
                  'video.h264',
                  P.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, ''),
                ),
                d.addTest(
                  'video.h265',
                  P.canPlayType('video/mp4; codecs="hev1"').replace(/^no$/, ''),
                ),
                d.addTest(
                  'video.webm',
                  P.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, ''),
                ),
                d.addTest(
                  'video.vp9',
                  P.canPlayType('video/webm; codecs="vp9"').replace(/^no$/, ''),
                ),
                d.addTest(
                  'video.hls',
                  P.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"').replace(/^no$/, ''),
                ),
                d.addTest(
                  'video.av1',
                  P.canPlayType('video/mp4; codecs="av01"').replace(/^no$/, ''),
                ));
            } catch {}
          })(),
          d.addTest('webgl', function () {
            return 'WebGLRenderingContext' in f;
          }));
        var be = !1;
        try {
          be = 'WebSocket' in f && f.WebSocket.CLOSING === 2;
        } catch {}
        (d.addTest('websockets', be),
          d.addTest('xdomainrequest', 'XDomainRequest' in f),
          d.addTest('matchmedia', !!N('matchMedia', f)),
          (function () {
            var P, X, re, ae, se, Ae, Ie;
            for (var Fe in A)
              if (A.hasOwnProperty(Fe)) {
                if (
                  ((P = []),
                  (X = A[Fe]),
                  X.name &&
                    (P.push(X.name.toLowerCase()),
                    X.options && X.options.aliases && X.options.aliases.length))
                )
                  for (re = 0; re < X.options.aliases.length; re++)
                    P.push(X.options.aliases[re].toLowerCase());
                for (ae = r(X.fn, 'function') ? X.fn() : X.fn, se = 0; se < P.length; se++)
                  ((Ae = P[se]),
                    (Ie = Ae.split('.')),
                    Ie.length === 1
                      ? (d[Ie[0]] = ae)
                      : ((d[Ie[0]] && (!d[Ie[0]] || d[Ie[0]] instanceof Boolean)) ||
                          (d[Ie[0]] = new Boolean(d[Ie[0]])),
                        (d[Ie[0]][Ie[1]] = ae)),
                    _.push((ae ? '' : 'no-') + Ie.join('-')));
              }
          })(),
          delete S.addTest,
          delete S.addAsyncTest);
        for (var Ne = 0; Ne < d._q.length; Ne++) d._q[Ne]();
        l.Modernizr = d;
      })(_POSignalsEntities || (_POSignalsEntities = {}), window, document);
    }),
    (function (l) {
      l.AiaSignals = (function (f) {
        'use strict';
        var E = [
            { name: 'IS_USER_VERIFYING_PLATFORM_AUTHENTICATOR_AVAILABLE', value: !1, error: null },
            { name: 'FILE_INJECT_JS_FOUND', value: !1, error: null },
            { name: 'FILE_CONTENT_JS_FOUND', value: !1, error: null },
            { name: 'WINDOW_GLOBAL_KEY_FOUND', value: !1, error: null },
          ],
          i = { webAuthn: 1e3, manus: 5e3, anchor: 5e3, skyvern: 5e3, detect: 1e4 };
        function r(x) {
          for (var m = 0; m < E.length; m++) if (E[m].name === x) return E[m];
          return null;
        }
        function a(x, m) {
          var p = r(x);
          p && ((p.value = m), (p.error = null));
        }
        function c(x, m, p) {
          var I = r(x);
          I && ((I.value = m), (I.error = p));
        }
        function t() {
          return new Promise(function (x) {
            var m = setTimeout(function () {
              x(E);
            }, i.detect);
            n()
              .then(function (p) {
                var I = r('IS_USER_VERIFYING_PLATFORM_AUTHENTICATOR_AVAILABLE');
                if (I && I.value) {
                  (clearTimeout(m), x(E));
                  return;
                }
                for (
                  var g = [
                      e().then(function (d) {
                        return { key: 'manus', result: d };
                      }),
                      o().then(function (d) {
                        return { key: 'anchor', result: d };
                      }),
                      s().then(function (d) {
                        return { key: 'skyvern', result: d };
                      }),
                    ],
                    v = 0,
                    A = function () {
                      (v++, v === g.length && (clearTimeout(m), x(E)));
                    },
                    S = 0;
                  S < g.length;
                  S++
                )
                  (function (d) {
                    d.then(A).catch(function () {
                      A();
                    });
                  })(g[S]);
              })
              .catch(function () {
                (clearTimeout(m), x(E));
              });
          });
        }
        function n() {
          return new Promise(function (x) {
            var m = i.webAuthn,
              p = setTimeout(function () {
                (c('IS_USER_VERIFYING_PLATFORM_AUTHENTICATOR_AVAILABLE', !1, 1004), x(E));
              }, m);
            try {
              window.PublicKeyCredential &&
              typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable == 'function'
                ? PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
                    .then(function (I) {
                      (clearTimeout(p),
                        I
                          ? a('IS_USER_VERIFYING_PLATFORM_AUTHENTICATOR_AVAILABLE', !0)
                          : c('IS_USER_VERIFYING_PLATFORM_AUTHENTICATOR_AVAILABLE', !1, 1001),
                        x(E));
                    })
                    .catch(function () {
                      (clearTimeout(p),
                        c('IS_USER_VERIFYING_PLATFORM_AUTHENTICATOR_AVAILABLE', !1, 1002),
                        x(E));
                    })
                : (clearTimeout(p),
                  c('IS_USER_VERIFYING_PLATFORM_AUTHENTICATOR_AVAILABLE', !1, 1003),
                  x(E));
            } catch {
              (clearTimeout(p),
                c('IS_USER_VERIFYING_PLATFORM_AUTHENTICATOR_AVAILABLE', !1, 1002),
                x(E));
            }
          });
        }
        function e() {
          return new Promise(function (x) {
            var m = i.manus,
              p;
            function I() {
              (clearTimeout(p), a('FILE_CONTENT_JS_FOUND', !0), x(E));
            }
            function g() {
              (c('FILE_CONTENT_JS_FOUND', !1, 2001), x(E));
            }
            var v = document.createElement('script');
            ((v.src = 'chrome-extension://mljmkmodkfigdopcpgboaalildgijkoc/content.ts.js'),
              (v.onload = I),
              (v.onerror = function () {
                (clearTimeout(p), c('FILE_CONTENT_JS_FOUND', !1, 2002), x(E));
              }),
              document.getElementsByTagName('head')[0].appendChild(v),
              (p = setTimeout(g, m)));
          });
        }
        function o() {
          return new Promise(function (x) {
            var m = i.anchor,
              p;
            function I() {
              (clearTimeout(p), a('FILE_INJECT_JS_FOUND', !0), x(E));
            }
            function g() {
              (c('FILE_INJECT_JS_FOUND', !1, 4001), x(E));
            }
            var v = document.createElement('script');
            ((v.src = 'chrome-extension://bppehibnhionalpjigdjdilknbljaeai/inject.js'),
              (v.onload = I),
              (v.onerror = function () {
                (clearTimeout(p), c('FILE_INJECT_JS_FOUND', !1, 4002), x(E));
              }),
              document.getElementsByTagName('head')[0].appendChild(v),
              (p = setTimeout(g, m)));
          });
        }
        function s() {
          return new Promise(function (x) {
            var m = i.skyvern,
              p = 1e3,
              I = 0;
            function g() {
              if (
                window.globalDomDepthMap ||
                window.GlobalEnableAllTextualElements ||
                window.globalObserverForDOMIncrement ||
                window.globalListnerFlag ||
                window.globalDomDepthMap ||
                window.globalOneTimeIncrementElements ||
                window.globalHoverStylesMap ||
                window.globalParsedElementCounter
              ) {
                (a('WINDOW_GLOBAL_KEY_FOUND', !0), x(E));
                return;
              }
              for (var v in window)
                if (typeof v == 'string') {
                  var A = v.toLowerCase();
                  if (A.indexOf('skyvern') !== -1 && v !== 'isSkyvern') {
                    (a('WINDOW_GLOBAL_KEY_FOUND', !0), x(E));
                    return;
                  }
                }
              ((I += p),
                I >= m ? (c('WINDOW_GLOBAL_KEY_FOUND', !1, 5002), x(E)) : setTimeout(g, p));
            }
            document.readyState === 'loading'
              ? document.addEventListener('DOMContentLoaded', g)
              : g();
          });
        }
        return (
          (f.detect = t),
          (f.checkWebAuthnPlatformSupport = n),
          (f.isManus = e),
          (f.isAnchor = o),
          (f.isSkyvern = s),
          Object.defineProperty(f, '__esModule', { value: !0 }),
          f
        );
      })({});
    })(typeof _POSignalsEntities != 'undefined' ? _POSignalsEntities : (_POSignalsEntities = {})),
    (function (l) {
      (_POSignalsEntities || (_POSignalsEntities = {})).pako = l();
    })(function () {
      return (function l(f, E, i) {
        function r(t, n) {
          if (!E[t]) {
            if (!f[t]) {
              var e = typeof require == 'function' && require;
              if (!n && e) return e(t, !0);
              if (a) return a(t, !0);
              var o = new Error("Cannot find module '" + t + "'");
              throw ((o.code = 'MODULE_NOT_FOUND'), o);
            }
            var s = (E[t] = { exports: {} });
            f[t][0].call(
              s.exports,
              function (x) {
                var m = f[t][1][x];
                return r(m || x);
              },
              s,
              s.exports,
              l,
              f,
              E,
              i,
            );
          }
          return E[t].exports;
        }
        for (var a = typeof require == 'function' && require, c = 0; c < i.length; c++) r(i[c]);
        return r;
      })(
        {
          1: [
            function (l, f, E) {
              'use strict';
              function i(t, n) {
                return Object.prototype.hasOwnProperty.call(t, n);
              }
              var r =
                typeof Uint8Array != 'undefined' &&
                typeof Uint16Array != 'undefined' &&
                typeof Int32Array != 'undefined';
              ((E.assign = function (t) {
                for (var n = Array.prototype.slice.call(arguments, 1); n.length; ) {
                  var e = n.shift();
                  if (e) {
                    if (typeof e != 'object') throw new TypeError(e + 'must be non-object');
                    for (var o in e) i(e, o) && (t[o] = e[o]);
                  }
                }
                return t;
              }),
                (E.shrinkBuf = function (t, n) {
                  return t.length === n ? t : t.subarray ? t.subarray(0, n) : ((t.length = n), t);
                }));
              var a = {
                  arraySet: function (t, n, e, o, s) {
                    if (n.subarray && t.subarray) t.set(n.subarray(e, e + o), s);
                    else for (var x = 0; x < o; x++) t[s + x] = n[e + x];
                  },
                  flattenChunks: function (t) {
                    var n, e, o, s, x, m;
                    for (o = 0, n = 0, e = t.length; n < e; n++) o += t[n].length;
                    for (m = new Uint8Array(o), s = 0, n = 0, e = t.length; n < e; n++)
                      ((x = t[n]), m.set(x, s), (s += x.length));
                    return m;
                  },
                },
                c = {
                  arraySet: function (t, n, e, o, s) {
                    for (var x = 0; x < o; x++) t[s + x] = n[e + x];
                  },
                  flattenChunks: function (t) {
                    return [].concat.apply([], t);
                  },
                };
              ((E.setTyped = function (t) {
                t
                  ? ((E.Buf8 = Uint8Array),
                    (E.Buf16 = Uint16Array),
                    (E.Buf32 = Int32Array),
                    E.assign(E, a))
                  : ((E.Buf8 = Array), (E.Buf16 = Array), (E.Buf32 = Array), E.assign(E, c));
              }),
                E.setTyped(r));
            },
            {},
          ],
          2: [
            function (l, f, E) {
              'use strict';
              function i(e, o) {
                if (o < 65537 && ((e.subarray && c) || (!e.subarray && a)))
                  return String.fromCharCode.apply(null, r.shrinkBuf(e, o));
                for (var s = '', x = 0; x < o; x++) s += String.fromCharCode(e[x]);
                return s;
              }
              var r = l('./common'),
                a = !0,
                c = !0;
              try {
                String.fromCharCode.apply(null, [0]);
              } catch {
                a = !1;
              }
              try {
                String.fromCharCode.apply(null, new Uint8Array(1));
              } catch {
                c = !1;
              }
              for (var t = new r.Buf8(256), n = 0; n < 256; n++)
                t[n] = n >= 252 ? 6 : n >= 248 ? 5 : n >= 240 ? 4 : n >= 224 ? 3 : n >= 192 ? 2 : 1;
              ((t[254] = t[254] = 1),
                (E.string2buf = function (e) {
                  var o,
                    s,
                    x,
                    m,
                    p,
                    I = e.length,
                    g = 0;
                  for (m = 0; m < I; m++)
                    ((64512 & (s = e.charCodeAt(m))) == 55296 &&
                      m + 1 < I &&
                      (64512 & (x = e.charCodeAt(m + 1))) == 56320 &&
                      ((s = 65536 + ((s - 55296) << 10) + (x - 56320)), m++),
                      (g += s < 128 ? 1 : s < 2048 ? 2 : s < 65536 ? 3 : 4));
                  for (o = new r.Buf8(g), p = 0, m = 0; p < g; m++)
                    ((64512 & (s = e.charCodeAt(m))) == 55296 &&
                      m + 1 < I &&
                      (64512 & (x = e.charCodeAt(m + 1))) == 56320 &&
                      ((s = 65536 + ((s - 55296) << 10) + (x - 56320)), m++),
                      s < 128
                        ? (o[p++] = s)
                        : s < 2048
                          ? ((o[p++] = 192 | (s >>> 6)), (o[p++] = 128 | (63 & s)))
                          : s < 65536
                            ? ((o[p++] = 224 | (s >>> 12)),
                              (o[p++] = 128 | ((s >>> 6) & 63)),
                              (o[p++] = 128 | (63 & s)))
                            : ((o[p++] = 240 | (s >>> 18)),
                              (o[p++] = 128 | ((s >>> 12) & 63)),
                              (o[p++] = 128 | ((s >>> 6) & 63)),
                              (o[p++] = 128 | (63 & s))));
                  return o;
                }),
                (E.buf2binstring = function (e) {
                  return i(e, e.length);
                }),
                (E.binstring2buf = function (e) {
                  for (var o = new r.Buf8(e.length), s = 0, x = o.length; s < x; s++)
                    o[s] = e.charCodeAt(s);
                  return o;
                }),
                (E.buf2string = function (e, o) {
                  var s,
                    x,
                    m,
                    p,
                    I = o || e.length,
                    g = new Array(2 * I);
                  for (x = 0, s = 0; s < I; )
                    if ((m = e[s++]) < 128) g[x++] = m;
                    else if ((p = t[m]) > 4) ((g[x++] = 65533), (s += p - 1));
                    else {
                      for (m &= p === 2 ? 31 : p === 3 ? 15 : 7; p > 1 && s < I; )
                        ((m = (m << 6) | (63 & e[s++])), p--);
                      p > 1
                        ? (g[x++] = 65533)
                        : m < 65536
                          ? (g[x++] = m)
                          : ((m -= 65536),
                            (g[x++] = 55296 | ((m >> 10) & 1023)),
                            (g[x++] = 56320 | (1023 & m)));
                    }
                  return i(g, x);
                }),
                (E.utf8border = function (e, o) {
                  var s;
                  for (
                    (o = o || e.length) > e.length && (o = e.length), s = o - 1;
                    s >= 0 && (192 & e[s]) == 128;

                  )
                    s--;
                  return s < 0 || s === 0 ? o : s + t[e[s]] > o ? s : o;
                }));
            },
            { './common': 1 },
          ],
          3: [
            function (l, f, E) {
              'use strict';
              f.exports = function (i, r, a, c) {
                for (var t = (65535 & i) | 0, n = ((i >>> 16) & 65535) | 0, e = 0; a !== 0; ) {
                  a -= e = a > 2e3 ? 2e3 : a;
                  do n = (n + (t = (t + r[c++]) | 0)) | 0;
                  while (--e);
                  ((t %= 65521), (n %= 65521));
                }
                return t | (n << 16) | 0;
              };
            },
            {},
          ],
          4: [
            function (l, f, E) {
              'use strict';
              var i = (function () {
                for (var r, a = [], c = 0; c < 256; c++) {
                  r = c;
                  for (var t = 0; t < 8; t++) r = 1 & r ? 3988292384 ^ (r >>> 1) : r >>> 1;
                  a[c] = r;
                }
                return a;
              })();
              f.exports = function (r, a, c, t) {
                var n = i,
                  e = t + c;
                r ^= -1;
                for (var o = t; o < e; o++) r = (r >>> 8) ^ n[255 & (r ^ a[o])];
                return -1 ^ r;
              };
            },
            {},
          ],
          5: [
            function (l, f, E) {
              'use strict';
              function i(u, F) {
                return ((u.msg = B[F]), F);
              }
              function r(u) {
                return (u << 1) - (u > 4 ? 9 : 0);
              }
              function a(u) {
                for (var F = u.length; --F >= 0; ) u[F] = 0;
              }
              function c(u) {
                var F = u.state,
                  H = F.pending;
                (H > u.avail_out && (H = u.avail_out),
                  H !== 0 &&
                    (O.arraySet(u.output, F.pending_buf, F.pending_out, H, u.next_out),
                    (u.next_out += H),
                    (F.pending_out += H),
                    (u.total_out += H),
                    (u.avail_out -= H),
                    (F.pending -= H),
                    F.pending === 0 && (F.pending_out = 0)));
              }
              function t(u, F) {
                (M._tr_flush_block(
                  u,
                  u.block_start >= 0 ? u.block_start : -1,
                  u.strstart - u.block_start,
                  F,
                ),
                  (u.block_start = u.strstart),
                  c(u.strm));
              }
              function n(u, F) {
                u.pending_buf[u.pending++] = F;
              }
              function e(u, F) {
                ((u.pending_buf[u.pending++] = (F >>> 8) & 255),
                  (u.pending_buf[u.pending++] = 255 & F));
              }
              function o(u, F, H, T) {
                var te = u.avail_in;
                return (
                  te > T && (te = T),
                  te === 0
                    ? 0
                    : ((u.avail_in -= te),
                      O.arraySet(F, u.input, u.next_in, te, H),
                      u.state.wrap === 1
                        ? (u.adler = R(u.adler, F, te, H))
                        : u.state.wrap === 2 && (u.adler = k(u.adler, F, te, H)),
                      (u.next_in += te),
                      (u.total_in += te),
                      te)
                );
              }
              function s(u, F) {
                var H,
                  T,
                  te = u.max_chain_length,
                  ce = u.strstart,
                  le = u.prev_length,
                  fe = u.nice_match,
                  Ge = u.strstart > u.w_size - Ve ? u.strstart - (u.w_size - Ve) : 0,
                  ve = u.window,
                  tt = u.w_mask,
                  ft = u.prev,
                  ut = u.strstart + Be,
                  ht = ve[ce + le - 1],
                  nt = ve[ce + le];
                (u.prev_length >= u.good_match && (te >>= 2),
                  fe > u.lookahead && (fe = u.lookahead));
                do
                  if (
                    ((H = F),
                    ve[H + le] === nt &&
                      ve[H + le - 1] === ht &&
                      ve[H] === ve[ce] &&
                      ve[++H] === ve[ce + 1])
                  ) {
                    ((ce += 2), H++);
                    do;
                    while (
                      ve[++ce] === ve[++H] &&
                      ve[++ce] === ve[++H] &&
                      ve[++ce] === ve[++H] &&
                      ve[++ce] === ve[++H] &&
                      ve[++ce] === ve[++H] &&
                      ve[++ce] === ve[++H] &&
                      ve[++ce] === ve[++H] &&
                      ve[++ce] === ve[++H] &&
                      ce < ut
                    );
                    if (((T = Be - (ut - ce)), (ce = ut - Be), T > le)) {
                      if (((u.match_start = F), (le = T), T >= fe)) break;
                      ((ht = ve[ce + le - 1]), (nt = ve[ce + le]));
                    }
                  }
                while ((F = ft[F & tt]) > Ge && --te != 0);
                return le <= u.lookahead ? le : u.lookahead;
              }
              function x(u) {
                var F,
                  H,
                  T,
                  te,
                  ce,
                  le = u.w_size;
                do {
                  if (
                    ((te = u.window_size - u.lookahead - u.strstart), u.strstart >= le + (le - Ve))
                  ) {
                    (O.arraySet(u.window, u.window, le, le, 0),
                      (u.match_start -= le),
                      (u.strstart -= le),
                      (u.block_start -= le),
                      (F = H = u.hash_size));
                    do ((T = u.head[--F]), (u.head[F] = T >= le ? T - le : 0));
                    while (--H);
                    F = H = le;
                    do ((T = u.prev[--F]), (u.prev[F] = T >= le ? T - le : 0));
                    while (--H);
                    te += le;
                  }
                  if (u.strm.avail_in === 0) break;
                  if (
                    ((H = o(u.strm, u.window, u.strstart + u.lookahead, te)),
                    (u.lookahead += H),
                    u.lookahead + u.insert >= _e)
                  )
                    for (
                      ce = u.strstart - u.insert,
                        u.ins_h = u.window[ce],
                        u.ins_h = ((u.ins_h << u.hash_shift) ^ u.window[ce + 1]) & u.hash_mask;
                      u.insert &&
                      ((u.ins_h =
                        ((u.ins_h << u.hash_shift) ^ u.window[ce + _e - 1]) & u.hash_mask),
                      (u.prev[ce & u.w_mask] = u.head[u.ins_h]),
                      (u.head[u.ins_h] = ce),
                      ce++,
                      u.insert--,
                      !(u.lookahead + u.insert < _e));

                    );
                } while (u.lookahead < Ve && u.strm.avail_in !== 0);
              }
              function m(u, F) {
                for (var H, T; ; ) {
                  if (u.lookahead < Ve) {
                    if ((x(u), u.lookahead < Ve && F === D)) return W;
                    if (u.lookahead === 0) break;
                  }
                  if (
                    ((H = 0),
                    u.lookahead >= _e &&
                      ((u.ins_h =
                        ((u.ins_h << u.hash_shift) ^ u.window[u.strstart + _e - 1]) & u.hash_mask),
                      (H = u.prev[u.strstart & u.w_mask] = u.head[u.ins_h]),
                      (u.head[u.ins_h] = u.strstart)),
                    H !== 0 && u.strstart - H <= u.w_size - Ve && (u.match_length = s(u, H)),
                    u.match_length >= _e)
                  )
                    if (
                      ((T = M._tr_tally(u, u.strstart - u.match_start, u.match_length - _e)),
                      (u.lookahead -= u.match_length),
                      u.match_length <= u.max_lazy_match && u.lookahead >= _e)
                    ) {
                      u.match_length--;
                      do
                        (u.strstart++,
                          (u.ins_h =
                            ((u.ins_h << u.hash_shift) ^ u.window[u.strstart + _e - 1]) &
                            u.hash_mask),
                          (H = u.prev[u.strstart & u.w_mask] = u.head[u.ins_h]),
                          (u.head[u.ins_h] = u.strstart));
                      while (--u.match_length != 0);
                      u.strstart++;
                    } else
                      ((u.strstart += u.match_length),
                        (u.match_length = 0),
                        (u.ins_h = u.window[u.strstart]),
                        (u.ins_h =
                          ((u.ins_h << u.hash_shift) ^ u.window[u.strstart + 1]) & u.hash_mask));
                  else ((T = M._tr_tally(u, 0, u.window[u.strstart])), u.lookahead--, u.strstart++);
                  if (T && (t(u, !1), u.strm.avail_out === 0)) return W;
                }
                return (
                  (u.insert = u.strstart < _e - 1 ? u.strstart : _e - 1),
                  F === ne
                    ? (t(u, !0), u.strm.avail_out === 0 ? ee : me)
                    : u.last_lit && (t(u, !1), u.strm.avail_out === 0)
                      ? W
                      : $
                );
              }
              function p(u, F) {
                for (var H, T, te; ; ) {
                  if (u.lookahead < Ve) {
                    if ((x(u), u.lookahead < Ve && F === D)) return W;
                    if (u.lookahead === 0) break;
                  }
                  if (
                    ((H = 0),
                    u.lookahead >= _e &&
                      ((u.ins_h =
                        ((u.ins_h << u.hash_shift) ^ u.window[u.strstart + _e - 1]) & u.hash_mask),
                      (H = u.prev[u.strstart & u.w_mask] = u.head[u.ins_h]),
                      (u.head[u.ins_h] = u.strstart)),
                    (u.prev_length = u.match_length),
                    (u.prev_match = u.match_start),
                    (u.match_length = _e - 1),
                    H !== 0 &&
                      u.prev_length < u.max_lazy_match &&
                      u.strstart - H <= u.w_size - Ve &&
                      ((u.match_length = s(u, H)),
                      u.match_length <= 5 &&
                        (u.strategy === re ||
                          (u.match_length === _e && u.strstart - u.match_start > 4096)) &&
                        (u.match_length = _e - 1)),
                    u.prev_length >= _e && u.match_length <= u.prev_length)
                  ) {
                    ((te = u.strstart + u.lookahead - _e),
                      (T = M._tr_tally(u, u.strstart - 1 - u.prev_match, u.prev_length - _e)),
                      (u.lookahead -= u.prev_length - 1),
                      (u.prev_length -= 2));
                    do
                      ++u.strstart <= te &&
                        ((u.ins_h =
                          ((u.ins_h << u.hash_shift) ^ u.window[u.strstart + _e - 1]) &
                          u.hash_mask),
                        (H = u.prev[u.strstart & u.w_mask] = u.head[u.ins_h]),
                        (u.head[u.ins_h] = u.strstart));
                    while (--u.prev_length != 0);
                    if (
                      ((u.match_available = 0),
                      (u.match_length = _e - 1),
                      u.strstart++,
                      T && (t(u, !1), u.strm.avail_out === 0))
                    )
                      return W;
                  } else if (u.match_available) {
                    if (
                      ((T = M._tr_tally(u, 0, u.window[u.strstart - 1])) && t(u, !1),
                      u.strstart++,
                      u.lookahead--,
                      u.strm.avail_out === 0)
                    )
                      return W;
                  } else ((u.match_available = 1), u.strstart++, u.lookahead--);
                }
                return (
                  u.match_available &&
                    ((T = M._tr_tally(u, 0, u.window[u.strstart - 1])), (u.match_available = 0)),
                  (u.insert = u.strstart < _e - 1 ? u.strstart : _e - 1),
                  F === ne
                    ? (t(u, !0), u.strm.avail_out === 0 ? ee : me)
                    : u.last_lit && (t(u, !1), u.strm.avail_out === 0)
                      ? W
                      : $
                );
              }
              function I(u, F) {
                for (var H, T, te, ce, le = u.window; ; ) {
                  if (u.lookahead <= Be) {
                    if ((x(u), u.lookahead <= Be && F === D)) return W;
                    if (u.lookahead === 0) break;
                  }
                  if (
                    ((u.match_length = 0),
                    u.lookahead >= _e &&
                      u.strstart > 0 &&
                      ((te = u.strstart - 1),
                      (T = le[te]) === le[++te] && T === le[++te] && T === le[++te]))
                  ) {
                    ce = u.strstart + Be;
                    do;
                    while (
                      T === le[++te] &&
                      T === le[++te] &&
                      T === le[++te] &&
                      T === le[++te] &&
                      T === le[++te] &&
                      T === le[++te] &&
                      T === le[++te] &&
                      T === le[++te] &&
                      te < ce
                    );
                    ((u.match_length = Be - (ce - te)),
                      u.match_length > u.lookahead && (u.match_length = u.lookahead));
                  }
                  if (
                    (u.match_length >= _e
                      ? ((H = M._tr_tally(u, 1, u.match_length - _e)),
                        (u.lookahead -= u.match_length),
                        (u.strstart += u.match_length),
                        (u.match_length = 0))
                      : ((H = M._tr_tally(u, 0, u.window[u.strstart])),
                        u.lookahead--,
                        u.strstart++),
                    H && (t(u, !1), u.strm.avail_out === 0))
                  )
                    return W;
                }
                return (
                  (u.insert = 0),
                  F === ne
                    ? (t(u, !0), u.strm.avail_out === 0 ? ee : me)
                    : u.last_lit && (t(u, !1), u.strm.avail_out === 0)
                      ? W
                      : $
                );
              }
              function g(u, F) {
                for (var H; ; ) {
                  if (u.lookahead === 0 && (x(u), u.lookahead === 0)) {
                    if (F === D) return W;
                    break;
                  }
                  if (
                    ((u.match_length = 0),
                    (H = M._tr_tally(u, 0, u.window[u.strstart])),
                    u.lookahead--,
                    u.strstart++,
                    H && (t(u, !1), u.strm.avail_out === 0))
                  )
                    return W;
                }
                return (
                  (u.insert = 0),
                  F === ne
                    ? (t(u, !0), u.strm.avail_out === 0 ? ee : me)
                    : u.last_lit && (t(u, !1), u.strm.avail_out === 0)
                      ? W
                      : $
                );
              }
              function v(u, F, H, T, te) {
                ((this.good_length = u),
                  (this.max_lazy = F),
                  (this.nice_length = H),
                  (this.max_chain = T),
                  (this.func = te));
              }
              function A(u) {
                ((u.window_size = 2 * u.w_size),
                  a(u.head),
                  (u.max_lazy_match = y[u.level].max_lazy),
                  (u.good_match = y[u.level].good_length),
                  (u.nice_match = y[u.level].nice_length),
                  (u.max_chain_length = y[u.level].max_chain),
                  (u.strstart = 0),
                  (u.block_start = 0),
                  (u.lookahead = 0),
                  (u.insert = 0),
                  (u.match_length = u.prev_length = _e - 1),
                  (u.match_available = 0),
                  (u.ins_h = 0));
              }
              function S() {
                ((this.strm = null),
                  (this.status = 0),
                  (this.pending_buf = null),
                  (this.pending_buf_size = 0),
                  (this.pending_out = 0),
                  (this.pending = 0),
                  (this.wrap = 0),
                  (this.gzhead = null),
                  (this.gzindex = 0),
                  (this.method = ze),
                  (this.last_flush = -1),
                  (this.w_size = 0),
                  (this.w_bits = 0),
                  (this.w_mask = 0),
                  (this.window = null),
                  (this.window_size = 0),
                  (this.prev = null),
                  (this.head = null),
                  (this.ins_h = 0),
                  (this.hash_size = 0),
                  (this.hash_bits = 0),
                  (this.hash_mask = 0),
                  (this.hash_shift = 0),
                  (this.block_start = 0),
                  (this.match_length = 0),
                  (this.prev_match = 0),
                  (this.match_available = 0),
                  (this.strstart = 0),
                  (this.match_start = 0),
                  (this.lookahead = 0),
                  (this.prev_length = 0),
                  (this.max_chain_length = 0),
                  (this.max_lazy_match = 0),
                  (this.level = 0),
                  (this.strategy = 0),
                  (this.good_match = 0),
                  (this.nice_match = 0),
                  (this.dyn_ltree = new O.Buf16(2 * We)),
                  (this.dyn_dtree = new O.Buf16(2 * (2 * dt + 1))),
                  (this.bl_tree = new O.Buf16(2 * (2 * Je + 1))),
                  a(this.dyn_ltree),
                  a(this.dyn_dtree),
                  a(this.bl_tree),
                  (this.l_desc = null),
                  (this.d_desc = null),
                  (this.bl_desc = null),
                  (this.bl_count = new O.Buf16(Ze + 1)),
                  (this.heap = new O.Buf16(2 * je + 1)),
                  a(this.heap),
                  (this.heap_len = 0),
                  (this.heap_max = 0),
                  (this.depth = new O.Buf16(2 * je + 1)),
                  a(this.depth),
                  (this.l_buf = 0),
                  (this.lit_bufsize = 0),
                  (this.last_lit = 0),
                  (this.d_buf = 0),
                  (this.opt_len = 0),
                  (this.static_len = 0),
                  (this.matches = 0),
                  (this.insert = 0),
                  (this.bi_buf = 0),
                  (this.bi_valid = 0));
              }
              function d(u) {
                var F;
                return u && u.state
                  ? ((u.total_in = u.total_out = 0),
                    (u.data_type = Fe),
                    (F = u.state),
                    (F.pending = 0),
                    (F.pending_out = 0),
                    F.wrap < 0 && (F.wrap = -F.wrap),
                    (F.status = F.wrap ? $e : V),
                    (u.adler = F.wrap === 2 ? 0 : 1),
                    (F.last_flush = D),
                    M._tr_init(F),
                    Y)
                  : i(u, be);
              }
              function _(u) {
                var F = d(u);
                return (F === Y && A(u.state), F);
              }
              function L(u, F, H, T, te, ce) {
                if (!u) return be;
                var le = 1;
                if (
                  (F === X && (F = 6),
                  T < 0 ? ((le = 0), (T = -T)) : T > 15 && ((le = 2), (T -= 16)),
                  te < 1 ||
                    te > Oe ||
                    H !== ze ||
                    T < 8 ||
                    T > 15 ||
                    F < 0 ||
                    F > 9 ||
                    ce < 0 ||
                    ce > Ae)
                )
                  return i(u, be);
                T === 8 && (T = 9);
                var fe = new S();
                return (
                  (u.state = fe),
                  (fe.strm = u),
                  (fe.wrap = le),
                  (fe.gzhead = null),
                  (fe.w_bits = T),
                  (fe.w_size = 1 << fe.w_bits),
                  (fe.w_mask = fe.w_size - 1),
                  (fe.hash_bits = te + 7),
                  (fe.hash_size = 1 << fe.hash_bits),
                  (fe.hash_mask = fe.hash_size - 1),
                  (fe.hash_shift = ~~((fe.hash_bits + _e - 1) / _e)),
                  (fe.window = new O.Buf8(2 * fe.w_size)),
                  (fe.head = new O.Buf16(fe.hash_size)),
                  (fe.prev = new O.Buf16(fe.w_size)),
                  (fe.lit_bufsize = 1 << (te + 6)),
                  (fe.pending_buf_size = 4 * fe.lit_bufsize),
                  (fe.pending_buf = new O.Buf8(fe.pending_buf_size)),
                  (fe.d_buf = 1 * fe.lit_bufsize),
                  (fe.l_buf = 3 * fe.lit_bufsize),
                  (fe.level = F),
                  (fe.strategy = ce),
                  (fe.method = H),
                  _(u)
                );
              }
              var y,
                O = l('../utils/common'),
                M = l('./trees'),
                R = l('./adler32'),
                k = l('./crc32'),
                B = l('./messages'),
                D = 0,
                G = 1,
                N = 3,
                ne = 4,
                he = 5,
                Y = 0,
                ye = 1,
                be = -2,
                Ne = -3,
                P = -5,
                X = -1,
                re = 1,
                ae = 2,
                se = 3,
                Ae = 4,
                Ie = 0,
                Fe = 2,
                ze = 8,
                Oe = 9,
                Re = 15,
                He = 8,
                je = 286,
                dt = 30,
                Je = 19,
                We = 2 * je + 1,
                Ze = 15,
                _e = 3,
                Be = 258,
                Ve = Be + _e + 1,
                Qe = 32,
                $e = 42,
                et = 69,
                qe = 73,
                Ke = 91,
                b = 103,
                V = 113,
                j = 666,
                W = 1,
                $ = 2,
                ee = 3,
                me = 4,
                Se = 3;
              ((y = [
                new v(0, 0, 0, 0, function (u, F) {
                  var H = 65535;
                  for (H > u.pending_buf_size - 5 && (H = u.pending_buf_size - 5); ; ) {
                    if (u.lookahead <= 1) {
                      if ((x(u), u.lookahead === 0 && F === D)) return W;
                      if (u.lookahead === 0) break;
                    }
                    ((u.strstart += u.lookahead), (u.lookahead = 0));
                    var T = u.block_start + H;
                    if (
                      ((u.strstart === 0 || u.strstart >= T) &&
                        ((u.lookahead = u.strstart - T),
                        (u.strstart = T),
                        t(u, !1),
                        u.strm.avail_out === 0)) ||
                      (u.strstart - u.block_start >= u.w_size - Ve &&
                        (t(u, !1), u.strm.avail_out === 0))
                    )
                      return W;
                  }
                  return (
                    (u.insert = 0),
                    F === ne
                      ? (t(u, !0), u.strm.avail_out === 0 ? ee : me)
                      : (u.strstart > u.block_start && (t(u, !1), u.strm.avail_out), W)
                  );
                }),
                new v(4, 4, 8, 4, m),
                new v(4, 5, 16, 8, m),
                new v(4, 6, 32, 32, m),
                new v(4, 4, 16, 16, p),
                new v(8, 16, 32, 32, p),
                new v(8, 16, 128, 128, p),
                new v(8, 32, 128, 256, p),
                new v(32, 128, 258, 1024, p),
                new v(32, 258, 258, 4096, p),
              ]),
                (E.deflateInit = function (u, F) {
                  return L(u, F, ze, Re, He, Ie);
                }),
                (E.deflateInit2 = L),
                (E.deflateReset = _),
                (E.deflateResetKeep = d),
                (E.deflateSetHeader = function (u, F) {
                  return u && u.state ? (u.state.wrap !== 2 ? be : ((u.state.gzhead = F), Y)) : be;
                }),
                (E.deflate = function (u, F) {
                  var H, T, te, ce;
                  if (!u || !u.state || F > he || F < 0) return u ? i(u, be) : be;
                  if (
                    ((T = u.state),
                    !u.output || (!u.input && u.avail_in !== 0) || (T.status === j && F !== ne))
                  )
                    return i(u, u.avail_out === 0 ? P : be);
                  if (((T.strm = u), (H = T.last_flush), (T.last_flush = F), T.status === $e))
                    if (T.wrap === 2)
                      ((u.adler = 0),
                        n(T, 31),
                        n(T, 139),
                        n(T, 8),
                        T.gzhead
                          ? (n(
                              T,
                              (T.gzhead.text ? 1 : 0) +
                                (T.gzhead.hcrc ? 2 : 0) +
                                (T.gzhead.extra ? 4 : 0) +
                                (T.gzhead.name ? 8 : 0) +
                                (T.gzhead.comment ? 16 : 0),
                            ),
                            n(T, 255 & T.gzhead.time),
                            n(T, (T.gzhead.time >> 8) & 255),
                            n(T, (T.gzhead.time >> 16) & 255),
                            n(T, (T.gzhead.time >> 24) & 255),
                            n(T, T.level === 9 ? 2 : T.strategy >= ae || T.level < 2 ? 4 : 0),
                            n(T, 255 & T.gzhead.os),
                            T.gzhead.extra &&
                              T.gzhead.extra.length &&
                              (n(T, 255 & T.gzhead.extra.length),
                              n(T, (T.gzhead.extra.length >> 8) & 255)),
                            T.gzhead.hcrc && (u.adler = k(u.adler, T.pending_buf, T.pending, 0)),
                            (T.gzindex = 0),
                            (T.status = et))
                          : (n(T, 0),
                            n(T, 0),
                            n(T, 0),
                            n(T, 0),
                            n(T, 0),
                            n(T, T.level === 9 ? 2 : T.strategy >= ae || T.level < 2 ? 4 : 0),
                            n(T, Se),
                            (T.status = V)));
                    else {
                      var le = (ze + ((T.w_bits - 8) << 4)) << 8;
                      ((le |=
                        (T.strategy >= ae || T.level < 2
                          ? 0
                          : T.level < 6
                            ? 1
                            : T.level === 6
                              ? 2
                              : 3) << 6),
                        T.strstart !== 0 && (le |= Qe),
                        (le += 31 - (le % 31)),
                        (T.status = V),
                        e(T, le),
                        T.strstart !== 0 && (e(T, u.adler >>> 16), e(T, 65535 & u.adler)),
                        (u.adler = 1));
                    }
                  if (T.status === et)
                    if (T.gzhead.extra) {
                      for (
                        te = T.pending;
                        T.gzindex < (65535 & T.gzhead.extra.length) &&
                        (T.pending !== T.pending_buf_size ||
                          (T.gzhead.hcrc &&
                            T.pending > te &&
                            (u.adler = k(u.adler, T.pending_buf, T.pending - te, te)),
                          c(u),
                          (te = T.pending),
                          T.pending !== T.pending_buf_size));

                      )
                        (n(T, 255 & T.gzhead.extra[T.gzindex]), T.gzindex++);
                      (T.gzhead.hcrc &&
                        T.pending > te &&
                        (u.adler = k(u.adler, T.pending_buf, T.pending - te, te)),
                        T.gzindex === T.gzhead.extra.length && ((T.gzindex = 0), (T.status = qe)));
                    } else T.status = qe;
                  if (T.status === qe)
                    if (T.gzhead.name) {
                      te = T.pending;
                      do {
                        if (
                          T.pending === T.pending_buf_size &&
                          (T.gzhead.hcrc &&
                            T.pending > te &&
                            (u.adler = k(u.adler, T.pending_buf, T.pending - te, te)),
                          c(u),
                          (te = T.pending),
                          T.pending === T.pending_buf_size)
                        ) {
                          ce = 1;
                          break;
                        }
                        ((ce =
                          T.gzindex < T.gzhead.name.length
                            ? 255 & T.gzhead.name.charCodeAt(T.gzindex++)
                            : 0),
                          n(T, ce));
                      } while (ce !== 0);
                      (T.gzhead.hcrc &&
                        T.pending > te &&
                        (u.adler = k(u.adler, T.pending_buf, T.pending - te, te)),
                        ce === 0 && ((T.gzindex = 0), (T.status = Ke)));
                    } else T.status = Ke;
                  if (T.status === Ke)
                    if (T.gzhead.comment) {
                      te = T.pending;
                      do {
                        if (
                          T.pending === T.pending_buf_size &&
                          (T.gzhead.hcrc &&
                            T.pending > te &&
                            (u.adler = k(u.adler, T.pending_buf, T.pending - te, te)),
                          c(u),
                          (te = T.pending),
                          T.pending === T.pending_buf_size)
                        ) {
                          ce = 1;
                          break;
                        }
                        ((ce =
                          T.gzindex < T.gzhead.comment.length
                            ? 255 & T.gzhead.comment.charCodeAt(T.gzindex++)
                            : 0),
                          n(T, ce));
                      } while (ce !== 0);
                      (T.gzhead.hcrc &&
                        T.pending > te &&
                        (u.adler = k(u.adler, T.pending_buf, T.pending - te, te)),
                        ce === 0 && (T.status = b));
                    } else T.status = b;
                  if (
                    (T.status === b &&
                      (T.gzhead.hcrc
                        ? (T.pending + 2 > T.pending_buf_size && c(u),
                          T.pending + 2 <= T.pending_buf_size &&
                            (n(T, 255 & u.adler),
                            n(T, (u.adler >> 8) & 255),
                            (u.adler = 0),
                            (T.status = V)))
                        : (T.status = V)),
                    T.pending !== 0)
                  ) {
                    if ((c(u), u.avail_out === 0)) return ((T.last_flush = -1), Y);
                  } else if (u.avail_in === 0 && r(F) <= r(H) && F !== ne) return i(u, P);
                  if (T.status === j && u.avail_in !== 0) return i(u, P);
                  if (u.avail_in !== 0 || T.lookahead !== 0 || (F !== D && T.status !== j)) {
                    var fe =
                      T.strategy === ae
                        ? g(T, F)
                        : T.strategy === se
                          ? I(T, F)
                          : y[T.level].func(T, F);
                    if (((fe !== ee && fe !== me) || (T.status = j), fe === W || fe === ee))
                      return (u.avail_out === 0 && (T.last_flush = -1), Y);
                    if (
                      fe === $ &&
                      (F === G
                        ? M._tr_align(T)
                        : F !== he &&
                          (M._tr_stored_block(T, 0, 0, !1),
                          F === N &&
                            (a(T.head),
                            T.lookahead === 0 &&
                              ((T.strstart = 0), (T.block_start = 0), (T.insert = 0)))),
                      c(u),
                      u.avail_out === 0)
                    )
                      return ((T.last_flush = -1), Y);
                  }
                  return F !== ne
                    ? Y
                    : T.wrap <= 0
                      ? ye
                      : (T.wrap === 2
                          ? (n(T, 255 & u.adler),
                            n(T, (u.adler >> 8) & 255),
                            n(T, (u.adler >> 16) & 255),
                            n(T, (u.adler >> 24) & 255),
                            n(T, 255 & u.total_in),
                            n(T, (u.total_in >> 8) & 255),
                            n(T, (u.total_in >> 16) & 255),
                            n(T, (u.total_in >> 24) & 255))
                          : (e(T, u.adler >>> 16), e(T, 65535 & u.adler)),
                        c(u),
                        T.wrap > 0 && (T.wrap = -T.wrap),
                        T.pending !== 0 ? Y : ye);
                }),
                (E.deflateEnd = function (u) {
                  var F;
                  return u && u.state
                    ? (F = u.state.status) !== $e &&
                      F !== et &&
                      F !== qe &&
                      F !== Ke &&
                      F !== b &&
                      F !== V &&
                      F !== j
                      ? i(u, be)
                      : ((u.state = null), F === V ? i(u, Ne) : Y)
                    : be;
                }),
                (E.deflateSetDictionary = function (u, F) {
                  var H,
                    T,
                    te,
                    ce,
                    le,
                    fe,
                    Ge,
                    ve,
                    tt = F.length;
                  if (
                    !u ||
                    !u.state ||
                    ((H = u.state),
                    (ce = H.wrap) === 2 || (ce === 1 && H.status !== $e) || H.lookahead)
                  )
                    return be;
                  for (
                    ce === 1 && (u.adler = R(u.adler, F, tt, 0)),
                      H.wrap = 0,
                      tt >= H.w_size &&
                        (ce === 0 &&
                          (a(H.head), (H.strstart = 0), (H.block_start = 0), (H.insert = 0)),
                        (ve = new O.Buf8(H.w_size)),
                        O.arraySet(ve, F, tt - H.w_size, H.w_size, 0),
                        (F = ve),
                        (tt = H.w_size)),
                      le = u.avail_in,
                      fe = u.next_in,
                      Ge = u.input,
                      u.avail_in = tt,
                      u.next_in = 0,
                      u.input = F,
                      x(H);
                    H.lookahead >= _e;

                  ) {
                    ((T = H.strstart), (te = H.lookahead - (_e - 1)));
                    do
                      ((H.ins_h = ((H.ins_h << H.hash_shift) ^ H.window[T + _e - 1]) & H.hash_mask),
                        (H.prev[T & H.w_mask] = H.head[H.ins_h]),
                        (H.head[H.ins_h] = T),
                        T++);
                    while (--te);
                    ((H.strstart = T), (H.lookahead = _e - 1), x(H));
                  }
                  return (
                    (H.strstart += H.lookahead),
                    (H.block_start = H.strstart),
                    (H.insert = H.lookahead),
                    (H.lookahead = 0),
                    (H.match_length = H.prev_length = _e - 1),
                    (H.match_available = 0),
                    (u.next_in = fe),
                    (u.input = Ge),
                    (u.avail_in = le),
                    (H.wrap = ce),
                    Y
                  );
                }),
                (E.deflateInfo = 'pako deflate (from Nodeca project)'));
            },
            { '../utils/common': 1, './adler32': 3, './crc32': 4, './messages': 6, './trees': 7 },
          ],
          6: [
            function (l, f, E) {
              'use strict';
              f.exports = {
                2: 'need dictionary',
                1: 'stream end',
                0: '',
                '-1': 'file error',
                '-2': 'stream error',
                '-3': 'data error',
                '-4': 'insufficient memory',
                '-5': 'buffer error',
                '-6': 'incompatible version',
              };
            },
            {},
          ],
          7: [
            function (l, f, E) {
              'use strict';
              function i(b) {
                for (var V = b.length; --V >= 0; ) b[V] = 0;
              }
              function r(b, V, j, W, $) {
                ((this.static_tree = b),
                  (this.extra_bits = V),
                  (this.extra_base = j),
                  (this.elems = W),
                  (this.max_length = $),
                  (this.has_stree = b && b.length));
              }
              function a(b, V) {
                ((this.dyn_tree = b), (this.max_code = 0), (this.stat_desc = V));
              }
              function c(b) {
                return b < 256 ? _e[b] : _e[256 + (b >>> 7)];
              }
              function t(b, V) {
                ((b.pending_buf[b.pending++] = 255 & V),
                  (b.pending_buf[b.pending++] = (V >>> 8) & 255));
              }
              function n(b, V, j) {
                b.bi_valid > Ae - j
                  ? ((b.bi_buf |= (V << b.bi_valid) & 65535),
                    t(b, b.bi_buf),
                    (b.bi_buf = V >> (Ae - b.bi_valid)),
                    (b.bi_valid += j - Ae))
                  : ((b.bi_buf |= (V << b.bi_valid) & 65535), (b.bi_valid += j));
              }
              function e(b, V, j) {
                n(b, j[2 * V], j[2 * V + 1]);
              }
              function o(b, V) {
                var j = 0;
                do ((j |= 1 & b), (b >>>= 1), (j <<= 1));
                while (--V > 0);
                return j >>> 1;
              }
              function s(b) {
                b.bi_valid === 16
                  ? (t(b, b.bi_buf), (b.bi_buf = 0), (b.bi_valid = 0))
                  : b.bi_valid >= 8 &&
                    ((b.pending_buf[b.pending++] = 255 & b.bi_buf),
                    (b.bi_buf >>= 8),
                    (b.bi_valid -= 8));
              }
              function x(b, V) {
                var j,
                  W,
                  $,
                  ee,
                  me,
                  Se,
                  u = V.dyn_tree,
                  F = V.max_code,
                  H = V.stat_desc.static_tree,
                  T = V.stat_desc.has_stree,
                  te = V.stat_desc.extra_bits,
                  ce = V.stat_desc.extra_base,
                  le = V.stat_desc.max_length,
                  fe = 0;
                for (ee = 0; ee <= se; ee++) b.bl_count[ee] = 0;
                for (u[2 * b.heap[b.heap_max] + 1] = 0, j = b.heap_max + 1; j < ae; j++)
                  ((ee = u[2 * u[2 * (W = b.heap[j]) + 1] + 1] + 1) > le && ((ee = le), fe++),
                    (u[2 * W + 1] = ee),
                    W > F ||
                      (b.bl_count[ee]++,
                      (me = 0),
                      W >= ce && (me = te[W - ce]),
                      (Se = u[2 * W]),
                      (b.opt_len += Se * (ee + me)),
                      T && (b.static_len += Se * (H[2 * W + 1] + me))));
                if (fe !== 0) {
                  do {
                    for (ee = le - 1; b.bl_count[ee] === 0; ) ee--;
                    (b.bl_count[ee]--, (b.bl_count[ee + 1] += 2), b.bl_count[le]--, (fe -= 2));
                  } while (fe > 0);
                  for (ee = le; ee !== 0; ee--)
                    for (W = b.bl_count[ee]; W !== 0; )
                      ($ = b.heap[--j]) > F ||
                        (u[2 * $ + 1] !== ee &&
                          ((b.opt_len += (ee - u[2 * $ + 1]) * u[2 * $]), (u[2 * $ + 1] = ee)),
                        W--);
                }
              }
              function m(b, V, j) {
                var W,
                  $,
                  ee = new Array(se + 1),
                  me = 0;
                for (W = 1; W <= se; W++) ee[W] = me = (me + j[W - 1]) << 1;
                for ($ = 0; $ <= V; $++) {
                  var Se = b[2 * $ + 1];
                  Se !== 0 && (b[2 * $] = o(ee[Se]++, Se));
                }
              }
              function p() {
                var b,
                  V,
                  j,
                  W,
                  $,
                  ee = new Array(se + 1);
                for (j = 0, W = 0; W < be - 1; W++)
                  for (Ve[W] = j, b = 0; b < 1 << He[W]; b++) Be[j++] = W;
                for (Be[j - 1] = W, $ = 0, W = 0; W < 16; W++)
                  for (Qe[W] = $, b = 0; b < 1 << je[W]; b++) _e[$++] = W;
                for ($ >>= 7; W < X; W++)
                  for (Qe[W] = $ << 7, b = 0; b < 1 << (je[W] - 7); b++) _e[256 + $++] = W;
                for (V = 0; V <= se; V++) ee[V] = 0;
                for (b = 0; b <= 143; ) ((We[2 * b + 1] = 8), b++, ee[8]++);
                for (; b <= 255; ) ((We[2 * b + 1] = 9), b++, ee[9]++);
                for (; b <= 279; ) ((We[2 * b + 1] = 7), b++, ee[7]++);
                for (; b <= 287; ) ((We[2 * b + 1] = 8), b++, ee[8]++);
                for (m(We, P + 1, ee), b = 0; b < X; b++)
                  ((Ze[2 * b + 1] = 5), (Ze[2 * b] = o(b, 5)));
                (($e = new r(We, He, Ne + 1, P, se)),
                  (et = new r(Ze, je, 0, X, se)),
                  (qe = new r(new Array(0), dt, 0, re, Ie)));
              }
              function I(b) {
                var V;
                for (V = 0; V < P; V++) b.dyn_ltree[2 * V] = 0;
                for (V = 0; V < X; V++) b.dyn_dtree[2 * V] = 0;
                for (V = 0; V < re; V++) b.bl_tree[2 * V] = 0;
                ((b.dyn_ltree[2 * Fe] = 1),
                  (b.opt_len = b.static_len = 0),
                  (b.last_lit = b.matches = 0));
              }
              function g(b) {
                (b.bi_valid > 8
                  ? t(b, b.bi_buf)
                  : b.bi_valid > 0 && (b.pending_buf[b.pending++] = b.bi_buf),
                  (b.bi_buf = 0),
                  (b.bi_valid = 0));
              }
              function v(b, V, j, W) {
                (g(b),
                  W && (t(b, j), t(b, ~j)),
                  B.arraySet(b.pending_buf, b.window, V, j, b.pending),
                  (b.pending += j));
              }
              function A(b, V, j, W) {
                var $ = 2 * V,
                  ee = 2 * j;
                return b[$] < b[ee] || (b[$] === b[ee] && W[V] <= W[j]);
              }
              function S(b, V, j) {
                for (
                  var W = b.heap[j], $ = j << 1;
                  $ <= b.heap_len &&
                  ($ < b.heap_len && A(V, b.heap[$ + 1], b.heap[$], b.depth) && $++,
                  !A(V, W, b.heap[$], b.depth));

                )
                  ((b.heap[j] = b.heap[$]), (j = $), ($ <<= 1));
                b.heap[j] = W;
              }
              function d(b, V, j) {
                var W,
                  $,
                  ee,
                  me,
                  Se = 0;
                if (b.last_lit !== 0)
                  do
                    ((W =
                      (b.pending_buf[b.d_buf + 2 * Se] << 8) | b.pending_buf[b.d_buf + 2 * Se + 1]),
                      ($ = b.pending_buf[b.l_buf + Se]),
                      Se++,
                      W === 0
                        ? e(b, $, V)
                        : (e(b, (ee = Be[$]) + Ne + 1, V),
                          (me = He[ee]) !== 0 && n(b, ($ -= Ve[ee]), me),
                          e(b, (ee = c(--W)), j),
                          (me = je[ee]) !== 0 && n(b, (W -= Qe[ee]), me)));
                  while (Se < b.last_lit);
                e(b, Fe, V);
              }
              function _(b, V) {
                var j,
                  W,
                  $,
                  ee = V.dyn_tree,
                  me = V.stat_desc.static_tree,
                  Se = V.stat_desc.has_stree,
                  u = V.stat_desc.elems,
                  F = -1;
                for (b.heap_len = 0, b.heap_max = ae, j = 0; j < u; j++)
                  ee[2 * j] !== 0
                    ? ((b.heap[++b.heap_len] = F = j), (b.depth[j] = 0))
                    : (ee[2 * j + 1] = 0);
                for (; b.heap_len < 2; )
                  ((ee[2 * ($ = b.heap[++b.heap_len] = F < 2 ? ++F : 0)] = 1),
                    (b.depth[$] = 0),
                    b.opt_len--,
                    Se && (b.static_len -= me[2 * $ + 1]));
                for (V.max_code = F, j = b.heap_len >> 1; j >= 1; j--) S(b, ee, j);
                $ = u;
                do
                  ((j = b.heap[1]),
                    (b.heap[1] = b.heap[b.heap_len--]),
                    S(b, ee, 1),
                    (W = b.heap[1]),
                    (b.heap[--b.heap_max] = j),
                    (b.heap[--b.heap_max] = W),
                    (ee[2 * $] = ee[2 * j] + ee[2 * W]),
                    (b.depth[$] = (b.depth[j] >= b.depth[W] ? b.depth[j] : b.depth[W]) + 1),
                    (ee[2 * j + 1] = ee[2 * W + 1] = $),
                    (b.heap[1] = $++),
                    S(b, ee, 1));
                while (b.heap_len >= 2);
                ((b.heap[--b.heap_max] = b.heap[1]), x(b, V), m(ee, F, b.bl_count));
              }
              function L(b, V, j) {
                var W,
                  $,
                  ee = -1,
                  me = V[1],
                  Se = 0,
                  u = 7,
                  F = 4;
                for (
                  me === 0 && ((u = 138), (F = 3)), V[2 * (j + 1) + 1] = 65535, W = 0;
                  W <= j;
                  W++
                )
                  (($ = me),
                    (me = V[2 * (W + 1) + 1]),
                    (++Se < u && $ === me) ||
                      (Se < F
                        ? (b.bl_tree[2 * $] += Se)
                        : $ !== 0
                          ? ($ !== ee && b.bl_tree[2 * $]++, b.bl_tree[2 * ze]++)
                          : Se <= 10
                            ? b.bl_tree[2 * Oe]++
                            : b.bl_tree[2 * Re]++,
                      (Se = 0),
                      (ee = $),
                      me === 0
                        ? ((u = 138), (F = 3))
                        : $ === me
                          ? ((u = 6), (F = 3))
                          : ((u = 7), (F = 4))));
              }
              function y(b, V, j) {
                var W,
                  $,
                  ee = -1,
                  me = V[1],
                  Se = 0,
                  u = 7,
                  F = 4;
                for (me === 0 && ((u = 138), (F = 3)), W = 0; W <= j; W++)
                  if ((($ = me), (me = V[2 * (W + 1) + 1]), !(++Se < u && $ === me))) {
                    if (Se < F)
                      do e(b, $, b.bl_tree);
                      while (--Se != 0);
                    else
                      $ !== 0
                        ? ($ !== ee && (e(b, $, b.bl_tree), Se--),
                          e(b, ze, b.bl_tree),
                          n(b, Se - 3, 2))
                        : Se <= 10
                          ? (e(b, Oe, b.bl_tree), n(b, Se - 3, 3))
                          : (e(b, Re, b.bl_tree), n(b, Se - 11, 7));
                    ((Se = 0),
                      (ee = $),
                      me === 0
                        ? ((u = 138), (F = 3))
                        : $ === me
                          ? ((u = 6), (F = 3))
                          : ((u = 7), (F = 4)));
                  }
              }
              function O(b) {
                var V;
                for (
                  L(b, b.dyn_ltree, b.l_desc.max_code),
                    L(b, b.dyn_dtree, b.d_desc.max_code),
                    _(b, b.bl_desc),
                    V = re - 1;
                  V >= 3 && b.bl_tree[2 * Je[V] + 1] === 0;
                  V--
                );
                return ((b.opt_len += 3 * (V + 1) + 5 + 5 + 4), V);
              }
              function M(b, V, j, W) {
                var $;
                for (n(b, V - 257, 5), n(b, j - 1, 5), n(b, W - 4, 4), $ = 0; $ < W; $++)
                  n(b, b.bl_tree[2 * Je[$] + 1], 3);
                (y(b, b.dyn_ltree, V - 1), y(b, b.dyn_dtree, j - 1));
              }
              function R(b) {
                var V,
                  j = 4093624447;
                for (V = 0; V <= 31; V++, j >>>= 1) if (1 & j && b.dyn_ltree[2 * V] !== 0) return G;
                if (b.dyn_ltree[18] !== 0 || b.dyn_ltree[20] !== 0 || b.dyn_ltree[26] !== 0)
                  return N;
                for (V = 32; V < Ne; V++) if (b.dyn_ltree[2 * V] !== 0) return N;
                return G;
              }
              function k(b, V, j, W) {
                (n(b, (he << 1) + (W ? 1 : 0), 3), v(b, V, j, !0));
              }
              var B = l('../utils/common'),
                D = 4,
                G = 0,
                N = 1,
                ne = 2,
                he = 0,
                Y = 1,
                ye = 2,
                be = 29,
                Ne = 256,
                P = Ne + 1 + be,
                X = 30,
                re = 19,
                ae = 2 * P + 1,
                se = 15,
                Ae = 16,
                Ie = 7,
                Fe = 256,
                ze = 16,
                Oe = 17,
                Re = 18,
                He = [
                  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5,
                  5, 0,
                ],
                je = [
                  0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
                  12, 12, 13, 13,
                ],
                dt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7],
                Je = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
                We = new Array(2 * (P + 2));
              i(We);
              var Ze = new Array(2 * X);
              i(Ze);
              var _e = new Array(512);
              i(_e);
              var Be = new Array(256);
              i(Be);
              var Ve = new Array(be);
              i(Ve);
              var Qe = new Array(X);
              i(Qe);
              var $e,
                et,
                qe,
                Ke = !1;
              ((E._tr_init = function (b) {
                (Ke || (p(), (Ke = !0)),
                  (b.l_desc = new a(b.dyn_ltree, $e)),
                  (b.d_desc = new a(b.dyn_dtree, et)),
                  (b.bl_desc = new a(b.bl_tree, qe)),
                  (b.bi_buf = 0),
                  (b.bi_valid = 0),
                  I(b));
              }),
                (E._tr_stored_block = k),
                (E._tr_flush_block = function (b, V, j, W) {
                  var $,
                    ee,
                    me = 0;
                  (b.level > 0
                    ? (b.strm.data_type === ne && (b.strm.data_type = R(b)),
                      _(b, b.l_desc),
                      _(b, b.d_desc),
                      (me = O(b)),
                      ($ = (b.opt_len + 3 + 7) >>> 3),
                      (ee = (b.static_len + 3 + 7) >>> 3) <= $ && ($ = ee))
                    : ($ = ee = j + 5),
                    j + 4 <= $ && V !== -1
                      ? k(b, V, j, W)
                      : b.strategy === D || ee === $
                        ? (n(b, (Y << 1) + (W ? 1 : 0), 3), d(b, We, Ze))
                        : (n(b, (ye << 1) + (W ? 1 : 0), 3),
                          M(b, b.l_desc.max_code + 1, b.d_desc.max_code + 1, me + 1),
                          d(b, b.dyn_ltree, b.dyn_dtree)),
                    I(b),
                    W && g(b));
                }),
                (E._tr_tally = function (b, V, j) {
                  return (
                    (b.pending_buf[b.d_buf + 2 * b.last_lit] = (V >>> 8) & 255),
                    (b.pending_buf[b.d_buf + 2 * b.last_lit + 1] = 255 & V),
                    (b.pending_buf[b.l_buf + b.last_lit] = 255 & j),
                    b.last_lit++,
                    V === 0
                      ? b.dyn_ltree[2 * j]++
                      : (b.matches++,
                        V--,
                        b.dyn_ltree[2 * (Be[j] + Ne + 1)]++,
                        b.dyn_dtree[2 * c(V)]++),
                    b.last_lit === b.lit_bufsize - 1
                  );
                }),
                (E._tr_align = function (b) {
                  (n(b, Y << 1, 3), e(b, Fe, We), s(b));
                }));
            },
            { '../utils/common': 1 },
          ],
          8: [
            function (l, f, E) {
              'use strict';
              f.exports = function () {
                ((this.input = null),
                  (this.next_in = 0),
                  (this.avail_in = 0),
                  (this.total_in = 0),
                  (this.output = null),
                  (this.next_out = 0),
                  (this.avail_out = 0),
                  (this.total_out = 0),
                  (this.msg = ''),
                  (this.state = null),
                  (this.data_type = 2),
                  (this.adler = 0));
              };
            },
            {},
          ],
          '/lib/deflate.js': [
            function (l, f, E) {
              'use strict';
              function i(I) {
                if (!(this instanceof i)) return new i(I);
                this.options = c.assign(
                  {
                    level: x,
                    method: p,
                    chunkSize: 16384,
                    windowBits: 15,
                    memLevel: 8,
                    strategy: m,
                    to: '',
                  },
                  I || {},
                );
                var g = this.options;
                (g.raw && g.windowBits > 0
                  ? (g.windowBits = -g.windowBits)
                  : g.gzip && g.windowBits > 0 && g.windowBits < 16 && (g.windowBits += 16),
                  (this.err = 0),
                  (this.msg = ''),
                  (this.ended = !1),
                  (this.chunks = []),
                  (this.strm = new e()),
                  (this.strm.avail_out = 0));
                var v = a.deflateInit2(
                  this.strm,
                  g.level,
                  g.method,
                  g.windowBits,
                  g.memLevel,
                  g.strategy,
                );
                if (v !== s) throw new Error(n[v]);
                if ((g.header && a.deflateSetHeader(this.strm, g.header), g.dictionary)) {
                  var A;
                  if (
                    ((A =
                      typeof g.dictionary == 'string'
                        ? t.string2buf(g.dictionary)
                        : o.call(g.dictionary) === '[object ArrayBuffer]'
                          ? new Uint8Array(g.dictionary)
                          : g.dictionary),
                    (v = a.deflateSetDictionary(this.strm, A)) !== s)
                  )
                    throw new Error(n[v]);
                  this._dict_set = !0;
                }
              }
              function r(I, g) {
                var v = new i(g);
                if ((v.push(I, !0), v.err)) throw v.msg || n[v.err];
                return v.result;
              }
              var a = l('./zlib/deflate'),
                c = l('./utils/common'),
                t = l('./utils/strings'),
                n = l('./zlib/messages'),
                e = l('./zlib/zstream'),
                o = Object.prototype.toString,
                s = 0,
                x = -1,
                m = 0,
                p = 8;
              ((i.prototype.push = function (I, g) {
                var v,
                  A,
                  S = this.strm,
                  d = this.options.chunkSize;
                if (this.ended) return !1;
                ((A = g === ~~g ? g : g === !0 ? 4 : 0),
                  typeof I == 'string'
                    ? (S.input = t.string2buf(I))
                    : o.call(I) === '[object ArrayBuffer]'
                      ? (S.input = new Uint8Array(I))
                      : (S.input = I),
                  (S.next_in = 0),
                  (S.avail_in = S.input.length));
                do {
                  if (
                    (S.avail_out === 0 &&
                      ((S.output = new c.Buf8(d)), (S.next_out = 0), (S.avail_out = d)),
                    (v = a.deflate(S, A)) !== 1 && v !== s)
                  )
                    return (this.onEnd(v), (this.ended = !0), !1);
                  (S.avail_out !== 0 && (S.avail_in !== 0 || (A !== 4 && A !== 2))) ||
                    (this.options.to === 'string'
                      ? this.onData(t.buf2binstring(c.shrinkBuf(S.output, S.next_out)))
                      : this.onData(c.shrinkBuf(S.output, S.next_out)));
                } while ((S.avail_in > 0 || S.avail_out === 0) && v !== 1);
                return A === 4
                  ? ((v = a.deflateEnd(this.strm)), this.onEnd(v), (this.ended = !0), v === s)
                  : A !== 2 || (this.onEnd(s), (S.avail_out = 0), !0);
              }),
                (i.prototype.onData = function (I) {
                  this.chunks.push(I);
                }),
                (i.prototype.onEnd = function (I) {
                  (I === s &&
                    (this.options.to === 'string'
                      ? (this.result = this.chunks.join(''))
                      : (this.result = c.flattenChunks(this.chunks))),
                    (this.chunks = []),
                    (this.err = I),
                    (this.msg = this.strm.msg));
                }),
                (E.Deflate = i),
                (E.deflate = r),
                (E.deflateRaw = function (I, g) {
                  return ((g = g || {}), (g.raw = !0), r(I, g));
                }),
                (E.gzip = function (I, g) {
                  return ((g = g || {}), (g.gzip = !0), r(I, g));
                }));
            },
            {
              './utils/common': 1,
              './utils/strings': 2,
              './zlib/deflate': 5,
              './zlib/messages': 6,
              './zlib/zstream': 8,
            },
          ],
        },
        {},
        [],
      )('/lib/deflate.js');
    }));
  var _POSignalsEntities;
  (function (l) {
    let f;
    (function (E) {
      class i {
        constructor() {
          ((this._isIphoneOrIPad = !1),
            (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) &&
              (this._isIphoneOrIPad = !0),
            this.initUAParser());
        }
        get userAgentData() {
          return this._userAgentData;
        }
        get deviceType() {
          return (
            this._deviceType ||
              (E.Util.isMobile
                ? (this._deviceType = this.mobileType || this.desktopType || i.UNKNOWN_DEVICE_TYPE)
                : (this._deviceType =
                    this.desktopType || this.mobileType || i.UNKNOWN_DEVICE_TYPE)),
            this._deviceType
          );
        }
        get isIphoneOrIPad() {
          return this._isIphoneOrIPad;
        }
        get browserName() {
          return this._userAgentData &&
            this._userAgentData.browser &&
            this._userAgentData.browser.name
            ? this._userAgentData.browser.name.trim()
            : '';
        }
        get browserVersion() {
          return this._userAgentData &&
            this._userAgentData.browser &&
            this._userAgentData.browser.version
            ? this._userAgentData.browser.version.trim()
            : '';
        }
        get browserMajor() {
          return this._userAgentData &&
            this._userAgentData.browser &&
            this._userAgentData.browser.major
            ? this._userAgentData.browser.major.trim()
            : '';
        }
        get browserType() {
          return this._userAgentData &&
            this._userAgentData.browser &&
            this._userAgentData.browser.type
            ? this._userAgentData.browser.type.trim()
            : '';
        }
        get osName() {
          return this._userAgentData && this._userAgentData.os && this._userAgentData.os.name
            ? this._userAgentData.os.name.trim()
            : '';
        }
        get osVersion() {
          return this._userAgentData && this._userAgentData.os && this._userAgentData.os.version
            ? this._userAgentData.os.version.trim()
            : '';
        }
        get deviceCategory() {
          return this._userAgentData &&
            this._userAgentData.device &&
            this._userAgentData.device.type
            ? this._userAgentData.device.type.trim()
            : '';
        }
        get engineName() {
          return this._userAgentData &&
            this._userAgentData.engine &&
            this._userAgentData.engine.name
            ? this._userAgentData.engine.name.trim()
            : '';
        }
        get engineVersion() {
          return this._userAgentData &&
            this._userAgentData.engine &&
            this._userAgentData.engine.version
            ? this._userAgentData.engine.version.trim()
            : '';
        }
        get cpuArchitecture() {
          return this._userAgentData &&
            this._userAgentData.cpu &&
            this._userAgentData.cpu.architecture
            ? this._userAgentData.cpu.architecture.trim()
            : '';
        }
        get deviceModel() {
          return this._userAgentData &&
            this._userAgentData.device &&
            this._userAgentData.device.model
            ? this._userAgentData.device.model.trim()
            : '';
        }
        get deviceVendor() {
          return this._userAgentData &&
            this._userAgentData.device &&
            this._userAgentData.device.vendor
            ? this._userAgentData.device.vendor.trim()
            : '';
        }
        get desktopType() {
          let a = this.browserName;
          this.browserVersion && (a = a + `(${this.browserVersion})`);
          let c = this.osName;
          this.osVersion && (c = c + `(${this.osVersion})`);
          const t = a && c ? `${a}-${c}` : a || c;
          return t ? t.trim() : '';
        }
        get mobileType() {
          const a = this.deviceModel,
            c = this.deviceVendor,
            t = a && c ? `${a} ${c}` : a || c;
          return t ? t.trim() : '';
        }
        initUAParser() {
          try {
            const a = new l.UAParser();
            (a.setUA(navigator.userAgent), (this._userAgentData = a.getResult()));
          } catch (a) {
            E.Logger.warn('UAParser failure', a);
          }
        }
      }
      ((i.UNKNOWN_DEVICE_TYPE = 'unknown'), (E.BrowserInfo = i));
    })((f = l._POSignalsUtils || (l._POSignalsUtils = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    let f;
    (function (E) {
      class i {
        static get CLIENT_VERSION() {
          return '5.6.9w';
        }
        static get SALT() {
          return 'ST8irbd3bB';
        }
        static get TAB_UUID_KEY() {
          return 'pos_tid';
        }
        static get OPS_KEY() {
          return 'pos_ops';
        }
        static get DEVICE_ID_KEY() {
          return 'SecuredTouchDeviceId';
        }
        static get DEVICE_ID_CREATED_AT() {
          return 'pos_dca';
        }
        static get LAST_DEVICE_KEY_RESYNC() {
          return 'DeviceRefreshDate';
        }
        static get CAPTURED_KEYBOARD_INTERACTIONS() {
          return 'pos_cki';
        }
        static get CAPTURED_MOUSE_INTERACTIONS() {
          return 'pos_cmi';
        }
        static get CAPTURED_GESTURES() {
          return 'pos_cg';
        }
        static get CAPTURED_INDIRECT() {
          return 'pos_cie';
        }
        static get CAPTURED_TAGS() {
          return 'pos_ct';
        }
        static get CAPTURED_MOUSE_INTERACTIONS_SUMMARY() {
          return 'pos_mdp';
        }
        static get KEYBOARD_INTERACTIONS_COUNT() {
          return 'pos_kic';
        }
        static get MOUSE_INTERACTIONS_COUNT() {
          return 'pos_mic';
        }
        static get GESTURES_COUNT() {
          return 'pos_gc';
        }
        static get EVENT_COUNTERS() {
          return 'pos_ec';
        }
        static get PINGID_AGENT_DEFAULT_PORT() {
          return 9400;
        }
        static get PINGID_AGENT_DEFAULT_TIMEOUT() {
          return 1e3;
        }
        static get MOUSE_EVENT_COUNTERS() {
          return 'pos_mec';
        }
        static get KEYBOARD_EVENT_COUNTERS() {
          return 'pos_kec';
        }
        static get TOUCH_EVENT_COUNTERS() {
          return 'pos_tec';
        }
        static get INDIRECT_EVENT_COUNTERS() {
          return 'pos_iec';
        }
        static get GeoDataKey() {
          return 'pos_geo';
        }
      }
      E.Constants = i;
    })((f = l._POSignalsUtils || (l._POSignalsUtils = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    let f;
    (function (E) {
      class i {
        constructor(a = 'ECDSA', c = ['sign', 'verify'], t = 'SHA-256') {
          if (
            ((this.signingKeyType = a),
            (this.keyUsage = c),
            (this.algorithm = t),
            (this._crypto = window.crypto || window.msCrypto),
            !this._crypto || !this._crypto.subtle)
          )
            throw new Error('Cryptography API not supported in this browser');
        }
        hexDecode(a) {
          let c = '';
          for (let t = 0; t < a.length; t += 2)
            c += String.fromCharCode(parseInt(a.substr(t, 2), 16));
          return c;
        }
        async generateKeys() {
          return this._crypto.subtle.generateKey(
            { name: this.signingKeyType, namedCurve: 'P-256' },
            !1,
            this.keyUsage,
          );
        }
        async exportPublicKey(a) {
          const c = await this._crypto.subtle.exportKey('spki', a.publicKey),
            t = E.Util.ab2str(c),
            n = btoa(t),
            e = this.hexDecode('2d2d2d2d2d424547494e205055424c4943204b45592d2d2d2d2d0a'),
            o = this.hexDecode('0a2d2d2d2d2d454e44205055424c4943204b45592d2d2d2d2d'),
            s = `${e}${n}${o}`;
          return (E.Logger.debug('Exported base64 pub key: ', s), s);
        }
        async exportPublicKeyJwk(a) {
          return await window.crypto.subtle.exportKey('jwk', a.publicKey);
        }
        async exportPrivateKey(a) {
          const c = await this._crypto.subtle.exportKey('pkcs8', a.privateKey),
            t = E.Util.ab2str(c),
            n = btoa(t),
            e = this.hexDecode('2d2d2d2d2d424547494e2050524956415445204b45592d2d2d2d2d0a'),
            o = this.hexDecode('0a2d2d2d2d2d454e442050524956415445204b45592d2d2d2d2d'),
            s = `${e}${n}${o}`;
          return (E.Logger.debug('Exported base64 pem:', s), s);
        }
        async signJWT(a, c, t = 0, n, e) {
          const s = { alg: 'ES256', typ: 'JWT', jwk: await this.exportPublicKeyJwk(c), kid: e },
            x = { deviceAttributesSerialized: a, iat: Math.floor(n / 1e3) };
          if (!c.privateKey) throw new Error('Require key');
          if (s.alg !== 'ES256' && s.typ !== 'JWT')
            throw new Error('jwt-encode only support the ES256 algorithm and the JWT type of hash');
          const m = E.Util.encode(s),
            p = E.Util.encode(x),
            I = `${m}.${p}`,
            g = E.Util.string2buf(I),
            v = await this._crypto.subtle.sign(
              { name: this.signingKeyType, hash: this.algorithm },
              c.privateKey,
              g,
            ),
            A = E.Util.base64url(btoa(E.Util.ab2str(v)));
          return (E.Logger.debug('Signed JWT: ', `${I}.${A}`), `${I}.${A}`);
        }
        async verifyJwtToken(a, c) {
          const [t, n, e] = a.split('.'),
            o = E.Util.parseJwt(t);
          if (o.alg !== 'ES256' && o.typ !== 'JWT')
            throw new Error('JWT header supports only ES256 algorithm and the JWT type of hash');
          const s = E.Util.parseJwt(n),
            x = Uint8Array.from(atob(e.replace(/-/g, '+').replace(/_/g, '/')), (I) =>
              I.charCodeAt(0),
            ),
            m = E.Util.string2buf(`${t}.${n}`);
          return await this._crypto.subtle.verify(
            { name: this.signingKeyType, hash: this.algorithm },
            c,
            x,
            m,
          );
        }
      }
      E.CryptoOperator = i;
    })((f = l._POSignalsUtils || (l._POSignalsUtils = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    let f;
    (function (E) {
      class i {
        static get isLogEnabled() {
          return this._isLogEnabled || window['enable-logs-pingOneSignals'];
        }
        static set isLogEnabled(a) {
          this._isLogEnabled = a;
        }
        static debug(a, ...c) {
          ((a = `${i.TAG} ${a}`),
            i.isLogEnabled &&
              (c && c.length > 0
                ? console.debug
                  ? console.debug(a, c)
                  : console.log(a, c)
                : console.debug
                  ? console.debug(a)
                  : console.log(a)));
        }
        static error(a, ...c) {
          ((a = `${i.TAG} ${a}`),
            i.isLogEnabled && (c && c.length > 0 ? console.error(a, c) : console.error(a)));
        }
        static warn(a, ...c) {
          ((a = `${i.TAG} ${a}`),
            i.isLogEnabled && (c && c.length > 0 ? console.warn(a, c) : console.warn(a)));
        }
        static info(a, ...c) {
          ((a = `${i.TAG} ${a}`),
            i.isLogEnabled && (c && c.length > 0 ? console.info(a, c) : console.info(a)));
        }
      }
      ((i.TAG = '[SignalsSDK]'), (E.Logger = i));
    })((f = l._POSignalsUtils || (l._POSignalsUtils = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    let f;
    (function (E) {
      class i {
        static get INITIALIZATION_ERROR() {
          return 'INITIALIZATION_ERROR';
        }
        static get UNEXPECTED_ERROR() {
          return 'UNEXPECTED_ERROR';
        }
      }
      E.POErrorCodes = i;
    })((f = l._POSignalsUtils || (l._POSignalsUtils = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  const Browser = {
      115: '115',
      2345: '2345',
      360: '360',
      ALIPAY: 'Alipay',
      AMAYA: 'Amaya',
      ANDROID: 'Android Browser',
      ARORA: 'Arora',
      AVANT: 'Avant',
      AVAST: 'Avast Secure Browser',
      AVG: 'AVG Secure Browser',
      BAIDU: 'Baidu Browser',
      BASILISK: 'Basilisk',
      BLAZER: 'Blazer',
      BOLT: 'Bolt',
      BOWSER: 'Bowser',
      BRAVE: 'Brave',
      CAMINO: 'Camino',
      CHIMERA: 'Chimera',
      CHROME: 'Chrome',
      CHROME_HEADLESS: 'Chrome Headless',
      CHROME_MOBILE: 'Mobile Chrome',
      CHROME_WEBVIEW: 'Chrome WebView',
      CHROMIUM: 'Chromium',
      COBALT: 'Cobalt',
      COC_COC: 'Coc Coc',
      CONKEROR: 'Conkeror',
      DAUM: 'Daum',
      DILLO: 'Dillo',
      DOLPHIN: 'Dolphin',
      DORIS: 'Doris',
      DRAGON: 'Dragon',
      DUCKDUCKGO: 'DuckDuckGo',
      EDGE: 'Edge',
      EPIPHANY: 'Epiphany',
      FACEBOOK: 'Facebook',
      FALKON: 'Falkon',
      FIREBIRD: 'Firebird',
      FIREFOX: 'Firefox',
      FIREFOX_FOCUS: 'Firefox Focus',
      FIREFOX_MOBILE: 'Mobile Firefox',
      FIREFOX_REALITY: 'Firefox Reality',
      FENNEC: 'Fennec',
      FLOCK: 'Flock',
      FLOW: 'Flow',
      GO: 'GoBrowser',
      GOOGLE_SEARCH: 'GSA',
      HELIO: 'Helio',
      HEYTAP: 'HeyTap',
      HONOR: 'Honor',
      HUAWEI: 'Huawei Browser',
      ICAB: 'iCab',
      ICE: 'ICE Browser',
      ICEAPE: 'IceApe',
      ICECAT: 'IceCat',
      ICEDRAGON: 'IceDragon',
      ICEWEASEL: 'IceWeasel',
      IE: 'IE',
      INSTAGRAM: 'Instagram',
      IRIDIUM: 'Iridium',
      IRON: 'Iron',
      JASMINE: 'Jasmine',
      KONQUEROR: 'Konqueror',
      KAKAO: 'KakaoTalk',
      KHTML: 'KHTML',
      K_MELEON: 'K-Meleon',
      KLAR: 'Klar',
      KLARNA: 'Klarna',
      KINDLE: 'Kindle',
      LENOVO: 'Smart Lenovo Browser',
      LADYBIRD: 'Ladybird',
      LIBREWOLF: 'LibreWolf',
      LIEBAO: 'LBBROWSER',
      LINE: 'Line',
      LINKEDIN: 'LinkedIn',
      LINKS: 'Links',
      LUNASCAPE: 'Lunascape',
      LYNX: 'Lynx',
      MAEMO: 'Maemo Browser',
      MAXTHON: 'Maxthon',
      MIDORI: 'Midori',
      MINIMO: 'Minimo',
      MIUI: 'MIUI Browser',
      MOZILLA: 'Mozilla',
      MOSAIC: 'Mosaic',
      NAVER: 'Naver',
      NETFRONT: 'NetFront',
      NETSCAPE: 'Netscape',
      NETSURF: 'Netsurf',
      NOKIA: 'Nokia Browser',
      OBIGO: 'Obigo',
      OCULUS: 'Oculus Browser',
      OMNIWEB: 'OmniWeb',
      OPERA: 'Opera',
      OPERA_COAST: 'Opera Coast',
      OPERA_GX: 'Opera GX',
      OPERA_MINI: 'Opera Mini',
      OPERA_MOBI: 'Opera Mobi',
      OPERA_TABLET: 'Opera Tablet',
      OPERA_TOUCH: 'Opera Touch',
      OVI: 'OviBrowser',
      PALEMOON: 'PaleMoon',
      PHANTOMJS: 'PhantomJS',
      PHOENIX: 'Phoenix',
      PICOBROWSER: 'Pico Browser',
      POLARIS: 'Polaris',
      PUFFIN: 'Puffin',
      QQ: 'QQBrowser',
      QQ_LITE: 'QQBrowserLite',
      QUARK: 'Quark',
      QUPZILLA: 'QupZilla',
      REKONQ: 'rekonq',
      ROCKMELT: 'Rockmelt',
      SAFARI: 'Safari',
      SAFARI_MOBILE: 'Mobile Safari',
      SAILFISH: 'Sailfish Browser',
      SAMSUNG: 'Samsung Internet',
      SEAMONKEY: 'SeaMonkey',
      SILK: 'Silk',
      SKYFIRE: 'Skyfire',
      SLEIPNIR: 'Sleipnir',
      SLIMBOAT: 'SlimBoat',
      SLIMBROWSER: 'SlimBrowser',
      SLIMJET: 'Slimjet',
      SNAPCHAT: 'Snapchat',
      SOGOU_EXPLORER: 'Sogou Explorer',
      SOGOU_MOBILE: 'Sogou Mobile',
      SWIFTFOX: 'Swiftfox',
      TESLA: 'Tesla',
      TIKTOK: 'TikTok',
      TIZEN: 'Tizen Browser',
      TWITTER: 'Twitter',
      UC: 'UCBrowser',
      UP: 'UP.Browser',
      VIVALDI: 'Vivaldi',
      VIVO: 'Vivo Browser',
      W3M: 'w3m',
      WATERFOX: 'Waterfox',
      WEBKIT: 'WebKit',
      WECHAT: 'WeChat',
      WEIBO: 'Weibo',
      WHALE: 'Whale',
      WOLVIC: 'Wolvic',
      YANDEX: 'Yandex',
    },
    BrowserType = {
      CRAWLER: 'crawler',
      CLI: 'cli',
      EMAIL: 'email',
      FETCHER: 'fetcher',
      INAPP: 'inapp',
      MEDIAPLAYER: 'mediaplayer',
      LIBRARY: 'library',
    },
    CPU = {
      '68K': '68k',
      ARM: 'arm',
      ARM_64: 'arm64',
      ARM_HF: 'armhf',
      AVR: 'avr',
      AVR_32: 'avr32',
      IA64: 'ia64',
      IRIX: 'irix',
      IRIX_64: 'irix64',
      MIPS: 'mips',
      MIPS_64: 'mips64',
      PA_RISC: 'pa-risc',
      PPC: 'ppc',
      SPARC: 'sparc',
      SPARC_64: 'sparc64',
      X86: 'ia32',
      X86_64: 'amd64',
    },
    Device = {
      CONSOLE: 'console',
      DESKTOP: 'desktop',
      EMBEDDED: 'embedded',
      MOBILE: 'mobile',
      SMARTTV: 'smarttv',
      TABLET: 'tablet',
      WEARABLE: 'wearable',
      XR: 'xr',
    },
    Vendor = {
      ACER: 'Acer',
      ADVAN: 'Advan',
      ALCATEL: 'Alcatel',
      APPLE: 'Apple',
      AMAZON: 'Amazon',
      ARCHOS: 'Archos',
      ASUS: 'ASUS',
      ATT: 'AT&T',
      BENQ: 'BenQ',
      BLACKBERRY: 'BlackBerry',
      CAT: 'Cat',
      DELL: 'Dell',
      ENERGIZER: 'Energizer',
      ESSENTIAL: 'Essential',
      FACEBOOK: 'Facebook',
      FAIRPHONE: 'Fairphone',
      GEEKSPHONE: 'GeeksPhone',
      GENERIC: 'Generic',
      GOOGLE: 'Google',
      HMD: 'HMD',
      HP: 'HP',
      HTC: 'HTC',
      HUAWEI: 'Huawei',
      IMO: 'IMO',
      INFINIX: 'Infinix',
      ITEL: 'itel',
      JOLLA: 'Jolla',
      KOBO: 'Kobo',
      LENOVO: 'Lenovo',
      LG: 'LG',
      MEIZU: 'Meizu',
      MICROMAX: 'Micromax',
      MICROSOFT: 'Microsoft',
      MOTOROLA: 'Motorola',
      NEXIAN: 'Nexian',
      NINTENDO: 'Nintendo',
      NOKIA: 'Nokia',
      NOTHING: 'Nothing',
      NVIDIA: 'Nvidia',
      ONEPLUS: 'OnePlus',
      OPPO: 'OPPO',
      OUYA: 'Ouya',
      PALM: 'Palm',
      PANASONIC: 'Panasonic',
      PEBBLE: 'Pebble',
      PICO: 'Pico',
      POLYTRON: 'Polytron',
      REALME: 'Realme',
      RIM: 'RIM',
      ROKU: 'Roku',
      SAMSUNG: 'Samsung',
      SHARP: 'Sharp',
      SIEMENS: 'Siemens',
      SMARTFREN: 'Smartfren',
      SONY: 'Sony',
      SPRINT: 'Sprint',
      TCL: 'TCL',
      TECHNISAT: 'TechniSAT',
      TECNO: 'Tecno',
      TESLA: 'Tesla',
      ULEFONE: 'Ulefone',
      VIVO: 'Vivo',
      VODAFONE: 'Vodafone',
      XBOX: 'Xbox',
      XIAOMI: 'Xiaomi',
      ZEBRA: 'Zebra',
      ZTE: 'ZTE',
    },
    Engine = {
      AMAYA: 'Amaya',
      ARKWEB: 'ArkWeb',
      BLINK: 'Blink',
      EDGEHTML: 'EdgeHTML',
      FLOW: 'Flow',
      GECKO: 'Gecko',
      GOANNA: 'Goanna',
      ICAB: 'iCab',
      KHTML: 'KHTML',
      LIBWEB: 'LibWeb',
      LINKS: 'Links',
      LYNX: 'Lynx',
      NETFRONT: 'NetFront',
      NETSURF: 'NetSurf',
      PRESTO: 'Presto',
      SERVO: 'Servo',
      TASMAN: 'Tasman',
      TRIDENT: 'Trident',
      W3M: 'w3m',
      WEBKIT: 'WebKit',
    },
    UAParserEnumOS = {
      AIX: 'AIX',
      AMIGA_OS: 'Amiga OS',
      ANDROID: 'Android',
      ANDROID_X86: 'Android-x86',
      ARCH: 'Arch',
      BADA: 'Bada',
      BEOS: 'BeOS',
      BLACKBERRY: 'BlackBerry',
      CENTOS: 'CentOS',
      CHROME_OS: 'Chrome OS',
      CHROMECAST: 'Chromecast',
      CHROMECAST_ANDROID: 'Chromecast Android',
      CHROMECAST_FUCHSIA: 'Chromecast Fuchsia',
      CHROMECAST_LINUX: 'Chromecast Linux',
      CHROMECAST_SMARTSPEAKER: 'Chromecast SmartSpeaker',
      CONTIKI: 'Contiki',
      DEBIAN: 'Debian',
      DEEPIN: 'Deepin',
      DRAGONFLY: 'DragonFly',
      ELEMENTARY_OS: 'elementary OS',
      FEDORA: 'Fedora',
      FIREFOX_OS: 'Firefox OS',
      FREEBSD: 'FreeBSD',
      FUCHSIA: 'Fuchsia',
      GENTOO: 'Gentoo',
      GHOSTBSD: 'GhostBSD',
      GNU: 'GNU',
      HAIKU: 'Haiku',
      HARMONYOS: 'HarmonyOS',
      HP_UX: 'HP-UX',
      HURD: 'Hurd',
      IOS: 'iOS',
      JOLI: 'Joli',
      KAIOS: 'KaiOS',
      KUBUNTU: 'Kubuntu',
      LINPUS: 'Linpus',
      LINSPIRE: 'Linspire',
      LINUX: 'Linux',
      MACOS: 'macOS',
      MAEMO: 'Maemo',
      MAGEIA: 'Mageia',
      MANDRIVA: 'Mandriva',
      MANJARO: 'Manjaro',
      MEEGO: 'MeeGo',
      MINIX: 'Minix',
      MINT: 'Mint',
      MORPH_OS: 'Morph OS',
      NETBSD: 'NetBSD',
      NETRANGE: 'NetRange',
      NETTV: 'NetTV',
      NINTENDO: 'Nintendo',
      OPENHARMONY: 'OpenHarmony',
      OPENBSD: 'OpenBSD',
      OPENVMS: 'OpenVMS',
      OS2: 'OS/2',
      PALM: 'Palm',
      PC_BSD: 'PC-BSD',
      PCLINUXOS: 'PCLinuxOS',
      PICO: 'Pico',
      PLAN9: 'Plan9',
      PLAYSTATION: 'PlayStation',
      QNX: 'QNX',
      RASPBIAN: 'Raspbian',
      REDHAT: 'RedHat',
      RIM_TABLET_OS: 'RIM Tablet OS',
      RISC_OS: 'RISC OS',
      SABAYON: 'Sabayon',
      SAILFISH: 'Sailfish',
      SERENITYOS: 'SerenityOS',
      SERIES40: 'Series40',
      SLACKWARE: 'Slackware',
      SOLARIS: 'Solaris',
      SUSE: 'SUSE',
      SYMBIAN: 'Symbian',
      TIZEN: 'Tizen',
      UBUNTU: 'Ubuntu',
      UBUNTU_TOUCH: 'Ubuntu Touch',
      UNIX: 'Unix',
      VECTORLINUX: 'VectorLinux',
      WATCHOS: 'watchOS',
      WEBOS: 'WebOS',
      WINDOWS: 'Windows',
      WINDOWS_IOT: 'Windows IoT',
      WINDOWS_MOBILE: 'Windows Mobile',
      WINDOWS_PHONE: 'Windows Phone',
      XBOX: 'Xbox',
      ZENWALK: 'Zenwalk',
    };
  var _POSignalsEntities;
  (function (l) {
    let f;
    (function (E) {
      class i {
        static get Browser() {
          return Browser;
        }
        static get BrowserType() {
          return BrowserType;
        }
        static get CPU() {
          return CPU;
        }
        static get Device() {
          return Device;
        }
        static get Vendor() {
          return Vendor;
        }
        static get Engine() {
          return Engine;
        }
        static get UAParserEnumOS() {
          return UAParserEnumOS;
        }
      }
      E.UAParserEnums = i;
    })((f = l._POSignalsUtils || (l._POSignalsUtils = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    let f;
    (function (E) {
      class i {
        static get isMobile() {
          let a = !1;
          return (
            (function (c) {
              (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
                c,
              ) ||
                /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                  c.substr(0, 4),
                )) &&
                (a = !0);
            })(navigator.userAgent || navigator.vendor || window.opera),
            a
          );
        }
        static newGuid() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (a) {
            const c = (Math.random() * 16) | 0;
            return (a === 'x' ? c : (c & 3) | 8).toString(16);
          });
        }
        static ieFix() {
          let a;
          (navigator.userAgent.indexOf('MSIE') != -1
            ? (a = /MSIE (\d+\.\d+);/)
            : (a = /Trident.*rv[ :]*(\d+\.\d+)/),
            a.test(navigator.userAgent) &&
              (document.body.setAttribute('style', '-ms-touch-action:none;'),
              (document.body.style.touchAction = 'none'),
              (document.body.style.msTouchAction = 'none')));
        }
        static now() {
          const a = window.performance || {};
          return (
            (a.now = (function () {
              return (
                a.now ||
                a.webkitNow ||
                a.msNow ||
                a.oNow ||
                a.mozNow ||
                function () {
                  return new Date().getTime();
                }
              );
            })()),
            a.now()
          );
        }
        static base64Uint8Array(a) {
          const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
          let t,
            n = a.length,
            e = '';
          for (t = 0; t < n; t += 3)
            ((e += c[a[t] >> 2]),
              (e += c[((a[t] & 3) << 4) | (a[t + 1] >> 4)]),
              (e += c[((a[t + 1] & 15) << 2) | (a[t + 2] >> 6)]),
              (e += c[a[t + 2] & 63]));
          return (
            n % 3 === 2
              ? (e = e.substring(0, e.length - 1) + '=')
              : n % 3 === 1 && (e = e.substring(0, e.length - 2) + '=='),
            e
          );
        }
        static string2buf(a) {
          if (typeof TextEncoder == 'function' && TextEncoder.prototype.encode)
            return new TextEncoder().encode(a);
          let c,
            t,
            n,
            e,
            o,
            s = a.length,
            x = 0;
          for (e = 0; e < s; e++)
            ((t = a.charCodeAt(e)),
              (t & 64512) === 55296 &&
                e + 1 < s &&
                ((n = a.charCodeAt(e + 1)),
                (n & 64512) === 56320 && ((t = 65536 + ((t - 55296) << 10) + (n - 56320)), e++)),
              (x += t < 128 ? 1 : t < 2048 ? 2 : t < 65536 ? 3 : 4));
          for (c = new Uint8Array(x), o = 0, e = 0; o < x; e++)
            ((t = a.charCodeAt(e)),
              (t & 64512) === 55296 &&
                e + 1 < s &&
                ((n = a.charCodeAt(e + 1)),
                (n & 64512) === 56320 && ((t = 65536 + ((t - 55296) << 10) + (n - 56320)), e++)),
              t < 128
                ? (c[o++] = t)
                : t < 2048
                  ? ((c[o++] = 192 | (t >>> 6)), (c[o++] = 128 | (t & 63)))
                  : t < 65536
                    ? ((c[o++] = 224 | (t >>> 12)),
                      (c[o++] = 128 | ((t >>> 6) & 63)),
                      (c[o++] = 128 | (t & 63)))
                    : ((c[o++] = 240 | (t >>> 18)),
                      (c[o++] = 128 | ((t >>> 12) & 63)),
                      (c[o++] = 128 | ((t >>> 6) & 63)),
                      (c[o++] = 128 | (t & 63))));
          return c;
        }
        static utf8Encode(a) {
          a = a.replace(
            /\r\n/g,
            `
`,
          );
          let c = '';
          for (let t = 0; t < a.length; t++) {
            const n = a.charCodeAt(t);
            n < 128
              ? (c += String.fromCharCode(n))
              : n > 127 && n < 2048
                ? ((c += String.fromCharCode((n >> 6) | 192)),
                  (c += String.fromCharCode((n & 63) | 128)))
                : ((c += String.fromCharCode((n >> 12) | 224)),
                  (c += String.fromCharCode(((n >> 6) & 63) | 128)),
                  (c += String.fromCharCode((n & 63) | 128)));
          }
          return c;
        }
        static hash(a) {
          let c = i.hashCache.get(a);
          return (c || ((c = l.sha256(a + E.Constants.SALT)), i.hashCache.set(a, c)), c);
        }
        static hashMini(a) {
          const c = `${JSON.stringify(a)}`;
          let t,
            n,
            e = 2166136261;
          for (t = 0, n = c.length; t < n; t++) e = (Math.imul(31, e) + c.charCodeAt(t)) | 0;
          return ('0000000' + (e >>> 0).toString(16)).substr(-8);
        }
        static hashCode(a) {
          let c = 0,
            t = a ? a.length : 0,
            n = 0;
          if (t > 0) for (; n < t; ) c = ((c << 5) - c + a.charCodeAt(n++)) | 0;
          return c;
        }
        static mod(a, c) {
          return ((i.hashCode(a) % c) + c) % c;
        }
        static isEmail(a) {
          try {
            return (
              a &&
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                a.toLowerCase(),
              )
            );
          } catch (c) {
            return (E.Logger.warn('isEmail function failed to parse string', c), !1);
          }
        }
        static getEmailDomain(a) {
          return i.isEmail(a) ? a.substring(a.lastIndexOf('@') + 1) : '';
        }
        static extendPrimitiveValues(a, c, t) {
          const n = i.allKeys(c);
          let e = 0;
          for (; e < n.length; )
            (!i.isObject(c[n[e]]) && (!t || (t && a[n[e]] === void 0)) && (a[n[e]] = c[n[e]]), e++);
          return a;
        }
        static flatten(a) {
          const c = {};
          return (i.dive('', a, c), c);
        }
        static isFunction(a) {
          return a && typeof a == 'function';
        }
        static isPassiveSupported() {
          let a = !1;
          const c = function () {};
          try {
            const t = {
              get passive() {
                return ((a = !0), !0);
              },
            };
            (window.addEventListener('test', c, t), window.removeEventListener('test', c, !1));
          } catch {
            a = !1;
          }
          return a;
        }
        static getAttribute(a, c) {
          try {
            if (a && typeof a.getAttribute == 'function') return a.getAttribute(c) || '';
          } catch {}
          return '';
        }
        static createInvisibleElement(a) {
          try {
            const c = document.createElement(a);
            return (
              (c.style.display = 'none'),
              (c.style.border = 'none'),
              (c.style.position = 'absolute'),
              (c.style.top = '-999px'),
              (c.style.left = '-999px'),
              (c.style.width = '0'),
              (c.style.height = '0'),
              (c.style.visibility = 'hidden'),
              c
            );
          } catch (c) {
            return (E.Logger.warn('Failed to create element', c), null);
          }
        }
        static values(a) {
          const c = i.allKeys(a),
            t = c.length,
            n = Array(t);
          for (let e = 0; e < t; e++) n[e] = a[c[e]];
          return n;
        }
        static getValuesOfMap(a) {
          if (this.isFunction(a.values)) return Array.from(a.values());
          const c = [];
          return (a.forEach((t) => c.push(t)), c);
        }
        static typesCounter(a) {
          const c = { epochTs: Date.now() };
          for (const t of a) c[t.type] = (c[t.type] || 0) + 1;
          return c;
        }
        static modifiersKeys(a) {
          const c = [
              'Alt',
              'AltGraph',
              'CapsLock',
              'Control',
              'Fn',
              'FnLock',
              'Hyper',
              'Meta',
              'NumLock',
              'OS',
              'ScrollLock',
              'Shift',
              'Super',
              'Symbol',
              'SymbolLock',
            ],
            t = [];
          return (
            a.getModifierState &&
              c.forEach((n) => {
                a.getModifierState(n.toString()) && t.push(n);
              }),
            t
          );
        }
        static getElementText(a) {
          var c, t;
          return a instanceof HTMLInputElement
            ? ['checkbox', 'radio'].indexOf(a.type) >= 0
              ? `${a.checked}`
              : a.value
            : a instanceof HTMLSelectElement
              ? (t = (c = a.selectedOptions) === null || c === void 0 ? void 0 : c[0]) === null ||
                t === void 0
                ? void 0
                : t.innerText
              : a.innerText;
        }
        static getSrcElement(a) {
          return a.srcElement || a.target;
        }
        static getObjectType(a) {
          try {
            const t = /function (.{1,})\(/.exec(a.constructor.toString());
            return t && t.length > 1 ? t[1] : '';
          } catch {
            return '';
          }
        }
        static isSelectorMatches(a, c, t) {
          try {
            const n = Element.prototype,
              e =
                n.matches || n.webkitMatchesSelector || n.mozMatchesSelector || n.msMatchesSelector;
            let o = 0;
            do {
              if (e.call(a, c)) return a;
              a = a.parentElement || a.parentNode;
            } while (a !== null && a.nodeType === 1 && o++ < t);
            return null;
          } catch {
            return null;
          }
        }
        static anySelectorMatches(a, c, t) {
          try {
            for (const n of c) if (this.isSelectorMatches(a, n, t)) return !0;
          } catch (n) {
            E.Logger.warn(n);
          }
          return !1;
        }
        static isArray(a) {
          return Array.isArray
            ? Array.isArray(a)
            : Object.prototype.toString.call(a) === '[object Array]';
        }
        static safeJsonParse(a) {
          let c = null;
          try {
            a && (c = JSON.parse(a));
          } catch (t) {
            (E.Logger.warn('Failed to parse object ' + t), (c = null));
          }
          return c;
        }
        static getElementSelectionStart(a) {
          let c;
          try {
            c = a.selectionStart;
          } catch {
            c = '';
          }
          return c;
        }
        static getElementSelectionEnd(a) {
          let c;
          try {
            c = a.selectionEnd;
          } catch {
            c = '';
          }
          return c;
        }
        static isClickableInput(a) {
          return (
            a &&
            [
              'button',
              'checkbox',
              'color',
              'radio',
              'range',
              'image',
              'submit',
              'file',
              'reset',
            ].indexOf(a.type) >= 0
          );
        }
        static isTextInput(a) {
          return (
            a &&
            [
              'date',
              'datetime-local',
              'email',
              'month',
              'number',
              'password',
              'search',
              'tel',
              'text',
              'time',
              'url',
              'week',
              'datetime',
            ].indexOf(a.type) >= 0
          );
        }
        static getDeviceOrientation() {
          const a = screen.orientation || screen.mozOrientation || {},
            c = screen.msOrientation || a.type,
            t = a.angle;
          return {
            orientation: c == null ? void 0 : c.toString(),
            angle: t == null ? void 0 : t.toString(),
          };
        }
        static getDevToolsState() {
          var a, c;
          const n = window.outerWidth - window.innerWidth > 160,
            e = window.outerHeight - window.innerHeight > 160,
            o = n ? 'vertical' : 'horizontal';
          return !(e && n) &&
            ((!(
              (c = (a = window.Firebug) === null || a === void 0 ? void 0 : a.chrome) === null ||
              c === void 0
            ) &&
              c.isInitialized) ||
              n ||
              e)
            ? { open: !0, orientation: o }
            : { open: !1, orientation: void 0 };
        }
        static getCookie(a) {
          const c = document.cookie.match('(^|;) ?' + a + '=([^;]*)(;|$)');
          return c ? c[2] : null;
        }
        static setCookie(a, c, t) {
          const n = new Date();
          (n.setTime(n.getTime() + 1e3 * t),
            (document.cookie =
              a + '=' + c + ';path=/;secure;SameSite=None;expires=' + n.toUTCString()));
        }
        static deleteCookie(a) {
          i.setCookie(a, '', -1);
        }
        static delay(a) {
          return new Promise((c) => setTimeout(c, a));
        }
        static getHostnameFromRegex(a) {
          if (a) {
            const c = a.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
            return c && c[1];
          }
          return null;
        }
        static inIframe() {
          try {
            return window.self !== window.top;
          } catch {
            return !0;
          }
        }
        static promiseTimeout(a, c) {
          const t = new Promise((n, e) => {
            const o = setTimeout(() => {
              (clearTimeout(o), e(new Error('Timed out in ' + a + 'ms.')));
            }, a);
          });
          return Promise.race([c, t]);
        }
        static getProperty(a, c) {
          return c.split('.').reduce(function (t, n) {
            return t ? t[n] : null;
          }, a);
        }
        static filterReduce(a, c) {
          return Object.keys(a)
            .filter((t) => c(a[t]))
            .reduce((t, n) => ({ ...t, [n]: a[n] }), {});
        }
        static dive(a, c, t) {
          for (const n in c)
            if (c.hasOwnProperty(n)) {
              let e = n;
              const o = c[n];
              (a.length > 0 && (e = a + '.' + n), i.isObject(o) ? i.dive(e, o, t) : (t[e] = o));
            }
        }
        static isObject(a) {
          const c = typeof a;
          return c === 'function' || (c === 'object' && !!a);
        }
        static allKeys(a) {
          if (!i.isObject(a)) return [];
          const c = [];
          for (const t in a) c.push(t);
          return c;
        }
        static encryptionString(a, c) {
          const t = [];
          for (let n = 0; n < a.length; n++) {
            const e = a.charCodeAt(n) ^ c.charCodeAt(n % c.length);
            t.push(String.fromCharCode(e));
          }
          return t.join('');
        }
        static encryptionBytes(a, c) {
          const t = new Uint8Array(a.length);
          for (let n = 0; n < a.length; n++) t[n] = a[n] ^ c.charCodeAt(n % c.length);
          return t;
        }
        static parseJwt(a) {
          const c = a.replace(/-/g, '+').replace(/_/g, '/'),
            t = decodeURIComponent(
              window
                .atob(c)
                .split('')
                .map((n) => '%' + ('00' + n.charCodeAt(0).toString(16)).slice(-2))
                .join(''),
            );
          return JSON.parse(t);
        }
        static calculateMeanTimeDeltasBetweenEvents(a) {
          let c = 0;
          if ((a == null ? void 0 : a.length) > 1) {
            let t = a[0].epochTs;
            for (let n = 1; n < a.length; n++) ((c += a[n].epochTs - t), (t = a[n].epochTs));
            c /= a.length - 1;
          }
          return c;
        }
        static sortEventsByTimestamp(a) {
          return a.sort((c, t) =>
            c.eventTs > t.eventTs
              ? 1
              : c.eventTs < t.eventTs
                ? -1
                : c.epochTs > t.epochTs
                  ? 1
                  : c.epochTs < t.epochTs
                    ? -1
                    : c.type === 'click'
                      ? 1
                      : -1,
          );
        }
        static distanceBetweenPoints(a, c) {
          return Math.sqrt(Math.pow(a.getX() - c.getX(), 2) + Math.pow(a.getY() - c.getY(), 2));
        }
        static calculateMeanDistanceBetweenPoints(a) {
          let c = 0;
          if ((a == null ? void 0 : a.length) > 1) {
            for (let t = 1; t < a.length; t++) c += i.distanceBetweenPoints(a[t - 1], a[t]);
            c /= a.length - 1;
          }
          return c;
        }
        static filterArrayByLength(a, c) {
          return a.length <= c ? a : a.slice(0, c).concat(a[a.length - 1]);
        }
        static keepFirstEventsWithDistance(a) {
          const { events: c, threshold: t, min: n, max: e } = a;
          if (c.length <= n) return c;
          const o = c[0];
          let s;
          for (
            s = 1;
            s < c.length &&
            s < e &&
            !(Math.max(Math.abs(c[s].getX() - o.getX()), Math.abs(c[s].getY() - o.getY())) >= t);
            s++
          );
          return c.slice(0, Math.max(s + 1, n));
        }
        static ab2str(a) {
          return String.fromCharCode.apply(null, new Uint8Array(a));
        }
        static str2ab(a) {
          const c = new ArrayBuffer(a.length),
            t = new Uint8Array(c);
          for (let n = 0, e = a.length; n < e; n++) t[n] = a.charCodeAt(n);
          return c;
        }
        static encode(a) {
          const c = JSON.stringify(a),
            t = new TextEncoder().encode(c),
            n = i.base64Uint8Array(t);
          return i.base64url(n);
        }
        static base64url(a) {
          return a.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
      }
      ((i.hashCache = new Map()),
        (i.keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='),
        (E.Util = i));
    })((f = l._POSignalsUtils || (l._POSignalsUtils = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    var f = l.openDB;
    let E;
    (function (i) {
      class r {
        constructor() {}
        static async initDB() {
          if (
            !(
              window.indexedDB ||
              window.mozIndexedDB ||
              window.webkitIndexedDB ||
              window.msIndexedDB
            )
          )
            throw new Error('IndexedDB is not supported');
          const t = new r();
          return new Promise(async (n) => {
            ((t.indexedDatabase = await f(this._PingDBName, r._version, {
              upgrade(e, o, s, x, m) {
                e.createObjectStore(r._storeDefaultName);
              },
            })),
              n(t));
          });
        }
        close() {
          this.indexedDatabase.close();
        }
        getValue(c) {
          return this.indexedDatabase.get(r._storeDefaultName, c);
        }
        setValue(c, t) {
          return this.indexedDatabase.put(r._storeDefaultName, t, c);
        }
      }
      ((r._PingDBName = 'Ping'),
        (r._version = 1),
        (r._storeDefaultName = 'PING_ONE'),
        (i.IndexedDBStorage = r));
    })((E = l._POSignalsStorage || (l._POSignalsStorage = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor(i, r, a) {
        ((this.deviceId = i), (this.dbStorage = r), (this.cryptoHandler = a));
      }
      async getExportedPublicKey() {
        if (!this.cachedPublicKey) {
          const i = await this.getDeviceKeys();
          i && (this.cachedPublicKey = await this.cryptoHandler.exportPublicKey(i));
        }
        return (
          l._POSignalsUtils.Logger.info('Exported public key:', this.cachedPublicKey),
          this.cachedPublicKey
        );
      }
      async setDeviceKeys(i) {
        const r = await this.dbStorage.setValue(this.deviceId, i);
        return ((this.cachedDeviceKey = i), r);
      }
      async associateDeviceKeys() {
        const i = await this.cryptoHandler.generateKeys();
        return (
          l._POSignalsUtils.Logger.info('Associating new device domain keys'),
          await this.setDeviceKeys(i),
          i
        );
      }
      async getDeviceKeys() {
        return (
          this.cachedDeviceKey ||
            (this.cachedDeviceKey = await this.dbStorage.getValue(this.deviceId)),
          this.cachedDeviceKey
        );
      }
      async signDeviceAttributeWithJWT(i, r, a) {
        return await this.cryptoHandler.signJWT(
          i,
          await this.getDeviceKeys(),
          f._default_salt,
          r,
          a,
        );
      }
      async verifyJWT(i) {
        return this.cryptoHandler.verifyJwtToken(i, (await this.getDeviceKeys()).publicKey);
      }
    }
    ((f._default_salt = 32), (l.DeviceKeys = f));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    let f;
    (function (E) {
      class i {
        constructor() {
          ((this._disabledStorage = []),
            (this.assertionValues = [
              'BROWSER_ENGINE_VERSION',
              'NAVIGATOR_LANGUAGE',
              'OS_NAME',
              'OS_VERSION',
              'NAVIGATOR_USER_AGENT',
              'FINGER_PRINT',
              'RESOLUTION',
              'PUSH_NOTIFICATIONS_SUPPORTED',
              'COOKIES_ENABLED',
              'IS_INCOGNITO',
              'IS_PRIVATE_MODE',
            ]));
          try {
            (window.sessionStorage.setItem('_st_storage_enabled_check', 'test'),
              window.sessionStorage.removeItem('_st_storage_enabled_check'),
              (this.signalsSessionStorage = window.sessionStorage));
          } catch {
            (l._POSignalsUtils.Logger.warn('session storage disabled'),
              this._disabledStorage.push('sessionStorage'),
              (this.signalsSessionStorage = new E.StorageFallback()));
          }
          try {
            (window.localStorage.setItem('_st_storage_enabled_check', 'test'),
              window.localStorage.removeItem('_st_storage_enabled_check'),
              (this.signalsLocalStorage = new E.StorageWrapper(window.localStorage)));
          } catch {
            (l._POSignalsUtils.Logger.warn('local storage disabled'),
              this._disabledStorage.push('localStorage'),
              (this.signalsLocalStorage = new E.StorageWrapper(new E.StorageFallback())));
          }
        }
        setStorageConfig(a) {
          ((this.universalTrustEnabled = this.isConfigurationEnabled(
            a.universalDeviceIdentification,
          )),
            (this.agentIdentificationEnabled = this.isConfigurationEnabled(a.agentIdentification)),
            (this.devEnv = a.devEnv),
            (this.agentPort = a.agentPort),
            (this.agentTimeout = a.agentTimeout),
            (this.htmlGeoLocation = this.isConfigurationEnabled(a.htmlGeoLocation)),
            (this.isIAFDetectionEnabled = this.isConfigurationEnabled(a.isIAFDetectionEnabled)));
        }
        static get instance() {
          return (i._instance || (i._instance = new i()), i._instance);
        }
        get tabUUID() {
          let a = this.signalsSessionStorage.getItem(l._POSignalsUtils.Constants.TAB_UUID_KEY);
          return (
            a ||
              ((a = l._POSignalsUtils.Util.newGuid()),
              this.signalsSessionStorage.setItem(l._POSignalsUtils.Constants.TAB_UUID_KEY, a)),
            a
          );
        }
        get ops() {
          const a = Number(this.signalsSessionStorage.getItem(l._POSignalsUtils.Constants.OPS_KEY));
          return isNaN(a) ? null : a;
        }
        set ops(a) {
          a
            ? this.signalsSessionStorage.setItem(l._POSignalsUtils.Constants.OPS_KEY, a.toString())
            : this.signalsSessionStorage.removeItem(l._POSignalsUtils.Constants.OPS_KEY);
        }
        get disabledStorage() {
          return this._disabledStorage;
        }
        get sessionStorage() {
          return this.signalsSessionStorage;
        }
        get localStorage() {
          return this.signalsLocalStorage;
        }
        async initDeviceIdentity() {
          let a;
          const c = this.signalsLocalStorage.getItem(l._POSignalsUtils.Constants.DEVICE_ID_KEY),
            t = this.signalsLocalStorage.getItem(l._POSignalsUtils.Constants.DEVICE_ID_CREATED_AT);
          return (
            c && (this.cachedDeviceId = c),
            this.universalTrustEnabled &&
              ((this.deviceTrust = { attestation: {}, dtts: new Date().getTime() }),
              (this.indexedDBStorage = await E.IndexedDBStorage.initDB()),
              (a = await this.loadLocalDeviceTrust())),
            this.getDeviceId() || (await this.associateDeviceDetails()),
            t ||
              this.signalsLocalStorage.setItem(
                l._POSignalsUtils.Constants.DEVICE_ID_CREATED_AT,
                Date.now(),
              ),
            this.universalTrustEnabled &&
              (!this.getDeviceId() || !a) &&
              (await this.createDomainKeys()),
            this.getDeviceId()
          );
        }
        shouldFallbackToP1Key(a) {
          return (
            this.universalTrustEnabled &&
            (!a || this.isRefreshRequired(this.deviceKeyRsyncIntervals))
          );
        }
        isRefreshRequired(a = 3) {
          if (!this.deviceTrust.dtts) return !0;
          const c = this.signalsLocalStorage.getItem(
            l._POSignalsUtils.Constants.LAST_DEVICE_KEY_RESYNC,
          );
          if (!c || isNaN(parseInt(c))) return !0;
          const n = this.deviceTrust.dtts - c > 60 * 60 * 24 * 1e3 * a;
          return (n && l._POSignalsUtils.Logger.debug('Refresh required'), n);
        }
        async loadLocalDeviceTrust() {
          try {
            let a;
            if (!this.cachedDeviceId)
              return (l._POSignalsUtils.Logger.debug('No device id found on customer domain'), !1);
            if (this.cachedDeviceId)
              return (
                (this.domainDeviceKeys = new l.DeviceKeys(
                  this.getDeviceId(),
                  this.indexedDBStorage,
                  new l._POSignalsUtils.CryptoOperator(),
                )),
                (a = await this.domainDeviceKeys.getDeviceKeys()),
                a
                  ? ((this.deviceTrust.attestation.deviceKey =
                      await this.domainDeviceKeys.getExportedPublicKey()),
                    !0)
                  : (l._POSignalsUtils.Logger.debug('No device keys found on customer domain'), !1)
              );
          } catch (a) {
            return (l._POSignalsUtils.Logger.error('Domain PKI initialization failed', a), !1);
          }
        }
        async createDomainKeys() {
          try {
            ((this.domainDeviceKeys = new l.DeviceKeys(
              this.getDeviceId(),
              this.indexedDBStorage,
              new l._POSignalsUtils.CryptoOperator(),
            )),
              await this.domainDeviceKeys.associateDeviceKeys(),
              (this.deviceTrust.attestation.deviceKey =
                await this.domainDeviceKeys.getExportedPublicKey()));
          } catch (a) {
            l._POSignalsUtils.Logger.error('Domain PKI initialization failed', a);
          }
        }
        getDeviceId() {
          return this.cachedDeviceId;
        }
        getDeviceCreatedAt() {
          return this.signalsLocalStorage.getItem(l._POSignalsUtils.Constants.DEVICE_ID_CREATED_AT);
        }
        async associateDeviceDetails() {
          var a, c;
          return (
            l._POSignalsUtils.Logger.debug('Associating fresh device details'),
            (this.cachedDeviceId = `Id-${l._POSignalsUtils.Util.newGuid()}`),
            this.signalsLocalStorage.setItem(
              l._POSignalsUtils.Constants.DEVICE_ID_KEY,
              this.cachedDeviceId,
            ),
            this.signalsLocalStorage.setItem(
              l._POSignalsUtils.Constants.DEVICE_ID_CREATED_AT,
              Date.now(),
            ),
            l._POSignalsUtils.Logger.debug(`PingOne Signals deviceId: ${this.cachedDeviceId}`),
            [
              this.cachedDeviceId,
              (c = (a = this.deviceTrust) === null || a === void 0 ? void 0 : a.attestation) ===
                null || c === void 0
                ? void 0
                : c.fallbackDeviceKey,
            ]
          );
        }
        closeTrustStore() {
          try {
            this.indexedDBStorage && this.indexedDBStorage.close();
          } catch (a) {
            l._POSignalsUtils.Logger.info('Unable to close trust store:', a);
          }
        }
        isConfigurationEnabled(a) {
          return a == null
            ? !1
            : typeof a == 'boolean'
              ? a
              : typeof a == 'string' && a.toLowerCase() === 'true';
        }
        async signJWTChallenge(a, c, t) {
          return this.domainDeviceKeys.signDeviceAttributeWithJWT(a, c, t);
        }
        getGeoSessionData() {
          const a = this.signalsSessionStorage.getItem(l._POSignalsUtils.Constants.GeoDataKey);
          return a == null ? null : a;
        }
      }
      E.SessionStorage = i;
    })((f = l._POSignalsStorage || (l._POSignalsStorage = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    let f;
    (function (E) {
      class i {
        constructor(c) {
          this.storage = c;
        }
        getItem(c) {
          const t = l._POSignalsUtils.Util.hash(c);
          let n = this.storage.getItem(t);
          return (
            n ||
              ((n = this.storage.getItem(c)),
              n && (this.storage.setItem(t, n), this.storage.removeItem(c))),
            n
          );
        }
        removeItem(c) {
          return this.storage.removeItem(l._POSignalsUtils.Util.hash(c));
        }
        setItem(c, t) {
          return this.storage.setItem(l._POSignalsUtils.Util.hash(c), t);
        }
      }
      E.StorageWrapper = i;
      class r {
        constructor() {
          this.internalStorageMap = new Map();
        }
        getItem(c) {
          return this.internalStorageMap.get(c);
        }
        removeItem(c) {
          this.internalStorageMap.delete(c);
        }
        setItem(c, t) {
          this.internalStorageMap.set(c, t);
        }
      }
      E.StorageFallback = r;
    })((f = l._POSignalsStorage || (l._POSignalsStorage = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  const _0x44f950 = _0x48f7;
  function _0x48f7(l, f) {
    const E = _0x1ccc();
    return (
      (_0x48f7 = function (i, r) {
        return ((i = i - 308), E[i]);
      }),
      _0x48f7(l, f)
    );
  }
  (function (l, f) {
    const E = _0x48f7,
      i = l();
    for (;;)
      try {
        if (
          -parseInt(E(1382)) / 1 +
            (parseInt(E(1161)) / 2) * (parseInt(E(1510)) / 3) +
            parseInt(E(1242)) / 4 +
            -parseInt(E(1015)) / 5 +
            -parseInt(E(710)) / 6 +
            parseInt(E(1053)) / 7 +
            parseInt(E(1284)) / 8 ===
          f
        )
          break;
        i.push(i.shift());
      } catch {
        i.push(i.shift());
      }
  })(_0x1ccc, 914438);
  var __awaiter =
      (this && this[_0x44f950(544)]) ||
      function (l, f, E, i) {
        function r(a) {
          return a instanceof E
            ? a
            : new E(function (c) {
                c(a);
              });
        }
        return new (E || (E = Promise))(function (a, c) {
          const t = _0x48f7;
          function n(s) {
            const x = _0x48f7;
            try {
              o(i[x(1448)](s));
            } catch (m) {
              c(m);
            }
          }
          function e(s) {
            const x = _0x48f7;
            try {
              o(i[x(594)](s));
            } catch (m) {
              c(m);
            }
          }
          function o(s) {
            const x = _0x48f7;
            s.done ? a(s[x(584)]) : r(s[x(584)])[x(804)](n, e);
          }
          o((i = i[t(399)](l, f || []))[t(1448)]());
        });
      },
    _POSignalsEntities;
  (function (l) {
    const f = _0x44f950;
    let E;
    (function (i) {
      const r = _0x48f7;
      class a {
        [r(729)]() {
          const t = r;
          try {
            const n = {
              hasAutofill: !1,
              autofillCount: 0,
              detectedFields: [],
              detectionMethods: [],
            };
            if (typeof document == 'undefined')
              return (
                l[t(631)].Logger[t(829)](t(856)),
                {
                  hasAutofill: !1,
                  autofillCount: 0,
                  detectedFields: [],
                  detectionMethods: [t(1129)],
                }
              );
            if (!document[t(517)])
              return (
                l[t(631)][t(867)][t(829)](t(1310)),
                {
                  hasAutofill: !1,
                  autofillCount: 0,
                  detectedFields: [],
                  detectionMethods: [t(764)],
                }
              );
            let e;
            try {
              e = document.querySelectorAll(t(816));
            } catch (m) {
              return (
                l[t(631)][t(867)][t(829)]('Failed to query input elements:', m),
                {
                  hasAutofill: !1,
                  autofillCount: 0,
                  detectedFields: [],
                  detectionMethods: [t(617)],
                }
              );
            }
            if (e[t(368)] <= 50) return this[t(678)](e, n);
            const s = 1e3,
              x = Math[t(770)](e[t(368)], s);
            return (
              e.length > s &&
                l._POSignalsUtils.Logger.warn('Large DOM detected: ' + e[t(368)] + t(767) + s),
              this[t(369)](e, x, n)
            );
          } catch (n) {
            return (
              l._POSignalsUtils[t(867)].warn(t(1263), n),
              { hasAutofill: !1, autofillCount: 0, detectedFields: [], detectionMethods: ['error'] }
            );
          }
        }
        processInputsSynchronously(t, n) {
          const e = r;
          for (let o = 0; o < t[e(368)]; o++)
            try {
              const s = t[o],
                x = this.detectInputAutofill(s);
              x[e(554)] && this[e(1110)](n, s, x);
            } catch (s) {
              l[e(631)][e(867)].warn(e(793) + o + ':', s);
            }
          return n;
        }
        [r(369)](t, n, e) {
          const o = r,
            s = performance[o(308)](),
            x = 100,
            m = 10;
          let p = 0;
          for (; p < n; ) {
            if (performance[o(308)]() - s > x) {
              (l[o(631)][o(867)].warn(o(962) + p + '/' + n + o(688)),
                e[o(928)][o(1265)](o(1523)) === -1 && e.detectionMethods[o(939)](o(1523)));
              break;
            }
            const I = Math[o(770)](p + m, n);
            for (let g = p; g < I; g++)
              try {
                const v = t[g],
                  A = this[o(520)](v);
                A.isAutofilled && this[o(1110)](e, v, A);
              } catch (v) {
                l[o(631)][o(867)][o(829)](o(793) + g + ':', v);
              }
            p = I;
          }
          return e;
        }
        [r(1110)](t, n, e) {
          const o = r;
          ((t.hasAutofill = !0),
            t[o(922)]++,
            t[o(1169)][o(939)]({
              type: n[o(322)] || o(1299),
              name: n[o(1246)] || '',
              id: n.id || '',
              placeholder: n[o(1216)] || '',
              value: n[o(584)] ? n[o(584)][o(1073)](0, 3) + o(451) : '',
              detectionMethod: e.method,
            }),
            t[o(928)][o(1265)](e[o(587)]) === -1 && t[o(928)][o(939)](e[o(587)]));
        }
        detectInputAutofill(t) {
          const n = r;
          if (!t || t[n(708)] !== n(1513)) return { isAutofilled: !1, method: n(460) };
          try {
            if (t.matches && t[n(1256)](n(1356))) return { isAutofilled: !0, method: n(472) };
          } catch {}
          try {
            if (t[n(1256)] && t[n(1256)](':-moz-autofill'))
              return { isAutofilled: !0, method: n(1200) };
          } catch {}
          try {
            const e = window[n(1396)](t),
              o = e[n(1504)];
            if ([n(310), n(378)][n(1265)](o) !== -1 || o[n(1265)](n(1261)) !== -1)
              return { isAutofilled: !0, method: 'background-color' };
          } catch {}
          try {
            if (t[n(584)] && t[n(584)][n(368)] > 0) {
              if (t[n(1366)](n(1072)) || t[n(1366)](n(500)))
                return { isAutofilled: !0, method: n(842) };
              if (t.hasAttribute(n(1271)) || t[n(1266)][n(637)](n(984))) {
                const e = [n(1179), n(1410), n(1353), n(1246), n(1189)];
                if (
                  e.indexOf(t[n(322)]) !== -1 ||
                  e[n(1148)]((o) => t[n(1246)] && t[n(1246)][n(1479)]()[n(1265)](o) !== -1)
                )
                  return { isAutofilled: !0, method: n(1089) };
              }
            }
          } catch {}
          try {
            if (
              t.classList[n(637)](n(586)) ||
              t.classList[n(637)]('auto-filled') ||
              t[n(1366)](n(789)) ||
              t[n(1366)](n(531))
            )
              return { isAutofilled: !0, method: n(851) };
          } catch {}
          try {
            if (t[n(1058)][n(540)] === 'autofill-detection' || t[n(1058)].animationName === n(1319))
              return { isAutofilled: !0, method: n(871) };
          } catch {}
          return { isAutofilled: !1, method: n(460) };
        }
        [r(1225)]() {
          const t = r;
          try {
            if (typeof document == 'undefined' || !document.querySelectorAll)
              return { hasEmail: !1, hasPassword: !1, hasName: !1, hasNumber: !1, hasInput: !1 };
            const n = document.querySelectorAll('input');
            let e = !1,
              o = !1,
              s = !1,
              x = !1;
            const m = n[t(368)] > 0;
            for (let p = 0; p < n[t(368)]; p++) {
              const I = n[p],
                g = (I[t(322)] || 'text')[t(1479)](),
                v = (I[t(1246)] || '')[t(1479)](),
                A = (I.id || '')[t(1479)](),
                S = (I[t(346)] || '')[t(1479)](),
                d = (I[t(1216)] || '').toLowerCase(),
                _ = (I[t(1503)](t(1282)) || '').toLowerCase();
              let L = '';
              try {
                if (I.id) {
                  const y = document[t(580)]('label[for="' + I.id + '"]');
                  y && (L = (y[t(1065)] || '')[t(1479)]());
                }
                if (!L) {
                  const y = I.closest('label');
                  y && (L = (y.textContent || '')[t(1479)]());
                }
              } catch {}
              if (
                (e ||
                  ((g === t(1179) ||
                    v[t(1265)](t(1179)) !== -1 ||
                    A[t(1265)](t(1179)) !== -1 ||
                    S[t(1265)](t(1179)) !== -1 ||
                    d[t(1265)](t(1179)) !== -1 ||
                    _[t(1265)](t(1179)) !== -1 ||
                    L.indexOf('email') !== -1 ||
                    L.indexOf(t(850)) !== -1) &&
                    (e = !0)),
                o ||
                  ((g === t(1410) ||
                    v[t(1265)](t(1410)) !== -1 ||
                    v.indexOf('passwd') !== -1 ||
                    v.indexOf('pass') !== -1 ||
                    v.indexOf(t(582)) !== -1 ||
                    A[t(1265)](t(1410)) !== -1 ||
                    A[t(1265)](t(825)) !== -1 ||
                    S.indexOf(t(1410)) !== -1 ||
                    d.indexOf('password') !== -1 ||
                    L[t(1265)](t(1410)) !== -1) &&
                    (o = !0)),
                s ||
                  ((g === t(1246) ||
                    v.indexOf(t(1246)) !== -1 ||
                    v[t(1265)]('username') !== -1 ||
                    v[t(1265)](t(559)) !== -1 ||
                    A[t(1265)](t(1246)) !== -1 ||
                    A[t(1265)](t(1376)) !== -1 ||
                    A[t(1265)](t(559)) !== -1 ||
                    S[t(1265)](t(1246)) !== -1 ||
                    S[t(1265)](t(1376)) !== -1 ||
                    d.indexOf(t(1246)) !== -1 ||
                    L[t(1265)]('name') !== -1 ||
                    L.indexOf(t(1376)) !== -1 ||
                    L[t(1265)](t(1150)) !== -1) &&
                    (s = !0)),
                x ||
                  ((g === t(1353) ||
                    g === t(497) ||
                    v[t(1265)](t(727)) !== -1 ||
                    v[t(1265)](t(1353)) !== -1 ||
                    v.indexOf(t(512)) !== -1 ||
                    v.indexOf(t(662)) !== -1 ||
                    A[t(1265)](t(727)) !== -1 ||
                    A[t(1265)](t(1353)) !== -1 ||
                    A.indexOf(t(512)) !== -1 ||
                    S[t(1265)]('tel') !== -1 ||
                    d[t(1265)](t(727)) !== -1 ||
                    L[t(1265)](t(727)) !== -1 ||
                    L[t(1265)](t(512)) !== -1) &&
                    (x = !0)),
                e && o && s && x)
              )
                break;
            }
            return { hasEmail: e, hasPassword: o, hasName: s, hasNumber: x, hasInput: m };
          } catch (n) {
            return (
              l[t(631)].Logger[t(829)]('Error detecting page input fields:', n),
              { hasEmail: !1, hasPassword: !1, hasName: !1, hasNumber: !1, hasInput: !1 }
            );
          }
        }
        static [r(865)]() {
          const t = r;
          try {
            if (!document.getElementById(t(759))) {
              const n = document[t(983)](t(1058));
              ((n.id = t(759)),
                (n.textContent =
                  t(1427) +
                  '@keyframes autofill-detection { 0% { opacity: 1; } 100% { opacity: 1; } }'),
                document[t(1295)].appendChild(n));
            }
            document[t(806)](
              t(1423),
              function (n) {
                const e = t;
                if (n[e(540)] === 'autofill-detection') {
                  const o = n.target;
                  o &&
                    o[e(708)] === e(1513) &&
                    (o[e(318)](e(1072), e(413)), o[e(1266)][e(373)]('autofilled'));
                }
              },
              !0,
            );
          } catch (n) {
            l[t(631)].Logger[t(829)](t(1506), n);
          }
        }
        [r(479)]() {
          const t = r,
            n = this.detectAutofillFields(),
            e = this.detectPageInputFields();
          return {
            AUTOFILL_DETECTED: n[t(632)],
            AUTOFILL_COUNT: n[t(922)],
            AUTOFILL_FIELDS_COUNT: n[t(1169)][t(368)],
            AUTOFILL_METHODS: n[t(928)][t(1512)](','),
            AUTOFILL_FIELD_TYPES: n[t(1169)][t(341)]((o) => o.type)[t(1512)](','),
            HAS_EMAIL: e[t(810)],
            HAS_PASSWORD: e[t(1457)],
            HAS_NAME: e.hasName,
            HAS_NUMBER: e[t(1177)],
            HAS_INPUT: e.hasInput,
          };
        }
        getAutofillMetadataAsync() {
          return __awaiter(this, void 0, void 0, function* () {
            const t = _0x48f7,
              n = yield this[t(316)](),
              e = this[t(1225)]();
            return {
              AUTOFILL_DETECTED: n[t(632)],
              AUTOFILL_COUNT: n[t(922)],
              AUTOFILL_FIELDS_COUNT: n[t(1169)][t(368)],
              AUTOFILL_METHODS: n.detectionMethods[t(1512)](','),
              AUTOFILL_FIELD_TYPES: n.detectedFields[t(341)]((o) => o[t(322)]).join(','),
              HAS_EMAIL: e[t(810)],
              HAS_PASSWORD: e[t(1457)],
              HAS_NAME: e[t(581)],
              HAS_NUMBER: e[t(1177)],
              HAS_INPUT: e[t(1409)],
            };
          });
        }
        [r(1415)]() {
          return __awaiter(this, void 0, void 0, function* () {
            const t = _0x48f7;
            try {
              return document[t(517)](t(816))[t(368)] > 500
                ? yield this[t(1032)]()
                : this[t(479)]();
            } catch (n) {
              return (l._POSignalsUtils[t(867)][t(829)](t(542), n), this[t(479)]());
            }
          });
        }
        detectAutofillFieldsAsync() {
          return __awaiter(this, void 0, void 0, function* () {
            return new Promise((t) => {
              const n = _0x48f7;
              try {
                const e = {
                  hasAutofill: !1,
                  autofillCount: 0,
                  detectedFields: [],
                  detectionMethods: [],
                };
                if (typeof document == 'undefined') {
                  (l[n(631)][n(867)].warn(n(1160)),
                    t({
                      hasAutofill: !1,
                      autofillCount: 0,
                      detectedFields: [],
                      detectionMethods: ['document-unavailable'],
                    }));
                  return;
                }
                let o;
                try {
                  o = document[n(517)]('input');
                } catch (g) {
                  (l._POSignalsUtils[n(867)][n(829)](n(693), g),
                    t({
                      hasAutofill: !1,
                      autofillCount: 0,
                      detectedFields: [],
                      detectionMethods: [n(617)],
                    }));
                  return;
                }
                const s = 2e3,
                  x = Math[n(770)](o[n(368)], s),
                  m = 20;
                let p = 0;
                const I = () => {
                  const g = n,
                    v = Math.min(p + m, x);
                  for (let A = p; A < v; A++)
                    try {
                      const S = o[A],
                        d = this[g(520)](S);
                      d[g(554)] && this[g(1110)](e, S, d);
                    } catch (S) {
                      l[g(631)][g(867)][g(829)](g(793) + A + g(432), S);
                    }
                  ((p = v),
                    p >= x
                      ? t(e)
                      : window.requestIdleCallback
                        ? window.requestIdleCallback(I, { timeout: 50 })
                        : setTimeout(I, 0));
                };
                window[n(518)] ? window[n(518)](I, { timeout: 50 }) : setTimeout(I, 0);
              } catch (e) {
                (l[n(631)][n(867)][n(829)](n(763), e),
                  t({
                    hasAutofill: !1,
                    autofillCount: 0,
                    detectedFields: [],
                    detectionMethods: ['async-error'],
                  }));
              }
            });
          });
        }
      }
      i[r(1201)] = a;
    })((E = l[f(813)] || (l[f(813)] = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    const f = _0x44f950;
    let E;
    (function (i) {
      const r = _0x48f7;
      class a {
        constructor() {
          const t = _0x48f7;
          ((this[t(323)] = t(1460)),
            (this[t(898)] = t(1093)),
            (this[t(1483)] = [t(1167), 'sans-serif', 'serif']),
            (this[t(522)] = [
              t(406),
              'Arial Black',
              'Arial Narrow',
              'Arial Rounded MT Bold',
              t(530),
              t(758),
              'Cambria',
              'Cambria Math',
              t(701),
              t(1308),
              t(1458),
              t(668),
              t(1158),
              t(546),
              t(609),
              'Franklin Gothic Medium',
              t(843),
              'Gadugi',
              t(1524),
              'HoloLens MDL2 Assets',
              t(890),
              t(779),
              t(926),
              t(1069),
              t(1354),
              t(1334),
              t(1348),
              t(1194),
              t(728),
              'Microsoft JhengHei',
              t(910),
              t(1260),
              'Microsoft Sans Serif',
              t(778),
              t(1403),
              t(629),
              t(1520),
              'Mongolian Baiti',
              t(899),
              t(976),
              'Myanmar Text',
              t(1005),
              t(819),
              t(1426),
              t(425),
              t(1514),
              t(1349),
              'Segoe UI Historic',
              'Segoe UI Emoji',
              t(535),
              t(343),
              t(452),
              t(1212),
              t(424),
              t(519),
              t(695),
              t(408),
              'Verdana',
              t(1361),
              'Wingdings',
              t(1220),
              t(1360),
              'Andale Mono',
              t(656),
              t(1219),
              t(547),
              t(1473),
              t(635),
              'AppleMyungjo',
              t(1293),
              t(904),
              t(515),
              'Avenir Next',
              t(488),
              t(1526),
              t(1135),
              t(1122),
              'Bodoni 72 Oldstyle',
              t(1519),
              'Bradley Hand',
              t(1286),
              t(1471),
              t(981),
              'Chalkduster',
              t(935),
              t(313),
              t(464),
              t(1352),
              t(528),
              'Futura',
              'Geneva',
              'Gill Sans',
              'Helvetica',
              t(1107),
              t(1464),
              'Hoefler Text',
              t(890),
              'Lucida Grande',
              'Luminari',
              t(828),
              t(1470),
              t(800),
              'Noteworthy',
              t(971),
              'Palatino',
              'Papyrus',
              t(676),
              'Rockwell',
              t(541),
              t(466),
              t(864),
              'Snell Roundhand',
              'Tahoma',
              t(427),
              t(1490),
              t(484),
              t(1090),
              t(821),
              t(1364),
              t(977),
              t(1182),
              'DejaVu Sans',
              t(543),
              t(371),
              t(724),
              'Droid Sans Mono',
              t(1244),
              t(461),
              t(487),
              t(1132),
              t(1133),
              'Gubbi',
              t(578),
              'Khmer OS',
              t(1176),
              t(1419),
              t(1518),
              t(1358),
              t(733),
              t(1344),
              'Lohit Devanagari',
              t(887),
              t(1173),
              t(434),
              t(332),
              t(740),
              'Noto Nastaliq Urdu',
              t(644),
              t(529),
              t(1046),
              t(1491),
              'Noto Sans CJK TC',
              'Noto Serif',
              t(1020),
              t(776),
              t(1527),
              t(379),
              t(1018),
              'Ubuntu',
              t(400),
              t(513),
              t(732),
              t(924),
              t(1007),
              t(724),
              t(1244),
              t(401),
              t(458),
              t(350),
              t(1442),
              t(504),
              t(1086),
              'Roboto Slab',
              t(1041),
              t(1155),
              t(1467),
              'PT Sans',
              t(777),
              t(396),
              t(564),
              t(1432),
              t(868),
              t(499),
              t(914),
              t(857),
              t(1222),
              t(521),
              t(787),
              'Batang',
              t(1010),
              t(493),
              t(968),
              'Clarendon',
              t(672),
              'Franklin Gothic',
              t(311),
              t(747),
              t(826),
              t(1253),
              t(524),
              t(390),
              t(1050),
              t(823),
              t(576),
              t(1392),
              t(734),
              t(1040),
              t(730),
              t(1452),
              t(1077),
              t(1059),
              'MYRIAD PRO',
              t(765),
              t(831),
              'Microsoft Uighur',
              t(443),
              t(653),
              t(412),
              t(1456),
              t(955),
              t(681),
              t(1509),
              t(551),
              t(1112),
              'Staccato222 BT',
              t(792),
              t(1214),
              t(876),
              'ZWAdobeF',
            ]));
        }
        [r(394)]() {
          return __awaiter(this, void 0, void 0, function* () {
            const t = _0x48f7,
              n = performance.now();
            try {
              const e = yield this.detectFontsWithIframe(),
                o = performance[t(308)](),
                s = Math.round(o - n),
                x = this[t(1232)](e);
              return { availableFonts: e, fontHash: x, detectionMethod: t(1505) };
            } catch (e) {
              return (
                l[t(631)][t(867)].warn(t(416), e),
                { availableFonts: [], fontHash: '', detectionMethod: t(1505) }
              );
            }
          });
        }
        [r(569)]() {
          return new Promise((t, n) => {
            const e = _0x48f7,
              o = document[e(983)](e(697));
            (o[e(1058)].setProperty(e(1421), e(964), e(1309)),
              (o.style[e(1351)] = e(685)),
              (o.style[e(991)] = '-9999px'),
              (o.style.top = e(735)));
            const s = () => {
                const m = e;
                try {
                  const p = o[m(766)] || o[m(772)][m(1306)],
                    I = this[m(588)](p);
                  (o[m(738)] && o[m(738)].removeChild(o), t(I));
                } catch (p) {
                  (o[m(738)] && o.parentNode.removeChild(o), n(p));
                }
              },
              x = () => {
                const m = e;
                (o[m(738)] && o.parentNode[m(960)](o),
                  n(new Error('Failed to create iframe for font detection')));
              };
            (o[e(806)](e(925), s), o[e(806)](e(381), x), document[e(1141)][e(896)](o));
          });
        }
        [r(588)](t) {
          const n = r,
            e = t[n(1141)];
          e.style[n(934)] = this[n(898)];
          const o = t.createElement(n(1367));
          (o[n(1058)][n(1229)]('visibility', 'hidden', 'important'),
            (o[n(1058)][n(1351)] = n(685)),
            (o.style[n(991)] = n(735)),
            (o.style[n(550)] = n(735)));
          const s = {},
            x = this[n(1483)].map((p) => {
              const I = n,
                g = t.createElement(I(1425));
              return (
                (g.style[I(1351)] = I(685)),
                (g[I(1058)][I(550)] = '0'),
                (g[I(1058)][I(991)] = '0'),
                (g[I(1058)][I(712)] = p),
                (g[I(1058)].fontSize = this[I(898)]),
                (g[I(1065)] = this[I(323)]),
                o[I(896)](g),
                { font: p, span: g }
              );
            });
          (e.appendChild(o),
            x.forEach(({ font: p, span: I }) => {
              s[p] = { width: I.offsetWidth, height: I.offsetHeight };
            }));
          const m = [];
          for (const p of this[n(522)]) {
            let I = !1;
            for (const g of this[n(1483)]) {
              const v = t.createElement(n(1425));
              ((v[n(1058)].position = n(685)),
                (v[n(1058)][n(550)] = '0'),
                (v.style.left = '0'),
                (v[n(1058)][n(712)] = "'" + p + n(1466) + g),
                (v[n(1058)][n(934)] = this[n(898)]),
                (v[n(1065)] = this[n(323)]),
                o[n(896)](v));
              const A = v.offsetWidth,
                S = v[n(952)];
              if (A !== s[g][n(1431)] || S !== s[g][n(507)]) {
                I = !0;
                break;
              }
            }
            I && m[n(939)](p);
          }
          return (o[n(738)] && o[n(738)][n(960)](o), m);
        }
        [r(1232)](t) {
          const n = r;
          if (t[n(368)] === 0) return '';
          const e = t[n(1068)]()[n(1512)](',');
          return this[n(671)](e);
        }
        [r(671)](t) {
          const n = r;
          let e = 0,
            o = 0;
          for (let I = 0; I < t[n(368)]; I++) {
            const g = t.charCodeAt(I);
            ((e = (e << 5) - e + g), (e = e | 0), (o = g + (o << 6) + (o << 16) - o), (o = o | 0));
          }
          const s = e >>> 0,
            x = o >>> 0;
          let m = s[n(861)](16);
          for (; m[n(368)] < 8; ) m = '0' + m;
          let p = x[n(861)](16);
          for (; p[n(368)] < 8; ) p = '0' + p;
          return m + p;
        }
        [r(352)]() {
          return __awaiter(this, void 0, void 0, function* () {
            const t = _0x48f7,
              n = performance[t(308)]();
            try {
              const e = document[t(983)](t(457)),
                o = e[t(1482)]('2d');
              if (!o) throw new Error(t(1243));
              ((e.width = 500), (e[t(507)] = 200));
              const s = [],
                x = {};
              for (const g of this.baseFonts)
                (o[t(575)](0, 0, e[t(1431)], e[t(507)]),
                  (o[t(364)] = this[t(898)] + ' ' + g),
                  o[t(468)](this.testString, 0, 100),
                  (x[g] = e[t(1008)]()));
              for (const g of this[t(522)]) {
                let v = !1;
                for (const A of this[t(1483)])
                  if (
                    (o[t(575)](0, 0, e[t(1431)], e[t(507)]),
                    (o[t(364)] = this[t(898)] + " '" + g + "', " + A),
                    o[t(468)](this[t(323)], 0, 100),
                    e[t(1008)]() !== x[A])
                  ) {
                    v = !0;
                    break;
                  }
                v && s[t(939)](g);
              }
              const m = performance[t(308)](),
                p = Math[t(620)](m - n),
                I = this[t(1232)](s);
              return { availableFonts: s, fontHash: I, detectionMethod: t(457) };
            } catch (e) {
              return (
                l[t(631)].Logger.warn(t(921), e),
                { availableFonts: [], fontHash: '', detectionMethod: t(457) }
              );
            }
          });
        }
        [r(353)]() {
          return __awaiter(this, void 0, void 0, function* () {
            const t = _0x48f7,
              n = performance.now();
            try {
              const e = [
                  t(406),
                  t(758),
                  t(1275),
                  t(1308),
                  t(1458),
                  t(546),
                  'Georgia',
                  t(890),
                  t(1349),
                  t(519),
                  t(695),
                  t(408),
                  t(762),
                  t(1360),
                  t(1473),
                  t(515),
                  t(716),
                  t(1107),
                  t(1413),
                  'Lucida Grande',
                  'Menlo',
                  t(800),
                  'Palatino',
                  t(484),
                  t(1231),
                  t(543),
                  t(371),
                  t(1518),
                  t(1358),
                  t(1344),
                  t(396),
                  t(513),
                  t(924),
                  t(724),
                  t(1244),
                  'Open Sans',
                  t(504),
                  t(1086),
                  t(514),
                ],
                o = yield this[t(1498)](e),
                s = this[t(1232)](o);
              return { availableFonts: o, fontHash: s, detectionMethod: t(1505) };
            } catch (e) {
              return (
                l[t(631)].Logger[t(829)]('Quick font detection failed', e),
                { availableFonts: [], fontHash: '', detectionMethod: 'size' }
              );
            }
          });
        }
        [r(1498)](t) {
          return new Promise((n, e) => {
            const o = _0x48f7,
              s = document[o(983)](o(697));
            (s[o(1058)].setProperty(o(1421), o(964), o(1309)),
              (s[o(1058)][o(1351)] = o(685)),
              (s[o(1058)][o(991)] = o(735)),
              (s[o(1058)].top = '-9999px'));
            const x = () => {
                const p = o;
                try {
                  const I = s[p(766)] || s.contentWindow[p(1306)],
                    g = I[p(1141)];
                  g[p(1058)].fontSize = this[p(898)];
                  const v = I[p(983)](p(1367));
                  (v[p(1058)][p(1229)](p(1421), p(964), 'important'),
                    (v[p(1058)][p(1351)] = p(685)),
                    (v[p(1058)][p(991)] = p(735)),
                    (v[p(1058)][p(550)] = '-9999px'));
                  const A = {},
                    S = this[p(1483)][p(341)]((_) => {
                      const L = p,
                        y = I[L(983)]('span');
                      return (
                        (y[L(1058)][L(1351)] = 'absolute'),
                        (y[L(1058)][L(550)] = '0'),
                        (y[L(1058)][L(991)] = '0'),
                        (y.style[L(712)] = _),
                        (y[L(1058)][L(934)] = this[L(898)]),
                        (y[L(1065)] = this.testString),
                        v[L(896)](y),
                        { font: _, span: y }
                      );
                    });
                  (g[p(896)](v),
                    S[p(892)](({ font: _, span: L }) => {
                      A[_] = { width: L.offsetWidth, height: L.offsetHeight };
                    }));
                  const d = [];
                  for (const _ of t) {
                    let L = !1;
                    for (const y of this.baseFonts) {
                      const O = I[p(983)](p(1425));
                      ((O.style[p(1351)] = 'absolute'),
                        (O.style[p(550)] = '0'),
                        (O[p(1058)][p(991)] = '0'),
                        (O.style[p(712)] = "'" + _ + p(1466) + y),
                        (O[p(1058)][p(934)] = this[p(898)]),
                        (O.textContent = this[p(323)]),
                        v.appendChild(O));
                      const M = O.offsetWidth,
                        R = O.offsetHeight;
                      if (M !== A[y].width || R !== A[y].height) {
                        L = !0;
                        break;
                      }
                    }
                    L && d[p(939)](_);
                  }
                  (v.parentNode && v[p(738)][p(960)](v),
                    s.parentNode && s[p(738)].removeChild(s),
                    n(d));
                } catch (I) {
                  (s[p(738)] && s[p(738)].removeChild(s), e(I));
                }
              },
              m = () => {
                const p = o;
                (s.parentNode && s.parentNode[p(960)](s),
                  e(new Error('Failed to create iframe for font detection')));
              };
            (s[o(806)]('load', x), s[o(806)](o(381), m), document[o(1141)][o(896)](s));
          });
        }
      }
      i[r(428)] = a;
    })((E = l[f(813)] || (l[f(813)] = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    const f = _0x44f950;
    let E;
    (function (i) {
      const r = _0x48f7;
      class a {
        get [r(711)]() {
          const n = r;
          if (!this[n(567)].browserInfo[n(1508)]) return 0;
          let e = this[n(600)].ops;
          return (!e && ((e = this[n(696)]()), (this[n(600)].ops = e)), e);
        }
        constructor(n, e, o, s) {
          const x = r;
          ((this.sessionData = n),
            (this.metadataParams = e),
            (this[x(496)] = o),
            (this.localAgentAccessor = s),
            (this[x(549)] = null),
            (this[x(1327)] = null),
            (this[x(1100)] = null),
            (this[x(1178)] = null),
            (this[x(1120)] = null),
            (this.isBatterySupported = null),
            (this[x(1187)] = null),
            (this[x(358)] = null),
            (this.batteryChargingTime = null),
            (this[x(1346)] = null),
            (this[x(1469)] = new Map()),
            (this.lieTests = {}),
            (this[x(485)] = null),
            (this[x(717)] = new Set([
              x(1121),
              x(1104),
              'audio',
              'audioBaseLatency',
              x(457),
              x(1385),
              x(356),
              x(807),
              x(568),
              x(1411),
              x(1210),
              x(1127),
              x(1031),
              x(639),
              x(663),
              x(834),
              x(1070),
              x(969),
              x(1289),
              'invertedColors',
              'languages',
              x(1446),
              'monochrome',
              x(411),
              'osCpu',
              x(1371),
              x(1057),
              x(492),
              x(516),
              x(1285),
              x(885),
              'screenFrame',
              'screenResolution',
              'sessionStorage',
              x(658),
              x(1240),
              x(1230),
              x(354),
              x(847),
            ])),
            (this[x(1393)] = -1),
            (this[x(726)] = 0),
            (this[x(604)] = 0),
            (this[x(437)] = []),
            (this[x(509)] = []),
            (this.audioOutputDevices = []),
            (this[x(367)] = new Map()),
            (this[x(1337)] = null),
            (this[x(589)] = null),
            (this[x(907)] = 0),
            (this.metadataQueue = new l[x(417)](1)),
            (this[x(1174)] = null),
            (this[x(849)] = null),
            (this.autoFillMeta = new i.AutofillDetector()),
            (this[x(624)] = null),
            (this[x(1166)] = null));
        }
        getDeviceAttributes() {
          return __awaiter(this, void 0, void 0, function* () {
            const n = _0x48f7;
            return this[n(646)][n(373)](() =>
              __awaiter(this, void 0, void 0, function* () {
                const e = n;
                !this[e(1337)] &&
                  ((this.lastCalculatedMetadata = yield this.calculateDeviceMetadata()),
                  l._POSignalsUtils[e(867)][e(1300)](e(430)),
                  l[e(631)][e(867)][e(1300)](e(879) + this.deviceId),
                  l[e(631)][e(867)][e(1300)](e(875) + this[e(1327)]),
                  this[e(600)].closeTrustStore());
                const o =
                  typeof window !== e(480) &&
                  window[e(342)] &&
                  typeof window[e(342)][e(368)] === e(497)
                    ? window[e(342)][e(368)]
                    : null;
                return (
                  this.lastCalculatedMetadata && (this.lastCalculatedMetadata[e(1019)] = o),
                  this[e(600)] && this[e(600)][e(1384)] && (yield this[e(377)]()),
                  yield this[e(1320)](),
                  this[e(600)] && this[e(600)][e(945)] && this[e(395)](),
                  this[e(600)][e(1472)] && (this[e(1174)] = JSON.stringify(this[e(1337)])),
                  this[e(1337)]
                );
              }),
            );
          });
        }
        getGeoLocationData() {
          var n, e, o, s;
          return __awaiter(this, void 0, void 0, function* () {
            const x = _0x48f7;
            this[x(1337)] = Object.assign(Object.assign({}, this[x(1337)]), {
              htmlGeoLocation_latitude: void 0,
              htmlGeoLocation_longitude: void 0,
              htmlGeoLocation_accuracy: void 0,
              htmlGeoLocation_speed: void 0,
              htmlGeoLocation_heading: void 0,
              htmlGeoLocation_timestamp: void 0,
              htmlGeoLocation_ErrorMessage: '',
              htmlGeoLocation_ErrorCode: '',
            });
            const m = (_, L = '') => {
                const y = x,
                  O = _[y(368)] > 255 ? _[y(1106)](0, 252) + y(360) : _;
                return (
                  (this[y(1337)].htmlGeoLocation_ErrorMessage = O),
                  (this[y(1337)][y(894)] = L),
                  { status: y(381), message: O }
                );
              },
              p = (_) => {
                const L = x;
                switch (_) {
                  case 1:
                    return m(L(607), L(1287));
                  case 2:
                    return m(L(756), L(1171));
                  case 3:
                    return m(L(805), L(591));
                  default:
                    return m(L(1197), L(1171));
                }
              };
            if (!navigator[x(597)])
              return m('Geolocation API is not supported by this browser.', x(933));
            const I = this[x(1337)][x(1379)].toLowerCase(),
              g = I[x(1461)](x(1084)),
              v = I[x(1461)](x(1478));
            let A = !1;
            const S = yield navigator[x(1184)][x(410)]({ name: x(597) });
            if (((this[x(1337)][x(917)] = S[x(628)]), S[x(628)] === x(338)))
              return m(x(1313) + S[x(628)] + x(714) + I + "'.", 'PERMISSION_DENIED');
            const d = this[x(600)][x(1302)]();
            if (d)
              try {
                const _ = JSON.parse(d);
                if (_ && _.latitude && _[x(1028)])
                  ((this[x(1337)][x(675)] = _[x(398)] ? parseFloat(_.latitude[x(1525)](2)) : null),
                    (this[x(1337)][x(958)] = _[x(1028)]
                      ? parseFloat(_[x(1028)][x(1525)](2))
                      : null),
                    (this[x(1337)].htmlGeoLocation_accuracy =
                      (n = _[x(801)]) !== null && n !== void 0 ? n : null),
                    (this[x(1337)][x(703)] = (e = _.speed) !== null && e !== void 0 ? e : null),
                    (this[x(1337)][x(314)] = (o = _.heading) !== null && o !== void 0 ? o : null),
                    (this[x(1337)][x(651)] = (s = _[x(456)]) !== null && s !== void 0 ? s : null),
                    delete this.lastCalculatedMetadata[x(1092)],
                    delete this[x(1337)][x(894)],
                    (A = !0));
                else if (_ && _.error_code) return ((A = !1), p(_[x(1530)]));
              } catch (_) {
                l._POSignalsUtils.Logger[x(1300)]('Invalid geoData JSON in session storage:', _);
              }
            if (S[x(628)] === 'granted')
              return yield new Promise((_) => {
                const L = { timeout: 500 },
                  y = (O = 1) => {
                    const M = _0x48f7;
                    navigator.geolocation[M(942)](
                      (R) => {
                        const k = M;
                        var B;
                        const {
                          latitude: D,
                          longitude: G,
                          accuracy: N,
                          speed: ne,
                          heading: he,
                        } = R[k(481)];
                        if ((!D || !G || D === 0 || G === 0) && (g || v) && O === 1) return y(2);
                        ((this[k(1337)].htmlGeoLocation_latitude = D
                          ? parseFloat(D[k(1525)](2))
                          : void 0),
                          (this[k(1337)].htmlGeoLocation_longitude = G
                            ? parseFloat(G[k(1525)](2))
                            : void 0),
                          (this.lastCalculatedMetadata.htmlGeoLocation_accuracy = N),
                          (this[k(1337)].htmlGeoLocation_speed = ne),
                          (this.lastCalculatedMetadata.htmlGeoLocation_heading = he),
                          (this[k(1337)].htmlGeoLocation_timestamp =
                            (B = R[k(456)]) !== null && B !== void 0 ? B : null),
                          delete this[k(1337)][k(1092)],
                          delete this[k(1337)][k(894)],
                          (A = !0),
                          _({ status: k(454) }));
                      },
                      (R) => {
                        (_(p(R[M(1416)])), (A = !1));
                      },
                      L,
                    );
                  };
                y();
              });
            if (!A) return m(x(1313) + S[x(628)] + x(1234) + I + "'", x(1171));
          });
        }
        refreshDeviceAttributes() {
          return __awaiter(this, void 0, void 0, function* () {
            const n = _0x48f7;
            yield this[n(1383)]();
            const e =
              typeof window != 'undefined' &&
              window[n(342)] &&
              typeof window.history[n(368)] === n(497)
                ? window[n(342)][n(368)]
                : null;
            this.lastCalculatedMetadata && (this[n(1337)][n(1019)] = e);
            const o = this[n(1186)][n(479)]();
            Object.assign(this.lastCalculatedMetadata, o);
          });
        }
        [r(1383)]() {
          return __awaiter(this, void 0, void 0, function* () {
            const n = _0x48f7,
              e = 160,
              o = window[n(883)] - window[n(1330)] > e,
              s = window[n(1332)] - window.innerHeight > e,
              x = n(o ? 421 : 1109);
            ((this[n(1337)][n(999)] = n(o || s ? 330 : 1474)),
              (this[n(1337)][n(918)] = o || s ? x : n(477)));
          });
        }
        [r(994)]() {
          return __awaiter(this, void 0, void 0, function* () {
            const n = _0x48f7;
            return this[n(646)][n(373)](() =>
              __awaiter(this, void 0, void 0, function* () {
                const e = n;
                if (this[e(907)] >= 5) return this.localAgentJwt;
                if (this[e(600)][e(1011)])
                  return (
                    !this[e(589)] && (this[e(589)] = yield this[e(1076)][e(1292)]()),
                    this[e(907)]++,
                    this[e(589)]
                  );
              }),
            );
          });
        }
        [r(795)]() {
          return { identifier: 'x1', key: 'Xq7tSbjB517mhZwt' };
        }
        getSerializedDeviceAttributes() {
          return this[r(1174)];
        }
        [r(1329)]() {
          return __awaiter(this, void 0, void 0, function* () {
            const n = _0x48f7;
            this[n(485)] = navigator[n(597)] != null;
            const e = this[n(567)][n(788)],
              o = [
                this.sessionData[n(324)]().catch((x) => {
                  const m = n;
                  l[m(631)][m(867)][m(1300)](m(694), x);
                }),
                this[n(1441)](e)[n(689)]((x) => {
                  const m = n;
                  l[m(631)][m(867)][m(1300)]('failed to get fingerprint info', x.message);
                }),
                this[n(1154)]()[n(689)]((x) => {
                  const m = n;
                  l[m(631)][m(867)].info(m(1485), x[m(768)]);
                }),
                i[n(1003)][n(1304)]()[n(689)]((x) => l._POSignalsUtils[n(867)][n(1300)](n(916), x)),
                this[n(418)]()[n(689)]((x) => l[n(631)][n(867)][n(1300)](n(1276), x)),
                new i[n(1459)](e)[n(627)]()[n(689)]((x) => l[n(631)][n(867)][n(1300)](n(537), x)),
                new i[n(1004)](e)
                  [n(328)]()
                  .catch((x) =>
                    l._POSignalsUtils[n(867)][n(1300)]('failed to get lies results', x),
                  ),
                this.audioIntVideoInit()[n(689)]((x) => l[n(631)].Logger.info(n(387), x)),
                this[n(508)]()[n(689)]((x) => l[n(631)][n(867)][n(1300)](n(503), x)),
                this[n(1339)](e)[n(689)]((x) => l._POSignalsUtils[n(867)].info(n(757), x)),
                this[n(625)]()[n(689)]((x) => {
                  const m = n;
                  return (l[m(631)][m(867)][m(1300)]('failed to get voices info', x), 0);
                }),
              ];
            (([
              this[n(549)],
              this.fingerPrint,
              this[n(750)],
              this[n(1051)],
              this[n(1184)],
              this[n(1469)],
              this[n(1033)],
              ,
              ,
              this[n(624)],
              this[n(1166)],
            ] = yield Promise[n(683)](o)),
              (this[n(1327)] = this.sessionData.getDeviceCreatedAt()));
            const s = {
              ops: this.OPS,
              devicePixelRatio: window[n(1209)],
              screenWidth: window[n(405)][n(1431)],
              screenHeight: window[n(405)][n(507)],
            };
            return (
              l[n(631)][n(1139)][n(872)](s, screen, !1),
              Object[n(1312)](
                Object[n(1312)](
                  Object[n(1312)](
                    Object.assign(
                      {
                        deviceId: this[n(549)],
                        device_created_ts: this[n(1327)],
                        deviceType: this[n(567)][n(419)].deviceType,
                        osVersion:
                          (this[n(567)][n(419)][n(1311)] + ' ' + this[n(567)][n(419)][n(719)])[
                            n(1451)
                          ]() || '',
                        externalIdentifiers: this[n(496)],
                        origin: location[n(1434)],
                        href: location.href,
                      },
                      yield this[n(445)](e),
                    ),
                    this[n(393)](),
                  ),
                  this.getSensorsMetadata(),
                ),
                s,
              )
            );
          });
        }
        [r(508)]() {
          return __awaiter(this, void 0, void 0, function* () {
            const n = _0x48f7,
              e = this;
            yield l[n(631)].Util[n(989)](
              50,
              new Promise((o, s) => {
                const x = n;
                navigator[x(1268)]
                  ? ((this[x(1404)] = !0),
                    navigator
                      .getBattery()
                      [x(804)]((m) => {
                        const p = x;
                        (m &&
                          ((e.batteryLevel = m[p(1137)]),
                          (e[p(358)] = m[p(944)]),
                          (e[p(1146)] = m.chargingTime),
                          (e[p(1346)] = m[p(1397)])),
                          o());
                      })
                      [x(689)]((m) => {
                        const p = x;
                        (l[p(631)][p(867)][p(1300)](p(630) + m), o());
                      }))
                  : (l._POSignalsUtils[x(867)][x(1300)](x(1444)), o());
              }),
            );
          });
        }
        [r(1336)]() {
          const n = r,
            e = /^((?!chrome|android).)*safari/i[n(431)](navigator[n(641)]);
          return !l._POSignalsUtils[n(1139)].inIframe() || !e;
        }
        getRTCPeerConnection() {
          const n = r;
          let e = window[n(1118)] || window[n(1394)] || window[n(1223)];
          if (!e) {
            const o = window['iframe.contentWindow'];
            o && (e = o[n(1118)] || o.mozRTCPeerConnection || o[n(1223)]);
          }
          return e;
        }
        [r(482)]() {
          const n = r,
            e = this;
          try {
            const o = {},
              s = this[n(1369)](),
              x = { optional: [{ RtpDataChannels: !0 }] },
              m = { iceServers: [{ urls: this[n(567)][n(556)][n(1451)]() }] },
              p = new s(m, x);
            ((p[n(1499)] = (I) => {
              const g = n,
                v = 1;
              if (I[g(1188)]) {
                const A = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/,
                  S = A[g(1079)](I[g(1188)][g(1188)])[1];
                (o[S] === void 0 &&
                  (I[g(1188)][g(1188)][g(1265)]('host') > 0
                    ? e[g(367)][g(525)]('WEB_RTC_HOST_IP', S)
                    : I[g(1188)][g(1188)][g(1265)]('srflx') > 0 &&
                      e[g(367)][g(525)]('WEB_RTC_SRFLX_IP', S)),
                  (o[S] = !0));
              }
            }),
              p[n(1422)](''),
              p[n(1489)](
                function (I) {
                  p.setLocalDescription(
                    I,
                    function () {},
                    function () {},
                  );
                },
                function () {},
              ));
          } catch {}
        }
        [r(974)]() {
          return __awaiter(this, void 0, void 0, function* () {
            const n = _0x48f7,
              e = this;
            yield l[n(631)][n(1139)][n(989)](
              50,
              new Promise((o, s) => {
                const x = n;
                if (!this[x(1336)]()) {
                  (l._POSignalsUtils[x(867)][x(1420)](x(986)), o());
                  return;
                }
                if (!navigator[x(855)] || !navigator.mediaDevices[x(1052)]) {
                  (l[x(631)][x(867)][x(1420)](x(1331)), o());
                  return;
                }
                navigator.mediaDevices[x(1052)]()
                  [x(804)]((m) => {
                    const p = x;
                    (m[p(892)]((I) => {
                      const g = p;
                      I[g(790)] &&
                        (I[g(790)][g(1479)]() == 'audioinput'
                          ? ((e[g(1100)] = !0),
                            e[g(604)]++,
                            I[g(1078)] && e.audioInputDevices[g(939)](I.label))
                          : I[g(790)][g(1479)]() == g(562)
                            ? ((e.hasWebcam = !0),
                              e[g(726)]++,
                              I[g(1078)] && e.videoInputDevices[g(939)](I.label))
                            : I[g(790)][g(1479)]() == 'audiooutput' &&
                              ((e[g(1178)] = !0),
                              e.numberOfAudioDevices++,
                              I[g(1078)] && e[g(938)][g(939)](I[g(1078)])));
                    }),
                      o());
                  })
                  [x(689)]((m) => {
                    const p = x;
                    (l[p(631)][p(867)][p(1300)]('enumerateDevices failed', m), o());
                  });
              }),
            );
          });
        }
        [r(1441)](n) {
          return __awaiter(this, void 0, void 0, function* () {
            const e = _0x48f7;
            if (n[e(438)](e(1009))) return Promise[e(1347)]('');
            const o = new Promise((x, m) =>
                __awaiter(this, void 0, void 0, function* () {
                  const p = e;
                  try {
                    const I = yield l[p(389)][p(925)](),
                      g = yield I[p(996)]();
                    ((this[p(687)] = g[p(453)]), (this[p(1418)] = g[p(953)]), x(g[p(453)]));
                  } catch (I) {
                    l[p(631)][p(867)][p(1300)](p(623) + I);
                    const g = { err: I, message: p(329) };
                    m(g);
                  }
                }),
              ),
              s = new Promise((x, m) =>
                __awaiter(this, void 0, void 0, function* () {
                  const p = e;
                  yield l._POSignalsUtils[p(1139)][p(929)](this[p(567)].fingerprintTimeoutMillis);
                  const I = { message: p(873) };
                  m(I);
                }),
              );
            return yield Promise.race([o, s]);
          });
        }
        [r(1154)]() {
          return __awaiter(this, void 0, void 0, function* () {
            return new Promise((n, e) => {
              const o = _0x48f7;
              l.BroprintJS[o(640)]()
                .then((s) => {
                  const x = o;
                  ((this[x(750)] = s), n(s));
                })
                [o(689)]((s) => {
                  const x = o;
                  (l[x(631)][x(867)].info(
                    'Failed to get Fingerprint from getCurrentBrowserFingerPrint',
                    s,
                  ),
                    e(s));
                });
            });
          });
        }
        [r(1339)](n) {
          return __awaiter(this, void 0, void 0, function* () {
            const e = _0x48f7;
            if (n[e(438)]('fontFingerprint')) return Promise.resolve(null);
            try {
              const o = new i[e(428)](),
                s = yield o.getQuickFingerprint();
              return ((this[e(624)] = s), s);
            } catch (o) {
              return (l[e(631)][e(867)].info(e(1375) + o), null);
            }
          });
        }
        getSensorsMetadata() {
          const n = r,
            e = {};
          return (
            this[n(592)](e, n(760), () => n(335) in window),
            this[n(592)](e, 'IS_TOUCH_DEVICE', () => 'ontouchstart' in window),
            !window[n(1401)] && this[n(592)](e, n(665), () => !1),
            !window[n(886)] && this.flatAndAddMetadata(e, n(532), () => !1),
            this[n(592)](e, n(761), () => n(486) in window),
            e
          );
        }
        getIdentificationMetadata(n) {
          return __awaiter(this, void 0, void 0, function* () {
            const e = _0x48f7,
              o = this,
              s = {};
            (this[e(592)](s, 'FINGER_PRINT', () => this[e(687)]),
              this[e(592)](s, e(501), () => this[e(750)]),
              this[e(624)] &&
                this[e(592)](s, e(1192), () => {
                  const d = e;
                  return this[d(624)][d(447)];
                }),
              this[e(567)].browserInfo[e(869)] &&
                (this[e(592)](s, e(1034), () => {
                  const d = e;
                  return this[d(567)][d(419)].osName;
                }),
                this.flatAndAddMetadata(s, e(884), () => {
                  const d = e;
                  return this[d(567)][d(419)][d(719)];
                })),
              this[e(567)][e(419)][e(869)] &&
                (this[e(592)](s, e(901), () => {
                  const d = e;
                  return this.metadataParams[d(419)][d(1143)];
                }),
                this[e(592)](s, 'DEVICE_VENDOR', () => {
                  const d = e;
                  return this[d(567)][d(419)][d(900)];
                }),
                this[e(592)](s, 'DEVICE_CATEGORY', () => {
                  const d = e;
                  return this.metadataParams[d(419)][d(1399)];
                })),
              this[e(567)][e(419)][e(869)] &&
                (this[e(592)](s, e(655), () => {
                  const d = e;
                  return this[d(567)][d(419)][d(975)];
                }),
                this[e(592)](s, 'BROWSER_ENGINE_VERSION', () => {
                  const d = e;
                  return this.metadataParams[d(419)][d(1495)];
                })),
              this[e(567)][e(419)].userAgentData &&
                this.flatAndAddMetadata(s, 'CPU_ARCHITECTURE', () => {
                  const d = e;
                  return this.metadataParams[d(419)][d(822)];
                }),
              this.metadataParams[e(419)].userAgentData &&
                (this[e(592)](s, 'BROWSER_NAME', () => {
                  const d = e;
                  return this[d(567)][d(419)].browserName;
                }),
                this[e(592)](s, e(863), () => {
                  const d = e;
                  return this.metadataParams[d(419)][d(866)];
                }),
                this.flatAndAddMetadata(s, e(1101), () => {
                  const d = e;
                  return this[d(567)][d(419)][d(690)];
                }),
                this[e(592)](s, 'BROWSER_TYPE', () => {
                  const d = e;
                  return this[d(567)][d(419)][d(659)];
                })));
            const x = new i[e(1408)]();
            (this[e(592)](s, e(1328), () => {
              const d = e;
              return x[d(1044)](this.metadataParams.browserInfo[d(869)].ua);
            }),
              this[e(592)](s, 'IS_BOT', () => {
                const d = e;
                return x[d(1203)](this.metadataParams[d(419)][d(869)].ua);
              }),
              this.flatAndAddMetadata(s, e(870), () => {
                const d = e;
                return x.isChromeFamily(this[d(567)][d(419)][d(869)][d(1450)]);
              }),
              this[e(592)](s, 'IS_ELECTRON_FAMILY', () => {
                const d = e;
                return x[d(1047)](this[d(567)][d(419)].userAgentData.ua);
              }),
              this.flatAndAddMetadata(s, e(598), () => navigator.vendor),
              this[e(592)](s, e(1114), () => {
                const d = e;
                return navigator[d(492)] ? navigator[d(492)][d(368)] : null;
              }),
              this.flatAndAddMetadata(s, e(1035), () => {
                const d = e;
                return navigator.mimeTypes ? navigator[d(614)][d(368)] : null;
              }),
              this[e(592)](s, e(1400), () => {
                const d = e;
                return (
                  navigator[d(359)] ||
                  navigator[d(351)] ||
                  navigator.browserLanguage ||
                  navigator.systemLanguage
                );
              }),
              this.flatAndAddMetadata(s, e(784), () => navigator[e(1402)]));
            const m = navigator[e(1402)] ? navigator.languages[e(368)] : 0;
            this[e(592)](s, 'NAVIGATOR_LANGUAGES_COUNT', () => m);
            const p = this[e(1166)] !== null ? this[e(1166)] : 0;
            (this[e(592)](s, e(1477), () => p),
              this[e(592)](s, 'NAVIGATOR_MAX_TOUCH_POINTS', () => {
                const d = e;
                return navigator[d(858)] || navigator[d(1238)];
              }),
              this[e(592)](s, e(1438), () => navigator[e(965)] || navigator.msPointerEnabled),
              this[e(592)](s, e(880), () => navigator.webdriver),
              this[e(592)](s, e(1249), () => navigator[e(1070)]),
              this[e(592)](s, e(490), () => navigator[e(1218)] != null),
              this[e(592)](s, e(593), () => 'Notification' in window),
              this[e(592)](s, e(621), () => navigator[e(1134)]),
              this.flatAndAddMetadata(s, e(1098), () => navigator[e(1014)]),
              this.flatAndAddMetadata(s, e(830), () => navigator[e(1048)]),
              this.flatAndAddMetadata(s, e(702), () => navigator[e(563)]),
              this.flatAndAddMetadata(s, e(903), () => navigator[e(1057)]),
              this[e(592)](s, e(1338), () => navigator[e(1088)]),
              this[e(592)](s, e(363), () => navigator[e(641)]),
              this.flatAndAddMetadata(s, 'NAVIGATOR_PDF_VIEWER_ENABLED', () => navigator[e(1371)]),
              this[e(592)](s, e(442), () => navigator[e(1127)]),
              this[e(592)](s, e(802), () => {
                const d = e;
                return navigator[d(606)] ? navigator[d(606)].rtt : null;
              }),
              !n[e(438)]('modernizr') && (yield this.safeAddModernizrFeatures(s)));
            const I = window[e(923)] || window[e(1428)];
            (I
              ? this[e(592)](s, 'JS_CHALLENGE', () => I)
              : this.flatAndAddMetadata(s, e(985), () => e(477)),
              this[e(592)](s, 'BROWSER_TAB_HISTORY_LENGTH', () => {
                const d = e;
                return typeof window !== d(480) &&
                  window[d(342)] &&
                  typeof window[d(342)][d(368)] == 'number'
                  ? window[d(342)][d(368)]
                  : null;
              }));
            const g = new i.WebGLMetadata();
            if (
              (this[e(592)](s, 'IS_WEBGL', () => g[e(1191)]()),
              this[e(592)](s, 'WEBGLVENDORANDRENDERER', () => {
                const d = e;
                return g.getWebglData().vendor + '~' + g[d(1083)]()[d(652)];
              }),
              this[e(592)](s, e(680), () => g[e(1125)]()),
              g[e(1125)]()
                ? this[e(592)](s, e(832), () => {
                    const d = e;
                    return g[d(1083)]()[d(1230)] + '~' + g[d(1083)]().renderer;
                  })
                : this[e(592)](s, 'WEBGL2VENDORANDRENDERER', () => ''),
              this[e(592)](s, 'WEBGL_VERSION', () => {
                const d = e;
                return g[d(1083)]()[d(723)];
              }),
              this.flatAndAddMetadata(s, e(920), () => g.getWebglData().shadingLanguageVersion),
              this[e(592)](s, e(895), () => {
                const d = e;
                return g.getWebglData()[d(791)].length;
              }),
              this[e(592)](s, 'WEBGL_MAXTEXTURESIZE', () => {
                const d = e;
                return g[d(1083)]()[d(469)];
              }),
              this[e(592)](s, e(997), () => {
                const d = e;
                return g[d(1083)]()[d(1373)];
              }),
              this[e(592)](s, e(1259), () => {
                const d = e;
                return g.getWebglData()[d(1398)];
              }),
              this[e(592)](s, e(667), () => {
                const d = e;
                return g[d(1083)]()[d(577)];
              }),
              this[e(592)](s, e(1301), () => g[e(1083)]().maxCombinedTextureImageUnits),
              this[e(592)](s, e(534), () => g.getWebglData().maxVertexAttribs),
              this[e(592)](s, 'WEBGL_MAXVARYINGVECTORS', () => {
                const d = e;
                return g[d(1083)]()[d(811)];
              }),
              this[e(592)](s, e(1094), () => {
                const d = e;
                return g[d(1083)]()[d(506)];
              }),
              this[e(592)](s, e(664), () => {
                const d = e;
                return g[d(1083)]()[d(476)];
              }),
              this.flatAndAddMetadata(s, e(1130), () => g[e(648)]()),
              this.flatAndAddMetadata(s, e(1494), () => g[e(1502)]()),
              this.flatAndAddMetadata(s, 'HASLIEDOS', () => g[e(993)]()),
              this.flatAndAddMetadata(s, e(1105), () => g.getHasLiedBrowser()),
              this[e(1418)])
            )
              for (const d in this.fingerPrintComponents) {
                if (!this[e(1418)][e(1417)](d)) continue;
                const _ = this[e(1418)][d];
                d == e(663)
                  ? this[e(592)](s, e(414), () => {
                      const L = e;
                      return _[L(584)][L(368)];
                    })
                  : d == e(457)
                    ? this[e(592)](s, 'IS_CANVAS', () => _.value != null)
                    : d == 'screenResolution' && _[e(584)] && _.value.length
                      ? this.flatAndAddMetadata(s, e(602), () => _.value.join(','))
                      : d == 'touchSupport' && _.value
                        ? this[e(592)](s, e(853), () => _.value)
                        : d == 'audio' && _[e(584)]
                          ? this[e(592)](s, e(494), () => _[e(584)])
                          : d == 'osCpu' && _[e(584)]
                            ? this[e(592)](s, e(385), () => _[e(584)])
                            : d == 'cookiesEnabled' && _[e(584)]
                              ? this[e(592)](s, e(348), () => _[e(584)])
                              : d == e(1321) && _[e(584)] && _[e(584)][e(368)]
                                ? this[e(592)](s, e(449), () => {
                                    const L = e;
                                    return _[L(584)][L(1512)](',');
                                  })
                                : d == e(1104) && _[e(584)]
                                  ? this[e(592)](s, e(510), () => _[e(584)])
                                  : d == 'domBlockers' && _[e(1298)]
                                    ? this[e(592)](s, 'DOM_BLOCKERS', () => _[e(1298)])
                                    : d == e(639) && _[e(584)]
                                      ? this[e(592)](s, 'FONT_PREFERENCES', () => _[e(584)])
                                      : d == e(1371) && _.value
                                        ? this.flatAndAddMetadata(s, e(932), () => _[e(584)])
                                        : d == 'vendorFlavors' && _[e(584)] && _[e(584)].length
                                          ? this.flatAndAddMetadata(s, e(844), () => {
                                              const L = e;
                                              return _[L(584)][L(1512)](',');
                                            })
                                          : d == e(963) && _[e(584)]
                                            ? this[e(592)](s, e(1468), () => _[e(584)].renderer)
                                            : o[e(717)].has(d) &&
                                              d != null &&
                                              this[e(592)](s, d[e(720)](), () => _.value);
              }
            (this[e(592)](s, e(1254), () => this[e(1051)]),
              this[e(592)](s, 'IS_WEB_GLSTATUS', () => this[e(1393)]));
            const v = {
              selenium:
                navigator[e(859)] ||
                l[e(631)][e(1139)][e(1503)](window[e(1306)][e(1157)], e(859)) ||
                '',
              phantomjs: {
                _phantom: window[e(441)] || '',
                __phantomas: window.__phantomas || '',
                callPhantom: window[e(1152)] || '',
              },
              nodejs: { Buffer: window[e(1131)] || '' },
              couchjs: { emit: window[e(1108)] || '' },
              rhino: { spawn: window[e(321)] || '' },
              chromium: {
                domAutomationController: window[e(1221)] || '',
                domAutomation: window[e(911)] || '',
              },
              outerWidth: window.outerWidth,
              outerHeight: window.outerHeight,
            };
            (this[e(592)](s, e(1228), () => v),
              this[e(592)](s, e(1228), () => this[e(1469)]),
              this.flatAndAddMetadata(s, e(794), () => {
                const d = e,
                  _ = {};
                for (const L in this.lieTests) _[L] = JSON[d(833)](this[d(1033)][L]);
                return Object[d(345)](_)[d(368)] > 0 ? _ : null;
              }),
              this[e(592)](s, e(1099), () => new i[e(704)](n)[e(1165)]()),
              this[e(592)](s, 'REF_LINK', () => document[e(1324)]),
              this[e(592)](s, e(940), () => {
                const d = e,
                  _ = { length: navigator.plugins.length, details: [] };
                for (let L = 0; L < _[d(368)]; L++)
                  _[d(1204)][d(939)]({
                    length: navigator.plugins[L][d(368)],
                    name: navigator[d(492)][L][d(1246)],
                    version: navigator[d(492)][L][d(317)],
                    filename: navigator[d(492)][L][d(1291)],
                  });
                return _;
              }),
              this[e(592)](s, e(737), () => this[e(604)]),
              this.flatAndAddMetadata(s, 'VIDEO', () => this[e(726)]),
              this.videoInputDevices &&
                this[e(437)][e(368)] > 0 &&
                this[e(592)](s, e(699), () => {
                  const d = e;
                  return this.videoInputDevices[d(861)]();
                }),
              this.audioInputDevices &&
                this[e(509)][e(368)] > 0 &&
                this[e(592)](s, e(1055), () => this[e(509)].toString()),
              this[e(938)] &&
                this.audioOutputDevices[e(368)] > 0 &&
                this[e(592)](s, e(333), () => {
                  const d = e;
                  return this[d(938)][d(861)]();
                }),
              this.flatAndAddMetadata(s, 'MEDIA_CODEC_MP4_AVC1', () => {
                const d = e;
                return this[d(1119)](d(1170));
              }),
              this[e(592)](s, e(1241), () => {
                const d = e;
                return this[d(1119)](d(1067));
              }),
              this[e(592)](s, 'MEDIA_CODEC_AAC', () => {
                const d = e;
                return this.getMediaCodec(d(1429));
              }));
            const A = this.metadataParams[e(691)];
            for (const d in A)
              A[e(1417)](d) && this[e(592)](s, 'MEDIA_CODEC_' + d, () => this.getMediaCodec(A[d]));
            (window.performance &&
              window[e(670)][e(948)] &&
              (this.flatAndAddMetadata(s, e(742), () => {
                const d = e;
                return window[d(670)][d(948)][d(612)];
              }),
              this[e(592)](s, 'MEMORY_TOTAL_HEAP_SIZE', () => {
                const d = e;
                return window[d(670)][d(948)].totalJSHeapSize;
              }),
              this[e(592)](s, 'MEMORY_USED_HEAP_SIZE', () => {
                const d = e;
                return window[d(670)][d(948)][d(841)];
              })),
              this[e(592)](s, e(1061), () => navigator[e(1262)]),
              this[e(592)](s, e(626), () => i[e(798)].seleniumInDocument()),
              this[e(592)](s, e(1480), () => {
                const d = e;
                return i[d(798)][d(1113)]();
              }),
              this[e(592)](s, e(436), () => {
                const d = e;
                return i[d(798)][d(638)]();
              }),
              this[e(592)](s, e(1012), () => i[e(798)].seleniumSequentum()),
              this.flatAndAddMetadata(s, 'DOCUMENT_ELEMENT_SELENIUM', () => {
                const d = e;
                return l[d(631)].Util[d(1503)](window[d(1306)].documentElement, d(1307));
              }),
              this[e(592)](s, e(1075), () => {
                const d = e;
                return l[d(631)][d(1139)].getAttribute(window[d(1306)][d(1157)], d(859));
              }),
              this[e(592)](s, e(415), () => {
                const d = e;
                return l._POSignalsUtils[d(1139)][d(1503)](
                  window[d(1306)].documentElement,
                  d(1405),
                );
              }),
              this.flatAndAddMetadata(
                s,
                e(836),
                () =>
                  !!l[e(631)][e(1139)][e(1503)](document.getElementsByTagName('html')[0], e(859)),
              ),
              this[e(592)](s, e(1142), () => !!window.geb),
              this[e(592)](s, e(1252), () => !!window[e(326)]),
              this.flatAndAddMetadata(s, e(463), () => !!window[e(1406)]),
              this[e(592)](s, e(1440), () => !!window[e(1211)]),
              this[e(592)](s, e(1437), () => e(1437) in document),
              this[e(592)](s, e(634), () => 'trustTokenOperationError' in XMLHttpRequest[e(622)]),
              this[e(592)](s, e(498), () => e(498) in XMLHttpRequest.prototype),
              this[e(592)](s, 'trustToken', () => e(1006) in HTMLIFrameElement[e(622)]),
              this[e(592)](s, 'localStorage.length', () => localStorage[e(368)]),
              this[e(592)](s, e(370), () => sessionStorage[e(368)]),
              this[e(600)][e(1037)].forEach((d) => {
                const _ = e;
                this.flatAndAddMetadata(s, d[_(720)]() + _(557), () => !0);
              }),
              this[e(592)](s, e(746), () => !!this[e(1369)]()),
              this[e(567)][e(556)] &&
                this[e(567)][e(556)].length > 0 &&
                (this[e(482)](),
                this[e(367)][e(892)]((d, _) => {
                  _ != null && d != null && this.flatAndAddMetadata(s, _, () => d);
                }),
                this[e(367)][e(725)]()),
              window[e(773)] &&
                this[e(592)](s, e(471), () => {
                  const d = e,
                    _ = window[d(773)]('(min-width: ' + (window[d(1330)] - 1) + d(1060));
                  return { matches: _[d(1256)], media: _.media };
                }),
              this[e(478)](s, n),
              window[e(362)] &&
                this.flatAndAddMetadata(s, e(1341), () => {
                  const d = e;
                  return window[d(362)][d(1049)];
                }),
              this[e(592)](s, e(1062), () => window[e(771)] && e(1151) in window[e(771)]),
              this[e(592)](s, 'HAS_CHROME_CSI', () => window[e(771)] && e(1430) in window.chrome),
              this[e(592)](s, e(877), () => window[e(771)] && e(610) in window[e(771)]),
              this.flatAndAddMetadata(s, e(455), () => window[e(771)] && e(1128) in window[e(771)]),
              yield this[e(1350)](s),
              this[e(592)](s, e(383), () => !!navigator[e(780)]),
              this[e(592)](s, e(320), () => !!navigator.hid),
              this[e(592)](s, e(505), () => !!navigator.serial),
              this.flatAndAddMetadata(s, e(1153), () => !!navigator.presentation));
            try {
              if (!n.has(e(736)) && l.Util[e(1136)](document[e(1388)])) {
                const { id: d, version: _ } = yield l[e(1139)][e(989)](
                  100,
                  document.interestCohort(),
                );
                (this.flatAndAddMetadata(s, e(1181), () => d),
                  this.flatAndAddMetadata(s, e(786), () => _));
              }
            } catch {}
            for (const d in this[e(567)][e(548)])
              this.flatAndAddMetadata(s, d, () =>
                l[e(631)][e(1139)][e(972)](window, this[e(567)][e(548)][d]),
              );
            const S = this.metadataParams.propertyDescriptors;
            for (const d in S) {
              if (!S[e(1417)](d)) continue;
              const _ = d === e(1447) ? window : window[d];
              _ && this[e(375)](_, d.toUpperCase() + '_PROPERTY_DESCRIPTOR', S[d], s);
            }
            return s;
          });
        }
        [r(1350)](n) {
          return __awaiter(this, void 0, void 0, function* () {
            const e = _0x48f7;
            try {
              const o = navigator[e(869)];
              if (!o) return;
              (this[e(592)](n, e(1296), () => o[e(1057)]),
                this.flatAndAddMetadata(n, e(1355), () => o[e(512)]));
              const s = o[e(1016)];
              if (!s) return;
              for (let x = 0; x < s[e(368)]; x++)
                if (s[x].hasOwnProperty('brand') && s[x][e(1417)](e(317))) {
                  const m = s[x][e(1374)] + ':' + s[x][e(317)];
                  this.flatAndAddMetadata(n, e(881) + x, () => m);
                }
              if (typeof o[e(1391)] === e(1064)) {
                const x = [e(1104), e(1294), e(555), e(1340), e(957), 'formFactor'],
                  m = yield o[e(1391)](x);
                if (
                  (this[e(592)](n, e(838), () => m[e(1104)]),
                  this[e(592)](n, e(429), () => m[e(1294)]),
                  this[e(592)](n, e(950), () => m.model),
                  this[e(592)](n, 'NAVIGATOR_CLIENT_HINTS_PLATFORM_VERSION', () => m[e(1340)]),
                  this[e(592)](n, e(1270), () => {
                    const p = e;
                    return m[p(334)]
                      ? Array[p(553)](m[p(334)])
                        ? m[p(334)][p(1512)](', ')
                        : String(m[p(334)])
                      : '';
                  }),
                  m.fullVersionList)
                ) {
                  const p = m.fullVersionList[e(341)]((I) => I.brand + ' v' + I[e(317)])[e(1512)](
                    '; ',
                  );
                  this[e(592)](n, e(558), () => p);
                }
              }
            } catch (o) {
              l[e(631)][e(867)][e(1300)](e(1529), o);
            }
          });
        }
        [r(375)](n, e, o, s) {
          const x = r;
          try {
            for (const m of o)
              this[x(592)](s, e + '_' + m[x(720)](), () => {
                const p = x,
                  I = n[p(622)] ? n[p(622)] : n,
                  g = Object.getOwnPropertyDescriptor(I, m);
                if (g) {
                  const v = g[p(996)] ? g[p(996)][p(861)]() : void 0;
                  return JSON[p(833)]({
                    configurable: g[p(1507)],
                    enumerable: g[p(1325)],
                    value: g[p(584)],
                    writable: g[p(815)],
                    getter: v != null && v.length < 100 ? v : void 0,
                  });
                }
                return 'undefined';
              });
          } catch (m) {
            l[x(631)][x(867)][x(1300)]('failed to add properties descriptor', m);
          }
        }
        addIframeData(n, e) {
          const o = r;
          if (!e[o(438)]('IFRAME_DATA'))
            try {
              const s = l[o(631)][o(1139)][o(325)](o(697));
              if (!s) return;
              ((s[o(882)] = 'blank page'),
                document[o(1141)][o(896)](s),
                this[o(592)](n, o(679), () => {
                  const x = o;
                  return typeof s[x(772)][x(771)];
                }),
                this[o(592)](n, 'IFRAME_WIDTH', () => {
                  const x = o;
                  return s[x(772)][x(405)][x(1431)];
                }),
                this[o(592)](n, o(1022), () => {
                  const x = o;
                  return s[x(772)][x(405)][x(507)];
                }),
                s[o(1283)]());
            } catch (s) {
              l[o(631)].Logger[o(1300)](o(1147), s);
            }
        }
        [r(418)]() {
          return __awaiter(this, void 0, void 0, function* () {
            const n = _0x48f7,
              e = {},
              o = [
                n(1248),
                n(1085),
                n(1481),
                n(1045),
                n(1326),
                n(448),
                n(1217),
                n(597),
                n(783),
                n(642),
                n(1024),
                n(1279),
                n(698),
                'payment-handler',
                'persistent-storage',
                n(939),
              ],
              s = [];
            if (navigator[n(1184)])
              for (const x in o) {
                const m = o[x];
                s.push(
                  navigator[n(1184)]
                    [n(410)]({ name: m })
                    [n(804)]((p) => {
                      const I = n;
                      e[m] = p[I(628)];
                    })
                    [n(689)]((p) => {}),
                );
              }
            try {
              yield Promise[n(683)](s);
            } catch (x) {
              l[n(631)].Logger[n(1300)](x);
            }
            return e;
          });
        }
        [r(1119)](n) {
          const e = r,
            o = document[e(983)]('video');
          if (o && o[e(327)]) return o[e(327)](n);
        }
        [r(669)](n) {
          return __awaiter(this, void 0, void 0, function* () {
            const e = _0x48f7;
            l[e(1257)]();
            const o = this,
              s = l[e(380)],
              x = s[e(1172)],
              m = s[e(585)];
            (this[e(592)](n, e(1323), () => s[e(893)]),
              this[e(592)](n, e(388), () => s[e(1233)]),
              this[e(592)](n, e(839), () => !!s[e(839)]),
              s.audio && this.flatAndAddMetadata(n, 'audio', () => s.audio),
              this[e(592)](n, e(397), () => {
                const g = e;
                return !!x('battery', navigator) || !!x(g(1268), navigator);
              }),
              this[e(592)](n, e(502), () => s[e(666)]),
              this[e(592)](n, 'context_menu', () => s[e(1465)]),
              this[e(592)](n, e(1102), () => s.cors),
              this[e(592)](n, e(946), () => s.cryptography),
              this.flatAndAddMetadata(n, e(1029), () => s[e(1164)]),
              this[e(592)](n, e(1198), () => s[e(1054)]),
              this[e(592)](n, e(1500), () => s.customevent),
              this.flatAndAddMetadata(n, 'dart', () => s.dart),
              this[e(592)](n, e(1288), () => s[e(573)]),
              this[e(592)](n, e(809), () => s[e(649)]));
            const p = yield this[e(1190)](e(1207));
            (o[e(592)](n, 'exif_orientation', () => p),
              this[e(592)](n, e(700), () => s[e(1273)]),
              s.forcetouch &&
                (this[e(592)](n, e(1126), () => m(x('mouseforcewillbegin', window, !1), window)),
                this[e(592)](n, e(1145), () => MouseEvent[e(616)]),
                this[e(592)](n, e(1180), () => MouseEvent[e(1370)])),
              this.flatAndAddMetadata(n, e(718), () => s[e(1315)]),
              this[e(592)](n, e(470), () => s[e(1372)]),
              this[e(592)](n, e(599), () => s[e(597)]),
              this[e(592)](n, e(1407), () => s[e(1407)]));
            const I = yield this[e(1190)](e(382));
            (o[e(592)](n, 'indexed_db', () => I),
              this[e(592)](n, e(1511), () => s[e(748)]),
              this[e(592)](n, e(1484), () => s[e(552)]),
              this[e(592)](n, e(961), () => s[e(961)]),
              this[e(592)](n, e(491), () => s[e(491)]),
              this.flatAndAddMetadata(n, 'media_source', () => 'MediaSource' in window),
              this[e(592)](n, 'message_channel', () => s[e(1149)]),
              this[e(592)](n, e(571), () => s[e(571)]),
              this[e(592)](n, e(741), () => s[e(611)]),
              this.flatAndAddMetadata(n, 'performance', () => s.performance),
              this.flatAndAddMetadata(n, 'pointer_events', () => s[e(538)]),
              this[e(592)](n, e(927), () => s[e(1236)]),
              this[e(592)](n, e(1277), () => s[e(1277)]),
              this[e(592)](n, e(692), () => s[e(905)]),
              this.flatAndAddMetadata(n, 'quota_management', () => s[e(845)]),
              this[e(592)](n, e(1091), () => s[e(366)]),
              this[e(592)](n, e(1272), () => s[e(824)]),
              this[e(592)](n, e(797), () => s[e(1389)]),
              this[e(592)](n, e(1074), () => s.typedarrays),
              this[e(592)](n, e(1218), () => s[e(1218)]),
              this[e(592)](n, e(654), () => !!s[e(654)]),
              s.video && this[e(592)](n, e(654), () => s.video),
              this[e(592)](n, e(959), () => s.webgl),
              this[e(592)](n, e(426), () => s[e(1439)]),
              this[e(592)](n, 'x_domain_request', () => s.xdomainrequest),
              this[e(592)](n, 'matchmedia', () => s[e(1454)]));
          });
        }
        [r(393)]() {
          const n = r,
            e = {},
            o = navigator.connection || navigator[n(1463)] || navigator.webkitConnection;
          return (
            this[n(592)](e, 'NETWORK_TYPE', () => (o ? o.type : null)),
            this[n(592)](e, n(1111), () => (o ? o[n(682)] : null)),
            this[n(592)](e, n(661), () => !!navigator[n(402)]),
            this[n(592)](e, n(1343), () => this.hasSpeakers),
            this.flatAndAddMetadata(e, n(1026), () => this[n(1100)]),
            this.flatAndAddMetadata(e, n(1123), () => this[n(1120)]),
            this[n(1404)] &&
              (this.flatAndAddMetadata(e, 'BATTERY_SUPPORTED', () => this.isBatterySupported),
              this[n(592)](e, n(1357), () => this[n(1187)]),
              this.flatAndAddMetadata(e, n(1206), () => this[n(358)]),
              this[n(592)](e, n(347), () => this[n(1146)]),
              this[n(592)](e, n(446), () => this.batteryDischargingTime)),
            this[n(592)](e, n(1247), () => this[n(485)]),
            this[n(592)](e, 'IS_MOBILE', () => {
              const s = n;
              return l._POSignalsUtils[s(1139)][s(1250)];
            }),
            this[n(592)](e, n(979), () => {
              const s = n;
              return s(374) in document[s(1157)];
            }),
            window[n(773)] &&
              (this.flatAndAddMetadata(
                e,
                'HAS_FINE_POINTER',
                () => window[n(773)]('(any-pointer: fine)')[n(1256)],
              ),
              this[n(592)](
                e,
                'HAS_COARSE_POINTER',
                () => window[n(773)]('(any-pointer: coarse)').matches,
              ),
              this[n(592)](e, n(386), () => window[n(773)](n(391))[n(1256)])),
            this[n(592)](e, n(1185), () => this[n(1184)]),
            this[n(592)](e, n(1386), () => {
              const s = n;
              return window[s(773)](s(422))[s(1256)]
                ? s(319)
                : window[s(773)](s(930))[s(1256)]
                  ? s(409)
                  : void 0;
            }),
            e
          );
        }
        [r(579)](n, e, o) {
          const s = r;
          try {
            const x = new Set(this.metadataParams[s(788)] || []);
            e != null && o != null && !x[s(438)](e) && (n[e] = o);
          } catch (x) {
            l._POSignalsUtils.Logger[s(1300)]('Failed to add ' + e + s(1333) + o + ', ' + x);
          }
        }
        [r(1190)](n) {
          return __awaiter(this, void 0, void 0, function* () {
            const e = _0x48f7,
              o = new Promise((x) => {
                const m = _0x48f7;
                try {
                  l[m(380)].on(n, (p) => {
                    x(p);
                  });
                } catch (p) {
                  (x(null), l[m(631)][m(867)].info(m(1168) + n, p));
                }
              }),
              s = l[e(631)][e(1139)][e(929)](250)[e(804)](() => null);
            return yield Promise[e(987)]([o, s]);
          });
        }
        [r(592)](n, e, o) {
          const s = r;
          try {
            const x = new Set(this[s(567)][s(788)] || []);
            if (!e || x[s(438)](e)) return;
            const m = o();
            if (typeof m === s(574) && m !== null) {
              const p = l._POSignalsUtils.Util[s(912)](m);
              for (const I in p) this[s(579)](n, e + '.' + I, p[I]);
            } else this.safeAddMetadata(n, e, m);
          } catch (x) {
            l[s(631)][s(867)][s(1300)]('Failed to add ' + e, x);
          }
        }
        [r(696)]() {
          const n = r;
          let e = new Date(),
            o = 0,
            s;
          do (o++, (s = new Date()[n(1144)]() - e.getTime()), Math[n(998)](o * Math[n(605)]()));
          while (s < 500);
          const x = o / s;
          return (l[n(631)][n(867)][n(1420)]('Ops : ' + x), x);
        }
        [r(395)]() {
          const n = r,
            e = [
              { name: n(1096), value: !1, error: null },
              { name: n(684), value: !1, error: null },
              { name: n(1013), value: !1, error: null },
              { name: n(1395), value: !1, error: null },
            ];
          (!this[n(849)] &&
            ((this.aiSignalsResult = e),
            (this[n(1337)][n(1115)] = e),
            l.AiaSignals.detect()
              [n(804)]((o) => {
                const s = n;
                ((this[s(849)] = o), (this[s(1337)].aiaSignals = o));
              })
              [n(689)]((o) => {
                const s = n;
                l._POSignalsUtils.Logger.info(s(643), o);
              })),
            this[n(849)] && (this.lastCalculatedMetadata[n(1115)] = this.aiSignalsResult));
        }
        static [r(1335)]() {
          const n = r;
          return (
            Math[n(1522)](0.123) == 1.4474840516030247 &&
            Math[n(1297)](Math[n(677)]) == 0.881373587019543 &&
            Math.atan(2) == 1.1071487177940904 &&
            Math[n(751)](0.5) == 0.5493061443340548 &&
            Math[n(752)](Math.PI) == 1.4645918875615231 &&
            Math.cos(21 * Math[n(840)]) == -0.4067775970251724 &&
            Math[n(336)](492 * Math[n(707)]) == 9199870313877772e292 &&
            Math[n(566)](1) == 1.718281828459045 &&
            Math.hypot(6 * Math.PI, -100) == 101.76102278593319 &&
            Math[n(1043)](Math.PI) == 0.4971498726941338 &&
            Math[n(713)](Math.PI) == 12246467991473532e-32 &&
            Math[n(1476)](Math.PI) == 11.548739357257748 &&
            Math[n(608)](10 * Math[n(707)]) == -3.3537128705376014 &&
            Math[n(1290)](0.123) == 0.12238344189440875 &&
            Math[n(523)](Math.PI, -100) == 19275814160560204e-66
          );
        }
        [r(625)]() {
          return __awaiter(this, void 0, void 0, function* () {
            return new Promise((n) => {
              const e = _0x48f7;
              if (typeof window === e(480) || !window.speechSynthesis) return n(0);
              const o = window[e(340)][e(1163)]();
              if (o[e(368)] > 0) n(o.length);
              else {
                const s = () => {
                  const x = e,
                    m = window[x(340)][x(1163)]();
                  m[x(368)] > 0 && (window[x(340)][x(888)](x(956), s), n(m[x(368)]));
                };
                (window[e(340)][e(806)]('voiceschanged', s),
                  window[e(340)][e(1163)](),
                  setTimeout(() => {
                    const x = e;
                    (window[x(340)].removeEventListener(x(956), s), n(0));
                  }, 500));
              }
            });
          });
        }
      }
      i[r(846)] = a;
      class c {
        constructor(n, e) {
          const o = r;
          ((this[o(435)] = n),
            (this[o(1342)] = e),
            (this.AGENT_BASE_URL = o(722)),
            (this[o(1528)] = '/device'));
        }
        getDevicePayload() {
          return __awaiter(this, void 0, void 0, function* () {
            const n = _0x48f7,
              e = this[n(902)] + ':' + this[n(435)] + this.AGENT_DEVICE_URL,
              o = new AbortController(),
              s = o[n(1239)],
              x = setTimeout(() => o[n(657)](), this[n(1342)]);
            try {
              const m = yield fetch(e, {
                method: n(636),
                headers: { 'Content-Type': n(874) },
                signal: s,
              });
              if (!m.ok) return (l[n(631)][n(867)].info(n(495) + m[n(1445)]), void 0);
              const p = yield m[n(1299)]();
              return (l[n(631)][n(867)][n(1300)]('calculated workstation device attributes.'), p);
            } catch (m) {
              return (
                m.name === 'AbortError'
                  ? l[n(631)][n(867)].error(
                      'Failed to fetch the Workstation data. Request timed out after ' +
                        this[n(1342)] +
                        'ms',
                    )
                  : l[n(631)][n(867)].info(n(1103) + m[n(768)]),
                void 0
              );
            } finally {
              clearTimeout(x);
            }
          });
        }
      }
      i[r(474)] = c;
    })((E = l[f(813)] || (l._POSignalsMetadata = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    const f = _0x44f950;
    let E;
    (function (i) {
      const r = _0x48f7;
      class a {
        static [r(1363)]() {
          const t = r,
            n = [
              '__webdriver_evaluate',
              t(1264),
              t(1380),
              '__webdriver_script_func',
              t(583),
              t(1462),
              t(818),
              '__webdriver_unwrapped',
              t(1202),
              '__selenium_unwrapped',
              t(1455),
            ];
          for (const e of n) if (document[e]) return !0;
          return !1;
        }
        static [r(1113)]() {
          const t = r,
            n = [
              t(441),
              '__nightmare',
              t(980),
              t(1152),
              'calledSelenium',
              'callSelenium',
              '_Selenium_IDE_Recorder',
            ];
          for (const e of n) if (window[e]) return !0;
          return !1;
        }
        static [r(638)]() {
          const t = r,
            n = [
              'webdriver',
              t(1202),
              t(860),
              t(1264),
              '__fxdriver_evaluate',
              t(818),
              t(1435),
              t(715),
              t(1455),
              '_Selenium_IDE_Recorder',
              t(980),
              t(1322),
              t(475),
              t(915),
              t(891),
              t(1303),
              t(775),
              t(1492),
              t(837),
              t(1317),
              '__webdriver_script_fn',
              '__$webdriverAsyncExecutor',
              t(1493),
              t(595),
              t(852),
              t(1318),
              t(440),
            ];
          for (const e of n) if (navigator[e]) return !0;
          return !1;
        }
        static [r(450)]() {
          const t = r;
          return (
            window[t(1424)] &&
            window[t(1424)][t(861)]() &&
            window[t(1424)][t(861)]()[t(1265)]('Sequentum') != -1
          );
        }
      }
      i[r(798)] = a;
    })((E = l[f(813)] || (l._POSignalsMetadata = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    const f = _0x44f950;
    let E;
    (function (i) {
      const r = _0x48f7,
        a = r(555),
        c = r(1246),
        t = r(322),
        n = r(1230),
        e = r(317),
        o = r(512),
        s = r(878),
        x = 'crawler',
        m = 'cli',
        p = r(1179),
        I = r(1082),
        g = r(1475),
        v = r(315),
        A = r(835),
        S = Object.freeze({
          browser: [[/(wget|curl|lynx|elinks|httpie)[\/ ]\(?([\w\.-]+)/i], [c, e, [t, m]]],
        }),
        d = Object[r(951)]({
          browser: [
            [
              /((?:ahrefs|amazon|bing|cc|dot|duckduck|exa|facebook|gpt|mj12|mojeek|oai-search|perplexity|semrush|seznam)bot)\/([\w\.-]+)/i,
              /(applebot(?:-extended)?)\/([\w\.]+)/i,
              /(baiduspider)[-imagevdonsfcpr]{0,6}\/([\w\.]+)/i,
              /(claude(?:bot|-web)|anthropic-ai)\/?([\w\.]*)/i,
              /(coccocbot-(?:image|web))\/([\w\.]+)/i,
              /(facebook(?:externalhit|catalog)|meta-externalagent)\/([\w\.]+)/i,
              /(google(?:bot|other|-inspectiontool)(?:-image|-video|-news)?|storebot-google)\/?([\w\.]*)/i,
              /(ia_archiver|archive\.org_bot)\/?([\w\.]*)/i,
              /((?:semrush|splitsignal)bot[-abcfimostw]*)\/([\w\.-]+)/i,
              /(sogou (?:pic|head|web|orion|news) spider)\/([\w\.]+)/i,
              /(y!?j-(?:asr|br[uw]|dscv|mmp|vsidx|wsc))\/([\w\.]+)/i,
              /(yandex(?:(?:mobile)?(?:accessibility|additional|renderresources|screenshot|sprav)?bot|image(?:s|resizer)|video(?:parser)?|blogs|adnet|favicons|fordomain|market|media|metrika|news|ontodb(?:api)?|pagechecker|partner|rca|tracker|turbo|vertis|webmaster|antivirus))\/([\w\.]+)/i,
              /(yeti)\/([\w\.]+)/i,
              /((?:aihit|diff|timpi|you)bot|omgili(?:bot)?|(?:magpie-|velenpublicweb)crawler|webzio-extended|(?:screaming frog seo |yisou)spider)\/?([\w\.]*)/i,
            ],
            [c, e, [t, x]],
            [
              /((?:adsbot|apis|mediapartners)-google(?:-mobile)?|google-?(?:other|cloudvertexbot|extended|safety))/i,
              /\b(360spider-?(?:image|video)?|bytespider|(?:ai2|aspiegel|dataforseo|imagesift|petal|turnitin)bot|teoma|(?=yahoo! )slurp)/i,
            ],
            [c, [t, x]],
          ],
        }),
        _ = Object[r(951)]({
          device: [
            [
              /(nook)[\w ]+build\/(\w+)/i,
              /(dell) (strea[kpr\d ]*[\dko])/i,
              /(le[- ]+pan)[- ]+(\w{1,9}) bui/i,
              /(trinity)[- ]*(t\d{3}) bui/i,
              /(gigaset)[- ]+(q\w{1,9}) bui/i,
              /(vodafone) ([\w ]+)(?:\)| bui)/i,
            ],
            [n, a, [t, s]],
            [/(u304aa)/i],
            [a, [n, r(331)], [t, o]],
            [/\bsie-(\w*)/i],
            [a, [n, 'Siemens'], [t, o]],
            [/\b(rct\w+) b/i],
            [a, [n, r(943)], [t, s]],
            [/\b(venue[\d ]{2,7}) b/i],
            [a, [n, r(909)], [t, s]],
            [/\b(q(?:mv|ta)\w+) b/i],
            [a, [n, r(1215)], [t, s]],
            [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i],
            [a, [n, r(1365)], [t, s]],
            [/\b(tm\d{3}\w+) b/i],
            [a, [n, r(967)], [t, s]],
            [/\b(k88) b/i],
            [a, [n, r(1501)], [t, s]],
            [/\b(nx\d{3}j) b/i],
            [a, [n, 'ZTE'], [t, o]],
            [/\b(gen\d{3}) b.+49h/i],
            [a, [n, r(660)], [t, o]],
            [/\b(zur\d{3}) b/i],
            [a, [n, r(660)], [t, s]],
            [/^((zeki)?tb.*\b) b/i],
            [a, [n, r(349)], [t, s]],
            [/\b([yr]\d{2}) b/i, /\b(?:dragon[- ]+touch |dt)(\w{5}) b/i],
            [a, [n, r(973)], [t, s]],
            [/\b(ns-?\w{0,9}) b/i],
            [a, [n, 'Insignia'], [t, s]],
            [/\b((nxa|next)-?\w{0,9}) b/i],
            [a, [n, 'NextBook'], [t, s]],
            [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i],
            [[n, 'Voice'], a, [t, o]],
            [/\b(lvtel\-)?(v1[12]) b/i],
            [[n, r(1521)], a, [t, o]],
            [/\b(ph-1) /i],
            [a, [n, r(705)], [t, o]],
            [/\b(v(100md|700na|7011|917g).*\b) b/i],
            [a, [n, r(357)], [t, s]],
            [/\b(trio[-\w\. ]+) b/i],
            [a, [n, 'MachSpeed'], [t, s]],
            [/\btu_(1491) b/i],
            [a, [n, 'Rotor'], [t, s]],
          ],
        }),
        L = Object[r(951)]({
          browser: [
            [
              /(airmail|bluemail|emclient|evolution|foxmail|kmail2?|kontact|(?:microsoft |mac)?outlook(?:-express)?|navermailapp|(?!chrom.+)sparrow|thunderbird|yahoo)(?:m.+ail; |[\/ ])([\w\.]+)/i,
            ],
            [c, e, [t, p]],
          ],
        }),
        y = Object[r(951)]({
          browser: [
            [
              /(ahrefssiteaudit|bingpreview|chatgpt-user|mastodon|(?:discord|duckassist|linkedin|pinterest|reddit|roger|siteaudit|telegram|twitter|uptimero)bot|google-site-verification|meta-externalfetcher|y!?j-dlc|yandex(?:calendar|direct(?:dyn)?|searchshop)|yadirectfetcher)\/([\w\.]+)/i,
              /(bluesky) cardyb\/([\w\.]+)/i,
              /(slack(?:bot)?(?:-imgproxy|-linkexpanding)?) ([\w\.]+)/i,
              /(whatsapp)\/([\w\.]+)[\/ ][ianw]/i,
            ],
            [c, e, [t, I]],
            [
              /(cohere-ai|vercelbot|feedfetcher-google|google(?:-read-aloud|producer)|(?=bot; )snapchat|yandex(?:sitelinks|userproxy))/i,
            ],
            [c, [t, I]],
          ],
        }),
        O = Object[r(951)]({
          browser: [
            [/chatlyio\/([\d\.]+)/i],
            [e, 'Slack', [t, g]],
            [/jp\.co\.yahoo\.android\.yjtop\/([\d\.]+)/i],
            [e, r(1414), [t, g]],
          ],
        }),
        M = Object.freeze({
          browser: [
            [
              /(apple(?:coremedia|tv))\/([\w\._]+)/i,
              /(coremedia) v([\w\._]+)/i,
              /(ares|clementine|music player daemon|nexplayer|ossproxy) ([\w\.-]+)/i,
              /^(aqualung|audacious|audimusicstream|amarok|bass|bsplayer|core|gnomemplayer|gvfs|irapp|lyssna|music on console|nero (?:home|scout)|nokia\d+|nsplayer|psp-internetradioplayer|quicktime|rma|radioapp|radioclientapplication|soundtap|stagefright|streamium|totem|videos|xbmc|xine|xmms)\/([\w\.-]+)/i,
              /(lg player|nexplayer) ([\d\.]+)/i,
              /player\/(nexplayer|lg player) ([\w\.-]+)/i,
              /(gstreamer) souphttpsrc.+libsoup\/([\w\.-]+)/i,
              /(htc streaming player) [\w_]+ \/ ([\d\.]+)/i,
              /(lavf)([\d\.]+)/i,
              /(mplayer)(?: |\/)(?:(?:sherpya-){0,1}svn)(?:-| )(r\d+(?:-\d+[\w\.-]+))/i,
              / (songbird)\/([\w\.-]+)/i,
              /(winamp)(?:3 version|mpeg| ) ([\w\.-]+)/i,
              /(vlc)(?:\/| media player - version )([\w\.-]+)/i,
              /^(foobar2000|itunes|smp)\/([\d\.]+)/i,
              /com\.(riseupradioalarm)\/([\d\.]*)/i,
              /(mplayer)(?:\s|\/| unknown-)([\w\.\-]+)/i,
              /(windows)\/([\w\.-]+) upnp\/[\d\.]+ dlnadoc\/[\d\.]+ home media server/i,
            ],
            [c, e, [t, v]],
            [/(flrp)\/([\w\.-]+)/i],
            [[c, 'Flip Player'], e, [t, v]],
            [
              /(fstream|media player classic|inlight radio|mplayer|nativehost|nero showtime|ocms-bot|queryseekspider|tapinradio|tunein radio|winamp|yourmuze)/i,
            ],
            [c, [t, v]],
            [/(htc_one_s|windows-media-player|wmplayer)\/([\w\.-]+)/i],
            [[c, /[_-]/g, ' '], e, [t, v]],
            [/(rad.io|radio.(?:de|at|fr)) ([\d\.]+)/i],
            [[c, r(1071)], e, [t, v]],
          ],
        }),
        R = Object.freeze({
          browser: [
            [
              /^(apache-httpclient|axios|(?:go|java)-http-client|got|guzzlehttp|java|libwww-perl|lua-resty-http|needle|node-(?:fetch|superagent)|okhttp|php-soap|postmanruntime|python-(?:urllib|requests)|scrapy)\/([\w\.]+)/i,
              /(jsdom|java)\/([\w\.]+)/i,
            ],
            [c, e, [t, A]],
          ],
        }),
        k = Object.freeze({
          device: [
            [/dilink.+(byd) auto/i],
            [n],
            [/(rivian) (r1t)/i],
            [n, a],
            [/vcc.+netfront/i],
            [[n, r(615)]],
          ],
        }),
        B = Object[r(951)]({ browser: [...S[r(489)], ...d[r(489)], ...y[r(489)], ...R[r(489)]] });
      class D {
        constructor() {
          const N = r;
          ((this[N(1044)] = (ne) =>
            [
              N(1116),
              N(982),
              N(1362),
              N(1387),
              N(407),
              'applebot',
              'applebot-extended',
              N(618),
              N(731),
              N(384),
              'diffbot',
              N(1195),
              N(1267),
              N(433),
              N(1087),
              N(1196),
              N(1199),
              'facebookbot',
              'meta-externalagent',
              N(613),
              N(966),
              N(527),
              N(420),
              N(774),
              N(908),
              N(1245),
              N(590),
              N(1017),
              N(1e3),
              N(931),
            ][N(1148)]((he) => ne[N(1479)]().includes(he))),
            (this[N(1203)] = (ne) => {
              const he = N,
                Y = ne[he(1479)](),
                ye = B[he(489)];
              for (let be = 0; be < ye[he(368)]; be += 2) {
                const Ne = ye[be],
                  P = Array.isArray(Ne) ? Ne : [Ne];
                for (const X of P) if (X instanceof RegExp && X.test(Y)) return !0;
              }
              return !1;
            }),
            (this[N(536)] = (ne) => ne[N(1246)] === Engine[N(990)]),
            (this[N(1047)] = (ne) => ne[N(1479)]()[N(1461)]('electron')));
        }
      }
      i[r(1408)] = D;
    })((E = l[f(813)] || (l._POSignalsMetadata = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  function _0x1ccc() {
    const l = [
      'NAVIGATOR_LANGUAGE',
      'DeviceMotionEvent',
      'languages',
      'Microsoft YaHei',
      'isBatterySupported',
      'driver',
      'RunPerfTest',
      'ie8compat',
      'UAParserHelperMetadata',
      'hasInput',
      'password',
      'cpuClass',
      'iframeWindow',
      'Hoefler Text',
      'Yahoo! Japan',
      'getAutofillMetadataSmart',
      'code',
      'hasOwnProperty',
      'fingerPrintComponents',
      'LKLUG',
      'debug',
      'visibility',
      'createDataChannel',
      'animationstart',
      'external',
      'span',
      'Segoe MDL2 Assets',
      'input:-webkit-autofill { animation: autofill-detection 0.001s; }',
      '_ST_PING',
      'audio/aac',
      'csi',
      'width',
      'Poppins',
      '    [native code]',
      'origin',
      '__webdriver_unwrapped',
      'VENDOR',
      'hasTrustToken',
      'NAVIGATOR_POINTER_ENABLED',
      'websockets',
      'window_fmget_targets',
      'getFingerPrint',
      'Open Sans',
      'you',
      'Battery not supported!',
      'statusText',
      'localStorage',
      'window',
      'next',
      'removeItem',
      'engine',
      'trim',
      'MS Reference Specialty',
      'webgl2',
      'matchmedia',
      '__fxdriver_unwrapped',
      'Pristina',
      'hasPassword',
      'Consolas',
      'DetectHeadless',
      'mmMwWLliI0O&1',
      'includes',
      '__fxdriver_evaluate',
      'mozConnection',
      'Herculanum',
      'contextmenu',
      "', ",
      'Raleway',
      'VIDEO_CARD',
      'headlessTests',
      'Menlo',
      'Chalkboard',
      'universalTrustEnabled',
      'Apple Symbols',
      'closed',
      'inapp',
      'sinh',
      'BROWSER_VOICES_COUNT',
      'safari',
      'toLowerCase',
      'selenium_in_window',
      'ambient-light-sensor',
      'getContext',
      'baseFonts',
      'internationalization',
      'failed to get broJsFingerprint info',
      'Windows Phone',
      'Other',
      'getLies',
      'createOffer',
      'Trattatello',
      'Noto Sans CJK SC',
      'webdriverCommand',
      '__lastWatirAlert',
      'HASLIEDRESOLUTION',
      'engineVersion',
      'getNewObjectToStringTypeErrorLie',
      'documentLie',
      'detectFontsQuick',
      'onicecandidate',
      'custom_event',
      'ZTE',
      'getHasLiedResolution',
      'getAttribute',
      'backgroundColor',
      'size',
      'Failed to setup autofill detection:',
      'configurable',
      'isIphoneOrIPad',
      'Serifa',
      '27szwMUD',
      'indexed_db_blob',
      'join',
      'INPUT',
      'Segoe Script',
      'webkitRequestFileSystem',
      'constructor',
      'MAX_VARYING_VECTORS',
      'Liberation Mono',
      'Bodoni 72 Smallcaps',
      'MingLiU-ExtB',
      'LvTel',
      'acos',
      'timeout',
      'Georgia',
      'toFixed',
      'Baskerville',
      'Sawasdee',
      'AGENT_DEVICE_URL',
      'failed to add client hints',
      'error_code',
      'now',
      'isCanvasSupported',
      'rgb(250, 255, 189)',
      'Futura Bk BT',
      'quota detection failed: ',
      'Cochin',
      'htmlGeoLocation_heading',
      'mediaplayer',
      'detectAutofillFieldsAsync',
      'version',
      'setAttribute',
      'light',
      'NAVIGATOR_HID_SUPPORTED',
      'spawn',
      'type',
      'testString',
      'initDeviceIdentity',
      'createInvisibleElement',
      'awesomium',
      'canPlayType',
      'getAllLies',
      'FingerPrint failed',
      'open',
      'AT&T',
      'Noto Color Emoji',
      'AUDIO_OUTPUT_DEVICES',
      'formFactor',
      'ondevicelight',
      'cosh',
      'addStealthTest',
      'denied',
      'getHasLiedBrowser',
      'speechSynthesis',
      'map',
      'history',
      'SimSun',
      'getSupportedExtensions',
      'keys',
      'autocomplete',
      'BATTERY_CHARGING_TIME',
      'COOKIES_ENABLED',
      'Zeki',
      'sans-serif-medium',
      'userLanguage',
      'detectFontsWithCanvas',
      'getQuickFingerprint',
      'vendorFlavors',
      'consistent_mimetypes_prototype',
      'colorGamut',
      'Envizen',
      'batteryCharging',
      'language',
      '...',
      'connect',
      'Notification',
      'NAVIGATOR_USER_AGENT',
      'font',
      'filter',
      'requestanimationframe',
      'webRtcIps',
      'length',
      'processInputsWithTimeout',
      'sessionStorage.length',
      'DejaVu Serif',
      'isInvalidStackTraceSize',
      'add',
      'ontouchstart',
      'addPropertyDescriptorInfo',
      'split',
      'getGeoLocationData',
      'rgb(232, 240, 254)',
      'Standard Symbols L',
      'Modernizr',
      'error',
      'indexeddb',
      'NAVIGATOR_KEYBOARD_SUPPORTED',
      'dataforseobot',
      'OS_CPU',
      'HAS_HOVER',
      'failed to get audio-video info',
      'application_cache',
      'FingerprintJS',
      'Humanst521 BT',
      '(any-hover: hover)',
      'headless_chrome',
      'getIoMetadata',
      'detectFonts',
      'getAiaSignals',
      'Ubuntu',
      'battery_api',
      'latitude',
      'apply',
      'Ubuntu Condensed',
      'sans-serif-thin',
      'bluetooth',
      '__proto__',
      'webkitTemporaryStorage',
      'screen',
      'Arial',
      'claudebot',
      'Trebuchet MS',
      'dark',
      'query',
      'openDatabase',
      'PMingLiU',
      'true',
      'JS_FONTS',
      'DOCUMENT_ELEMENT_DRIVER',
      'Font detection failed',
      'PromiseQueue',
      'getPermissionsMetadata',
      'browserInfo',
      'semrushbot-ocob',
      'vertical',
      '(prefers-color-scheme: light)',
      'Internet Explorer',
      'Symbol',
      'Segoe Print',
      'web_sockets',
      'Times',
      'FontFingerprint',
      'NAVIGATOR_CLIENT_HINTS_BITNESS',
      'calculated browser device attributes.',
      'test',
      ' in async detection:',
      'googleother-video',
      'Meera',
      'agentPort',
      'selenium_in_navigator',
      'videoInputDevices',
      'has',
      'MAX_VERTEX_ATTRIBS',
      '$cdc_asdjflasutopfhvcZLmcfl_',
      '_phantom',
      'NAVIGATOR_DEVICE_MEMORY',
      'Minion Pro',
      'productSub',
      'getIdentificationMetadata',
      'BATTERY_DISCHARGING_TIME',
      'fontHash',
      'clipboard-read',
      'SCREEN_FRAME',
      'seleniumSequentum',
      '***',
      'Sitka',
      'visitorId',
      'granted',
      'HAS_CHROME_RUNTIME',
      'timestamp',
      'canvas',
      'sans-serif-light',
      'find',
      'none',
      'FreeMono',
      'cant',
      'window_RunPerfTest',
      'Copperplate',
      'getOwnPropertyDescriptors',
      'SignPainter',
      'ondevicemotion',
      'fillText',
      'maxTextureSize',
      'game_pads',
      'MQ_SCREEN',
      'webkit-autofill',
      'ipod',
      'LocalAgentAccessor',
      '_WEBDRIVER_ELEM_CACHE',
      'maxFragmentUniformVectors',
      'unknown',
      'addIframeData',
      'getAutofillMetadata',
      'undefined',
      'coords',
      'collectWebRtc',
      'MAX_VERTEX_UNIFORM_VECTORS',
      'Zapfino',
      'gpsSupported',
      'ondeviceproximity',
      'FreeSans',
      'Avenir Next Condensed',
      'browser',
      'NAVIGATOR_VIBRATE',
      'ligatures',
      'plugins',
      'Century',
      'AUDIO_FINGERPRINT',
      'Failed to fetch the Workstation data. Invalid network response: ',
      'externalIdentifiers',
      'number',
      'setTrustToken',
      'Mukta',
      'autocompleted',
      'SDKBP_FINGERPRINT',
      'blob_constructor',
      'failed to get battery info',
      'Montserrat',
      'NAVIGATOR_SERIAL_SUPPORTED',
      'maxVertexUniformVectors',
      'height',
      'batteryInit',
      'audioInputDevices',
      'ARCHITECTURE',
      'Browser unknown',
      'mobile',
      'Ubuntu Mono',
      'Roboto Slab',
      'Avenir',
      'privateClickMeasurement',
      'querySelectorAll',
      'requestIdleCallback',
      'Tahoma',
      'detectInputAutofill',
      'AvantGarde Bk BT',
      'fontList',
      'pow',
      'Haettenschweiler',
      'set',
      'getToStringLie',
      'perplexitybot',
      'Didot',
      'Noto Sans CJK JP',
      'Bahnschrift',
      'data-lastpass-icon-id',
      'GYROSCOPE_SUPPORTED',
      'experimental-webgl',
      'WEBGL_MAXVERTEXATTRIBS',
      'Segoe UI Symbol',
      'isChromeFamily',
      'failed to get headless results',
      'pointerevents',
      'chrome_runtime_functions_invalid',
      'animationName',
      'Savoye LET',
      'Error in smart autofill detection, falling back to sync:',
      'DejaVu Sans Mono',
      '__awaiter',
      'MAX_RENDERBUFFER_SIZE',
      'Courier New',
      'Apple SD Gothic Neo',
      'dataPoints',
      'deviceId',
      'top',
      'SimHei',
      'intl',
      'isArray',
      'isAutofilled',
      'model',
      'webRtcUrl',
      '_FAILED',
      'NAVIGATOR_CLIENT_HINTS_FULL_VERSION',
      'user',
      'Mac',
      'trident',
      'videoinput',
      'onLine',
      'Playfair Display',
      'Firefox',
      'expm1',
      'metadataParams',
      'cookiesEnabled',
      'detectFontsWithIframe',
      'Edge',
      'notification',
      'stealth test ',
      'dataview',
      'object',
      'clearRect',
      'Levenim MT',
      'maxVertexTextureImageUnits',
      'KacstOne',
      'safeAddMetadata',
      'querySelector',
      'hasName',
      'pwd',
      '__webdriver_script_fn',
      'value',
      'hasEvent',
      'autofilled',
      'method',
      'performFontDetection',
      'localAgentJwt',
      'omgilibot',
      'TIMEOUT',
      'flatAndAddMetadata',
      'PUSH_NOTIFICATIONS_SUPPORTED',
      'throw',
      '__lastWatirConfirm',
      'stack',
      'geolocation',
      'NAVIGATOR_VENDOR',
      'geo_location',
      'sessionData',
      'MAX_TEXTURE_IMAGE_UNITS',
      'RESOLUTION',
      'windows phone',
      'numberOfAudioDevices',
      'random',
      'connection',
      'Geolocation retrieval failed: Location permission denied by the user.',
      'tan',
      'Ebrima',
      'loadTimes',
      'pagevisibility',
      'jsHeapSizeLimit',
      'gptbot',
      'mimeTypes',
      'Volvo',
      'WEBKIT_FORCE_AT_MOUSE_DOWN',
      'dom-query-error',
      'bytespider',
      'deleteDatabase',
      'round',
      'NAVIGATOR_APP_CODE_NAME',
      'prototype',
      'Failed to get FingerPrint ',
      'fontFingerprintResult',
      'getVoicesCount',
      'selenium_in_document',
      'getHeadlessResults',
      'state',
      'Microsoft Yi Baiti',
      'Battery ',
      '_POSignalsUtils',
      'hasAutofill',
      'WebGLMetadata',
      'trustTokenOperationError',
      'AppleGothic',
      'GET',
      'contains',
      'seleniumInNavigator',
      'fontPreferences',
      'getCurrentBrowserFingerPrint',
      'userAgent',
      'magnetometer',
      'Error during detection of aiasignals:',
      'Noto Sans',
      'getUndefinedValueLie',
      'metadataQueue',
      'serviceWorker',
      'getHasLiedLanguages',
      'eventlistener',
      'getParameter',
      'htmlGeoLocation_timestamp',
      'renderer',
      'Monotype Corsiva',
      'video',
      'BROWSER_ENGINE_NAME',
      'Apple Chancery',
      'abort',
      'timezone',
      'browserType',
      'Swiss',
      'BLUTOOTH_SUPPORTED',
      'cell',
      'fonts',
      'WEBGL_MAXFRAGMENTUNIFORMVECTORS',
      'ACCELEROMETER_SUPPORTED',
      'blobconstructor',
      'WEBGL_MAXVERTEXTEXTUREIMAGEUNITS',
      'Constantia',
      'safeAddModernizrFeatures',
      'performance',
      'simpleHash',
      'EUROSTILE',
      'Linux',
      'Unknown',
      'htmlGeoLocation_latitude',
      'Phosphate',
      'SQRT2',
      'processInputsSynchronously',
      'IFRAME_CHROME',
      'IS_WEBGL2',
      'Segoe UI Light',
      'downlinkMax',
      'all',
      'FILE_INJECT_JS_FOUND',
      'absolute',
      'linux',
      'fingerPrint',
      ' inputs',
      'catch',
      'browserMajor',
      'additionalMediaCodecs',
      'query_selector',
      'Failed to query input elements in async detection:',
      'failed to get deviceId info',
      'Times New Roman',
      'getOps',
      'iframe',
      'notifications',
      'VIDEO_INPUT_DEVICES',
      'force_touch',
      'Candara',
      'NAVIGATOR_ON_LINE',
      'htmlGeoLocation_speed',
      'DetectStealth',
      'Essential',
      'SHADING_LANGUAGE_VERSION',
      'LOG2E',
      'tagName',
      'getLineDash',
      '6608340mbTdOA',
      'OPS',
      'fontFamily',
      'sin',
      " in browser '",
      '__selenium_unwrapped',
      'Helvetica',
      'fingerPrintComponentKeys',
      'full_screen',
      'osVersion',
      'toUpperCase',
      'log',
      'http://127.0.0.1',
      'webglVersion',
      'Droid Sans',
      'clear',
      'numberOfVideoDevices',
      'phone',
      'Microsoft Himalaya',
      'detectAutofillFields',
      'MS Outlook',
      'ccbot',
      'Urdu Nastaliq Unicode',
      'Liberation Sans Narrow',
      'Lucida Sans',
      '-9999px',
      'floc',
      'AUDIO',
      'parentNode',
      'win',
      'Noto Mono',
      'page_visibility',
      'MEMORY_HEAP_SIZE_LIMIT',
      'function query() { [native code] }',
      'create',
      'android',
      'WEB_RTC_ENABLED',
      'Futura Md BT',
      'indexeddbblob',
      '20030107',
      'broJsFingerprint',
      'atanh',
      'cbrt',
      'getDirectory',
      'minDecibels',
      'isWebGlSupported',
      'Geolocation retrieval failed: Location information is unavailable.',
      'failed to get font fingerprint info',
      'Calibri',
      'autofill-detector-styles',
      'DEDVCE_LIGHT_SUPPORTED',
      'PROXIMITY_SUPPORTED',
      'Verdana',
      'Failed to start async autofill detection:',
      'queryselector-unsupported',
      'Meiryo',
      'contentDocument',
      ' inputs, checking first ',
      'message',
      'ipad',
      'min',
      'chrome',
      'contentWindow',
      'matchMedia',
      'timpibot',
      'selenium-evaluate',
      'Rachana',
      'Merriweather',
      'Microsoft Tai Le',
      'Ink Free',
      'keyboard',
      ' failed',
      'LIES.',
      'gyroscope',
      'NAVIGATOR_LANGUAGES',
      'mac',
      'floc_version',
      'BankGothic Md BT',
      'metadataBlackList',
      'data-com-onepassword-filled',
      'kind',
      'extensions',
      'TRAJAN PRO',
      'Error processing input ',
      'LIES',
      'getObfsInfo',
      'getFrequencyResponse',
      'touch_events',
      'SeleniumProperties',
      'caller',
      'Monaco',
      'accuracy',
      'NAVIGATOR_CONNECTION_RTT',
      'propertyBlackList',
      'then',
      'Geolocation retrieval failed: Location request timed out.',
      'addEventListener',
      'contrast',
      'srcdoc_triggers_window_proxy',
      'event_listener',
      'hasEmail',
      'maxVaryingVectors',
      'createObjectStore',
      '_POSignalsMetadata',
      'getWebglCanvas',
      'writable',
      'input',
      'consistent_plugins_prototype',
      '__driver_unwrapped',
      'Palatino Linotype',
      'page intentionally left blank',
      'Bitstream Charter',
      'cpuArchitecture',
      'Letter Gothic',
      'serviceworker',
      'pass',
      'GOTHAM',
      'hashMini',
      'Marker Felt',
      'warn',
      'NAVIGATOR_APP_VERSION',
      'Meiryo UI',
      'WEBGL2VENDORANDRENDERER',
      'stringify',
      'forcedColors',
      'library',
      'window_html_webdriver',
      'webdriver-evaluate-response',
      'NAVIGATOR_CLIENT_HINTS_ARCHITECTURE',
      'audio',
      'LN2',
      'usedJSHeapSize',
      'data-attribute',
      'Gabriola',
      'VENDOR_FLAVORS',
      'quotamanagement',
      'Metadata',
      'webGlBasics',
      'StackTraceTester',
      'aiSignalsResult',
      'e-mail',
      'browser-class',
      '__lastWatirPrompt',
      'TOUCH_SUPPORT',
      'lied',
      'mediaDevices',
      'Document not available for autofill detection',
      'Agency FB',
      'maxTouchPoints',
      'webdriver',
      '__webdriver_evaluate',
      'toString',
      'cros',
      'BROWSER_VERSION',
      'Skia',
      'setupAutofillDetection',
      'browserVersion',
      'Logger',
      'Nunito',
      'userAgentData',
      'IS_CHROME_FAMILY',
      'animation-detection',
      'extendPrimitiveValues',
      'Fingerprint timeout',
      'application/json',
      'PingOne Signals deviceCreatedAt: ',
      'Vrinda',
      'HAS_CHROME_LOADTIMES',
      'tablet',
      'PingOne Signals deviceId: ',
      'NAVIGATOR_WEB_DRIVER',
      'NAVIGATOR_CLIENT_HINTS_BRAND_',
      'srcdoc',
      'outerWidth',
      'OS_VERSION',
      'reducedTransparency',
      'DeviceOrientationEvent',
      'Lohit Gujarati',
      'removeEventListener',
      'Function_prototype_toString_invalid_typeError',
      'Impact',
      'driver-evaluate',
      'forEach',
      'ambientlight',
      'htmlGeoLocation_ErrorCode',
      'WEBGL_EXTENSIONS',
      'appendChild',
      'function () { [native code] }',
      'textSize',
      'MS Gothic',
      'deviceVendor',
      'DEVICE_MODEL',
      'AGENT_BASE_URL',
      'NAVIGATOR_PLATFORM',
      'Arial Unicode MS',
      'queryselector',
      'msSaveBlob',
      'localAgentJwtRequestCount',
      'velenpublicwebcrawler',
      'Dell',
      'Microsoft New Tai Lue',
      'domAutomation',
      'flatten',
      'MAX_TEXTURE_SIZE',
      'ARNO PRO',
      'ChromeDriverw',
      'failed to get private mode info',
      'PERMISSIONS.geolocation',
      'devToolsOrientation',
      'Chromium',
      'WEBGL_SHADINGLANGUAGEVERSION',
      'Canvas font detection failed',
      'autofillCount',
      '_pingOneSignalsPingResult',
      'Roboto',
      'load',
      'Javanese Text',
      'pointer_lock',
      'detectionMethods',
      'delay',
      '(prefers-color-scheme: dark)',
      'scrapy',
      'PDF_VIEWER_ENABLED',
      'INCOMPATIBLE_BROWSER',
      'fontSize',
      'Charter',
      'getPrototypeInFunctionLie',
      'getExtension',
      'audioOutputDevices',
      'push',
      'PLUGINS',
      'Promise',
      'getCurrentPosition',
      'RCA',
      'charging',
      'isIAFDetectionEnabled',
      'cryptography',
      'replace',
      'memory',
      'setItem',
      'NAVIGATOR_CLIENT_HINTS_MODEL',
      'freeze',
      'offsetHeight',
      'components',
      '() {',
      'SCRIPTINA',
      'voiceschanged',
      'fullVersionList',
      'htmlGeoLocation_longitude',
      'web_gl',
      'removeChild',
      'json',
      'Autofill detection timeout after processing ',
      'videoCard',
      'hidden',
      'pointerEnabled',
      'oai-searchbot',
      'NuVision',
      'Century Gothic',
      'hdr',
      'permissions_api_overriden',
      'Optima',
      'getProperty',
      'Dragon Touch',
      'audioIntVideoInit',
      'engineName',
      'MV Boli',
      'Cantarell',
      'getOwnPropertyDescriptor',
      'HAS_TOUCH',
      '_selenium',
      'Chalkboard SE',
      'amazonbot',
      'createElement',
      'browser-autofilled',
      'JS_CHALLENGE',
      'enumerateDevices() cannot run within safari iframe',
      'race',
      'getOwnPropertyNames',
      'promiseTimeout',
      'BLINK',
      'left',
      'VERSION',
      'getHasLiedOs',
      'getLocalAgentJwt',
      'result',
      'get',
      'WEBGL_MAXRENDERBUFFERSIZE',
      'sqrt',
      'devToolsOpen',
      'youbot',
      'allSettled',
      'navigator.webdriver_present',
      'Incognito',
      'DetectLies',
      'Nirmala UI',
      'trustToken',
      'Roboto Condensed',
      'toDataURL',
      'fingerprint',
      'Bitstream Vera Sans Mono',
      'agentIdentificationEnabled',
      'selenium_sequentum',
      'FILE_CONTENT_JS_FOUND',
      'appName',
      '7884160moAMPL',
      'brands',
      'webzio-extended',
      'Tibetan Machine Uni',
      'BROWSER_TAB_HISTORY_LENGTH',
      'Padauk',
      'function get ',
      'IFRAME_HEIGHT',
      'Windows',
      'microphone',
      'LIES_IFRAME',
      'HAS_MICROPHONE',
      'iOS',
      'longitude',
      'custom_elements',
      'lieTypes',
      'domBlockers',
      'getAutofillMetadataAsync',
      'lieTests',
      'OS_NAME',
      'NAVIGATOR_MIME_TYPES_LENGTH',
      'queryUsageAndQuota',
      'disabledStorage',
      'Opera',
      'substr',
      'MS Mincho',
      'Oswald',
      'getOwnPropertyLie',
      'log10',
      'isAIBot',
      'background-sync',
      'Noto Sans CJK KR',
      'isElectronFamily',
      'appVersion',
      'permission',
      'Leelawadee',
      'isPrivateModeV2',
      'enumerateDevices',
      '9921562buzzOg',
      'customprotocolhandler',
      'AUDIO_INPUT_DEVICES',
      'UNMASKED_RENDERER_WEBGL',
      'platform',
      'style',
      'MT Extra',
      'px)',
      'IS_ACCEPT_COOKIES',
      'HAS_CHROME_APP',
      '[[IsRevoked]]',
      'function',
      'textContent',
      'failed ',
      'audio/x-m4a',
      'sort',
      'Leelawadee UI',
      'hardwareConcurrency',
      'rad.io',
      'data-autofilled',
      'substring',
      'typed_arrays',
      'DOCUMENT_ELEMENT_WEBDRIVER',
      'localAgentAccessor',
      'MS UI Gothic',
      'label',
      'exec',
      'storage',
      'pike',
      'fetcher',
      'getWebglData',
      'firefox',
      'accessibility-events',
      'Lato',
      'google-extended',
      'product',
      'field-type-heuristic',
      'Abyssinica SIL',
      'request_animation_frame',
      'htmlGeoLocation_ErrorMessage',
      '72px',
      'WEBGL_MAXVERTEXUNIFORMVECTORS',
      'Android',
      'IS_USER_VERIFYING_PLATFORM_AUTHENTICATOR_AVAILABLE',
      'function ',
      'NAVIGATOR_APP_NAME',
      'STEALTH',
      'hasMicrophone',
      'BROWSER_MAJOR',
      'cors',
      'Failed to fetch the Workstation data: ',
      'architecture',
      'HASLIEDBROWSER',
      'slice',
      'Helvetica Neue',
      'emit',
      'horizontal',
      'addAutofillResult',
      'NETWORK_DOWNLOAD_MAX',
      'Small Fonts',
      'seleniumInWindow',
      'NAVIGATOR_PLUGINS_LENGTH',
      'aiaSignals',
      'ai2bot',
      'Neither WebGL 2.0 nor WebGL 1.0 is supported.',
      'RTCPeerConnection',
      'getMediaCodec',
      'hasWebcam',
      'applePay',
      'Bodoni 72',
      'HAS_CAMERA',
      'Security error',
      'isWebGl2',
      'force_touch.mouse_force_will_begin',
      'deviceMemory',
      'runtime',
      'document-unavailable',
      'HASLIEDLANGUAGES',
      'Buffer',
      'FreeSerif',
      'Gargi',
      'appCodeName',
      'Big Caslon',
      'isFunction',
      'level',
      'availHeight',
      'Util',
      'RENDERER',
      'body',
      'window_geb',
      'deviceModel',
      'getTime',
      'force_touch.webkit_force_at_mouse_down',
      'batteryChargingTime',
      'failed to add iframe data',
      'some',
      'messagechannel',
      'user name',
      'app',
      'callPhantom',
      'NAVIGATOR_PRESENTATION_SUPPORTED',
      'getBroPrintFingerPrint',
      'Source Sans Pro',
      'navigator.plugins_empty',
      'documentElement',
      'Corbel',
      'copyFromChannel',
      'Document not available for async autofill detection',
      '105246tdrkWn',
      'Function',
      'getVoices',
      'customelements',
      'getStealthResult',
      'voicesCount',
      'monospace',
      'Modernizr.on Failed with feature ',
      'detectedFields',
      'video/mp4;; codecs = "avc1.42E01E"',
      'POSITION_UNAVAILABLE',
      'prefixed',
      'Lohit Tamil',
      'serializedDeviceAttributes',
      'WEBGL_debug_renderer_info',
      'Khmer OS System',
      'hasNumber',
      'hasSpeakers',
      'email',
      'force_touch.webkit_force_at_force_mouse_down',
      'floc_id',
      'Century Schoolbook L',
      '[[Handler]]',
      'permissions',
      'PERMISSIONS',
      'autoFillMeta',
      'batteryLevel',
      'candidate',
      'address',
      'safeModernizrOn',
      'isWebGl',
      'FONT_FINGERPRINT',
      'iphone',
      'Marlett',
      'googleother',
      'imagesiftbot',
      'Geolocation retrieval failed: Unknown geolocation error occurred.',
      'custom_protocol_handler',
      'petalbot',
      'moz-autofill',
      'AutofillDetector',
      '__driver_evaluate',
      'isBot',
      'details',
      'headlessResults',
      'BATTERY_CHARGING',
      'exiforientation',
      'navigator.languages_blank',
      'devicePixelRatio',
      'dateTimeLocale',
      'fmget_targets',
      'Sylfaen',
      'iframe_window',
      'Univers CE 55 Medium',
      'Verizon',
      'placeholder',
      'clipboard-write',
      'vibrate',
      'Apple Color Emoji',
      'Yu Gothic',
      'domAutomationController',
      'Arabic Typesetting',
      'webkitRTCPeerConnection',
      '[[Target]]',
      'detectPageInputFields',
      'toSource',
      'UNMASKED_VENDOR_WEBGL',
      'HEADLESS',
      'setProperty',
      'vendor',
      'DejaVu Sans',
      'hashFonts',
      'applicationcache',
      "' in browser '",
      'Chrome',
      'pointerlock',
      'isPrivate',
      'msMaxTouchPoints',
      'signal',
      'touchSupport',
      'MEDIA_CODEC_X_M4A',
      '2675716vuQeYs',
      'Canvas context not available',
      'Droid Serif',
      'omgili',
      'name',
      'GPS_SUPPORTED',
      'accelerometer',
      'NAVIGATOR_HARDWARE_CONCURRENCY',
      'isMobile',
      'hide',
      'window_awesomium',
      'HELV',
      'IS_PRIVATE_MODE',
      'function () {',
      'matches',
      'evaluateModernizr',
      'srcdoc_throws_error',
      'WEBGL_MAXTEXTUREIMAGEUNITS',
      'Microsoft PhagsPa',
      '250, 255, 189',
      'cookieEnabled',
      'Failed to detect autofill:',
      '__selenium_evaluate',
      'indexOf',
      'classList',
      'googleother-image',
      'getBattery',
      'webgl',
      'NAVIGATOR_CLIENT_HINTS_FORM_FACTORS',
      'data-rapid-fill',
      'service_worker',
      'forcetouch',
      'searchLies',
      'Cambria',
      'failed to get permissions info',
      'proximity',
      ' headless test was failed',
      'midi',
      '() { [native code] }',
      'string',
      'aria-label',
      'remove',
      '8763432iXdKsh',
      'reducedMotion',
      'Brush Script MT',
      'PERMISSION_DENIED',
      'data_view',
      'indexedDB',
      'tanh',
      'filename',
      'getDevicePayload',
      'Arial Hebrew',
      'bitness',
      'head',
      'NAVIGATOR_CLIENT_HINTS_PLATFORM',
      'acosh',
      'duration',
      'text',
      'info',
      'WEBGL_MAXCOMBINEDTEXTUREIMAGEUNITS',
      'getGeoSessionData',
      'webdriver-evaluate',
      'isPrivateMode',
      'Safari',
      'document',
      'selenium',
      'Comic Sans MS',
      'important',
      'querySelectorAll not supported for autofill detection',
      'osName',
      'assign',
      "Geolocation permission state is '",
      'match',
      'fullscreen',
      'cookieStore',
      '__webdriverFunc',
      '$chrome_asyncScriptInfo',
      'onAutoFillStart',
      'refreshDeviceAttributes',
      'screenFrame',
      'calledSelenium',
      'ambient_light',
      'referrer',
      'enumerable',
      'camera',
      'deviceCreatedAt',
      'IS_AIBot',
      'calculateDeviceMetadata',
      'innerWidth',
      'enumerateDevices() not supported.',
      'outerHeight',
      ' -> ',
      'Lucida Sans Unicode',
      'detectChromium',
      'enumerateDevicesEnabled',
      'lastCalculatedMetadata',
      'NAVIGATOR_PRODUCT',
      'getFontFingerprint',
      'platformVersion',
      'NOTIFICATION_PERMISSION',
      'agentTimeout',
      'HAS_SPEAKERS',
      'Liberation Serif',
      'onupgradeneeded',
      'batteryDischargingTime',
      'resolve',
      'Malgun Gothic',
      'Segoe UI',
      'addClientHints',
      'position',
      'Courier',
      'tel',
      'Lucida Console',
      'NAVIGATOR_CLIENT_HINTS_MOBILE',
      ':-webkit-autofill',
      'BATTERY_LEVEL',
      'Liberation Sans',
      'function toString() { [native code] }',
      'American Typewriter',
      'Webdings',
      'anthropic-ai',
      'seleniumInDocument',
      'C059',
      'Barnes & Noble',
      'hasAttribute',
      'div',
      'navigator',
      'getRTCPeerConnection',
      'WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN',
      'pdfViewerEnabled',
      'gamepads',
      'maxRenderbufferSize',
      'brand',
      'Failed to get font fingerprint: ',
      'username',
      'window.chrome_missing',
      'TypeError',
      'BROWSER_NAME',
      '__webdriver_script_function',
      ' test execution',
      '62671tHBJnn',
      'calculatedDevToolsOpen',
      'htmlGeoLocation',
      'colorDepth',
      'PREFERS_COLOR_SCHEME',
      'claude-web',
      'interestCohort',
      'touchevents',
      'call',
      'getHighEntropyValues',
      'Lucida Bright',
      'webGlStatus',
      'mozRTCPeerConnection',
      'WINDOW_GLOBAL_KEY_FOUND',
      'getComputedStyle',
      'dischargingTime',
      'maxTextureImageUnits',
      'deviceCategory',
    ];
    return (
      (_0x1ccc = function () {
        return l;
      }),
      _0x1ccc()
    );
  }
  (function (l) {
    const f = _0x44f950;
    let E;
    (function (i) {
      const r = _0x48f7;
      class a {
        [r(309)]() {
          const t = r,
            n = document.createElement(t(457));
          return !!(n.getContext && n.getContext('2d'));
        }
        getWebglCanvas(t) {
          const n = r,
            e = document.createElement(n(457));
          let o = null;
          try {
            t === n(1269)
              ? (o = e.getContext(n(1269)) || e[n(1482)]('experimental-webgl'))
              : (o = e[n(1482)]('webgl2'));
          } catch {}
          return o;
        }
        [r(755)]() {
          const t = r;
          if (!this[t(309)]()) return { supported: !1, type: null };
          let n = this[t(814)](t(1453));
          return n
            ? { supported: !0, type: t(1453) }
            : ((n = this[t(814)]('webgl')),
              n ? { supported: !0, type: t(1269) } : { supported: !1, type: null });
        }
        [r(1191)]() {
          const t = r,
            { supported: n } = this[t(755)]();
          return n;
        }
        [r(1125)]() {
          const t = r,
            { supported: n, type: e } = this[t(755)]();
          return n && e === t(1453);
        }
        [r(1083)]() {
          const t = r,
            n = document[t(983)](t(457));
          let e, o, s, x;
          try {
            ((e = n[t(1482)](t(1453))),
              !e &&
                ((e = n[t(1482)](t(1269)) || n[t(1482)](t(533))), !e && console[t(721)](t(1117))));
          } catch {
            console[t(721)]('Neither WebGL 2.0 nor WebGL 1.0 is supported.');
          }
          try {
            ((o = e[t(937)](t(1175))),
              (s = e[t(650)](o[t(1227)])),
              (x = e.getParameter(o[t(1056)])));
          } catch {
            ((s = e.getParameter(e[t(1436)])), (x = e.getParameter(e[t(1140)])));
          }
          return {
            vendor: s,
            renderer: x,
            webglVersion: e.getParameter(e[t(992)]),
            shadingLanguageVersion: e[t(650)](e[t(706)]),
            extensions: e[t(344)](),
            maxTextureSize: e[t(650)](e[t(913)]),
            maxRenderbufferSize: e.getParameter(e[t(545)]),
            maxTextureImageUnits: e[t(650)](e[t(601)]),
            maxVertexTextureImageUnits: e[t(650)](e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
            maxCombinedTextureImageUnits: e[t(650)](e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
            maxVertexAttribs: e[t(650)](e[t(439)]),
            maxVaryingVectors: e[t(650)](e[t(1517)]),
            maxVertexUniformVectors: e[t(650)](e[t(483)]),
            maxFragmentUniformVectors: e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),
          };
        }
        getHasLiedLanguages() {
          const t = r;
          if (typeof navigator[t(1402)] !== t(480))
            try {
              if (navigator[t(1402)][0][t(1039)](0, 2) !== navigator.language.substr(0, 2))
                return !0;
            } catch {
              return !0;
            }
          return !1;
        }
        getHasLiedResolution() {
          const t = r;
          return (
            window[t(405)][t(1431)] < window[t(405)].availWidth ||
            window[t(405)][t(507)] < window[t(405)][t(1138)]
          );
        }
        [r(993)]() {
          const t = r,
            n = navigator[t(641)][t(1479)]();
          let e = navigator.oscpu;
          const o = navigator[t(1057)][t(1479)]();
          let s;
          if (
            (n.indexOf(t(603)) >= 0
              ? (s = t(1486))
              : n[t(1265)](t(739)) >= 0
                ? (s = 'Windows')
                : n.indexOf(t(745)) >= 0
                  ? (s = t(1095))
                  : n[t(1265)](t(686)) >= 0 || n[t(1265)](t(862)) >= 0
                    ? (s = t(673))
                    : n[t(1265)](t(1193)) >= 0 || n[t(1265)](t(769)) >= 0
                      ? (s = t(1027))
                      : n[t(1265)](t(785)) >= 0
                        ? (s = t(560))
                        : (s = t(1487)),
            (t(374) in window || navigator[t(858)] > 0 || navigator[t(1238)] > 0) &&
              s !== 'Windows Phone' &&
              s !== t(1095) &&
              s !== 'iOS' &&
              s !== 'Other')
          )
            return !0;
          if (typeof e !== t(480)) {
            if (((e = e.toLowerCase()), e[t(1265)](t(739)) >= 0 && s !== t(1023) && s !== t(1486)))
              return !0;
            if (e[t(1265)](t(686)) >= 0 && s !== t(673) && s !== t(1095)) return !0;
            if (e[t(1265)](t(785)) >= 0 && s !== 'Mac' && s !== t(1027)) return !0;
            if (
              (e[t(1265)](t(739)) === -1 &&
                e[t(1265)](t(686)) === -1 &&
                e[t(1265)](t(785)) === -1) !=
              (s === t(1487))
            )
              return !0;
          }
          return (o[t(1265)](t(739)) >= 0 && s !== 'Windows' && s !== 'Windows Phone') ||
            ((o.indexOf('linux') >= 0 || o.indexOf(t(745)) >= 0 || o[t(1265)](t(1081)) >= 0) &&
              s !== t(673) &&
              s !== t(1095)) ||
            ((o[t(1265)](t(785)) >= 0 ||
              o[t(1265)]('ipad') >= 0 ||
              o.indexOf(t(473)) >= 0 ||
              o.indexOf(t(1193)) >= 0) &&
              s !== t(560) &&
              s !== 'iOS') ||
            (o[t(1265)](t(739)) < 0 &&
              o[t(1265)](t(686)) < 0 &&
              o[t(1265)](t(785)) < 0 &&
              o[t(1265)](t(1193)) < 0 &&
              o[t(1265)]('ipad') < 0) !==
              (s === 'Other')
            ? !0
            : typeof navigator.plugins === t(480) && s !== 'Windows' && s !== t(1486);
        }
        [r(339)]() {
          const t = r,
            n = navigator.userAgent[t(1479)](),
            e = navigator[t(444)];
          let o;
          if (
            (n[t(1265)](t(1084)) >= 0
              ? (o = t(565))
              : n.indexOf('opera') >= 0 || n.indexOf('opr') >= 0
                ? (o = t(1038))
                : n[t(1265)](t(771)) >= 0
                  ? (o = t(1235))
                  : n[t(1265)](t(1478)) >= 0
                    ? (o = 'Safari')
                    : n[t(1265)](t(561)) >= 0
                      ? (o = t(423))
                      : (o = 'Other'),
            (o === t(1235) || o === 'Safari' || o === t(1038)) && e !== t(749))
          )
            return !0;
          const s = eval[t(861)]()[t(368)];
          if (s === 37 && o !== 'Safari' && o !== t(565) && o !== 'Other') return !0;
          if (s === 39 && o !== t(423) && o !== 'Other') return !0;
          if (s === 33 && o !== t(1235) && o !== t(1038) && o !== 'Other') return !0;
          let x;
          try {
            throw 'a';
          } catch (m) {
            try {
              (m[t(1226)](), (x = !0));
            } catch {
              x = !1;
            }
          }
          return x && o !== t(565) && o !== t(1487);
        }
      }
      i[r(633)] = a;
    })((E = l[f(813)] || (l[f(813)] = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    const f = _0x44f950;
    let E;
    (function (i) {
      const r = _0x48f7;
      class a {
        constructor(t) {
          const n = _0x48f7;
          this[n(803)] = t;
        }
        [r(627)]() {
          return __awaiter(this, void 0, void 0, function* () {
            const t = _0x48f7,
              n = yield this[t(1205)](window);
            return (
              yield this[t(431)](n, t(1213), () =>
                __awaiter(this, void 0, void 0, function* () {
                  const e = t;
                  if (!Object[e(465)]) return;
                  const o = l[e(631)][e(1139)][e(325)]('iframe');
                  if (!o) return;
                  if (
                    ((o[e(882)] = e(820)),
                    document.body[e(896)](o),
                    Object[e(465)](HTMLIFrameElement[e(622)])[e(772)][e(996)][e(861)]() !==
                      'function get contentWindow() { [native code] }' || o[e(772)] === window)
                  )
                    return !0;
                  const x = yield this[e(1205)](o[e(772)]);
                  return (o.remove(), x);
                }),
              ),
              n
            );
          });
        }
        headlessResults(t) {
          return __awaiter(this, void 0, void 0, function* () {
            const n = _0x48f7,
              e = new Map(),
              o = [];
            return (
              o[n(939)](
                this[n(431)](e, n(392), () =>
                  __awaiter(this, void 0, void 0, function* () {
                    const s = n;
                    return /HeadlessChrome/.test(t[s(1368)][s(641)]);
                  }),
                ),
              ),
              o[n(939)](
                this.test(e, n(1002), () =>
                  __awaiter(this, void 0, void 0, function* () {
                    const s = n;
                    return t[s(1368)][s(859)];
                  }),
                ),
              ),
              o[n(939)](
                this[n(431)](e, n(1377), () =>
                  __awaiter(this, void 0, void 0, function* () {
                    const s = n;
                    return /Chrome/.test(t.navigator.userAgent) && !t[s(771)];
                  }),
                ),
              ),
              o[n(939)](
                this[n(431)](e, 'permissions_api', () =>
                  __awaiter(this, void 0, void 0, function* () {
                    const s = n;
                    if (t[s(1368)][s(1184)] && t[s(362)]) {
                      const x = yield t.navigator.permissions.query({ name: 'notifications' });
                      return t[s(362)][s(1049)] === s(338) && x[s(628)] === 'prompt';
                    }
                  }),
                ),
              ),
              o[n(939)](
                this[n(431)](e, n(970), () =>
                  __awaiter(this, void 0, void 0, function* () {
                    const s = n,
                      x = t[s(1368)][s(1184)];
                    if (x)
                      return x[s(410)][s(861)]() !== s(743) ||
                        x[s(410)][s(861)][s(861)]() !== s(1359) ||
                        (x[s(410)].toString[s(1417)](s(1183)) &&
                          x[s(410)][s(861)].hasOwnProperty(s(1224)) &&
                          x.query[s(861)][s(1417)](s(1063)))
                        ? !0
                        : x[s(1417)](s(410));
                  }),
                ),
              ),
              o[n(939)](
                this[n(431)](e, n(1156), () =>
                  __awaiter(this, void 0, void 0, function* () {
                    return navigator[n(492)].length === 0;
                  }),
                ),
              ),
              o[n(939)](
                this[n(431)](e, n(1208), () =>
                  __awaiter(this, void 0, void 0, function* () {
                    return navigator[n(1402)] === '';
                  }),
                ),
              ),
              o[n(939)](
                this[n(431)](e, n(817), () =>
                  __awaiter(this, void 0, void 0, function* () {
                    const s = n;
                    let x = PluginArray[s(622)] === navigator[s(492)].__proto__;
                    return (
                      navigator[s(492)][s(368)] > 0 &&
                        (x = x && Plugin[s(622)] === navigator.plugins[0].__proto__),
                      x
                    );
                  }),
                ),
              ),
              o[n(939)](
                this.test(e, n(355), () =>
                  __awaiter(this, void 0, void 0, function* () {
                    const s = n;
                    let x = MimeTypeArray[s(622)] === navigator[s(614)].__proto__;
                    return (
                      navigator[s(614)].length > 0 &&
                        (x = x && MimeType[s(622)] === navigator[s(614)][0][s(403)]),
                      x
                    );
                  }),
                ),
              ),
              yield Promise[n(683)](o),
              e
            );
          });
        }
        [r(431)](t, n, e) {
          return __awaiter(this, void 0, void 0, function* () {
            const o = _0x48f7;
            try {
              if (!this[o(803)][o(438)](n)) {
                const s = yield l[o(631)][o(1139)][o(989)](100, e());
                s != null && (t[n] = s);
              }
            } catch (s) {
              l[o(631)][o(867)].warn(n + o(1278), s);
            }
          });
        }
      }
      i[r(1459)] = a;
    })((E = l._POSignalsMetadata || (l[f(813)] = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    const f = _0x44f950;
    let E;
    (function (i) {
      function r() {
        return new Promise((a, c) => {
          const t = _0x48f7;
          let n = t(674),
            e = !1;
          function o(D) {
            e || ((e = !0), a({ isPrivate: D, browserName: n }));
          }
          function s() {
            const D = t,
              G = navigator[D(641)];
            return G.match(/Chrome/)
              ? navigator.brave !== void 0
                ? 'Brave'
                : G[D(1314)](/Edg/)
                  ? D(570)
                  : G[D(1314)](/OPR/)
                    ? D(1038)
                    : D(1235)
              : D(919);
          }
          function x(D) {
            const G = t;
            try {
              return D === eval[G(861)]()[G(368)];
            } catch {
              return !1;
            }
          }
          function m() {
            const D = t;
            let G = 0;
            const N = parseInt('-1');
            try {
              N[D(1525)](N);
            } catch (ne) {
              G = ne[D(768)][D(368)];
            }
            return G;
          }
          function p() {
            return m() === 44;
          }
          function I() {
            return m() === 51;
          }
          function g() {
            return m() === 25;
          }
          function v() {
            return navigator[t(906)] !== void 0 && x(39);
          }
          function A() {
            var D;
            return __awaiter(this, void 0, void 0, function* () {
              const G = _0x48f7;
              try {
                const N = navigator[G(1080)];
                (typeof (N == null ? void 0 : N[G(753)]) === G(1064) && (yield N[G(753)]()), o(!1));
              } catch (N) {
                const ne = N instanceof Error && (D = N[G(768)]) !== null && D !== void 0 ? D : N;
                o(typeof ne === G(1281) && ne.includes('unknown transient reason'));
              }
            });
          }
          function S() {
            const D = t,
              G = String(Math[D(605)]());
            try {
              const N = indexedDB[D(330)](G, 1);
              ((N[D(1345)] = (ne) => {
                const he = D,
                  Y = ne.target.result;
                try {
                  (Y[he(812)]('t', { autoIncrement: !0 }).put(new Blob()), o(!1));
                } catch (ye) {
                  const be = ye.message || '';
                  o(be[he(1461)]('are not yet supported'));
                } finally {
                  (Y.close(), indexedDB[he(619)](G));
                }
              }),
                (N.onerror = () => o(!1)));
            } catch {
              o(!1);
            }
          }
          function d() {
            const D = t;
            try {
              window[D(411)](null, null, null, null);
            } catch {
              return o(!0);
            }
            try {
              (localStorage[D(949)](D(431), '1'), localStorage[D(1449)](D(431)));
            } catch {
              return o(!0);
            }
            o(!1);
          }
          function _() {
            return __awaiter(this, void 0, void 0, function* () {
              const D = _0x48f7,
                G = navigator[D(1080)];
              typeof (G == null ? void 0 : G[D(753)]) === D(1064)
                ? yield A()
                : navigator[D(858)] !== void 0
                  ? S()
                  : d();
            });
          }
          function L() {
            const D = t;
            var G;
            const N =
              (G = performance == null ? void 0 : performance.memory) === null || G === void 0
                ? void 0
                : G[D(612)];
            return N != null ? N : 1073741824;
          }
          function y() {
            const D = t;
            navigator[D(404)][D(1036)](
              function (G, N) {
                const ne = Math.round(N / 1048576),
                  he = Math.round(L() / (1024 * 1024)) * 2;
                o(ne < he);
              },
              function (G) {
                const N = D;
                c(new Error(N(312) + G[N(768)]));
              },
            );
          }
          function O() {
            const D = t,
              G = window[D(1515)];
            G(
              0,
              1,
              () => o(!1),
              () => o(!0),
            );
          }
          function M() {
            const D = t;
            self[D(941)] && self[D(941)][D(1001)] ? y() : O();
          }
          function R() {
            return __awaiter(this, void 0, void 0, function* () {
              const D = _0x48f7,
                G = navigator[D(1080)];
              if (typeof (G == null ? void 0 : G.getDirectory) == 'function')
                try {
                  (yield G[D(753)](), o(!1));
                } catch (N) {
                  const ne = N instanceof Error ? N[D(768)] : String(N);
                  o(typeof ne === D(1281) && ne[D(1461)](D(1124)));
                  return;
                }
              else o(navigator[D(647)] === void 0);
            });
          }
          function k() {
            o(window[t(1289)] === void 0);
          }
          function B() {
            return __awaiter(this, void 0, void 0, function* () {
              const D = _0x48f7;
              p()
                ? ((n = D(1305)), yield _())
                : I()
                  ? ((n = s()), M())
                  : g()
                    ? ((n = D(565)), yield R())
                    : v()
                      ? ((n = 'Internet Explorer'), k())
                      : c(new Error(D(511)));
            });
          }
          B()[t(689)](c);
        });
      }
      i.detectIncognitoInternal = r;
    })((E = l[f(813)] || (l[f(813)] = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    const f = _0x44f950;
    let E;
    (function (i) {
      const r = _0x48f7;
      class a {
        constructor(t) {
          const n = _0x48f7;
          ((this.propertyBlackList = t), (this[n(995)] = {}));
        }
        [r(1497)](t, n) {
          const e = r;
          if (n[e(854)])
            for (const o of n[e(1030)])
              (!this.result[o] && (this[e(995)][o] = []), this.result[o][e(939)](t));
        }
        getLies(t, n, e = null) {
          const o = r;
          if (typeof t != 'function') return { lied: !1, lieTypes: [] };
          const s = t[o(1246)][o(947)](/get\s/, ''),
            x = {
              undefined_properties: () => (e ? a[o(645)](e, s) : !1),
              to_string: () => a[o(526)](t, s, this[o(1412)]),
              prototype_in_function: () => a[o(936)](t),
              own_property: () => a[o(1042)](t),
              object_to_string_error: () => a[o(1496)](t),
            },
            m = Object[o(345)](x)[o(365)]((p) => !this[o(803)][o(438)](o(782) + p) && !!x[p]());
          return { lied: m[o(368)] > 0, lieTypes: m };
        }
        [r(328)]() {
          return __awaiter(this, void 0, void 0, function* () {
            const t = _0x48f7;
            if (this.propertyBlackList[t(438)](t(794))) return this[t(995)];
            if (!this[t(803)][t(438)](t(1025))) {
              const n = l[t(631)][t(1139)].createInvisibleElement(t(697));
              n && (document[t(1141)][t(896)](n), (this.iframeWindow = n));
            }
            return (
              yield Promise.all([
                this[t(1274)](() => AnalyserNode, { target: [t(754)] }),
                this[t(1274)](() => AudioBuffer, { target: [t(1159)] }),
                this[t(1274)](() => BiquadFilterNode, { target: [t(796)] }),
                this[t(1274)](() => CanvasRenderingContext2D, { target: [t(709)] }),
                this[t(1274)](() => DOMRect, { target: [t(507)] }),
                this[t(1274)](() => DOMRectReadOnly, { target: ['left'] }),
                this.searchLies(() => Element, { target: ['getClientRects'] }),
                this[t(1274)](() => HTMLCanvasElement, { target: [t(507)] }),
                this[t(1274)](() => Math, { target: [t(1476)] }),
                this[t(1274)](() => MediaDevices, { target: [t(1052)] }),
                this[t(1274)](() => Navigator, { target: [t(492)] }),
                this[t(1274)](() => OffscreenCanvasRenderingContext2D, { target: [t(709)] }),
                this[t(1274)](() => SVGRect, { target: ['x'] }),
              ]),
              this.iframeWindow[t(1283)](),
              this[t(995)]
            );
          });
        }
        [r(1274)](t, { target: n = [], ignore: e = [] } = {}) {
          return __awaiter(this, void 0, void 0, function* () {
            const o = _0x48f7;
            function s(p) {
              return typeof p != _0x48f7(480) && !!p;
            }
            let x;
            try {
              if (((x = t()), !s(x))) return;
            } catch {
              return;
            }
            const m = x.prototype ? x.prototype : x;
            Object[o(988)](m)[o(892)]((p) => {
              const I = o;
              if (
                p == I(1516) ||
                (n.length && !new Set(n)[I(438)](p)) ||
                (e.length && new Set(e).has(p))
              )
                return;
              const v = /\s(.+)\]/,
                A = (x[I(1246)] ? x.name : v[I(431)](x) ? v.exec(x)[1] : void 0) + '.' + p;
              try {
                const S = x.prototype ? x[I(622)] : x;
                try {
                  if (typeof S[p] == 'function') {
                    const y = this[I(1488)](S[p], S);
                    this[I(1497)](A, y);
                    return;
                  }
                } catch {}
                const d = Object[I(978)](S, p)[I(996)],
                  _ = this.getLies(d, S, x);
                this.documentLie(A, _);
              } catch (S) {
                l[I(631)][I(867)][I(829)](I(1066) + p + I(1381), S);
              }
            });
          });
        }
        static [r(645)](t, n) {
          const e = r,
            o = t.name,
            s = window[o.charAt(0).toLowerCase() + o[e(1106)](1)];
          return (
            !!s && (typeof Object[e(978)](s, n) != e(480) || typeof Reflect[e(978)](s, n) != e(480))
          );
        }
        static [r(526)](t, n, e) {
          const o = r;
          let s, x;
          try {
            s = e[o(1162)][o(622)][o(861)][o(1390)](t);
          } catch {}
          try {
            x = e.Function[o(622)].toString.call(t[o(861)]);
          } catch {}
          const m = s || t[o(861)](),
            p = x || t[o(861)][o(861)](),
            I = (g) => ({
              [o(1097) + g + '() { [native code] }']: !0,
              ['function get ' + g + o(1280)]: !0,
              [o(897)]: !0,
              [o(1097) +
              g +
              o(954) +
              `
    [native code]
}`]: !0,
              [o(1021) +
              g +
              o(954) +
              `
    [native code]
}`]: !0,
              [o(1255) +
              `
` +
              o(1433) +
              `
}`]: !0,
            });
          return !I(n)[m] || !I(o(861))[p];
        }
        static [r(936)](t) {
          return r(622) in t;
        }
        static [r(1042)](t) {
          const n = r;
          return (
            t.hasOwnProperty('arguments') ||
            t[n(1417)](n(799)) ||
            t.hasOwnProperty(n(622)) ||
            t[n(1417)]('toString')
          );
        }
        static getNewObjectToStringTypeErrorLie(t) {
          const n = r;
          try {
            return (Object[n(744)](t)[n(861)](), !0);
          } catch (e) {
            const o = e[n(596)][n(376)](`
`),
              s = o.slice(1),
              x = /at Object\.apply/,
              m = /at Function\.toString/,
              p = !s[n(459)]((v) => x[n(431)](v)),
              I = e[n(1516)][n(1246)] == n(1378) && o.length > 1,
              g = n(771) in window || i[n(846)].detectChromium();
            return I && g && (!m[n(431)](o[1]) || !p) ? !0 : !I;
          }
        }
      }
      i[r(1004)] = a;
    })((E = l[f(813)] || (l._POSignalsMetadata = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    const f = _0x44f950;
    let E;
    (function (i) {
      const r = _0x48f7;
      class a {
        constructor(t) {
          const n = _0x48f7;
          ((this[n(803)] = t), (this[n(995)] = new Map()));
        }
        [r(1165)]() {
          const t = r;
          return (
            this.addStealthTest(t(1258), () => {
              const n = t;
              try {
                const { srcdoc: e } = document[n(983)](n(697));
                return !!e;
              } catch {
                return !0;
              }
            }),
            this[t(337)](t(808), () => {
              const n = t,
                e = document[n(983)](n(697));
              return (
                (e.srcdoc =
                  '' + l[n(631)][n(1139)][n(827)](crypto.getRandomValues(new Uint32Array(10)))),
                !!e[n(772)]
              );
            }),
            this[t(337)]('index_chrome_too_high', () => {
              const n = t,
                e = n(1316) in window ? n(1316) : n(467) in window ? n(467) : n(340),
                o = [];
              for (const m in window) o[n(939)](m);
              const s = o.indexOf('chrome'),
                x = o[n(1265)](e);
              return s > x;
            }),
            this[t(337)](t(539), () => {
              const n = t;
              if (!('chrome' in window && n(1128) in window[n(771)])) return !1;
              try {
                return (
                  n(622) in window[n(771)][n(1128)].sendMessage ||
                    n(622) in window[n(771)][n(1128)][n(361)] ||
                    (new window[n(771)].runtime.sendMessage(),
                    new window[n(771)][n(1128)][n(361)]()),
                  !0
                );
              } catch (e) {
                return e[n(1516)][n(1246)] != n(1378);
              }
            }),
            this[t(337)](t(889), () => {
              const n = t,
                e = new a[n(848)]();
              return e[n(372)](Function[n(622)][n(861)]) || e[n(372)](() => {});
            }),
            this[t(995)]
          );
        }
        [r(337)](t, n) {
          const e = r;
          if (!this[e(803)][e(438)](t))
            try {
              this[e(995)][t] = n();
            } catch (o) {
              l[e(631)][e(867)][e(829)](e(572) + t + e(781), o);
            }
        }
      }
      ((a[r(848)] = class {
        [r(372)](c) {
          const t = r;
          try {
            return (
              (this[t(1443)] = () => Object[t(744)](c)[t(861)]()),
              (this[t(462)] = () => this[t(1443)]()),
              (this[t(1251)] = () => this[t(462)]()),
              this[t(1251)](),
              !0
            );
          } catch (n) {
            const e = n[t(596)].split(`
`),
              o = !/at Object\.apply/[t(431)](e[1]),
              s = n[t(1516)].name == 'TypeError' && e.length >= 5,
              x = 'chrome' in window || i[t(846)][t(1335)]();
            return s &&
              x &&
              (!o ||
                !/at Function\.toString/[t(431)](e[1]) ||
                !/\.you/[t(431)](e[2]) ||
                !/\.cant/[t(431)](e[3]) ||
                !/\.hide/[t(431)](e[4]))
              ? !0
              : !s;
          }
        }
      }),
        (i[r(704)] = a));
    })((E = l[f(813)] || (l[f(813)] = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    const f = _0x44f950;
    let E;
    (function (i) {
      const r = _0x48f7;
      class a {
        static [r(1304)]() {
          const t = r;
          return l[t(813)]
            .detectIncognitoInternal()
            [t(804)]((n) => n[t(1237)])
            [t(689)](() => !1);
        }
      }
      i[r(1003)] = a;
    })((E = l[f(813)] || (l[f(813)] = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    let f;
    (function (E) {
      ((E[(E.Unknown = 0)] = 'Unknown'),
        (E[(E.FlingRight = 1)] = 'FlingRight'),
        (E[(E.FlingLeft = 2)] = 'FlingLeft'),
        (E[(E.FlingUp = 3)] = 'FlingUp'),
        (E[(E.FlingDown = 4)] = 'FlingDown'),
        (E[(E.Diagonal = 5)] = 'Diagonal'),
        (E[(E.ScrollRight = 6)] = 'ScrollRight'),
        (E[(E.ScrollLeft = 7)] = 'ScrollLeft'),
        (E[(E.ScrollUp = 8)] = 'ScrollUp'),
        (E[(E.ScrollDown = 9)] = 'ScrollDown'),
        (E[(E.Tap = 10)] = 'Tap'),
        (E[(E.DoubleTap = 11)] = 'DoubleTap'));
    })((f = l.GestureType || (l.GestureType = {})));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    'use strict';
    class f {
      constructor(_, L) {
        ((this.handler = _), (this.isOnce = L), (this.isExecuted = !1));
      }
      execute(_, L, y) {
        if (!this.isOnce || !this.isExecuted) {
          this.isExecuted = !0;
          const O = this.handler;
          _
            ? setTimeout(() => {
                O.apply(L, y);
              }, 1)
            : O.apply(L, y);
        }
      }
    }
    class E {
      constructor() {
        ((this._wrap = new c(this)), (this._subscriptions = new Array()));
      }
      subscribe(_) {
        _ && this._subscriptions.push(new f(_, !1));
      }
      sub(_) {
        this.subscribe(_);
      }
      one(_) {
        _ && this._subscriptions.push(new f(_, !0));
      }
      has(_) {
        if (_) {
          for (const L of this._subscriptions) if (L.handler == _) return !0;
        }
        return !1;
      }
      unsubscribe(_) {
        if (_) {
          for (let L = 0; L < this._subscriptions.length; L++)
            if (this._subscriptions[L].handler == _) {
              this._subscriptions.splice(L, 1);
              break;
            }
        }
      }
      unsub(_) {
        this.unsubscribe(_);
      }
      _dispatch(_, L, y) {
        for (let O = 0; O < this._subscriptions.length; O++) {
          const M = this._subscriptions[O];
          if (M.isOnce) {
            if (M.isExecuted === !0) continue;
            (this._subscriptions.splice(O, 1), O--);
          }
          M.execute(_, L, y);
        }
      }
      asEvent() {
        return this._wrap;
      }
    }
    l.DispatcherBase = E;
    class i extends E {
      dispatch(_, L) {
        this._dispatch(!1, this, arguments);
      }
      dispatchAsync(_, L) {
        this._dispatch(!0, this, arguments);
      }
    }
    l.EventDispatcher = i;
    class r extends E {
      dispatch(_) {
        this._dispatch(!1, this, arguments);
      }
      dispatchAsync(_) {
        this._dispatch(!0, this, arguments);
      }
    }
    class a extends E {
      dispatch() {
        this._dispatch(!1, this, arguments);
      }
      dispatchAsync() {
        this._dispatch(!0, this, arguments);
      }
    }
    class c {
      constructor(_) {
        ((this._subscribe = (L) => _.subscribe(L)),
          (this._unsubscribe = (L) => _.unsubscribe(L)),
          (this._one = (L) => _.one(L)),
          (this._has = (L) => _.has(L)));
      }
      subscribe(_) {
        this._subscribe(_);
      }
      sub(_) {
        this.subscribe(_);
      }
      unsubscribe(_) {
        this._unsubscribe(_);
      }
      unsub(_) {
        this.unsubscribe(_);
      }
      one(_) {
        this._one(_);
      }
      has(_) {
        return this._has(_);
      }
    }
    class t {
      constructor() {
        this._events = {};
      }
      get(_) {
        let L = this._events[_];
        return L || ((L = this.createDispatcher()), (this._events[_] = L), L);
      }
      remove(_) {
        this._events[_] = null;
      }
    }
    class n extends t {
      createDispatcher() {
        return new i();
      }
    }
    class e extends t {
      createDispatcher() {
        return new r();
      }
    }
    class o extends t {
      createDispatcher() {
        return new a();
      }
    }
    class s {
      constructor() {
        this._events = new n();
      }
      get events() {
        return this._events;
      }
      subscribe(_, L) {
        this._events.get(_).subscribe(L);
      }
      sub(_, L) {
        this.subscribe(_, L);
      }
      unsubscribe(_, L) {
        this._events.get(_).unsubscribe(L);
      }
      unsub(_, L) {
        this.unsubscribe(_, L);
      }
      one(_, L) {
        this._events.get(_).one(L);
      }
      has(_, L) {
        return this._events.get(_).has(L);
      }
    }
    class x {
      constructor() {
        this._events = new e();
      }
      get events() {
        return this._events;
      }
      subscribe(_, L) {
        this._events.get(_).subscribe(L);
      }
      sub(_, L) {
        this.subscribe(_, L);
      }
      one(_, L) {
        this._events.get(_).one(L);
      }
      has(_, L) {
        return this._events.get(_).has(L);
      }
      unsubscribe(_, L) {
        this._events.get(_).unsubscribe(L);
      }
      unsub(_, L) {
        this.unsubscribe(_, L);
      }
    }
    class m {
      constructor() {
        this._events = new o();
      }
      get events() {
        return this._events;
      }
      one(_, L) {
        this._events.get(_).one(L);
      }
      has(_, L) {
        return this._events.get(_).has(L);
      }
      subscribe(_, L) {
        this._events.get(_).subscribe(L);
      }
      sub(_, L) {
        this.subscribe(_, L);
      }
      unsubscribe(_, L) {
        this._events.get(_).unsubscribe(L);
      }
      unsub(_, L) {
        this.unsubscribe(_, L);
      }
    }
    function p() {
      return new i();
    }
    function I() {
      return new n();
    }
    function g() {
      return new r();
    }
    function v() {
      return new e();
    }
    function A() {
      return new a();
    }
    function S() {
      return new o();
    }
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      get LAST_GESTURE_SENSOR_TIMEOUT_MILI_SECONDS() {
        return 3e3;
      }
      get accX() {
        return this._accX;
      }
      get accY() {
        return this._accY;
      }
      get accZ() {
        return this._accZ;
      }
      get lienarAccX() {
        return this._lienarAccX;
      }
      get lienarAccY() {
        return this._lienarAccY;
      }
      get lienarAccZ() {
        return this._lienarAccZ;
      }
      get isStarted() {
        return this._isStarted;
      }
      get rotX() {
        return this._rotX;
      }
      get rotY() {
        return this._rotY;
      }
      get rotZ() {
        return this._rotZ;
      }
      get maxSensorSamples() {
        return this._maxSensorSamples;
      }
      set maxSensorSamples(i) {
        this._maxSensorSamples = i;
      }
      get sensorsTimestampDeltaInMillis() {
        return this._sensorsTimestampDeltaInMillis;
      }
      set sensorsTimestampDeltaInMillis(i) {
        this._sensorsTimestampDeltaInMillis = i;
      }
      get accelerometerList() {
        return this.getRelevantSensorSamples(this._accelerometerList);
      }
      get gyroscopeList() {
        return this.getRelevantSensorSamples(this._gyroscopeList);
      }
      get linearAccelerometerList() {
        return this.getRelevantSensorSamples(this._linearAccelerometerList);
      }
      get rotationList() {
        return this._rotationList;
      }
      constructor(i) {
        ((this._isStarted = !1),
          (this._isEventsStarted = !1),
          (this._gestureTimestamps = []),
          (this._maxSensorSamples = 0),
          (this._sensorsTimestampDeltaInMillis = 0),
          (this._accelerometerList = []),
          (this._gyroscopeList = []),
          (this._linearAccelerometerList = []),
          (this._rotationList = []),
          (this.orientationImplementationFix = 1),
          (this.delegate = i),
          window.navigator.userAgent.match(
            /^.*(iPhone|iPad).*(OS\s[0-9]).*(CriOS|Version)\/[.0-9]*\sMobile.*$/i,
          ) && (this.orientationImplementationFix = -1),
          (this.accelerometerUpdateHandle = this.accelerometerUpdate.bind(this)),
          (this.orientationUpdateHandle = this.orientationUpdate.bind(this)));
      }
      start() {
        this._isStarted ||
          ((this._isStarted = !0), l._POSignalsUtils.Logger.debug('Sensor events started...'));
      }
      getRotationListCopy() {
        return this._rotationList ? Array.from(this._rotationList) : [];
      }
      stop() {
        this._isStarted &&
          (window.DeviceMotionEvent != null &&
            window.removeEventListener('devicemotion', this.accelerometerUpdateHandle, !0),
          window.DeviceOrientationEvent &&
            window.removeEventListener('deviceorientation', this.orientationUpdateHandle, !0),
          (this._isStarted = !1),
          l._POSignalsUtils.Logger.debug('Sensor events stopped'));
      }
      getRelevantSensorSamples(i) {
        if (
          i.length == 0 ||
          this._sensorsTimestampDeltaInMillis < 1 ||
          this._gestureTimestamps.length == 0
        )
          return i;
        const r = new Map();
        let a = null,
          c = 0;
        for (let t = 0; t < i.length; t++)
          for (let n = 0; n < this._gestureTimestamps.length; n++)
            ((c = i[t].timestamp),
              (a = this._gestureTimestamps[n]),
              c >= a.start - this._sensorsTimestampDeltaInMillis &&
                c <= a.end + this._sensorsTimestampDeltaInMillis &&
                r.set(i[t].timestamp, i[t]));
        return l._POSignalsUtils.Util.getValuesOfMap(r);
      }
      stopEvents() {
        this._isEventsStarted &&
          (window.DeviceMotionEvent != null &&
            window.removeEventListener('devicemotion', this.accelerometerUpdateHandle, !0),
          window.DeviceOrientationEvent &&
            window.removeEventListener('deviceorientation', this.orientationUpdateHandle, !0),
          (this._isEventsStarted = !1),
          l._POSignalsUtils.Logger.debug('Sensor events stopped listening'));
      }
      async startEvents() {
        if (this._isEventsStarted) return;
        typeof DeviceMotionEvent != 'undefined' &&
          typeof DeviceMotionEvent.requestPermission == 'function' &&
          l._POSignalsUtils.Logger.debug(
            'iOS detected. Attaching passive sensor listeners (data will flow if host app grants permission).',
          );
        let i = 'granted';
        if (navigator.permissions)
          try {
            if (
              (await navigator.permissions.query({ name: 'accelerometer' })).state !== 'granted'
            ) {
              l._POSignalsUtils.Logger.debug('Sensor permission not granted. Skipping.');
              return;
            }
          } catch {}
        (window.DeviceMotionEvent != null
          ? this.delegate.addEventListener(
              window,
              'devicemotion',
              this.accelerometerUpdateHandle,
              !0,
            )
          : l._POSignalsUtils.Logger.warn('DeviceMotion not supported!'),
          window.DeviceOrientationEvent
            ? this.delegate.addEventListener(
                window,
                'deviceorientation',
                this.orientationUpdateHandle,
                !0,
              )
            : l._POSignalsUtils.Logger.warn('DeviceOrientation not supported!'),
          l._POSignalsUtils.Logger.debug('Sensor events start listening...'),
          (this._isEventsStarted = !0));
      }
      reset() {
        ((this._accelerometerList = []),
          (this._gyroscopeList = []),
          (this._linearAccelerometerList = []),
          (this._rotationList = []),
          this._gestureTimestamps.length > 0
            ? (this._gestureTimestamps = [
                this._gestureTimestamps[this._gestureTimestamps.length - 1],
              ])
            : (this._gestureTimestamps = []),
          (this._accX = 0),
          (this._accY = 0),
          (this._accZ = 0),
          (this._rotX = 0),
          (this._rotY = 0),
          (this._rotZ = 0));
      }
      onGesture(i) {
        (this._isEventsStarted || this.startEvents(),
          i.events.length > 1 &&
            this._gestureTimestamps.push({
              start: i.events[0].eventTs,
              end: i.events[i.events.length - 1].eventTs,
            }));
      }
      puaseSensorsCollectionIfNoActivity(i) {
        if (
          (this._gestureTimestamps.length > 0
            ? this._gestureTimestamps[this._gestureTimestamps.length - 1].end
            : 0) > 0
        ) {
          if (
            Math.abs(i - this._gestureTimestamps[this._gestureTimestamps.length - 1].end) >
            this.LAST_GESTURE_SENSOR_TIMEOUT_MILI_SECONDS
          )
            return (this.stopEvents(), !0);
        } else return (this.stopEvents(), !0);
        return !1;
      }
      getDeviceAcceleration(i) {
        return !i || i.x == null || i.y == null || i.z == null ? null : i;
      }
      accelerometerUpdate(i) {
        try {
          if (
            !this.delegate.collectBehavioralData() ||
            this.puaseSensorsCollectionIfNoActivity(l._POSignalsUtils.Util.now())
          )
            return;
          const r = this.getDeviceAcceleration(i.accelerationIncludingGravity);
          r &&
            ((this._accX = r.x * this.orientationImplementationFix),
            (this._accY = r.y * this.orientationImplementationFix),
            (this._accZ = r.z),
            this.safeAddSensorSample(
              {
                x: this._accX,
                y: this._accY,
                z: this._accX,
                timestamp: l._POSignalsUtils.Util.now(),
              },
              this._accelerometerList,
            ));
          const a = this.getDeviceAcceleration(i.acceleration);
          (a &&
            ((this._lienarAccX = a.x * this.orientationImplementationFix),
            (this._lienarAccY = a.y * this.orientationImplementationFix),
            (this._lienarAccZ = a.z),
            this.safeAddSensorSample(
              {
                x: this._lienarAccX,
                y: this._lienarAccY,
                z: this._lienarAccZ,
                timestamp: l._POSignalsUtils.Util.now(),
              },
              this._linearAccelerometerList,
            )),
            i.rotationRate &&
              i.rotationRate.alpha != null &&
              i.rotationRate.beta != null &&
              i.rotationRate.gamma != null &&
              ((this._rotX = i.rotationRate.alpha),
              (this._rotY = i.rotationRate.beta),
              (this._rotZ = i.rotationRate.gamma),
              this.safeAddSensorSample(
                {
                  x: this._rotX,
                  y: this._rotY,
                  z: this._rotZ,
                  timestamp: l._POSignalsUtils.Util.now(),
                },
                this._gyroscopeList,
              )));
        } catch (r) {
          l._POSignalsUtils.Logger.warn('error in accelerometer handler', r);
        }
      }
      orientationUpdate(i) {
        try {
          if (
            !this.delegate.collectBehavioralData() ||
            this.puaseSensorsCollectionIfNoActivity(l._POSignalsUtils.Util.now())
          )
            return;
          i.alpha != null &&
            i.beta != null &&
            i.gamma != null &&
            this.safeAddSensorSample(
              { x: i.alpha, y: i.beta, z: i.gamma, timestamp: l._POSignalsUtils.Util.now() },
              this._rotationList,
            );
        } catch (r) {
          l._POSignalsUtils.Logger.warn('error in orientation handler', r);
        }
      }
      safeAddSensorSample(i, r) {
        this.maxSensorSamples > r.length && r.push(i);
      }
    }
    l.Sensors = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      static get instance() {
        return (f._instance || (f._instance = new f()), f._instance);
      }
      constructor() {
        this._pointerParams = new l.PointerParams();
      }
      get pointerParams() {
        return this._pointerParams;
      }
    }
    l.PointerConfig = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    let f;
    (function (i) {
      ((i[(i.Up = 1)] = 'Up'),
        (i[(i.Down = 2)] = 'Down'),
        (i[(i.Left = 3)] = 'Left'),
        (i[(i.Right = 4)] = 'Right'));
    })(f || (f = {}));
    class E {
      get onGesture() {
        return this._onGesture.asEvent();
      }
      get isStarted() {
        return this._isStarted;
      }
      get SCROLL_MIN_DURATION() {
        return 500;
      }
      get SWIPE_MAX_ANGLE() {
        return 45;
      }
      get TAP_MOVEMENT_TRESHOLD() {
        return 10;
      }
      constructor(r, a) {
        ((this.BEHAVIORAL_TYPE = 'gestures'),
          (this._isStarted = !1),
          (this._onGesture = new l.EventDispatcher()),
          (this.touchSnapshotsMap = new Map()),
          (this.snapshotStartTime = new Map()),
          (this.delegate = r),
          (this.sensors = a),
          (this.touchStartHandler = this.touchStart.bind(this)),
          (this.touchMoveHandler = this.touchMove.bind(this)),
          (this.touchEndHandler = this.touchEnd.bind(this)),
          (this.touchCancelHandler = this.touchCancel.bind(this)));
      }
      countEvents(r) {
        const a = { epochTs: Date.now() };
        for (const c of r) a[c.type] = (a[c.type] || 0) + 1;
        return a;
      }
      clearTouchSnapshots(r) {
        (this.touchSnapshotsMap.delete(r), this.snapshotStartTime.delete(r));
      }
      getTouchSnapshots(r) {
        let a;
        return (
          this.touchSnapshotsMap.has(r)
            ? (a = this.touchSnapshotsMap.get(r))
            : ((a = []), this.touchSnapshotsMap.set(r, a)),
          a
        );
      }
      isEmpty() {
        return this.touchSnapshotsMap.size === 0;
      }
      start() {
        this._isStarted ||
          (this.delegate.addEventListener(document, 'touchstart', this.touchStartHandler),
          this.delegate.addEventListener(document, 'touchmove', this.touchMoveHandler),
          this.delegate.addEventListener(document, 'touchend', this.touchEndHandler),
          this.delegate.addEventListener(document, 'touchcancel', this.touchCancelHandler),
          (this._isStarted = !0));
      }
      stop() {
        this._isStarted &&
          (document.removeEventListener('touchstart', this.touchStartHandler),
          document.removeEventListener('touchmove', this.touchMoveHandler),
          document.removeEventListener('touchend', this.touchEndHandler),
          document.removeEventListener('touchcancel', this.touchCancelHandler),
          (this._isStarted = !1));
      }
      touchStart(r) {
        try {
          if (
            !this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE) ||
            l.PointerConfig.instance.pointerParams.eventsToIgnore.has(r.type)
          )
            return;
          (l._POSignalsUtils.Logger.debug('touchstart(' + r.changedTouches.length + ')', r),
            r.changedTouches.length > 0 && this.pushSnapshot(r));
        } catch (a) {
          l._POSignalsUtils.Logger.warn('error in touchStart handler', a);
        }
      }
      touchMove(r) {
        try {
          if (
            !this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE) ||
            l.PointerConfig.instance.pointerParams.eventsToIgnore.has(r.type)
          )
            return;
          (l._POSignalsUtils.Logger.debug('touchmove(' + r.changedTouches.length + ')', r),
            r.changedTouches.length > 0 && this.pushSnapshot(r));
        } catch (a) {
          l._POSignalsUtils.Logger.warn('error in touchMove handler', a);
        }
      }
      touchEnd(r) {
        try {
          if (!this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE)) {
            this._onGesture.dispatch(this, null);
            return;
          }
          if (l.PointerConfig.instance.pointerParams.eventsToIgnore.has(r.type)) return;
          (l._POSignalsUtils.Logger.debug('touchend(' + r.changedTouches.length + ')', r),
            this.gestureEnd(r));
        } catch (a) {
          l._POSignalsUtils.Logger.warn('error in touchEnd handler', a);
        }
      }
      touchCancel(r) {
        try {
          if (!this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE)) {
            this._onGesture.dispatch(this, null);
            return;
          }
          if (l.PointerConfig.instance.pointerParams.eventsToIgnore.has(r.type)) return;
          (l._POSignalsUtils.Logger.debug('touchcancel(' + r.changedTouches.length + ')', r),
            this.gestureEnd(r));
        } catch (a) {
          l._POSignalsUtils.Logger.warn('error in touchCancel handler', a);
        }
      }
      gestureEnd(r) {
        r.changedTouches.length > 0 && this.pushSnapshot(r);
        for (let a = 0; a < r.changedTouches.length; a++) {
          const c = r.changedTouches.item(a),
            t = this.getTouchSnapshots(c.identifier);
          t.length > 0 &&
            (this.isTap(t)
              ? this.dispatchGesture(l.GestureType.Tap, c.identifier)
              : this.dispatchGesture(this.calcGestureType(t), c.identifier));
        }
      }
      calcGestureType(r) {
        let a;
        const c = this.getDirection(r);
        if (this.isFling(r))
          switch (c) {
            case f.Up: {
              a = l.GestureType.FlingUp;
              break;
            }
            case f.Right: {
              a = l.GestureType.FlingRight;
              break;
            }
            case f.Down: {
              a = l.GestureType.FlingDown;
              break;
            }
            case f.Left: {
              a = l.GestureType.FlingLeft;
              break;
            }
          }
        else if (this.isScroll(r))
          switch (c) {
            case f.Up: {
              a = l.GestureType.ScrollUp;
              break;
            }
            case f.Right: {
              a = l.GestureType.ScrollRight;
              break;
            }
            case f.Down: {
              a = l.GestureType.ScrollDown;
              break;
            }
            case f.Left: {
              a = l.GestureType.ScrollLeft;
              break;
            }
          }
        return a;
      }
      pushSnapshot(r) {
        if (r.changedTouches && r.changedTouches.length > 0)
          for (let a = 0; a < r.changedTouches.length; a++) {
            const c = r.changedTouches.item(a),
              t = c.radiusX && c.radiusY ? (c.radiusX + c.radiusY) / 2 : null;
            this.snapshotStartTime.has(c.identifier) ||
              this.snapshotStartTime.set(c.identifier, Date.now());
            const n = this.getTouchSnapshots(c.identifier);
            n.length < l.PointerConfig.instance.pointerParams.maxSnapshotsCount &&
              n.push({
                type: r.type,
                eventTs: r.timeStamp,
                epochTs: Date.now(),
                relativeX: c.screenX,
                relativeY: c.screenY,
                x: c.clientX,
                y: c.clientY,
                pressure: c.force,
                size: t,
                xaccelerometer: this.sensors.accX,
                yaccelerometer: this.sensors.accY,
                zaccelerometer: this.sensors.accZ,
                xlinearaccelerometer: this.sensors.lienarAccX,
                ylinearaccelerometer: this.sensors.lienarAccY,
                zlinearaccelerometer: this.sensors.lienarAccZ,
                xrotation: this.sensors.rotX,
                yrotation: this.sensors.rotY,
                zrotation: this.sensors.rotZ,
                radiusX: c.radiusX,
                radiusY: c.radiusY,
                rotationAngle: c.rotationAngle,
                pageX: c.pageX,
                pageY: c.pageY,
                getX() {
                  return c.screenX;
                },
                getY() {
                  return c.screenY;
                },
              });
          }
      }
      dispatchGesture(r, a) {
        const c = this.touchSnapshotsMap.get(a) || [],
          t = c.filter((n) => n.type === 'touchmove');
        (this._onGesture.dispatch(this, {
          epochTs: this.snapshotStartTime.get(a) || 0,
          counter: this.delegate.gesturesCounter,
          type: r,
          events: c,
          eventCounters: this.countEvents(c),
          duration: this.delegate.getInteractionDuration(c),
          additionalData: this.delegate.additionalData,
          uiControl: void 0,
          timeProximity: l._POSignalsUtils.Util.calculateMeanTimeDeltasBetweenEvents(t),
          meanEuclidean: l._POSignalsUtils.Util.calculateMeanDistanceBetweenPoints(t),
          reduction: {},
          quality: '',
        }),
          this.clearTouchSnapshots(a));
      }
      isTap(r) {
        const a = Math.abs(r[0].x - r[1].x),
          c = Math.abs(r[0].y - r[1].y);
        return r.length == 2 && a < this.TAP_MOVEMENT_TRESHOLD && c < this.TAP_MOVEMENT_TRESHOLD;
      }
      isFling(r) {
        return r.length > 1 && r[r.length - 1].eventTs - r[0].eventTs < this.SCROLL_MIN_DURATION;
      }
      isScroll(r) {
        return r.length > 1 && r[r.length - 1].eventTs - r[0].eventTs > this.SCROLL_MIN_DURATION;
      }
      getDirection(r) {
        const a = this.calcAngle(r[0], r[r.length - 1]);
        return a > 90 - this.SWIPE_MAX_ANGLE && a <= 90 + this.SWIPE_MAX_ANGLE
          ? f.Up
          : a > 180 - this.SWIPE_MAX_ANGLE && a <= 180 + this.SWIPE_MAX_ANGLE
            ? f.Right
            : a > 270 - this.SWIPE_MAX_ANGLE && a <= 270 + this.SWIPE_MAX_ANGLE
              ? f.Down
              : f.Left;
      }
      calcAngle(r, a) {
        return (Math.atan2(a.y - r.y, a.x - r.x) * 180) / Math.PI + 180;
      }
    }
    l.GestureEvents = E;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor(i) {
        ((this.key = i), (this.cache = this.loadFromStorage()));
      }
      loadFromStorage() {
        let i = f.sessionStorage.getItem(this.key);
        return (i || (i = JSON.stringify([])), JSON.parse(i));
      }
      get() {
        return this.cache;
      }
      get length() {
        return this.cache.length;
      }
      push(i) {
        const r = this.cache.push(i);
        return (f.sessionStorage.setItem(this.key, JSON.stringify(this.cache)), r);
      }
      set(i) {
        ((this.cache = i), f.sessionStorage.setItem(this.key, JSON.stringify(this.cache)));
      }
      remove(i) {
        (this.cache.splice(i, 1), f.sessionStorage.setItem(this.key, JSON.stringify(this.cache)));
      }
      concat(i) {
        return this.cache.concat(i);
      }
      clear() {
        ((this.cache = []), f.sessionStorage.removeItem(this.key));
      }
    }
    ((f.sessionStorage = l._POSignalsStorage.SessionStorage.instance.sessionStorage),
      (l.StorageArray = f));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor() {
        ((this.MAX_TAGS = 10),
          (this._tags = new l.StorageArray(l._POSignalsUtils.Constants.CAPTURED_TAGS)));
      }
      static get instance() {
        return (f._instance || (f._instance = new f()), f._instance);
      }
      get tags() {
        return this._tags.get();
      }
      set disableTags(i) {
        this._disableTags = i;
      }
      setTag(i, r) {
        var a;
        if (this._disableTags) return;
        if (!l.PointerConfig.instance.pointerParams.enabled) {
          l._POSignalsUtils.Logger.info("Can't add tag, PingOneSignals SDK is disabled");
          return;
        }
        if (!i) {
          l._POSignalsUtils.Logger.info("Can't add tag, missing name");
          return;
        }
        const c = l.PointerConfig.instance.pointerParams.tagsBlacklistRegex;
        if (c && (i.match(c) || (typeof r == 'string' && r != null && r.match(c)))) {
          l._POSignalsUtils.Logger.info('Tag name or value is blacklisted');
          return;
        }
        if (this._tags.length >= this.MAX_TAGS) return;
        typeof r != 'number'
          ? this._tags.push({
              name: i.trim(),
              value:
                ((a = r == null ? void 0 : r.trim) === null || a === void 0 ? void 0 : a.call(r)) ||
                void 0,
              epochTs: Date.now(),
              timestamp: Date.now(),
            })
          : this._tags.push({
              name: i.trim(),
              value: r,
              epochTs: Date.now(),
              timestamp: Date.now(),
            });
        const t = r ? `${i}:${r}` : i;
        l._POSignalsUtils.Logger.info(`Add tag: ${t}`);
      }
      reset() {
        this._tags.clear();
      }
    }
    l.Tags = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor(i) {
        this.client = i;
      }
      calculateStrategyResult(i, r) {
        return {
          shouldCollect:
            this.client.getBufferSize() < l.PointerConfig.instance.pointerParams.bufferSize,
        };
      }
    }
    l.FirstInteractionsStrategy = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    let f;
    (function (i) {
      ((i[(i.RICH = 3)] = 'RICH'),
        (i[(i.CLICK = 2)] = 'CLICK'),
        (i[(i.MOVE = 1)] = 'MOVE'),
        (i[(i.POOR = 0)] = 'POOR'));
    })(f || (f = {}));
    class E {
      constructor(r) {
        ((this.client = r),
          (this.MAX_INTERACTIONS_PER_TYPE = 7),
          (this.RICH_MOUSE_MOVES_AMOUNT = 8),
          (this.MIN_KEYBOARD_EVENTS = 6),
          (this.MIN_TOUCH_EVENTS = 20));
      }
      isRichMouseInteraction(r) {
        return r.mousemove >= this.RICH_MOUSE_MOVES_AMOUNT && this.isClickInteraction(r);
      }
      isClickInteraction(r) {
        return r.mousedown > 0 && r.mouseup > 0;
      }
      isMoveInteraction(r) {
        return r.mousemove >= this.RICH_MOUSE_MOVES_AMOUNT;
      }
      classifyMouseInteraction(r) {
        const a = l._POSignalsUtils.Util.typesCounter(r.events);
        return this.isRichMouseInteraction(a)
          ? f.RICH
          : this.isClickInteraction(a)
            ? f.CLICK
            : this.isMoveInteraction(a)
              ? f.MOVE
              : f.POOR;
      }
      classifyKeyboardInteraction(r) {
        return r.events.length >= this.MIN_KEYBOARD_EVENTS ? f.RICH : f.POOR;
      }
      classifyTouchInteraction(r) {
        return r.events.length >= this.MIN_TOUCH_EVENTS ? f.RICH : f.POOR;
      }
      handleMouseInteraction(r, a) {
        const t = Date.now(),
          n = this.classifyMouseInteraction(r),
          e = this.getEnumKeyByValue(n);
        if (a.mouse.interactions.length < this.MAX_INTERACTIONS_PER_TYPE)
          return { shouldCollect: !0, quality: e };
        if (n === f.RICH) {
          const x = this.findOldestInteractionWithLowestQuality(a.mouse.interactions);
          if (x !== -1)
            return { shouldCollect: !0, remove: { type: 'mouse', index: x }, quality: e };
        }
        const [o, s] = this.splitInteractionsByTime(a.mouse.interactions, t, 18e4);
        return o.length < 2
          ? this.handleOlderInteractions(s, e)
          : this.handleRecentInteractions(o, s, n, e);
      }
      splitInteractionsByTime(r, a, c) {
        return r.reduce((t, n) => (n.epochTs >= a - c ? t[0].push(n) : t[1].push(n), t), [[], []]);
      }
      handleOlderInteractions(r, a) {
        const c = this.findOldestInteractionWithLowestQuality(r);
        return c !== -1
          ? { shouldCollect: !0, remove: { type: 'mouse', index: c }, quality: a }
          : { shouldCollect: !1, quality: a };
      }
      handleRecentInteractions(r, a, c, t) {
        const n = this.findOldestInteractionWithLowestQuality(r, c);
        if (n !== -1) {
          const e = r[n],
            o = this.client.getBehavioralData().mouse.interactions.indexOf(e),
            s = this.findOldestInteractionWithLowestQuality(
              a,
              f[this.client.getBehavioralData().mouse.interactions[o].quality],
            );
          return s !== -1
            ? { shouldCollect: !0, remove: { type: 'mouse', index: s }, quality: t }
            : { shouldCollect: !0, remove: { type: 'mouse', index: o }, quality: t };
        }
        return { shouldCollect: !1, quality: t };
      }
      handleKeyboardInteraction(r, a) {
        const t = Date.now(),
          n = this.classifyKeyboardInteraction(r),
          e = this.getEnumKeyByValue(n);
        if (a.keyboard.interactions.length < this.MAX_INTERACTIONS_PER_TYPE)
          return { shouldCollect: !0, quality: e };
        if (n === f.RICH) {
          const x = this.findOldestInteractionWithLowestQuality(a.keyboard.interactions);
          if (x !== -1)
            return { shouldCollect: !0, remove: { type: 'keyboard', index: x }, quality: e };
        }
        const [o, s] = this.splitInteractionsByTime(a.keyboard.interactions, t, 18e4);
        return o.length < 2
          ? this.handleOlderInteractions(s, e)
          : this.handleRecentInteractions(o, s, n, e);
      }
      handleTouchInteraction(r, a) {
        const t = Date.now(),
          n = this.classifyTouchInteraction(r),
          e = this.getEnumKeyByValue(n);
        if (a.touch.interactions.length < this.MAX_INTERACTIONS_PER_TYPE)
          return { shouldCollect: !0, quality: e };
        if (n === f.RICH) {
          const x = this.findOldestInteractionWithLowestQuality(a.touch.interactions);
          if (x !== -1)
            return { shouldCollect: !0, remove: { type: 'touch', index: x }, quality: e };
        }
        const [o, s] = this.splitInteractionsByTime(a.touch.interactions, t, 18e4);
        return o.length < 2
          ? this.handleOlderInteractions(s, e)
          : this.handleRecentInteractions(o, s, n, e);
      }
      calculateStrategyResult(r, a) {
        const c = this.client.getBehavioralData();
        switch (a) {
          case 'mouse':
            return this.handleMouseInteraction(r, c);
          case 'keyboard':
            return this.handleKeyboardInteraction(r, c);
          case 'touch':
            return this.handleTouchInteraction(r, c);
          default:
            throw new Error(`Unknown interaction type: ${a}`);
        }
      }
      getEnumKeyByValue(r) {
        return Object.keys(f).find((a) => f[a] === r);
      }
      findOldestInteractionWithLowestQuality(r, a) {
        let c = a != null ? a : f.RICH,
          t = -1,
          n = Number.MAX_SAFE_INTEGER;
        for (let e = 0; e < r.length; e++) {
          const o = f[r[e].quality];
          (o < c || (o === c && r[e].epochTs < n)) && ((c = o), (n = r[e].epochTs), (t = e));
        }
        return t;
      }
    }
    l.PriorityStrategy = E;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    let f;
    (function (i) {
      ((i[(i.FIRST_INTERACTIONS = 0)] = 'FIRST_INTERACTIONS'),
        (i[(i.PRIORITY_INTERACTIONS = 1)] = 'PRIORITY_INTERACTIONS'));
    })((f = l.BufferingStrategyType || (l.BufferingStrategyType = {})));
    class E {
      static createBufferingStrategy(r, a) {
        switch (r) {
          case f.FIRST_INTERACTIONS:
            return new l.FirstInteractionsStrategy(a);
          case f.PRIORITY_INTERACTIONS:
            return new l.PriorityStrategy(a);
        }
      }
    }
    l.StrategyFactory = E;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor(i) {
        ((this.sessionData = i),
          (this.instanceUUID = l._POSignalsUtils.Util.newGuid()),
          (this._isBehavioralDataPaused = !1),
          (this.started = !1),
          (this.initQueue = new l.PromiseQueue(1)));
      }
      static instance() {
        if (!this._instance) {
          const i = l._POSignalsStorage.SessionStorage.instance;
          if (!document.body)
            throw (
              l._POSignalsUtils.Logger.error(
                'PingOne Signals can be started only after DOM Ready!',
              ),
              new Error('PingOne Signals can be started only after DOM Ready!')
            );
          this._instance = new l.Client(i, l.BufferingStrategyType.PRIORITY_INTERACTIONS);
        }
        return this._instance;
      }
      async getData() {
        if (!this.startedPromise) throw new Error('SDK not initialized');
        return (await this.startedPromise, await this.dataHandler.getData(Date.now()));
      }
      addTag(i, r) {
        l.Tags.instance.setTag(i, r);
      }
      async start(i = {}) {
        var r, a, c, t;
        if (
          (((r = i.waitForWindowLoad) !== null && r !== void 0 ? r : !0) &&
            (await this.loadEventPromise()),
          (this.initParams = i),
          this.validateStartParams(i),
          (this.clientVersion = l._POSignalsUtils.Constants.CLIENT_VERSION),
          this.started)
        ) {
          l._POSignalsUtils.Logger.warn('SDK already initialized');
          return;
        }
        ((this.browserInfo = new l._POSignalsUtils.BrowserInfo()),
          (l._POSignalsUtils.Logger.isLogEnabled = !!i.consoleLogEnabled || !!i.devEnv),
          l._POSignalsUtils.Logger.info('Starting Signals SDK...'),
          (l.Tags.instance.disableTags = !!this.initParams.disableTags),
          this.sessionData.setStorageConfig(i));
        const e = l.PointerConfig.instance.pointerParams,
          o = {
            additionalMediaCodecs: e.additionalMediaCodecs,
            browserInfo: this.browserInfo,
            fingerprintTimeoutMillis: e.fingerprintTimeoutMillis,
            metadataBlackList: new Set(e.metadataBlackList.concat(i.deviceAttributesToIgnore)),
            propertyDescriptors: e.propertyDescriptors,
            webRtcUrl: e.webRtcUrl,
            dataPoints: e.metadataDataPoints,
          };
        ((this.localAgentAccessor = new l._POSignalsMetadata.LocalAgentAccessor(
          (a = i.agentPort) !== null && a !== void 0
            ? a
            : l._POSignalsUtils.Constants.PINGID_AGENT_DEFAULT_PORT,
          (c = i.agentTimeout) !== null && c !== void 0
            ? c
            : l._POSignalsUtils.Constants.PINGID_AGENT_DEFAULT_TIMEOUT,
        )),
          (this.metadata = new l._POSignalsMetadata.Metadata(
            this.sessionData,
            o,
            i.externalIdentifiers,
            this.localAgentAccessor,
          )),
          (this.dataHandler = new l.DataHandler(
            this.clientVersion,
            this.instanceUUID,
            this.initParams,
            this.metadata,
            this,
            this.sessionData,
          )),
          (!((t = this.initParams.behavioralDataCollection) !== null && t !== void 0) || t) &&
            this.refreshListening(),
          i.lazyMetadata || (this.metadata.getDeviceAttributes(), this.metadata.getLocalAgentJwt()),
          (this.started = !0));
        try {
          (this.logInit(), this.addStartupTags());
        } catch (s) {
          l._POSignalsUtils.Logger.warn('SDK post init failed', s);
        }
      }
      logInit() {
        var i, r;
        l._POSignalsUtils.Logger.info(
          `PingOne Signals initialized. ${JSON.stringify({ timestamp: new Date().getTime(), sdkVersion: this.clientVersion, instanceUUID: this.instanceUUID, tabUUID: this.sessionData.tabUUID }, null, 2)}`,
        );
        const a = () =>
            l._POSignalsUtils.Logger.info(`Token Ready: ${window._pingOneSignalsToken}`),
          c = () => {
            (l._POSignalsUtils.Logger.info('Signals token fetch is disabled'),
              (window._pingOneSignalsToken = void 0));
          },
          t = 'uninitialized',
          n = 'skipped';
        (((i = window._pingOneSignalsToken) === null || i === void 0
          ? void 0
          : i.substring(0, n.length)) === n
          ? c()
          : ((r = window._pingOneSignalsToken) === null || r === void 0
              ? void 0
              : r.substring(0, t.length)) !== t && a(),
          document.addEventListener('PingOneSignalsTokenReadyEvent', a),
          document.addEventListener('PingOneSignalsTokenSkippedEvent', c));
      }
      get isBehavioralDataPaused() {
        return this._isBehavioralDataPaused;
      }
      getSignalsToken() {
        let i = '';
        if (
          typeof window._pingOneSignalsToken == 'string' &&
          0 <= window._pingOneSignalsToken.indexOf(':')
        ) {
          const r = window._pingOneSignalsToken.match(/t:(.*?)(&|$)/g);
          r && 0 < r.length && (i = r[0].replace(/&s*$/, '').replace(/t:/, ''));
        } else typeof window._pingOneSignalsToken == 'string' && (i = window._pingOneSignalsToken);
        return i;
      }
      pauseBehavioralData() {
        this._isBehavioralDataPaused ||
          ((this._isBehavioralDataPaused = !0), this.addTag('SDK paused behaviorally'));
      }
      resumeBehavioralData() {
        this._isBehavioralDataPaused &&
          ((this._isBehavioralDataPaused = !1), this.addTag('SDK resumed behaviorally'));
      }
      async startSignals(i) {
        try {
          return (
            (this.startedPromise = this.initQueue.add(() => this.start(i))),
            await this.startedPromise
          );
        } catch (r) {
          const a = {
            id: l._POSignalsUtils.POErrorCodes.INITIALIZATION_ERROR,
            message: r.message,
            code: 'SDK initialization failed.',
          };
          throw new Error(JSON.stringify(a));
        }
      }
      validateStartParams(i) {
        if (!document.body)
          throw (
            l._POSignalsUtils.Logger.error('PingOne Signals can be started only after DOM Ready!'),
            new Error('PingOne Signals can be started only after DOM Ready!')
          );
        i.externalIdentifiers = i.externalIdentifiers || {};
      }
      async loadEventPromise() {
        return new Promise((i) => {
          document.readyState === 'complete'
            ? i()
            : window.addEventListener('load', (r) => {
                i();
              });
        });
      }
      addStartupTags() {
        (this.addTag('SDK started'),
          document.referrer && this.addTag('referrer', document.referrer),
          this.addTag('location', window.location.href));
      }
    }
    l.ClientBase = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor(i) {
        ((this.BEHAVIORAL_TYPE = 'indirect'),
          (this._isStarted = !1),
          (this._onClipboardEvent = new l.EventDispatcher()),
          (this.delegate = i),
          (this.onClipboardEventHandler = this.onEvent.bind(this)));
      }
      get isStarted() {
        return this._isStarted;
      }
      get onClipboardEvent() {
        return this._onClipboardEvent.asEvent();
      }
      onEvent(i) {
        try {
          if (!this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE)) return;
          this._onClipboardEvent.dispatch(this, this.createClipboardEvent(i));
        } catch (r) {
          l._POSignalsUtils.Logger.warn('error in clipboard handler', r);
        }
      }
      createClipboardEvent(i) {
        const r = l._POSignalsUtils.Util.getSrcElement(i);
        return {
          category: 'ClipboardEvent',
          type: i.type,
          eventTs: i.timeStamp,
          epochTs: new Date().getTime(),
          additionalData: {
            locationHref: location.href,
            stId: this.delegate.getElementsStID(r),
            elementId: r == null ? void 0 : r.id,
          },
        };
      }
      start() {
        this._isStarted ||
          ((this._isStarted = !0),
          this.delegate.addEventListener(document, 'cut', this.onClipboardEventHandler),
          this.delegate.addEventListener(document, 'copy', this.onClipboardEventHandler),
          this.delegate.addEventListener(document, 'paste', this.onClipboardEventHandler));
      }
      stop() {
        this._isStarted &&
          ((this._isStarted = !1),
          document.removeEventListener('cut', this.onClipboardEventHandler),
          document.removeEventListener('copy', this.onClipboardEventHandler),
          document.removeEventListener('paste', this.onClipboardEventHandler));
      }
    }
    l.ClipboardEvents = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor(i) {
        ((this.BEHAVIORAL_TYPE = 'indirect'),
          (this._isStarted = !1),
          (this._onDragEvent = new l.EventDispatcher()),
          (this.delegate = i),
          (this.onDragEventHandler = this.onEvent.bind(this)));
      }
      get isStarted() {
        return this._isStarted;
      }
      get onDragEvent() {
        return this._onDragEvent.asEvent();
      }
      createDragEvent(i) {
        return {
          category: 'DragEvent',
          type: i.type,
          eventTs: i.timeStamp,
          epochTs: new Date().getTime(),
          additionalData: { locationHref: location.href },
        };
      }
      onEvent(i) {
        try {
          if (!this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE)) return;
          this._onDragEvent.dispatch(this, this.createDragEvent(i));
        } catch (r) {
          l._POSignalsUtils.Logger.warn('error in drag handler', r);
        }
      }
      start() {
        this._isStarted ||
          ((this._isStarted = !0),
          this.delegate.addEventListener(document, 'dragstart', this.onDragEventHandler),
          this.delegate.addEventListener(document, 'dragexit', this.onDragEventHandler),
          this.delegate.addEventListener(document, 'drop', this.onDragEventHandler),
          this.delegate.addEventListener(document, 'dragend', this.onDragEventHandler));
      }
      stop() {
        this._isStarted &&
          ((this._isStarted = !1),
          document.removeEventListener('dragstart', this.onDragEventHandler),
          document.removeEventListener('dragexit', this.onDragEventHandler),
          document.removeEventListener('drop', this.onDragEventHandler),
          document.removeEventListener('dragend', this.onDragEventHandler));
      }
    }
    l.DragEvents = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor(i) {
        ((this.BEHAVIORAL_TYPE = 'indirect'),
          (this._isStarted = !1),
          (this._onFocusEvent = new l.EventDispatcher()),
          (this.delegate = i),
          (this.onFocusEventHandler = this.onEvent.bind(this)));
      }
      get isStarted() {
        return this._isStarted;
      }
      get onFocusEvent() {
        return this._onFocusEvent.asEvent();
      }
      getRelatedTarget(i) {
        if (!i.relatedTarget) return { type: '', stId: '', elementId: '' };
        const r = {
          type: l._POSignalsUtils.Util.getObjectType(i.relatedTarget),
          stId: '',
          elementId: '',
        };
        i.relatedTarget.id && (r.elementId = i.relatedTarget.id);
        try {
          const a = i.relatedTarget;
          r.stId = this.delegate.getElementsStID(a);
        } catch {}
        return r;
      }
      createFocusEvent(i) {
        const r = l._POSignalsUtils.Util.getSrcElement(i),
          a = this.getRelatedTarget(i);
        return {
          category: 'FocusEvent',
          type: i.type,
          eventTs: i.timeStamp,
          epochTs: new Date().getTime(),
          additionalData: {
            locationHref: location.href,
            stId: this.delegate.getElementsStID(r),
            elementId: r ? r.id : '',
            relatedTarget: a,
          },
        };
      }
      onEvent(i) {
        try {
          if (!this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE)) return;
          this._onFocusEvent.dispatch(this, this.createFocusEvent(i));
        } catch (r) {
          l._POSignalsUtils.Logger.warn('error in focus handler', r);
        }
      }
      start() {
        this._isStarted ||
          ((this._isStarted = !0),
          this.delegate.addEventListener(document, 'DOMFocusIn', this.onFocusEventHandler),
          this.delegate.addEventListener(document, 'DOMFocusOut', this.onFocusEventHandler),
          this.delegate.addEventListener(document, 'focus', this.onFocusEventHandler),
          this.delegate.addEventListener(document, 'focusin', this.onFocusEventHandler),
          this.delegate.addEventListener(document, 'focusout', this.onFocusEventHandler));
      }
      stop() {
        this._isStarted &&
          ((this._isStarted = !1),
          document.removeEventListener('DOMFocusIn', this.onFocusEventHandler),
          document.removeEventListener('DOMFocusOut', this.onFocusEventHandler),
          document.removeEventListener('focus', this.onFocusEventHandler),
          document.removeEventListener('focusin', this.onFocusEventHandler),
          document.removeEventListener('focusout', this.onFocusEventHandler));
      }
    }
    l.FocusEvents = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor(i) {
        ((this.BEHAVIORAL_TYPE = 'indirect'),
          (this._isStarted = !1),
          (this._onUIEvent = new l.EventDispatcher()),
          (this.delegate = i),
          (this.onUIEventHandler = this.onEvent.bind(this)));
      }
      get isStarted() {
        return this._isStarted;
      }
      get onUIEvent() {
        return this._onUIEvent.asEvent();
      }
      createUIEvent(i) {
        return {
          category: 'UIEvent',
          type: i.type,
          eventTs: i.timeStamp,
          epochTs: new Date().getTime(),
          additionalData: { locationHref: location.href },
        };
      }
      onEvent(i) {
        try {
          if (!this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE)) return;
          this._onUIEvent.dispatch(this, this.createUIEvent(i));
        } catch (r) {
          l._POSignalsUtils.Logger.warn('error in UIEvent handler', r);
        }
      }
      start() {
        this._isStarted ||
          ((this._isStarted = !0),
          this.delegate.addEventListener(document, 'resize', this.onUIEventHandler),
          this.delegate.addEventListener(document, 'scroll', this.onUIEventHandler),
          this.delegate.addEventListener(document, 'select', this.onUIEventHandler));
      }
      stop() {
        this._isStarted &&
          ((this._isStarted = !1),
          document.removeEventListener('resize', this.onUIEventHandler),
          document.removeEventListener('scroll', this.onUIEventHandler),
          document.removeEventListener('select', this.onUIEventHandler));
      }
    }
    l.UIEvents = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor(i) {
        ((this.BEHAVIORAL_TYPE = 'indirect'),
          (this.visibilityChangeEventName = 'visibilitychange'),
          (this.hiddenProperty = 'hidden'),
          (this._isStarted = !1),
          (this._onGeneralEvent = new l.EventDispatcher()),
          (this.delegate = i),
          (this.onGeneralEventHandler = this.onEvent.bind(this)),
          (this.onLangChangeHandler = this.onLangChangeEvent.bind(this)),
          (this.onOrientationChangeHandler = this.onOrientationChangeEvent.bind(this)),
          (this.onVisibilityChangeHandler = this.onVisibilityChangeEvent.bind(this)),
          typeof document.msHidden != 'undefined'
            ? ((this.hiddenProperty = 'msHidden'),
              (this.visibilityChangeEventName = 'msvisibilitychange'))
            : typeof document.webkitHidden != 'undefined' &&
              ((this.hiddenProperty = 'webkitHidden'),
              (this.visibilityChangeEventName = 'webkitvisibilitychange')));
      }
      get isStarted() {
        return this._isStarted;
      }
      get onGeneralEvent() {
        return this._onGeneralEvent.asEvent();
      }
      onEvent(i) {
        try {
          if (!this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE)) return;
          this._onGeneralEvent.dispatch(this, this.createGeneralEvent(i));
        } catch (r) {
          l._POSignalsUtils.Logger.warn('error in general event handler', r);
        }
      }
      onLangChangeEvent(i) {
        try {
          if (!this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE)) return;
          const r = this.createGeneralEvent(i);
          this._onGeneralEvent.dispatch(this, r);
        } catch (r) {
          l._POSignalsUtils.Logger.warn('error in LangChange event handler', r);
        }
      }
      onOrientationChangeEvent(i) {
        try {
          if (!this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE)) return;
          const r = this.createGeneralEvent(i),
            a = l._POSignalsUtils.Util.getDeviceOrientation();
          ((r.additionalData.deviceOrientation = a.orientation),
            (r.additionalData.deviceAngle = a.angle),
            this._onGeneralEvent.dispatch(this, r));
        } catch (r) {
          l._POSignalsUtils.Logger.warn('error in OrientationChange event handler', r);
        }
      }
      onVisibilityChangeEvent(i) {
        try {
          if (!this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE)) return;
          const r = this.createGeneralEvent(i);
          ((r.additionalData.hidden = !!document[this.hiddenProperty]),
            document.visibilityState &&
              (r.additionalData.visibilityState = document.visibilityState.toString()),
            this._onGeneralEvent.dispatch(this, r));
        } catch (r) {
          l._POSignalsUtils.Logger.warn('error in VisibilityChange event handler', r);
        }
      }
      createGeneralEvent(i) {
        return {
          category: 'Event',
          type: i.type,
          eventTs: i.timeStamp,
          epochTs: new Date().getTime(),
          additionalData: { locationHref: location.href },
        };
      }
      start() {
        this._isStarted ||
          ((this._isStarted = !0),
          this.delegate.addEventListener(
            document,
            this.visibilityChangeEventName,
            this.onVisibilityChangeHandler,
          ),
          this.delegate.addEventListener(document, 'change', this.onGeneralEventHandler),
          this.delegate.addEventListener(document, 'fullscreenchange', this.onGeneralEventHandler),
          this.delegate.addEventListener(document, 'invalid', this.onGeneralEventHandler),
          this.delegate.addEventListener(window, 'languagechange', this.onLangChangeHandler),
          this.delegate.addEventListener(
            window,
            'orientationchange',
            this.onOrientationChangeHandler,
          ),
          this.delegate.addEventListener(document, 'seeked', this.onGeneralEventHandler),
          this.delegate.addEventListener(document, 'seeking', this.onGeneralEventHandler),
          this.delegate.addEventListener(document, 'selectstart', this.onGeneralEventHandler),
          this.delegate.addEventListener(document, 'selectionchange', this.onGeneralEventHandler),
          this.delegate.addEventListener(document, 'submit', this.onGeneralEventHandler),
          this.delegate.addEventListener(document, 'volumechange', this.onGeneralEventHandler),
          this.delegate.addEventListener(document, 'reset', this.onGeneralEventHandler),
          this.delegate.addEventListener(document, 'textInput', this.onGeneralEventHandler));
      }
      stop() {
        this._isStarted &&
          ((this._isStarted = !1),
          document.removeEventListener(
            this.visibilityChangeEventName,
            this.onVisibilityChangeHandler,
          ),
          document.removeEventListener('change', this.onGeneralEventHandler),
          document.removeEventListener('fullscreenchange', this.onGeneralEventHandler),
          document.removeEventListener('invalid', this.onGeneralEventHandler),
          window.removeEventListener('languagechange', this.onLangChangeHandler),
          window.removeEventListener('orientationchange', this.onOrientationChangeHandler),
          document.removeEventListener('seeked', this.onGeneralEventHandler),
          document.removeEventListener('seeking', this.onGeneralEventHandler),
          document.removeEventListener('selectstart', this.onGeneralEventHandler),
          document.removeEventListener('selectionchange', this.onGeneralEventHandler),
          document.removeEventListener('submit', this.onGeneralEventHandler),
          document.removeEventListener('volumechange', this.onGeneralEventHandler),
          document.removeEventListener('reset', this.onGeneralEventHandler),
          document.removeEventListener('textInput', this.onGeneralEventHandler));
      }
    }
    l.GeneralEvents = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor(i) {
        ((this.DEFAULT_INDIRECT_IDLE_INTERVAL = 1e3),
          (this.MAX_INDIRECT_EVENTS = 25),
          (this._onIndirect = new l.EventDispatcher()),
          (this.indirectEvents = []),
          (this.idleTimeInMillis = this.DEFAULT_INDIRECT_IDLE_INTERVAL),
          (this.lastIndirectEventTimestamp = 0),
          (this._isStarted = !1),
          (this.clipboardEvents = new l.ClipboardEvents(i)),
          this.clipboardEvents.onClipboardEvent.subscribe(this.handleEvent.bind(this)),
          (this.dragEvents = new l.DragEvents(i)),
          this.dragEvents.onDragEvent.subscribe(this.handleEvent.bind(this)),
          (this.focusEvents = new l.FocusEvents(i)),
          this.focusEvents.onFocusEvent.subscribe(this.handleEvent.bind(this)),
          (this.uiEvents = new l.UIEvents(i)),
          this.uiEvents.onUIEvent.subscribe(this.handleEvent.bind(this)),
          (this.generalEvents = new l.GeneralEvents(i)),
          this.generalEvents.onGeneralEvent.subscribe(this.handleEvent.bind(this)),
          (this.onTimeElapsedHandler = this.onTimeElapsed.bind(this)));
      }
      get onIndirect() {
        return this._onIndirect.asEvent();
      }
      async onTimeElapsed() {
        this.indirectEvents.length > 0 &&
          new Date().getTime() - this.lastIndirectEventTimestamp >= this.idleTimeInMillis &&
          this.dispatch();
      }
      handleEvent(i, r) {
        ((this.lastIndirectEventTimestamp = new Date().getTime()), this.pushEvent(r));
      }
      pushEvent(i) {
        (this.indirectEvents.push(i),
          this.indirectEvents.length >= this.MAX_INDIRECT_EVENTS && this.dispatch());
      }
      clearBuffer() {
        const i = { events: this.indirectEvents };
        return ((this.indirectEvents = []), i);
      }
      dispatch() {
        try {
          (clearInterval(this.updateIntervalHandle),
            this._onIndirect.dispatch(this, this.clearBuffer()),
            (this.updateIntervalHandle = setInterval(
              this.onTimeElapsedHandler,
              l.PointerConfig.instance.pointerParams.indirectIntervalMillis,
            )));
        } catch (i) {
          l._POSignalsUtils.Logger.warn('Failed to dispatch indirect events', i);
        }
      }
      get isStarted() {
        return this._isStarted;
      }
      start() {
        this._isStarted ||
          ((this.updateIntervalHandle = setInterval(
            this.onTimeElapsedHandler,
            l.PointerConfig.instance.pointerParams.indirectIntervalMillis,
          )),
          this.clipboardEvents.start(),
          this.dragEvents.start(),
          this.focusEvents.start(),
          this.uiEvents.start(),
          this.generalEvents.start(),
          (this._isStarted = !0));
      }
      stop() {
        this._isStarted &&
          (this.clipboardEvents.stop(),
          this.dragEvents.stop(),
          this.focusEvents.stop(),
          this.uiEvents.stop(),
          this.generalEvents.stop(),
          clearInterval(this.updateIntervalHandle),
          (this.updateIntervalHandle = null),
          (this._isStarted = !1));
      }
      unsubscribe() {
        (this.clipboardEvents.onClipboardEvent.unsubscribe(this.handleEvent.bind(this)),
          this.dragEvents.onDragEvent.unsubscribe(this.handleEvent.bind(this)),
          this.focusEvents.onFocusEvent.unsubscribe(this.handleEvent.bind(this)),
          this.uiEvents.onUIEvent.unsubscribe(this.handleEvent.bind(this)),
          this.generalEvents.onGeneralEvent.unsubscribe(this.handleEvent.bind(this)));
      }
    }
    l.IndirectClient = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor() {
        ((this.config = {}), (this._cacheHash = 0), (this.cache = new Map()));
      }
      refreshCssSelectors(i) {
        try {
          if (!i) return;
          const r = l._POSignalsUtils.Util.hashCode(JSON.stringify(i));
          if (this._cacheHash === r) return;
          ((this.config = i), (this._cacheHash = r), (this.cache = new Map()));
        } catch (r) {
          l._POSignalsUtils.Logger.warn('Failed to set css selectors', r);
        }
      }
      getIdentification(i, r) {
        if (this.cache.get(i) === null) return null;
        if (this.cache.get(i) !== void 0) return this.cache.get(i);
        for (const a in this.config)
          try {
            if (!this.config.hasOwnProperty(a)) continue;
            let c = this.config[a] || [];
            l._POSignalsUtils.Util.isArray(c) || (c = [].concat(c));
            for (const t of c)
              if (l._POSignalsUtils.Util.isSelectorMatches(i, t, r))
                return (this.cache.set(i, a), a);
          } catch (c) {
            l._POSignalsUtils.Logger.warn(`Failed to find selector for ${a}`, c);
          }
        return (this.cache.set(i, null), null);
      }
      get cacheHash() {
        return this._cacheHash;
      }
    }
    l.ElementsIdentifications = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    const f = 'keydown',
      E = 'keyup',
      i = 'blur',
      r = 'focus';
    class c {
      get isStarted() {
        return this._isStarted;
      }
      get onInteraction() {
        return this._onInteraction.asEvent();
      }
      get onEnterPress() {
        return this._onEnterPress.asEvent();
      }
      get onObfuscatedValue() {
        return this._onObfuscatedValue.asEvent();
      }
      refreshKeyboardCssSelectors(n) {
        this._fieldsIdentifications.refreshCssSelectors(n);
      }
      get modifiersKeys() {
        return [
          'Alt',
          'AltGraph',
          'CapsLock',
          'Control',
          'Fn',
          'FnLock',
          'Hyper',
          'Meta',
          'NumLock',
          'OS',
          'ScrollLock',
          'Shift',
          'Super',
          'Symbol',
          'SymbolLock',
        ];
      }
      get specialKeys() {
        return [
          'Tab',
          'Shift',
          'Backspace',
          'Enter',
          'CapsLock',
          'Meta',
          'Delete',
          'Alt',
          'ArrowDown',
          'ArrowUp',
          'Control',
          'ArrowLeft',
          'End',
          'Unidentified',
          'Home',
          'ArrowRight',
          'Insert',
          'Pause',
          'PageDown',
          'PageUp',
          'F1',
          'F2',
          'F3',
          'F4',
          'F5',
          'F6',
          'F7',
          'F8',
          'F9',
          'F10',
          'F11',
          'F12',
          'AltGraph',
          'Escape',
        ];
      }
      constructor(n, e) {
        ((this.BEHAVIORAL_TYPE = 'eventKeyboard'),
          (this._isStarted = !1),
          (this._onInteraction = new l.EventDispatcher()),
          (this._onEnterPress = new l.EventDispatcher()),
          (this._onObfuscatedValue = new l.EventDispatcher()),
          (this.interactionsMap = new Map()),
          (this._fieldsIdentifications = new l.ElementsIdentifications()),
          (this.keyStrokeMap = new Map()),
          (this.delegate = n),
          (this.uiControlManager = e),
          (this.onKeyDownHandle = this.onKeyDown.bind(this)),
          (this.onKeyUpHandle = this.onKeyUp.bind(this)),
          (this.onFocusHandle = this.onFocus.bind(this)),
          (this.onBlurHandle = this.onBlur.bind(this)));
      }
      countEvent(n, e) {
        e && (e.eventCounters[n] = (e.eventCounters[n] || 0) + 1);
      }
      clearBuffer() {
        const n = l._POSignalsUtils.Util.getValuesOfMap(this.interactionsMap);
        return (this.interactionsMap.clear(), n);
      }
      start() {
        this._isStarted
          ? l._POSignalsUtils.Logger.debug('Desktop Keyboard events already listening')
          : (this.delegate.addEventListener(document, f, this.onKeyDownHandle),
            this.delegate.addEventListener(document, E, this.onKeyUpHandle),
            this.delegate.addEventListener(document, r, this.onFocusHandle, !0),
            this.delegate.addEventListener(document, i, this.onBlurHandle, !0),
            (this._isStarted = !0),
            l._POSignalsUtils.Logger.debug('Desktop Keyboard events start listening...'));
      }
      stop() {
        this._isStarted
          ? (document.removeEventListener(f, this.onKeyDownHandle),
            document.removeEventListener(E, this.onKeyUpHandle),
            document.removeEventListener(r, this.onFocusHandle, !0),
            document.removeEventListener(i, this.onBlurHandle, !0),
            (this._isStarted = !1),
            l._POSignalsUtils.Logger.debug('Desktop Keyboard events stop listening...'))
          : l._POSignalsUtils.Logger.debug('Desktop Keyboard events already stopped');
      }
      getInteractionFromElement(n) {
        var e;
        let o = null,
          s = null;
        const x = l._POSignalsUtils.Util.getSrcElement(n);
        if (
          x &&
          x instanceof HTMLInputElement &&
          !l._POSignalsUtils.Util.isClickableInput(x) &&
          l._POSignalsUtils.Util.isFunction(x.getAttribute) &&
          !(!((e = x.hasAttribute) === null || e === void 0) && e.call(x, 'data-st-ignore')) &&
          !l._POSignalsUtils.Util.anySelectorMatches(
            x,
            l.PointerConfig.instance.pointerParams.keyboardCssSelectorsBlacklist,
            0,
          )
        ) {
          s = this.delegate.getElementsStID(x);
          const m = l.PointerConfig.instance.pointerParams.keyboardIdentifierAttributes;
          for (let p = 0; p < m.length && !s; p++) s = x.getAttribute(m[p]);
          s &&
            !l.PointerConfig.instance.pointerParams.keyboardFieldBlackList.has(s) &&
            ((o = this.interactionsMap.get(x)),
            o ||
              ((o = {
                epochTs: Date.now(),
                stId: s,
                elementId: l._POSignalsUtils.Util.getAttribute(x, 'id'),
                name: l._POSignalsUtils.Util.getAttribute(x, 'name'),
                type: l._POSignalsUtils.Util.getAttribute(x, 'type'),
                events: [],
                counter: this.delegate.keyboardCounter,
                eventCounters: { epochTs: Date.now() },
                duration: 0,
                numOfDeletions: 0,
                additionalData: this.delegate.additionalData,
                quality: '',
              }),
              this.interactionsMap.set(x, o)));
        }
        return o;
      }
      getKeyCode(n) {
        return n.keyCode
          ? n.keyCode
          : n.which
            ? n.which
            : n.code
              ? l._POSignalsUtils.Util.hashCode(n.code)
              : l._POSignalsUtils.Util.hashCode(n.key) + (n.location || 0);
      }
      getKeyboardEvent(n) {
        return n || window.event;
      }
      getKeystrokeId(n, e) {
        const o = this.getKeyCode(n);
        let s;
        return (
          e === E &&
            (this.keyStrokeMap.has(o)
              ? ((s = this.keyStrokeMap.get(o)), this.keyStrokeMap.delete(o))
              : (s = l._POSignalsUtils.Util.newGuid())),
          e === f &&
            (this.keyStrokeMap.has(o) && n.repeat
              ? (s = this.keyStrokeMap.get(o))
              : ((s = l._POSignalsUtils.Util.newGuid()), this.keyStrokeMap.set(o, s))),
          s
        );
      }
      createKeyboardInteractionEvent(n, e) {
        const o = l._POSignalsUtils.Util.getSrcElement(e),
          s = o.value ? o.value.toString().length : 0;
        return {
          type: n,
          eventTs: e.timeStamp,
          epochTs: Date.now(),
          selectionStart: l._POSignalsUtils.Util.getElementSelectionStart(o),
          selectionEnd: l._POSignalsUtils.Util.getElementSelectionEnd(o),
          key: e.key,
          keystrokeId: null,
          currentLength: s,
        };
      }
      enrichKeyboardEvent(n, e) {
        ((this.modifiersKeys.indexOf(n.key) >= 0 || this.specialKeys.indexOf(n.key) >= 0) &&
          (e.key = n.key),
          (e.keystrokeId = this.getKeystrokeId(n, e.type)));
        const o = l._POSignalsUtils.Util.getSrcElement(n);
        e.currentLength = String(o.value).length;
      }
      onFocus(n) {
        var e, o;
        try {
          if (!this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE)) {
            this._onInteraction.dispatch(this, null);
            return;
          }
          n = this.getKeyboardEvent(n);
          const s = this.getInteractionFromElement(n);
          if (
            (this.countEvent(n.type, s),
            l.PointerConfig.instance.pointerParams.eventsToIgnore.has(n.type))
          )
            return;
          if (s) {
            const x = this.createKeyboardInteractionEvent(r, n);
            s.events.push(x);
            const m = this.uiControlManager.createUIControlData(n);
            m &&
              ((s.uiControl = { uiElement: m.uiElement, enrichedData: m.enrichedData }),
              ((o = (e = m.uiElement) === null || e === void 0 ? void 0 : e.id) === null ||
              o === void 0
                ? void 0
                : o.length) > 0 &&
                l._POSignalsUtils.Logger.info(`Typing in element with id '${m.uiElement.id}'`));
          }
        } catch (s) {
          l._POSignalsUtils.Logger.warn('error in keyboard focus handler', s);
        }
      }
      onKeyUp(n) {
        try {
          if (
            ((n = this.getKeyboardEvent(n)),
            (n.keyCode === 13 || n.which === 13) &&
              this._onEnterPress.dispatch(this, l._POSignalsUtils.Util.getSrcElement(n)),
            !this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE))
          ) {
            this._onInteraction.dispatch(this, null);
            return;
          }
          const e = this.getInteractionFromElement(n);
          if (
            (this.countEvent(n.type, e),
            l.PointerConfig.instance.pointerParams.eventsToIgnore.has(n.type))
          )
            return;
          if (e) {
            const o = this.createKeyboardInteractionEvent(E, n);
            (this.enrichKeyboardEvent(n, o), e.events.push(o));
          } else this.keyStrokeMap.delete(this.getKeyCode(n));
        } catch (e) {
          l._POSignalsUtils.Logger.warn('error in keyUp handler', e);
        }
      }
      isEmpty() {
        return this.interactionsMap.size === 0;
      }
      onKeyDown(n) {
        try {
          if (!this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE)) {
            this._onInteraction.dispatch(this, null);
            return;
          }
          n = this.getKeyboardEvent(n);
          const e = this.getInteractionFromElement(n);
          if (
            (this.countEvent(n.type, e),
            l.PointerConfig.instance.pointerParams.eventsToIgnore.has(n.type))
          )
            return;
          if (e) {
            const o = this.createKeyboardInteractionEvent(f, n);
            (this.enrichKeyboardEvent(n, o), e.events.push(o));
          }
        } catch (e) {
          l._POSignalsUtils.Logger.warn('error in keyDown handler', e);
        }
      }
      onBlur(n) {
        try {
          n = this.getKeyboardEvent(n);
          const e = this.getInteractionFromElement(n);
          if (!this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE)) {
            this._onInteraction.dispatch(this, null);
            return;
          }
          if (
            (this.countEvent(n.type, e),
            l.PointerConfig.instance.pointerParams.eventsToIgnore.has(n.type))
          )
            return;
          if (e) {
            const o = this.createKeyboardInteractionEvent(i, n);
            (e.events.push(o),
              (e.duration = this.delegate.getInteractionDuration(e.events)),
              (e.numOfDeletions = this.calculateNumOfDeletions(e.events)));
            const s = l._POSignalsUtils.Util.getSrcElement(n);
            (this.interactionsMap.delete(s), this._onInteraction.dispatch(this, e));
          }
        } catch (e) {
          l._POSignalsUtils.Logger.warn('error in blur handler', e);
        }
      }
      calculateNumOfDeletions(n) {
        if (!(n != null && n[0])) return 0;
        let e = 0,
          o = n[0].currentLength;
        for (let s = 1; s < n.length; s++)
          (n[s].currentLength < o && e++, (o = n[s].currentLength));
        return e;
      }
      get fieldsIdentifications() {
        return this._fieldsIdentifications;
      }
    }
    l.Keyboard = c;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor(i, r) {
        var a;
        const c = l.PointerConfig.instance.pointerParams.uiModelingElementFilters,
          t = l._POSignalsUtils.Util.getAttribute,
          n = (a = i.getBoundingClientRect) === null || a === void 0 ? void 0 : a.call(i);
        ((this._htmlElement = i),
          (this._data = {
            location: this.getUIElementAttribute(c.location, () => window.location.href),
            id: this.getUIElementAttribute(c.id, () => t(i, 'id')),
            aria_label: this.getUIElementAttribute(c.aria_label, () => t(i, 'aria-label')),
            data_st_field: this.getUIElementAttribute(c.data_st_field, () => r.getElementsStID(i)),
            data_st_tag: this.getUIElementAttribute(c.data_st_tag, () => t(i, 'data-st-tag')),
            data_selenium: this.getUIElementAttribute(c.data_selenium, () => t(i, 'data-selenium')),
            data_selenium_id: this.getUIElementAttribute(c.data_selenium_id, () =>
              t(i, 'data-selenium-id'),
            ),
            data_testid: this.getUIElementAttribute(c.data_testid, () => t(i, 'data-testid')),
            data_test_id: this.getUIElementAttribute(c.data_test_id, () => t(i, 'data-test-id')),
            data_qa_id: this.getUIElementAttribute(c.data_qa_id, () => t(i, 'data-qa-id')),
            data_id: this.getUIElementAttribute(c.data_id, () => t(i, 'data-id')),
            name: this.getUIElementAttribute(c.name, () => t(i, 'name')),
            placeholder: this.getUIElementAttribute(c.placeholder, () => t(i, 'placeholder')),
            role: this.getUIElementAttribute(c.role, () => t(i, 'role')),
            type: this.getUIElementAttribute(c.type, () => t(i, 'type')),
            nodeTypeInt: this.getUIElementAttribute(c.nodeTypeInt, () => i.nodeType),
            nodeName: this.getUIElementAttribute(c.nodeName, () => i.nodeName),
            cursorType: this.getUIElementAttribute(
              c.cursorType,
              () => window.getComputedStyle(i).cursor,
            ),
            text: this.getUIElementAttribute(c.text, () => this.getElementText(i)),
            textLength: this.getUIElementAttribute(c.textLength, () => {
              var e;
              return (
                ((e = this.getElementText(i)) === null || e === void 0 ? void 0 : e.length) || null
              );
            }),
            bottom: this.getUIElementAttribute(c.bottom, () => (n == null ? void 0 : n.bottom)),
            height: this.getUIElementAttribute(c.height, () => (n == null ? void 0 : n.height)),
            left: this.getUIElementAttribute(c.left, () => (n == null ? void 0 : n.left)),
            right: this.getUIElementAttribute(c.right, () => (n == null ? void 0 : n.right)),
            top: this.getUIElementAttribute(c.top, () => (n == null ? void 0 : n.top)),
            width: this.getUIElementAttribute(c.width, () => (n == null ? void 0 : n.width)),
            x: this.getUIElementAttribute(c.x, () => (n == null ? void 0 : n.x)),
            y: this.getUIElementAttribute(c.y, () => (n == null ? void 0 : n.y)),
          }),
          (this._data.elementId = this.getStrongestElementID()));
      }
      get data() {
        return l._POSignalsUtils.Util.filterReduce(this._data, (i) => i != null && i !== '');
      }
      get htmlElement() {
        return this._htmlElement;
      }
      getUIElementAttribute(i, r) {
        var a;
        try {
          if (!((a = i == null ? void 0 : i.enabled) !== null && a !== void 0) || a) {
            let c = r();
            return (
              typeof c == 'string' &&
                (typeof (i == null ? void 0 : i.maxLength) == 'number' &&
                  c.length > i.maxLength &&
                  (c = c.substring(0, i.maxLength)),
                i != null && i.filterRegex && (c = c.replace(new RegExp(i.filterRegex, 'g'), '*'))),
              c
            );
          }
        } catch (c) {
          l._POSignalsUtils.Logger.warn('Failed to add ui element attribute', c);
        }
        return null;
      }
      getStrongestElementID() {
        return (
          this._data.data_st_field ||
          this._data.data_selenium_id ||
          this._data.data_selenium ||
          this._data.data_testid ||
          this._data.data_test_id ||
          this._data.data_qa_id ||
          this._data.data_id ||
          this._data.id ||
          ''
        );
      }
      getElementText(i) {
        return i instanceof HTMLInputElement && !l._POSignalsUtils.Util.isClickableInput(i)
          ? null
          : l._POSignalsUtils.Util.getElementText(i);
      }
      equals(i) {
        return !(
          !i ||
          (i.location && location.href.indexOf(i.location) < 0) ||
          (i.elementId && i.elementId !== this._data.elementId) ||
          (i.id && i.id !== this._data.id) ||
          (i.aria_label && i.aria_label !== this._data.aria_label) ||
          (i.data_st_field && i.data_st_field !== this._data.data_st_field) ||
          (i.data_st_tag && i.data_st_tag !== this._data.data_st_tag) ||
          (i.data_selenium && i.data_selenium !== this._data.data_selenium) ||
          (i.data_selenium_id && i.data_selenium_id !== this._data.data_selenium_id) ||
          (i.data_testid && i.data_testid !== this._data.data_testid) ||
          (i.data_test_id && i.data_test_id !== this._data.data_test_id) ||
          (i.data_qa_id && i.data_qa_id !== this._data.data_qa_id) ||
          (i.data_id && i.data_id !== this._data.data_id) ||
          (i.name && i.name !== this._data.name) ||
          (i.placeholder && i.placeholder !== this._data.placeholder) ||
          (i.role && i.role !== this._data.role) ||
          (i.type && i.type !== this._data.type) ||
          (i.nodeTypeInt && i.nodeTypeInt !== this._data.nodeTypeInt) ||
          (i.nodeName && i.nodeName !== this._data.nodeName) ||
          (i.cursorType && i.cursorType !== this._data.cursorType) ||
          (i.text && i.text !== this._data.text) ||
          (i.textLength && i.textLength !== this._data.textLength) ||
          (i.bottom && i.bottom !== this._data.bottom) ||
          (i.height && i.height !== this._data.height) ||
          (i.left && i.left !== this._data.left) ||
          (i.right && i.right !== this._data.right) ||
          (i.top && i.top !== this._data.top) ||
          (i.width && i.width !== this._data.width) ||
          (i.x && i.x !== this._data.x) ||
          (i.y && i.y !== this._data.y)
        );
      }
      static createCssSelector(i) {
        let r = '';
        return (
          i != null && i.nodeName && (r += i.nodeName.toLowerCase()),
          i != null && i.id && (r += `[id="${i.id}"]`),
          i != null && i.aria_label && (r += `[aria-label="${i.aria_label}"]`),
          i != null && i.data_st_field && (r += `[data-st-field="${i.data_st_field}"]`),
          i != null && i.data_st_tag && (r += `[data-st-tag="${i.data_st_tag}"]`),
          i != null && i.data_selenium && (r += `[data-selenium="${i.data_selenium}"]`),
          i != null && i.data_selenium_id && (r += `[data-selenium-id="${i.data_selenium_id}"]`),
          i != null && i.data_testid && (r += `[data-testid="${i.data_testid}"]`),
          i != null && i.data_test_id && (r += `[data-test-id="${i.data_test_id}"]`),
          i != null && i.data_qa_id && (r += `[data-qa-id="${i.data_qa_id}"]`),
          i != null && i.data_id && (r += `[data-id="${i.data_id}"]`),
          i != null && i.name && (r += `[name="${i.name}"]`),
          i != null && i.placeholder && (r += `[placeholder="${i.placeholder}"]`),
          i != null && i.role && (r += `[role="${i.role}"]`),
          i != null && i.type && (r += `[type="${i.type}"]`),
          r
        );
      }
    }
    l.UiElement = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor(i) {
        this._clientDelegate = i;
      }
      createUIControlData(i) {
        const r = l._POSignalsUtils.Util.getSrcElement(i);
        if (!r) return null;
        const a = l.PointerConfig.instance.pointerParams.uiModelingBlacklistRegex;
        if (a && window.location.href.match(a))
          return (l._POSignalsUtils.Logger.debug('ui control data is disabled for this url'), null);
        const c = new l.UiElement(r, this._clientDelegate);
        return this.findMatchingUiControl(c) || { uiElement: c.data };
      }
      findMatchingUiControl(i, r = 0) {
        try {
          const a = l.PointerConfig.instance.pointerParams.uiControlsConfig;
          if (
            a.length === 0 ||
            r > l.PointerConfig.instance.pointerParams.uiModelingMaxMatchingParents
          )
            return null;
          let c = !1;
          for (const n of a)
            if (!(!n.tagConfig && !n.enrichedData) && ((c = !0), i.equals(n.uiElement)))
              return { uiElement: i.data, enrichedData: n.enrichedData, tagConfig: n.tagConfig };
          if (!c) return null;
          const t = i.htmlElement.parentElement;
          if ((t == null ? void 0 : t.nodeType) === Node.ELEMENT_NODE) {
            const n = new l.UiElement(t, this._clientDelegate);
            return this.findMatchingUiControl(n, r + 1);
          }
        } catch (a) {
          l._POSignalsUtils.Logger.warn('failed to find matching ui control', a);
        }
        return null;
      }
      convertToTagValueConfig(i) {
        var r;
        return {
          context:
            (r = i == null ? void 0 : i.uiElement) === null || r === void 0 ? void 0 : r.location,
          valueSelector: l.UiElement.createCssSelector(i == null ? void 0 : i.uiElement),
          operation: i == null ? void 0 : i.operation,
          valueMandatory: i == null ? void 0 : i.valueMandatory,
        };
      }
    }
    l.UIControlManager = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      get isStarted() {
        return this._isStarted;
      }
      get onInteraction() {
        return this._onInteraction.asEvent();
      }
      get onClickEvent() {
        return this._onClickEvent.asEvent();
      }
      constructor(i, r) {
        ((this.BEHAVIORAL_TYPE = 'mouse'),
          (this._isStarted = !1),
          (this._onInteraction = new l.EventDispatcher()),
          (this._onClickEvent = new l.EventDispatcher()),
          (this.lastMouseInteractionTimestamp = null),
          (this.mouseEventsCounter = 0),
          (this.eventCounters = { epochTs: Date.now() }),
          (this.delegate = i),
          (this.uiControlManager = r),
          (this.wheelOptions = l._POSignalsUtils.Util.isPassiveSupported() ? { passive: !0 } : !1),
          (this.onPointerHandle = this.onPointerEvent.bind(this)),
          (this.onClickHandle = this.onClick.bind(this)),
          (this.onDblclickHandle = this.onMouseClickEvent.bind(this)),
          (this.onMousedownHandle = this.onMouseClickEvent.bind(this)),
          (this.onMousemoveHandle = this.onMouseEvent.bind(this)),
          (this.onMouseoutHandle = this.onMouseout.bind(this)),
          (this.onMouseoverHandle = this.onMouseEvent.bind(this)),
          (this.onMouseupHandle = this.onMouseClickEvent.bind(this)),
          (this.onWheelHandle = this.onMouseEvent.bind(this)),
          (this.interactionUpdateHandle = this.interactionUpdate.bind(this)));
      }
      countEvent(i) {
        this.eventCounters[i] = (this.eventCounters[i] || 0) + 1;
      }
      interactionUpdate() {
        this.lastMouseInteraction
          ? Date.now() - this.lastMouseInteractionTimestamp >=
              l.PointerConfig.instance.pointerParams.mouseIdleTimeoutMillis && this.dispatch()
          : !this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE) &&
            Date.now() - this.lastMouseInteractionTimestamp <=
              l.PointerConfig.instance.pointerParams.mouseIntervalMillis &&
            this.dispatch();
      }
      enrichLastInteraction() {
        var i;
        if (!this.lastMouseInteraction) return;
        ((this.lastMouseInteraction.eventCounters = this.eventCounters),
          (this.lastMouseInteraction.duration = this.delegate.getInteractionDuration(
            this.lastMouseInteraction.events,
          )));
        const r =
          (i = this.lastMouseInteraction.events) === null || i === void 0
            ? void 0
            : i.filter((a) => a.type === 'mousemove');
        ((this.lastMouseInteraction.timeProximity =
          l._POSignalsUtils.Util.calculateMeanTimeDeltasBetweenEvents(r)),
          (this.lastMouseInteraction.meanEuclidean =
            l._POSignalsUtils.Util.calculateMeanDistanceBetweenPoints(r)));
      }
      dispatch() {
        try {
          (this.enrichLastInteraction(),
            this._onInteraction.dispatch(this, this.lastMouseInteraction),
            (this.eventCounters = { epochTs: Date.now() }),
            (this.lastMouseInteraction = null),
            (this.mouseEventsCounter = 0));
        } catch (i) {
          l._POSignalsUtils.Logger.warn('Failed to dispatch mouse events', i);
        }
      }
      updateInteraction(i, r) {
        (this.lastMouseInteraction ||
          (this.lastMouseInteraction = {
            epochTs: Date.now(),
            events: [],
            counter: this.delegate.mouseCounter,
            additionalData: this.delegate.additionalData,
            eventCounters: { epochTs: Date.now() },
            duration: 0,
            timeProximity: 0,
            uiControl: void 0,
            meanEuclidean: 0,
            reduction: {},
            quality: '',
          }),
          this.lastMouseInteraction.events.push(i),
          this.mouseEventsCounter++,
          r &&
            ((this.lastMouseInteraction.uiControl = {
              uiElement: r.uiElement,
              enrichedData: r.enrichedData,
            }),
            this.delegate.addUiControlTags(r.tagConfig)),
          this.mouseEventsCounter >= l.PointerConfig.instance.pointerParams.maxMouseEvents &&
            this.dispatch());
      }
      start() {
        this._isStarted
          ? l._POSignalsUtils.Logger.debug('Desktop Mouse events already listening')
          : (this.delegate.addEventListener(document, 'click', this.onClickHandle, !0),
            this.delegate.addEventListener(document, 'dblclick', this.onDblclickHandle),
            this.delegate.addEventListener(document, 'mousedown', this.onMousedownHandle),
            this.delegate.addEventListener(document, 'mousemove', this.onMousemoveHandle),
            this.delegate.addEventListener(document, 'mouseout', this.onMouseoutHandle),
            this.delegate.addEventListener(document, 'mouseover', this.onMouseoverHandle),
            this.delegate.addEventListener(document, 'mouseup', this.onMouseupHandle),
            this.delegate.addEventListener(
              document,
              'wheel',
              this.onWheelHandle,
              this.wheelOptions,
            ),
            this.delegate.addEventListener(document, 'pointerover', this.onPointerHandle),
            this.delegate.addEventListener(document, 'pointerenter', this.onPointerHandle),
            this.delegate.addEventListener(document, 'pointerdown', this.onPointerHandle),
            this.delegate.addEventListener(document, 'pointermove', this.onPointerHandle),
            this.delegate.addEventListener(document, 'pointerup', this.onPointerHandle),
            this.delegate.addEventListener(document, 'pointercancel', this.onPointerHandle),
            this.delegate.addEventListener(document, 'pointerout', this.onPointerHandle),
            this.delegate.addEventListener(document, 'pointerleave', this.onPointerHandle),
            (this.updateIntervalHandle = setInterval(
              this.interactionUpdateHandle,
              l.PointerConfig.instance.pointerParams.mouseIntervalMillis,
            )),
            (this._isStarted = !0),
            l._POSignalsUtils.Logger.debug('Desktop Mouse events start listening...'));
      }
      stop() {
        this._isStarted
          ? (document.removeEventListener('click', this.onClickHandle, !0),
            document.removeEventListener('dblclick', this.onDblclickHandle),
            document.removeEventListener('mousedown', this.onMousedownHandle),
            document.removeEventListener('mousemove', this.onMousemoveHandle),
            document.removeEventListener('mouseout', this.onMouseoutHandle),
            document.removeEventListener('mouseover', this.onMouseoverHandle),
            document.removeEventListener('mouseup', this.onMouseupHandle),
            document.removeEventListener('wheel', this.onWheelHandle, this.wheelOptions),
            document.removeEventListener('pointerover', this.onPointerHandle),
            document.removeEventListener('pointerenter', this.onPointerHandle),
            document.removeEventListener('pointerdown', this.onPointerHandle),
            document.removeEventListener('pointermove', this.onPointerHandle),
            document.removeEventListener('pointerup', this.onPointerHandle),
            document.removeEventListener('pointercancel', this.onPointerHandle),
            document.removeEventListener('pointerout', this.onPointerHandle),
            document.removeEventListener('pointerleave', this.onPointerHandle),
            clearInterval(this.updateIntervalHandle),
            (this.updateIntervalHandle = null),
            (this._isStarted = !1),
            l._POSignalsUtils.Logger.debug('Desktop Mouse events stop listening...'))
          : l._POSignalsUtils.Logger.debug('Desktop Mouse events already stopped');
      }
      onClick(i) {
        var r, a;
        try {
          this.lastMouseInteractionTimestamp = Date.now();
          const c = l._POSignalsUtils.Util.getSrcElement(i);
          if (
            (this._onClickEvent.dispatch(this, c),
            !this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE) ||
              (this.countEvent(i.type),
              l.PointerConfig.instance.pointerParams.eventsToIgnore.has(i.type)))
          )
            return;
          const t = this.uiControlManager.createUIControlData(i);
          (this.updateInteraction(this.createMouseClickEvent(i.type, i), t),
            this.dispatch(),
            ((a =
              (r = t == null ? void 0 : t.uiElement) === null || r === void 0 ? void 0 : r.id) ===
              null || a === void 0
              ? void 0
              : a.length) > 0 &&
              l._POSignalsUtils.Logger.info(`Tapped on element with id '${t.uiElement.id}'`));
        } catch (c) {
          l._POSignalsUtils.Logger.warn(`error in ${i.type} handler`, c);
        }
      }
      onMouseout(i) {
        try {
          this.onMouseEvent(i);
          const r = i.relatedTarget || i.toElement;
          (!r || r.nodeName === 'HTML') && this.dispatch();
        } catch (r) {
          l._POSignalsUtils.Logger.warn(`error in ${i.type} handler`, r);
        }
      }
      onMouseEvent(i) {
        try {
          if (
            (i.type !== 'wheel' && (this.lastMouseInteractionTimestamp = Date.now()),
            !this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE) ||
              (this.countEvent(i.type),
              l.PointerConfig.instance.pointerParams.eventsToIgnore.has(i.type)))
          )
            return;
          this.updateInteraction(this.createMouseEvent(i.type, i));
        } catch (r) {
          l._POSignalsUtils.Logger.warn(`error in ${i.type} handler`, r);
        }
      }
      onMouseClickEvent(i) {
        try {
          if (
            ((this.lastMouseInteractionTimestamp = Date.now()),
            !this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE) ||
              (this.countEvent(i.type),
              l.PointerConfig.instance.pointerParams.eventsToIgnore.has(i.type)))
          )
            return;
          this.updateInteraction(this.createMouseClickEvent(i.type, i));
        } catch (r) {
          l._POSignalsUtils.Logger.warn(`error in ${i.type} handler`, r);
        }
      }
      onPointerEvent(i) {
        try {
          if (
            ((this.lastMouseInteractionTimestamp = Date.now()),
            !this.delegate.collectBehavioralData(this.BEHAVIORAL_TYPE) ||
              (this.countEvent(i.type),
              l.PointerConfig.instance.pointerParams.eventsToIgnore.has(i.type)))
          )
            return;
          this.updateInteraction(this.createPointerEvent(i.type, i));
        } catch (r) {
          l._POSignalsUtils.Logger.warn(`error in ${i.type} handler`, r);
        }
      }
      clearBuffer() {
        let i = null;
        return (
          this.lastMouseInteraction && (i = this.lastMouseInteraction),
          (this.lastMouseInteraction = null),
          i
        );
      }
      isEmpty() {
        return !this.lastMouseInteraction;
      }
      createMouseEvent(i, r) {
        return {
          type: i,
          eventTs: r.timeStamp,
          epochTs: Date.now(),
          button: r.button,
          offsetX: r.offsetX,
          offsetY: r.offsetY,
          pageX: r.pageX,
          pageY: r.pageY,
          screenX: r.screenX,
          screenY: r.screenY,
          getX() {
            return r.screenX;
          },
          getY() {
            return r.screenY;
          },
        };
      }
      createPointerEvent(i, r) {
        return {
          ...this.createMouseEvent(i, r),
          pointerId: r.pointerId,
          width: r.width,
          height: r.height,
          pressure: r.pressure,
          tangentialPressure: r.tangentialPressure,
          tiltX: r.tiltX,
          tiltY: r.tiltY,
          twist: r.twist,
          pointerType: r.pointerType,
          isPrimary: r.isPrimary,
        };
      }
      createMouseClickEvent(i, r) {
        const a = this.createMouseEvent(i, r);
        if (r.target && l._POSignalsUtils.Util.isFunction(r.target.getBoundingClientRect)) {
          const c = r.target.getBoundingClientRect();
          ((a.targetBottom = c.bottom),
            (a.targetHeight = c.height),
            (a.targetLeft = c.left),
            (a.targetRight = c.right),
            (a.targetTop = c.top),
            (a.targetWidth = c.width),
            (a.targetX = c.x),
            (a.targetY = c.y));
        }
        return a;
      }
    }
    l.Mouse = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor(i) {
        ((this.counter = 0), (this.key = i), (this.counter = this.loadFromStorage()));
      }
      loadFromStorage() {
        const i = f.sessionStorage.getItem(this.key);
        return Number(i) || 0;
      }
      get() {
        return this.counter;
      }
      increment(i = 1) {
        ((this.counter += i), f.sessionStorage.setItem(this.key, this.counter));
      }
      decrement(i = 1) {
        this.increment(i * -1);
      }
      reset() {
        ((this.counter = 0), f.sessionStorage.removeItem(this.key));
      }
    }
    ((f.sessionStorage = l._POSignalsStorage.SessionStorage.instance.sessionStorage),
      (l.StorageCounter = f));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor(i) {
        ((this.mapKey = i), (this.cache = this.loadFromStorage()));
      }
      loadFromStorage() {
        let i = f.sessionStorage.getItem(this.mapKey);
        return (i || (i = JSON.stringify({})), JSON.parse(i));
      }
      asMap() {
        return this.cache;
      }
      set(i, r, a = !0) {
        ((this.cache[i] = r),
          a && f.sessionStorage.setItem(this.mapKey, JSON.stringify(this.cache)));
      }
      sync() {
        f.sessionStorage.setItem(this.mapKey, JSON.stringify(this.cache));
      }
      get(i) {
        return this.cache[i];
      }
      delete(i) {
        (delete this.cache[i], f.sessionStorage.setItem(this.mapKey, JSON.stringify(this.cache)));
      }
      values() {
        return l._POSignalsUtils.Util.values(this.cache);
      }
      clear() {
        ((this.cache = {}), f.sessionStorage.removeItem(this.mapKey));
      }
      forEach(i) {
        for (const r in this.cache) this.cache.hasOwnProperty(r) && i(this.cache[r], r);
      }
    }
    ((f.sessionStorage = l._POSignalsStorage.SessionStorage.instance.sessionStorage),
      (l.StorageMap = f));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor() {
        ((this.config = {}), (this._cacheHash = 0), (this.cache = new Map()));
      }
      refreshConfig(i) {
        try {
          if (!i) return;
          const r = l._POSignalsUtils.Util.hashCode(JSON.stringify(i));
          if (this._cacheHash === r) return;
          ((this.config = i), (this._cacheHash = r), (this.cache = new Map()));
        } catch (r) {
          l._POSignalsUtils.Logger.warn('Failed to set css selectors', r);
        }
      }
      getMatchingTags(i, r) {
        const a = this.cache.get(i);
        if (a) return a;
        const c = {};
        for (const t in this.config)
          try {
            if (!this.config.hasOwnProperty(t)) continue;
            let n = this.config[t].selector || [];
            l._POSignalsUtils.Util.isArray(n) || (n = [].concat(n));
            for (const e of n)
              l._POSignalsUtils.Util.isSelectorMatches(i, e, r) && (c[t] = this.config[t]);
          } catch (n) {
            l._POSignalsUtils.Logger.warn(`Failed to get the config for ${t} tag`, n);
          }
        return (this.cache.set(i, c), c);
      }
      getValue(i, r) {
        if (r && i)
          switch (((r = r.trim()), i)) {
            case 'email_domain':
              return l._POSignalsUtils.Util.getEmailDomain(r);
            case 'obfuscate':
              return `${l._POSignalsUtils.Util.mod(r, 1e3)}`;
            case 'plain':
              return r;
            case 'zip':
              return r.substr(0, 3);
            case 'length':
              return `${r.length}`;
          }
        return '';
      }
      get cacheHash() {
        return this._cacheHash;
      }
    }
    l.TagsIdentifications = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor() {
        this._reduceFactorMap = null;
      }
      set reduceFactorMap(i) {
        this._reduceFactorMap = i;
      }
      get reduceFactorMap() {
        return this._reduceFactorMap;
      }
      reduceEventsByFactor(i) {
        try {
          if (!i || i.length === 0 || !this.reduceFactorMap) return i;
          const r = new Map(),
            a = [];
          for (let t = 0; t < i.length; t++)
            r.get(i[t].type) ? r.get(i[t].type).push(t) : r.set(i[t].type, [t]);
          r.forEach((t, n) => {
            const e = this.reduceFactorMap[n] ? Number(this.reduceFactorMap[n]) : 0;
            this.reduceByFactor(e, t, (o) => {
              a[t[o]] = !0;
            });
          });
          const c = [];
          for (let t = 0; t < i.length; t++) a[t] && c.push(i[t]);
          return (
            i.length !== c.length &&
              l._POSignalsUtils.Logger.debug(
                `${i.length - c.length} events reduced out of ${i.length}`,
              ),
            c
          );
        } catch (r) {
          return (l._POSignalsUtils.Logger.warn('Failed to reduce events', r), i);
        }
      }
      reduceByFactor(i, r, a) {
        i = Math.min(i, 1);
        const c = Math.round(Math.max(r.length * (1 - i), 2)),
          t = (r.length - 1) / (c - 1),
          n = Math.min(r.length, c);
        for (let e = 0; e < n; e++) {
          const o = Math.round(e * t);
          a(o);
        }
      }
    }
    l.ReduceFactor = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor(i) {
        this.algorithm = i;
      }
      reduce(i, r) {
        if (f.TYPES_TO_REDUCE.indexOf(r) === -1) return { keptEvents: i, epsilon: 0 };
        if (i.length <= f.MIN_EVENTS_TO_REDUCE) return { keptEvents: i, epsilon: 0 };
        const a = i.length < 50 ? 0.55 : i.length < 100 ? 0.35 : 0.2,
          c = i.length < 50 ? 1 : i.length < 100 ? 3 : 7,
          t = this.algorithm.reduceEvents(i, c),
          n = t.length / i.length;
        if (t.length >= 10 && n >= a) return { keptEvents: t, epsilon: c };
        const e = i.length < 50 ? 0.1 : i.length < 100 ? 0.3 : 0.7,
          o = this.algorithm.reduceEvents(i, e),
          s = o.length / i.length;
        if (o.length <= f.MIN_EVENTS_TO_REDUCE || s <= a) return { keptEvents: o, epsilon: e };
        const m =
          (Math.min(c, Math.pow(c, n / a)) * Math.abs(s - a) + e * Math.abs(n - a)) /
          Math.abs(n - s);
        return (
          (m < e || m > c) &&
            l._POSignalsUtils.Logger.warn(
              `linear weighted average - calculated epsilon is out of range, lowEpsilon: ${e}, highEpsilon: ${c}, epsilon: ${m}`,
            ),
          { keptEvents: this.algorithm.reduceEvents(i, m), epsilon: m }
        );
      }
    }
    ((f.MIN_EVENTS_TO_REDUCE = 18),
      (f.TYPES_TO_REDUCE = ['mousemove', 'touchmove']),
      (l.RDPEpsilonStrategy = f));
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor(i) {
        this.rdpStrategy = i;
      }
      reduceWithRPD(i) {
        if (!i || i.length === 0) return { events: i, reductionInfo: {} };
        const r = new Map();
        let a = [];
        for (const n of i) r.get(n.type) ? r.get(n.type).push(n) : r.set(n.type, [n]);
        const c = {};
        return (
          r.forEach((n, e) => {
            const { keptEvents: o, epsilon: s } = this.rdpStrategy.reduce(n, e);
            (s > 0 && (c[e] = { epsilon: s, originalLength: n.length, keptLength: o.length }),
              (a = a.concat(o)));
          }),
          { events: l._POSignalsUtils.Util.sortEventsByTimestamp(a), reductionInfo: c }
        );
      }
    }
    l.ReduceRDP = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      getSqDist(i, r) {
        const a = i.getX() - r.getX(),
          c = i.getY() - r.getY();
        return a * a + c * c;
      }
      getSqSegDist(i, r, a) {
        let c = r.getX(),
          t = r.getY(),
          n = a.getX() - c,
          e = a.getY() - t;
        if (n !== 0 || e !== 0) {
          const o = ((i.getX() - c) * n + (i.getY() - t) * e) / (n * n + e * e);
          o > 1 ? ((c = a.getX()), (t = a.getY())) : o > 0 && ((c += n * o), (t += e * o));
        }
        return ((n = i.getX() - c), (e = i.getY() - t), n * n + e * e);
      }
      simplifyRadialDist(i, r) {
        let a = i[0],
          c = [a],
          t;
        for (let n = 1, e = i.length; n < e; n++)
          ((t = i[n]), this.getSqDist(t, a) > r && (c.push(t), (a = t)));
        return (a !== t && c.push(t), c);
      }
      simplifyDPStep(i, r, a, c, t) {
        let n = c,
          e;
        for (let o = r + 1; o < a; o++) {
          const s = this.getSqSegDist(i[o], i[r], i[a]);
          s > n && ((e = o), (n = s));
        }
        n > c &&
          (e - r > 1 && this.simplifyDPStep(i, r, e, c, t),
          t.push(i[e]),
          a - e > 1 && this.simplifyDPStep(i, e, a, c, t));
      }
      simplifyDouglasPeucker(i, r) {
        const a = i.length - 1,
          c = [i[0]];
        return (this.simplifyDPStep(i, 0, a, r, c), c.push(i[a]), c);
      }
      simplify(i, r, a) {
        if (i.length <= 2) return i;
        const c = r !== void 0 ? r * r : 1;
        return (
          (i = a ? i : this.simplifyRadialDist(i, c)),
          (i = this.simplifyDouglasPeucker(i, c)),
          i
        );
      }
      reduceEvents(i, r) {
        return this.simplify(i, r);
      }
    }
    l.RDPReduction = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      filterMoveEvents(i, r) {
        if (i.length <= 18) return i;
        const a = i.filter((e) => e.type === r),
          c = l._POSignalsUtils.Util.keepFirstEventsWithDistance({
            events: a,
            threshold: 200,
            min: 18,
            max: 30,
          });
        let t = -1;
        const n = {};
        for (let e = 0; e < i.length; e++) {
          const o = i[e];
          if (o.type !== r) {
            if (o.type === 'mousedown') {
              t = e;
              continue;
            }
            n[o.type] || (c.push(o), (n[o.type] = !0));
          }
        }
        return (t >= 0 && c.push(i[t]), l._POSignalsUtils.Util.sortEventsByTimestamp(c));
      }
    }
    l.EventsReduction = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f {
      constructor() {
        ((this.reduceFactor = new l.ReduceFactor()),
          (this.reduceRDP = new l.ReduceRDP(new l.RDPEpsilonStrategy(new l.RDPReduction()))),
          (this.eventsReduction = new l.EventsReduction()));
      }
      set reduceFactorMap(i) {
        this.reduceFactor.reduceFactorMap = i;
      }
      reduceGesture(i) {
        const r = this.reduceRDP.reduceWithRPD(i.events);
        ((i.events = this.eventsReduction.filterMoveEvents(r.events, 'touchmove')),
          (i.reduction = r.reductionInfo));
      }
      reduceKeyboardInteraction(i) {
        i.events = l._POSignalsUtils.Util.filterArrayByLength(i.events, 50);
      }
      reduceMouseInteraction(i) {
        const r = this.reduceRDP.reduceWithRPD(i.events);
        ((i.events = this.eventsReduction.filterMoveEvents(r.events, 'mousemove')),
          (i.reduction = r.reductionInfo));
      }
    }
    l.ReductionManager = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  (function (l) {
    class f extends l.ClientBase {
      constructor(i, r) {
        (super(i),
          (this.tagsWithValueIdentifications = new l.TagsIdentifications()),
          (this.reductionManager = new l.ReductionManager()),
          (this.lastGestureTimestamp = 0),
          (this.currentBufferSize = 0),
          (this.MAX_EVENT_COUNTERS = 20),
          (this.bufferingStrategy = l.StrategyFactory.createBufferingStrategy(r, this)),
          (this.capturedKeyboardInteractions = new l.StorageArray(
            l._POSignalsUtils.Constants.CAPTURED_KEYBOARD_INTERACTIONS,
          )),
          (this.keyboardInteractionsCount = new l.StorageCounter(
            l._POSignalsUtils.Constants.KEYBOARD_INTERACTIONS_COUNT,
          )),
          (this.mouseInteractionsCount = new l.StorageCounter(
            l._POSignalsUtils.Constants.MOUSE_INTERACTIONS_COUNT,
          )),
          (this.gesturesCount = new l.StorageCounter(l._POSignalsUtils.Constants.GESTURES_COUNT)),
          (this.mouseEventCounters = new l.StorageArray(
            l._POSignalsUtils.Constants.MOUSE_EVENT_COUNTERS,
          )),
          (this.keyboardEventCounters = new l.StorageArray(
            l._POSignalsUtils.Constants.KEYBOARD_EVENT_COUNTERS,
          )),
          (this.touchEventCounters = new l.StorageArray(
            l._POSignalsUtils.Constants.TOUCH_EVENT_COUNTERS,
          )),
          (this.indirectEventCounters = new l.StorageArray(
            l._POSignalsUtils.Constants.INDIRECT_EVENT_COUNTERS,
          )),
          (this.capturedMouseInteractions = new l.StorageArray(
            l._POSignalsUtils.Constants.CAPTURED_MOUSE_INTERACTIONS,
          )),
          (this.capturedGestures = new l.StorageArray(
            l._POSignalsUtils.Constants.CAPTURED_GESTURES,
          )),
          (this.capturedIndirectEvents = new l.StorageArray(
            l._POSignalsUtils.Constants.CAPTURED_INDIRECT,
          )),
          (this.capturedMouseInteractionSummary = new l.StorageArray(
            l._POSignalsUtils.Constants.CAPTURED_MOUSE_INTERACTIONS_SUMMARY,
          )),
          (this.currentBufferSize =
            this.capturedGestures.length +
            this.capturedMouseInteractions.length +
            this.capturedKeyboardInteractions.length),
          (this.uiControlManager = new l.UIControlManager(this)),
          (this.keyboard = new l.Keyboard(this, this.uiControlManager)),
          this.keyboard.onInteraction.subscribe(this.handleKeyboardInteraction.bind(this)),
          this.keyboard.onEnterPress.subscribe(this.handleStTagOnEnter.bind(this)),
          this.keyboard.onObfuscatedValue.subscribe(this.handleTagValueOnBlur.bind(this)),
          (this.mouse = new l.Mouse(this, this.uiControlManager)),
          this.mouse.onInteraction.subscribe(this.handleMouseInteraction.bind(this)),
          this.mouse.onClickEvent.subscribe(this.handleStTagOnClick.bind(this)),
          (this.sensors = new l.Sensors(this)),
          (this.gesture = new l.GestureEvents(this, this.sensors)),
          this.gesture.onGesture.subscribe(this.handleGesture.bind(this)),
          (this.indirect = new l.IndirectClient(this)),
          this.indirect.onIndirect.subscribe(this.handleIndirect.bind(this)),
          (this.onUrlChangeHandler = this.onUrlChange.bind(this)));
      }
      get keyboardCounter() {
        return this.keyboardInteractionsCount.get();
      }
      get mouseCounter() {
        return this.mouseInteractionsCount.get();
      }
      get gesturesCounter() {
        return this.gesturesCount.get();
      }
      get additionalData() {
        const i = l._POSignalsUtils.Util.getDeviceOrientation();
        return {
          locationHref: location.href,
          devTools: l._POSignalsUtils.Util.getDevToolsState(),
          innerWidth:
            window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
          innerHeight:
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight,
          outerWidth: window.outerWidth,
          outerHeight: window.outerHeight,
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          pixelRatio: window.devicePixelRatio,
          deviceOrientation: i.orientation,
          deviceAngle: i.angle,
        };
      }
      getBehavioralData() {
        this.clearIndirectBuffer();
        const i = this.reduceEpochEventCounters();
        return {
          mouse: {
            count: this.mouseInteractionsCount.get(),
            interactions: this.capturedMouseInteractions.get(),
          },
          keyboard: {
            count: this.keyboardInteractionsCount.get(),
            interactions: this.capturedKeyboardInteractions.get(),
          },
          touch: { count: this.gesturesCount.get(), interactions: this.capturedGestures.get() },
          indirect: { events: this.capturedIndirectEvents.get() },
          mouseSummary: { events: this.capturedMouseInteractionSummary.get() },
          eventCounters: i,
        };
      }
      getBufferSize() {
        return this.currentBufferSize;
      }
      getInteractionDuration(i) {
        return (i == null ? void 0 : i.length) > 0 ? i[i.length - 1].epochTs - i[0].epochTs : 0;
      }
      async dispose() {
        (this.stopListening(),
          this.keyboard.onInteraction.unsubscribe(this.handleKeyboardInteraction.bind(this)),
          this.keyboard.onEnterPress.unsubscribe(this.handleStTagOnEnter.bind(this)),
          this.keyboard.onObfuscatedValue.unsubscribe(this.handleTagValueOnBlur.bind(this)),
          this.mouse.onInteraction.unsubscribe(this.handleMouseInteraction.bind(this)),
          this.mouse.onClickEvent.unsubscribe(this.handleStTagOnClick.bind(this)),
          this.gesture.onGesture.unsubscribe(this.handleGesture.bind(this)),
          this.indirect.unsubscribe(),
          this.indirect.onIndirect.unsubscribe(this.handleIndirect.bind(this)));
      }
      collectBehavioralData(i) {
        if (this.isBehavioralDataPaused) return !1;
        const r = l.PointerConfig.instance.pointerParams.behavioralBlacklist;
        return !i || !r || !r[i] ? !0 : !window.location.href.match(r[i]);
      }
      getElementsStID(i) {
        try {
          return (
            l._POSignalsUtils.Util.getAttribute(i, 'data-st-field') ||
            this.keyboard.fieldsIdentifications.getIdentification(i, 0) ||
            ''
          );
        } catch (r) {
          return (l._POSignalsUtils.Logger.warn('failed to get element stId', r), '');
        }
      }
      addEventListener(i, r, a, c) {
        l.PointerConfig.instance.pointerParams.eventsBlackList.has(r) ||
          (i.addEventListener(r, this.onEventHandler, c), i.addEventListener(r, a, c));
      }
      addUiControlTags(i) {
        if ((i == null ? void 0 : i.length) > 0) {
          let r = !1;
          for (const a of i)
            try {
              if (a != null && a.name) {
                const c = this.uiControlManager.convertToTagValueConfig(a.value);
                r = this.addSingleTagWithValue(a.name, c) || r;
              }
            } catch (c) {
              l._POSignalsUtils.Logger.warn('failed to add tag config', c);
            }
        }
      }
      refreshListening() {
        const i = l.PointerConfig.instance;
        (this.tagsWithValueIdentifications.refreshConfig(i.pointerParams.remoteTags),
          (this.reductionManager.reduceFactorMap = i.pointerParams.eventsReduceFactorMap),
          this.keyboard.refreshKeyboardCssSelectors(i.pointerParams.keyboardCssSelectors),
          (this.sensors.maxSensorSamples = i.pointerParams.maxSensorSamples),
          (this.sensors.sensorsTimestampDeltaInMillis = i.pointerParams.sensorsDeltaInMillis),
          this.mouse.start(),
          this.keyboard.start(),
          this.gesture.start(),
          this.indirect.start(),
          i.pointerParams.maxSensorSamples == 0 ? this.sensors.stop() : this.sensors.start(),
          this.addEventListener(window, '_onlocationchange', this.onUrlChangeHandler),
          this.addEventListener(window, 'popstate', this.onUrlChangeHandler));
      }
      addSingleTagWithValue(i, r) {
        try {
          if (r != null && r.context && !window.location.href.match(r.context)) return !1;
          let a = '';
          if (r != null && r.operation && r != null && r.valueSelector) {
            const c = document.querySelector(r.valueSelector);
            if (c) {
              const t = l._POSignalsUtils.Util.getElementText(c);
              a = this.tagsWithValueIdentifications.getValue(r.operation, t);
            }
          }
          if (r != null && r.valueMandatory && !a)
            return (l._POSignalsUtils.Logger.warn(`tag '${i}' wasn't added. value is missing`), !1);
          this.addTag(i, a);
        } catch (a) {
          l._POSignalsUtils.Logger.warn(`failed to add ${i} tag`, a);
        }
        return !1;
      }
      addTagsWithValue(i) {
        let r = !1;
        for (const a in i) i.hasOwnProperty(a) && (r = this.addSingleTagWithValue(a, i[a]) || r);
      }
      handleStTagOnEnter(i, r) {
        r instanceof HTMLInputElement &&
          l._POSignalsUtils.Util.isTextInput(r) &&
          this.handleStTagElement(r);
      }
      handleTagValueOnBlur(i, r) {
        r && this.addTag(r.fieldKey, r.obfuscatedValue);
      }
      handleStTagOnClick(i, r) {
        (!(r instanceof HTMLInputElement) || l._POSignalsUtils.Util.isClickableInput(r)) &&
          this.handleStTagElement(r);
      }
      handleMouseInteraction(i, r) {
        if (!r) return;
        (this.incrementEventCounters(r.eventCounters, 'mouse'),
          this.filterOldMouseEvents(),
          this.mouseInteractionsCount.increment(),
          this.reductionManager.reduceMouseInteraction(r));
        const a = this.bufferingStrategy.calculateStrategyResult(r, 'mouse');
        ((r.quality = a.quality),
          this.handleMouseInteractionSummary(r),
          a.shouldCollect &&
            (a.remove && this.removeInteraction(a.remove),
            this.capturedMouseInteractions.push(r),
            this.lastGestureTimestamp !== r.events[r.events.length - 1].eventTs &&
              this.currentBufferSize++));
      }
      handleMouseInteractionSummary(i) {
        const r = {
          epochTs: i.epochTs,
          duration: this.getInteractionDuration(i.events),
          quality: i.quality,
        };
        (this.capturedMouseInteractionSummary.push(r),
          this.capturedMouseInteractionSummary.length > 10 &&
            this.capturedMouseInteractionSummary.remove(0));
      }
      handleIndirect(i, r) {
        (this.filterOldIndirectEvents(), this.addIndirectEvents(r));
      }
      handleKeyboardInteraction(i, r) {
        if (!r) return;
        (this.incrementEventCounters(r.eventCounters, 'keyboard'),
          this.filterOldKeyboardEvents(),
          this.keyboardInteractionsCount.increment(),
          this.reductionManager.reduceKeyboardInteraction(r));
        const a = this.bufferingStrategy.calculateStrategyResult(r, 'keyboard');
        a.shouldCollect &&
          (a.remove && this.removeInteraction(a.remove),
          (r.quality = a.quality),
          this.capturedKeyboardInteractions.push(r),
          this.currentBufferSize++);
      }
      handleGesture(i, r) {
        var a;
        if (!this.isValidGesture(r)) return;
        (this.incrementEventCounters(r.eventCounters, 'touch'),
          this.filterOldGesturesEvents(),
          this.gesturesCount.increment(),
          this.reductionManager.reduceGesture(r));
        const c = this.bufferingStrategy.calculateStrategyResult(r, 'touch');
        c.shouldCollect &&
          (c.remove && this.removeInteraction(c.remove),
          (r.quality = c.quality),
          this.sensors.onGesture(r),
          this.capturedGestures.push(r),
          this.currentBufferSize++,
          (this.lastGestureTimestamp =
            (a = r.events[r.events.length - 1]) === null || a === void 0 ? void 0 : a.eventTs));
      }
      clearIndirectBuffer() {
        const i = this.indirect.clearBuffer();
        this.addIndirectEvents(i);
      }
      removeInteraction(i) {
        switch (i.type) {
          case 'mouse':
            this.capturedMouseInteractions.remove(i.index);
            break;
          case 'keyboard':
            this.capturedKeyboardInteractions.remove(i.index);
            break;
          case 'touch':
            this.capturedGestures.remove(i.index);
            break;
        }
      }
      addIndirectEvents(i) {
        var r;
        if (
          ((r = i == null ? void 0 : i.events) === null || r === void 0 ? void 0 : r.length) > 0
        ) {
          const a = [],
            c = l._POSignalsUtils.Util.typesCounter(this.capturedIndirectEvents.get());
          for (const t of i.events)
            (l.PointerConfig.instance.pointerParams.highPriorityIndirectEvents.has(t.type) &&
              this.capturedIndirectEvents.length + a.length <
                l.PointerConfig.instance.pointerParams.maxIndirectEvents &&
              a.push(t),
              c[t.type] > 0 || (a.push(t), (c[t.type] = 1)));
          (this.incrementEventCounters(c, 'indirect'),
            this.capturedIndirectEvents.set(this.capturedIndirectEvents.concat(a)));
        }
      }
      onUrlChange() {
        this.addTag('location', window.location.href);
      }
      handleStTagElement(i) {
        if (i) {
          const r = l.PointerConfig.instance.pointerParams.maxSelectorChildren,
            a = this.tagsWithValueIdentifications.getMatchingTags(i, r);
          this.addTagsWithValue(a);
          const c = l._POSignalsUtils.Util.isSelectorMatches(i, '[data-st-tag]', r);
          if (c instanceof Element) {
            const t = l._POSignalsUtils.Util.getAttribute(c, 'data-st-tag'),
              n = l._POSignalsUtils.Util.getAttribute(c, 'data-st-tag-value');
            t && this.addTag(t, n);
          }
        }
      }
      stopListening() {
        (this.keyboard.stop(),
          this.mouse.stop(),
          this.gesture.stop(),
          this.indirect.stop(),
          this.sensors.stop(),
          window.removeEventListener('_onlocationchange', this.onUrlChangeHandler),
          window.removeEventListener('popstate', this.onUrlChangeHandler));
      }
      clearBehavioralData() {
        (this.capturedKeyboardInteractions.clear(),
          this.capturedMouseInteractions.clear(),
          this.capturedGestures.clear(),
          this.capturedIndirectEvents.clear(),
          this.sensors.reset(),
          l.Tags.instance.reset(),
          (this.currentBufferSize = 0),
          this.keyboardInteractionsCount.reset(),
          this.mouseInteractionsCount.reset(),
          this.gesturesCount.reset(),
          this.mouseEventCounters.clear(),
          this.mouseEventCounters.clear(),
          this.indirectEventCounters.clear(),
          this.keyboardEventCounters.clear(),
          this.touchEventCounters.clear(),
          this.eventCounters.clear());
      }
      isValidGesture(i) {
        var r, a;
        return (
          ((r = i == null ? void 0 : i.events) === null || r === void 0 ? void 0 : r.length) > 0 &&
          ((a = i == null ? void 0 : i.events) === null || a === void 0 ? void 0 : a.length) <
            l.PointerConfig.instance.pointerParams.maxSnapshotsCount
        );
      }
      filterOldIndirectEvents() {
        const r = new Date().getTime();
        this.capturedIndirectEvents.set(
          this.capturedIndirectEvents.get().filter((a) => r - a.epochTs <= 36e5),
        );
      }
      filterOldMouseEvents() {
        const r = new Date().getTime();
        this.capturedMouseInteractions.set(
          this.capturedMouseInteractions.get().filter((a) => r - a.epochTs <= 36e5),
        );
      }
      filterOldKeyboardEvents() {
        const r = new Date().getTime();
        this.capturedKeyboardInteractions.set(
          this.capturedKeyboardInteractions.get().filter((a) => r - a.epochTs <= 36e5),
        );
      }
      filterOldGesturesEvents() {
        const r = new Date().getTime();
        this.capturedGestures.set(this.capturedGestures.get().filter((a) => r - a.epochTs <= 36e5));
      }
      incrementEventCounters(i, r) {
        const c = Date.now();
        let t;
        switch (r) {
          case 'mouse':
            t = this.mouseEventCounters;
            break;
          case 'keyboard':
            t = this.keyboardEventCounters;
            break;
          case 'touch':
            t = this.touchEventCounters;
            break;
          case 'indirect':
            t = this.indirectEventCounters;
            break;
        }
        (t.set(t.get().filter((n) => c - n.epochTs <= 36e5)),
          t.length < this.MAX_EVENT_COUNTERS || t.remove(0),
          t.push(i));
      }
      reduceEpochEventCounters() {
        const i = { epochTs: Date.now() };
        return (
          [
            ...this.mouseEventCounters.get(),
            ...this.keyboardEventCounters.get(),
            ...this.touchEventCounters.get(),
            ...this.indirectEventCounters.get(),
          ].forEach((a) => {
            Object.keys(a).forEach((c) => {
              c !== 'epochTs' && (i[c] ? (i[c] += a[c]) : (i[c] = a[c]));
            });
          }),
          delete i.epochTs,
          i
        );
      }
    }
    l.Client = f;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  class _pingOneSignals {
    static getData() {
      return _POSignalsEntities.ClientBase.instance().getData();
    }
    static init(f) {
      return (
        _POSignalsEntities._POSignalsUtils.Util.ieFix(),
        _POSignalsEntities.ClientBase.instance().startSignals(f)
      );
    }
    static initSilent(f) {
      return this.init(f);
    }
    static pauseBehavioralData() {
      _POSignalsEntities.ClientBase.instance().pauseBehavioralData();
    }
    static resumeBehavioralData() {
      _POSignalsEntities.ClientBase.instance().resumeBehavioralData();
    }
  }
  const onDomReady = function (l) {
    document.readyState !== 'loading' ? l() : document.addEventListener('DOMContentLoaded', l);
  };
  onDomReady(function () {
    if (!window._pingOneSignalsReady) {
      const l = new CustomEvent('PingOneSignalsReadyEvent');
      (document.dispatchEvent(l), (window._pingOneSignalsReady = !0));
    }
  });
  var _POSignalsEntities;
  (function (l) {
    let f;
    (function (i) {
      ((i[(i.RICH = 3)] = 'RICH'),
        (i[(i.CLICK = 2)] = 'CLICK'),
        (i[(i.MOVE = 1)] = 'MOVE'),
        (i[(i.POOR = 0)] = 'POOR'));
    })(f || (f = {}));
    class E {
      constructor(r, a, c, t, n, e) {
        ((this.clientVersion = r),
          (this.instanceUUID = a),
          (this.initParams = c),
          (this.metadata = t),
          (this.behavioralDataHandler = n),
          (this.sessionData = e),
          (this.Max_Mouse_Touch_Interactions = 6));
      }
      async getData(r) {
        this.incrementGetData();
        const a = await this.getRiskData(r),
          c = a.tags.findIndex((t) => t.name === 'Get Data');
        return (
          c !== -1 ? (a.tags[c] = this._getDataCounter) : a.tags.push(this._getDataCounter),
          this.toString(a)
        );
      }
      async getRiskData(r) {
        const [a, c] = await Promise.all([
          this.metadata.getDeviceAttributes(),
          this.metadata.getLocalAgentJwt(),
        ]);
        let t = this.behavioralDataHandler.getBehavioralData();
        t = await this.modifyBehavioralData(t);
        const n = {
          behavioral: t,
          tags: l.Tags.instance.tags,
          sdkConfig: this.initParams,
          epochTs: r,
          instanceUUID: this.instanceUUID,
          tabUUID: l._POSignalsStorage.SessionStorage.instance.tabUUID,
          sdkVersion: this.clientVersion,
          platform: 'web',
          clientToken: window._pingOneSignalsToken,
        };
        let e;
        return (
          this.sessionData.universalTrustEnabled
            ? (e = { jwtDeviceAttributes: await this.getJWTSignedPayload(r, a.deviceId), ...n })
            : (e = { deviceAttributes: a, ...n }),
          this.sessionData.agentIdentificationEnabled && (e = { jwtAgentPayload: c, ...e }),
          e
        );
      }
      toString(r) {
        let a;
        const c = this.metadata.getObfsInfo();
        try {
          a = l._POSignalsUtils.Util.string2buf(JSON.stringify(r));
        } catch (t) {
          throw new Error(`Failed to create data, ${t.message}`);
        }
        try {
          a = l.pako.gzip(a);
        } catch (t) {
          throw new Error(`Failed to compress data, ${t.message}`);
        }
        try {
          a = l._POSignalsUtils.Util.encryptionBytes(a, c.key);
        } catch (t) {
          throw new Error(`failed to obfuscate data, ${t.message}`);
        }
        try {
          return `${l._POSignalsUtils.Util.base64Uint8Array(a)}.${btoa(c.identifier)}`;
        } catch (t) {
          throw new Error(`failed to encode data, ${t.message}`);
        }
      }
      async getJWTSignedPayload(r, a) {
        const c = this.metadata.getSerializedDeviceAttributes();
        return this.sessionData.signJWTChallenge(c, r, a);
      }
      async modifyBehavioralData(r) {
        return (
          (r.mouse.interactions = this.getBestMouseInteractions(r.mouse.interactions)),
          (r.touch.interactions = this.getBestTouchInteractions(
            r.touch.interactions,
            r.mouse.interactions,
          )),
          (r.keyboard.interactions = this.getBestKeyboardInteractions(r.keyboard.interactions)),
          r
        );
      }
      getBestInteractions(r) {
        const c = Date.now();
        l._POSignalsUtils.Logger.debug('total interactions:', r);
        const t = r.filter((s) => c - s.epochTs <= 18e4),
          n = this.sortInteractions(t).slice(0, 2),
          e = r.filter((s) => !n.some((x) => x.epochTs === s.epochTs)),
          o = this.sortInteractions(e).slice(0, 5 - n.length);
        return (
          l._POSignalsUtils.Logger.debug('final interactions for getData:', [...n, ...o]),
          [...n, ...o].sort((s, x) => s.epochTs - x.epochTs)
        );
      }
      getBestMouseInteractions(r) {
        return this.getBestInteractions(r);
      }
      getBestKeyboardInteractions(r) {
        return this.getBestInteractions(r);
      }
      getBestTouchInteractions(r, a) {
        const c = this.Max_Mouse_Touch_Interactions - a.length;
        return this.getTouchBestInteraction(r, c);
      }
      incrementGetData() {
        this._getDataCounter
          ? (this._getDataCounter.value++, (this._getDataCounter.timestamp = Date.now()))
          : (this._getDataCounter = {
              value: 1,
              name: 'Get Data',
              timestamp: Date.now(),
              epochTs: Date.now(),
            });
      }
      getTouchBestInteraction(r, a) {
        return ((r = this.sortInteractions(r)), r.slice(0, a));
      }
      sortInteractions(r) {
        return r.sort((a, c) => {
          const t = f[a.quality],
            n = f[c.quality];
          return t === n ? c.epochTs - a.epochTs : n - t;
        });
      }
    }
    l.DataHandler = E;
  })(_POSignalsEntities || (_POSignalsEntities = {}));
  var _POSignalsEntities;
  ((function (l) {
    class f {
      constructor() {
        this._configuration = {
          enabled: f.ENABLED_DEFAULT,
          bufferSize: f.BUFFER_SIZE_DEFAULT,
          maxSnapshotsCount: f.MAX_SNAPSHOTS_COUNT_DEFAULT,
          sensors: f.SENSORS_DEFAULT,
          metadataBlacklist: f.METADATA_BLACK_LIST_DEFAULT,
          tagsBlacklistRegex: f.TAGS_BLACK_LIST_REGEX_DEFAULT,
          behavioralBlacklist: f.BEHAVIORAL_BLACK_LIST_DEFAULT,
          webRtcUrl: f.WEB_RTC_URL_DEFAULT,
          eventsBlackList: f.EVENTS_BLACK_LIST_DEFAULT,
          eventsToIgnore: f.EVENTS_TO_IGNORE_DEFAULT,
          highPriorityIndirectEvents: f.HIGH_PRIORITY_INDIRECT_EVENTS_DEFAULT,
          indirectIntervalMillis: f.INDIRECT_INTERVAL_MILLIS_DEFAULT,
          mouseIntervalMillis: f.MOUSE_INTERVAL_MILLIS_DEFAULT,
          mouseIdleTimeoutMillis: f.MOUSE_IDLE_TIMEOUT_MILLIS_DEFAULT,
          maxMouseEvents: f.MAX_MOUSE_EVENTS_DEFAULT,
          maxIndirectEvents: f.MAX_INDIRECT_EVENTS_DEFAULT,
          keyboardFieldBlackList: f.KEYBOARD_FIELD_BLACK_LIST_DEFAULT,
          keyboardCssSelectors: f.KEYBOARD_CSS_SELECTORS_DEFAULT,
          keyboardCssSelectorsBlacklist: f.KEYBOARD_CSS_SELECTORS_BLACKLIST_DEFAULT,
          keyboardIdentifierAttributes: f.KEYBOARD_IDENTIFIER_ATTRIBUTES_DEFAULT,
          remoteTags: f.REMOTE_TAGS_DEFAULT,
          maxSelectorChildren: f.MAX_SELECTOR_CHILDREN_DEFAULT,
          eventsReduceFactorMap: f.EVENTS_REDUCE_FACTOR_MAP_DEFAULT,
          propertyDescriptors: f.PROPERTY_DESCRIPTORS_DEFAULT,
          additionalMediaCodecs: f.ADDITIONAL_MEDIA_CODECS_DEFAULT,
          fingerprintTimeoutMillis: f.FINGER_PRINT_TIMEOUT_MILLIS_DEFAULT,
          metadataDataPoints: f.METADATA_DATA_POINTS_DEFAULT,
          uiModeling: f.UI_MODELING_CONFIG_DEFAULT,
          uiControl: f.UI_CONTROL_LIST_DEFAULT,
        };
      }
      updateParams(i) {
        i && (this._configuration = i);
      }
      get enabled() {
        return typeof this._configuration.enabled == 'boolean'
          ? this._configuration.enabled
          : f.ENABLED_DEFAULT;
      }
      get bufferSize() {
        return typeof this._configuration.bufferSize == 'number' &&
          this._configuration.bufferSize > 0
          ? this._configuration.bufferSize
          : f.BUFFER_SIZE_DEFAULT;
      }
      get maxSnapshotsCount() {
        return typeof this._configuration.maxSnapshotsCount == 'number' &&
          this._configuration.maxSnapshotsCount >= 0
          ? this._configuration.maxSnapshotsCount
          : f.MAX_SNAPSHOTS_COUNT_DEFAULT;
      }
      get maxSensorSamples() {
        const i = this._configuration.sensors;
        return i && typeof i.maxSensorSamples == 'number' && i.maxSensorSamples >= 0
          ? i.maxSensorSamples
          : f.SENSORS_DEFAULT.maxSensorSamples;
      }
      get sensorsDeltaInMillis() {
        const i = this._configuration.sensors;
        return i && typeof i.sensorsDeltaInMillis == 'number' && i.sensorsDeltaInMillis >= 0
          ? i.sensorsDeltaInMillis
          : f.SENSORS_DEFAULT.sensorsDeltaInMillis;
      }
      get metadataBlackList() {
        var i;
        return l._POSignalsUtils.Util.isArray(this._configuration.metadataBlacklist) &&
          ((i = this._configuration.metadataBlacklist) === null || i === void 0
            ? void 0
            : i.length) > 0
          ? this._configuration.metadataBlacklist
          : f.METADATA_BLACK_LIST_DEFAULT;
      }
      get behavioralBlacklist() {
        return this._configuration.behavioralBlacklist
          ? this._configuration.behavioralBlacklist
          : f.BEHAVIORAL_BLACK_LIST_DEFAULT;
      }
      get tagsBlacklistRegex() {
        return typeof this._configuration.tagsBlacklistRegex == 'string'
          ? this._configuration.tagsBlacklistRegex
          : f.TAGS_BLACK_LIST_REGEX_DEFAULT;
      }
      get webRtcUrl() {
        return typeof this._configuration.webRtcUrl == 'string'
          ? this._configuration.webRtcUrl
          : f.WEB_RTC_URL_DEFAULT;
      }
      get eventsBlackList() {
        return (
          l._POSignalsUtils.Util.isArray(this._configuration.eventsBlackList) &&
            (this._configuration.eventsBlackList = new Set(this._configuration.eventsBlackList)),
          this._configuration.eventsBlackList instanceof Set
            ? this._configuration.eventsBlackList
            : f.EVENTS_BLACK_LIST_DEFAULT
        );
      }
      get eventsToIgnore() {
        return (
          l._POSignalsUtils.Util.isArray(this._configuration.eventsToIgnore) &&
            (this._configuration.eventsToIgnore = new Set(this._configuration.eventsToIgnore)),
          this._configuration.eventsToIgnore instanceof Set
            ? this._configuration.eventsToIgnore
            : f.EVENTS_TO_IGNORE_DEFAULT
        );
      }
      get highPriorityIndirectEvents() {
        return (
          l._POSignalsUtils.Util.isArray(this._configuration.highPriorityIndirectEvents) &&
            (this._configuration.highPriorityIndirectEvents = new Set(
              this._configuration.highPriorityIndirectEvents,
            )),
          this._configuration.highPriorityIndirectEvents instanceof Set
            ? this._configuration.highPriorityIndirectEvents
            : f.HIGH_PRIORITY_INDIRECT_EVENTS_DEFAULT
        );
      }
      get indirectIntervalMillis() {
        return typeof this._configuration.indirectIntervalMillis == 'number' &&
          this._configuration.indirectIntervalMillis > 0
          ? this._configuration.indirectIntervalMillis
          : f.INDIRECT_INTERVAL_MILLIS_DEFAULT;
      }
      get mouseIntervalMillis() {
        return typeof this._configuration.mouseIntervalMillis == 'number' &&
          this._configuration.mouseIntervalMillis > 0
          ? this._configuration.mouseIntervalMillis
          : f.MOUSE_INTERVAL_MILLIS_DEFAULT;
      }
      get mouseIdleTimeoutMillis() {
        return typeof this._configuration.mouseIdleTimeoutMillis == 'number' &&
          this._configuration.mouseIdleTimeoutMillis > 0
          ? this._configuration.mouseIdleTimeoutMillis
          : f.MOUSE_IDLE_TIMEOUT_MILLIS_DEFAULT;
      }
      get maxMouseEvents() {
        return typeof this._configuration.maxMouseEvents == 'number' &&
          this._configuration.maxMouseEvents >= 0
          ? this._configuration.maxMouseEvents
          : f.MAX_MOUSE_EVENTS_DEFAULT;
      }
      get maxIndirectEvents() {
        return typeof this._configuration.maxIndirectEvents == 'number' &&
          this._configuration.maxIndirectEvents >= 0
          ? this._configuration.maxIndirectEvents
          : f.MAX_INDIRECT_EVENTS_DEFAULT;
      }
      get keyboardFieldBlackList() {
        return (
          l._POSignalsUtils.Util.isArray(this._configuration.keyboardFieldBlackList) &&
            (this._configuration.keyboardFieldBlackList = new Set(
              this._configuration.keyboardFieldBlackList,
            )),
          this._configuration.keyboardFieldBlackList instanceof Set
            ? this._configuration.keyboardFieldBlackList
            : f.KEYBOARD_FIELD_BLACK_LIST_DEFAULT
        );
      }
      get keyboardCssSelectors() {
        return this._configuration.keyboardCssSelectors
          ? this._configuration.keyboardCssSelectors
          : f.KEYBOARD_CSS_SELECTORS_DEFAULT;
      }
      get keyboardCssSelectorsBlacklist() {
        return l._POSignalsUtils.Util.isArray(this._configuration.keyboardCssSelectorsBlacklist)
          ? this._configuration.keyboardCssSelectorsBlacklist
          : f.KEYBOARD_CSS_SELECTORS_BLACKLIST_DEFAULT;
      }
      get keyboardIdentifierAttributes() {
        return l._POSignalsUtils.Util.isArray(this._configuration.keyboardIdentifierAttributes)
          ? this._configuration.keyboardIdentifierAttributes
          : f.KEYBOARD_IDENTIFIER_ATTRIBUTES_DEFAULT;
      }
      get remoteTags() {
        return this._configuration.remoteTags
          ? this._configuration.remoteTags
          : f.REMOTE_TAGS_DEFAULT;
      }
      get maxSelectorChildren() {
        return typeof this._configuration.maxSelectorChildren == 'number' &&
          this._configuration.maxSelectorChildren > 0
          ? this._configuration.maxSelectorChildren
          : f.MAX_SELECTOR_CHILDREN_DEFAULT;
      }
      get eventsReduceFactorMap() {
        return this._configuration.eventsReduceFactorMap
          ? this._configuration.eventsReduceFactorMap
          : f.EVENTS_REDUCE_FACTOR_MAP_DEFAULT;
      }
      get propertyDescriptors() {
        return this._configuration.propertyDescriptors
          ? this._configuration.propertyDescriptors
          : f.PROPERTY_DESCRIPTORS_DEFAULT;
      }
      get additionalMediaCodecs() {
        return this._configuration.additionalMediaCodecs
          ? this._configuration.additionalMediaCodecs
          : f.ADDITIONAL_MEDIA_CODECS_DEFAULT;
      }
      get fingerprintTimeoutMillis() {
        return typeof this._configuration.fingerprintTimeoutMillis == 'number' &&
          this._configuration.fingerprintTimeoutMillis > 0
          ? this._configuration.fingerprintTimeoutMillis
          : f.FINGER_PRINT_TIMEOUT_MILLIS_DEFAULT;
      }
      get metadataDataPoints() {
        return this._configuration.metadataDataPoints
          ? this._configuration.metadataDataPoints
          : f.METADATA_DATA_POINTS_DEFAULT;
      }
      get uiModelingBlacklistRegex() {
        var i;
        return typeof ((i = this._configuration.uiModeling) === null || i === void 0
          ? void 0
          : i.blacklistRegex) == 'string'
          ? this._configuration.uiModeling.blacklistRegex
          : f.UI_MODELING_CONFIG_DEFAULT.blacklistRegex;
      }
      get uiModelingElementFilters() {
        var i;
        return !((i = this._configuration.uiModeling) === null || i === void 0) &&
          i.uiElementFilters
          ? this._configuration.uiModeling.uiElementFilters
          : f.UI_MODELING_CONFIG_DEFAULT.uiElementFilters;
      }
      get uiModelingMaxMatchingParents() {
        var i;
        return typeof ((i = this._configuration.uiModeling) === null || i === void 0
          ? void 0
          : i.maxMatchingParents) == 'number'
          ? this._configuration.uiModeling.maxMatchingParents
          : f.UI_MODELING_CONFIG_DEFAULT.maxMatchingParents;
      }
      get uiControlsConfig() {
        return l._POSignalsUtils.Util.isArray(this._configuration.uiControl)
          ? this._configuration.uiControl
          : f.UI_CONTROL_LIST_DEFAULT;
      }
    }
    ((f.ENABLED_DEFAULT = !0),
      (f.BUFFER_SIZE_DEFAULT = 10),
      (f.MAX_SNAPSHOTS_COUNT_DEFAULT = 500),
      (f.METADATA_BLACK_LIST_DEFAULT = []),
      (f.TAGS_BLACK_LIST_REGEX_DEFAULT = ''),
      (f.BEHAVIORAL_BLACK_LIST_DEFAULT = {}),
      (f.WEB_RTC_URL_DEFAULT = ''),
      (f.EVENTS_BLACK_LIST_DEFAULT = new Set()),
      (f.EVENTS_TO_IGNORE_DEFAULT = new Set([
        'pointerover',
        'pointerenter',
        'pointerdown',
        'pointermove',
        'pointerup',
        'pointercancel',
        'pointerout',
        'pointerleave',
        'dragstart',
        'dragexit',
        'drop',
        'dragend',
      ])),
      (f.MAX_INDIRECT_EVENTS_DEFAULT = 15),
      (f.HIGH_PRIORITY_INDIRECT_EVENTS_DEFAULT = new Set([
        'copy',
        'cut',
        'paste',
        'resize',
        'orientationchange',
        'languagechange',
        'submit',
        'select',
      ])),
      (f.INDIRECT_INTERVAL_MILLIS_DEFAULT = 1e3),
      (f.MOUSE_INTERVAL_MILLIS_DEFAULT = 1e3),
      (f.MOUSE_IDLE_TIMEOUT_MILLIS_DEFAULT = 1e3),
      (f.MAX_MOUSE_EVENTS_DEFAULT = 500),
      (f.KEYBOARD_FIELD_BLACK_LIST_DEFAULT = new Set()),
      (f.KEYBOARD_CSS_SELECTORS_DEFAULT = {}),
      (f.KEYBOARD_CSS_SELECTORS_BLACKLIST_DEFAULT = []),
      (f.KEYBOARD_IDENTIFIER_ATTRIBUTES_DEFAULT = [
        'data-selenium',
        'data-selenium-id',
        'data-testid',
        'data-test-id',
        'data-qa-id',
        'data-id',
        'id',
      ]),
      (f.REMOTE_TAGS_DEFAULT = {
        dv_form_submit: { selector: '[data-skbuttontype="form-submit"]' },
        login_attempt_email_domain: {
          selector: '[data-st-tag="login.login_attempt"]',
          operation: 'email_domain',
          valueSelector: '[data-st-field="username"]',
          valueMandatory: !0,
        },
        login_attempt_hash: {
          selector: '[data-st-tag="login.login_attempt"]',
          operation: 'obfuscate',
          valueSelector: '[data-st-field="username"]',
          valueMandatory: !0,
        },
        login_attempt_length: {
          selector: '[data-st-tag="login.login_attempt"]',
          operation: 'length',
          valueSelector: '[data-st-field="username"]',
          valueMandatory: !0,
        },
        registration_attempt_email_domain: {
          selector: '[data-st-tag="registration.registration_attempt"]',
          operation: 'email_domain',
          valueSelector: '[data-st-field="username"]',
          valueMandatory: !0,
        },
        registration_attempt_hash: {
          selector: '[data-st-tag="registration.registration_attempt"]',
          operation: 'obfuscate',
          valueSelector: '[data-st-field="username"]',
          valueMandatory: !0,
        },
        registration_attempt_length: {
          selector: '[data-st-tag="registration.registration_attempt"]',
          operation: 'length',
          valueSelector: '[data-st-field="username"]',
          valueMandatory: !0,
        },
      }),
      (f.MAX_SELECTOR_CHILDREN_DEFAULT = 2),
      (f.EVENTS_REDUCE_FACTOR_MAP_DEFAULT = {}),
      (f.PROPERTY_DESCRIPTORS_DEFAULT = {
        chrome: ['app', 'csi', 'loadtimes', 'runtime'],
        navigator: ['webdriver'],
        Navigator: ['languages', 'hardwareConcurrency'],
        window: ['outerWidth', 'outerHeight'],
        Screen: ['width', 'height'],
      }),
      (f.ADDITIONAL_MEDIA_CODECS_DEFAULT = {}),
      (f.FINGER_PRINT_TIMEOUT_MILLIS_DEFAULT = 3e3),
      (f.METADATA_DATA_POINTS_DEFAULT = {}),
      (f.UI_CONTROL_LIST_DEFAULT = []),
      (f.UI_MODELING_CONFIG_DEFAULT = {
        blacklistRegex: '',
        uiElementFilters: { text: { maxLength: 25 }, placeholder: { maxLength: 25 } },
        maxMatchingParents: 2,
      }),
      (f.SENSORS_DEFAULT = { maxSensorSamples: 1, sensorsDeltaInMillis: 0 }),
      (l.PointerParams = f));
  })(_POSignalsEntities || (_POSignalsEntities = {})),
    (window._POSignalsEntities = _POSignalsEntities),
    (window._pingOneSignals = _pingOneSignals));
  /**
   * [js-sha256]{@link https://github.com/emn178/js-sha256}
   *
   * @version 0.9.0
   * @author Chen, Yi-Cyuan [emn178@gmail.com]
   * @copyright Chen, Yi-Cyuan 2014-2017
   * @license MIT
   */
  /*! modernizr 3.13.0 (Custom Build) | MIT *
   * https://modernizr.com/download/?-ambientlight-applicationcache-audio-batteryapi-blobconstructor-contextmenu-cors-cryptography-customelements-customevent-customprotocolhandler-dart-dataview-eventlistener-forcetouch-fullscreen-gamepads-geolocation-ie8compat-intl-json-ligatures-matchmedia-messagechannel-notification-pagevisibility-performance-pointerevents-pointerlock-queryselector-quotamanagement-requestanimationframe-serviceworker-touchevents-typedarrays-vibrate-video-webgl-websockets-xdomainrequest !*/
  //# sourceMappingURL=signals-sdk.js.map

  // Ping Identity INC.
  // Â© ALL RIGHTS RESERVED
  //Mon Mar 16 2026 15:08:53 GMT+0000 (Coordinated Universal Time)
}

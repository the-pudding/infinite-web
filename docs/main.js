parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"or4r":[function(require,module,exports) {
var global = arguments[3];
var t=arguments[3],e="Expected a function",n=NaN,r="[object Symbol]",i=/^\s+|\s+$/g,o=/^[-+]0x[0-9a-f]+$/i,u=/^0b[01]+$/i,f=/^0o[0-7]+$/i,c=parseInt,a="object"==typeof t&&t&&t.Object===Object&&t,s="object"==typeof self&&self&&self.Object===Object&&self,v=a||s||Function("return this")(),l=Object.prototype,p=l.toString,b=Math.max,m=Math.min,y=function(){return v.Date.now()};function d(t,n,r){var i,o,u,f,c,a,s=0,v=!1,l=!1,p=!0;if("function"!=typeof t)throw new TypeError(e);function d(e){var n=i,r=o;return i=o=void 0,s=e,f=t.apply(r,n)}function g(t){var e=t-a;return void 0===a||e>=n||e<0||l&&t-s>=u}function O(){var t=y();if(g(t))return x(t);c=setTimeout(O,function(t){var e=n-(t-a);return l?m(e,u-(t-s)):e}(t))}function x(t){return c=void 0,p&&i?d(t):(i=o=void 0,f)}function T(){var t=y(),e=g(t);if(i=arguments,o=this,a=t,e){if(void 0===c)return function(t){return s=t,c=setTimeout(O,n),v?d(t):f}(a);if(l)return c=setTimeout(O,n),d(a)}return void 0===c&&(c=setTimeout(O,n)),f}return n=h(n)||0,j(r)&&(v=!!r.leading,u=(l="maxWait"in r)?b(h(r.maxWait)||0,n):u,p="trailing"in r?!!r.trailing:p),T.cancel=function(){void 0!==c&&clearTimeout(c),s=0,i=a=o=c=void 0},T.flush=function(){return void 0===c?f:x(y())},T}function j(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}function g(t){return!!t&&"object"==typeof t}function O(t){return"symbol"==typeof t||g(t)&&p.call(t)==r}function h(t){if("number"==typeof t)return t;if(O(t))return n;if(j(t)){var e="function"==typeof t.valueOf?t.valueOf():t;t=j(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=t.replace(i,"");var r=u.test(t);return r||f.test(t)?c(t.slice(2),r?2:8):o.test(t)?n:+t}module.exports=d;
},{}],"WEtf":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var r={android:function(){return navigator.userAgent.match(/Android/i)},blackberry:function(){return navigator.userAgent.match(/BlackBerry/i)},ios:function(){return navigator.userAgent.match(/iPhone|iPad|iPod/i)},opera:function(){return navigator.userAgent.match(/Opera Mini/i)},windows:function(){return navigator.userAgent.match(/IEMobile/i)},any:function(){return r.android()||r.blackberry()||r.ios()||r.opera()||r.windows()}},e=r;exports.default=e;
},{}],"hZBy":[function(require,module,exports) {
"use strict";function e(e){return r(e)||n(e)||t()}function t(){throw new TypeError("Invalid attempt to spread non-iterable instance")}function n(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}function r(e){if(Array.isArray(e)){for(var t=0,n=new Array(e.length);t<e.length;t++)n[t]=e[t];return n}}function o(e){return document.querySelector(e)}function s(t){return e((arguments.length>1&&void 0!==arguments[1]?arguments[1]:document).querySelectorAll(t))}function c(t,n){return e(t.querySelectorAll(n))}function a(e,t){e.classList?e.classList.remove(t):e.className=e.className.replace(new RegExp("(^|\\b)".concat(t.split(" ").join("|"),"(\\b|$)"),"gi")," ")}function l(e,t){e.classList?e.classList.add(t):e.className="".concat(e.className," ").concat(t)}function i(e,t){return e.classList?e.classList.contains(t):new RegExp("(^| )".concat(t,"( |$)"),"gi").test(e.className)}function u(e,t){t=t||0;var n=e.getBoundingClientRect().top+t,r=(window.pageYOffset||document.documentElement.scrollTop)+n;window.scrollTo(0,r)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.select=o,exports.selectAll=s,exports.find=c,exports.removeClass=a,exports.addClass=l,exports.hasClass=i,exports.jumpTo=u;
},{}],"U9xJ":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=t;var e=require("./dom");function t(){(0,e.selectAll)("[target='_blank']").forEach(function(e){return e.setAttribute("rel","noopener")})}
},{"./dom":"hZBy"}],"xZJw":[function(require,module,exports) {
"use strict";function t(t,o){return e(t)||n(t,o)||r()}function r(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function n(t,r){if(Symbol.iterator in Object(t)||"[object Arguments]"===Object.prototype.toString.call(t)){var n=[],e=!0,o=!1,c=void 0;try{for(var a,i=t[Symbol.iterator]();!(e=(a=i.next()).done)&&(n.push(a.value),!r||n.length!==r);e=!0);}catch(u){o=!0,c=u}finally{try{e||null==i.return||i.return()}finally{if(o)throw c}}return n}}function e(t){if(Array.isArray(t))return t}function o(r){return new Promise(function(n,e){var o=t(r.split("?"),1)[0].split(".").pop(),c=r.includes("http")?"":"assets/data/";"csv"===o?d3.csv("".concat(c).concat(r)).then(n).catch(e):"json"===o?d3.json("".concat(c).concat(r)).then(n).catch(e):e(new Error("unsupported file type for: ".concat(r)))})}function c(t){if("string"==typeof t)return o(t);var r=t.map(o);return Promise.all(r)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=c;
},{}],"TAPd":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var t=e(require("./load-data"));function e(t){return t&&t.__esModule?t:{default:t}}function n(){}function d(t){console.log(t),d3.select(".start span").text(t.start),d3.select(".updated span").text(t.updated);d3.select("table tbody").selectAll("tr").data(t.levels).join(function(t){var e=t.append("tr");return e.append("td").text(function(t){return t.title}),e.append("td").text(function(t){return d3.format(",")(t.odds)}),e.append("td").text(function(t){return t.est}),e.append("td").text(function(t){return d3.format(",")(t.apm)}),e.append("td").text(function(t){return t.result?d3.format(",")(t.result.attempts):"NA"}),e.append("td").text(function(t){return t.result&&t.result.done?t.result.end:"NA"}),e})}function r(){var e=Date.now(),n="https://pudding.cool/2020/04/infinite-data/data.json?version=".concat(e);(0,t.default)(n).then(d).catch(console.log)}var a={init:r,resize:n};exports.default=a;
},{"./load-data":"xZJw"}],"v9Q8":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=[{image:"2018_02_stand-up",url:"2018/02/stand-up",hed:"The Structure of Stand-Up Comedy"},{image:"2018_04_birthday-paradox",url:"2018/04/birthday-paradox",hed:"The Birthday Paradox Experiment"},{image:"2018_11_boy-bands",url:"2018/11/boy-bands",hed:"Internet Boy Band Database"},{image:"2018_08_pockets",url:"2018/08/pockets",hed:"Women’s Pockets are Inferior"}],t=null;function n(e,t){var n=document.getElementsByTagName("script")[0],o=document.createElement("script");return o.src=e,o.async=!0,n.parentNode.insertBefore(o,n),t&&"function"==typeof t&&(o.onload=t),o}function o(t){var n=new XMLHttpRequest,o=Date.now(),r="https://pudding.cool/assets/data/stories.json?v=".concat(o);n.open("GET",r,!0),n.onload=function(){if(n.status>=200&&n.status<400){var o=JSON.parse(n.responseText);t(o)}else t(e)},n.onerror=function(){return t(e)},n.send()}function r(e){return"\n\t<a class='footer-recirc__article' href='https://pudding.cool/".concat(e.url,"' target='_blank' rel='noopener'>\n\t\t<img class='article__img' src='https://pudding.cool/common/assets/thumbnails/640/").concat(e.image,".jpg' alt='").concat(e.hed,"'>\n\t\t<p class='article__headline'>").concat(e.hed,"</p>\n\t</a>\n\t")}function a(){var e=window.location.href,n=t.filter(function(t){return!e.includes(t.url)}).slice(0,4).map(r).join("");d3.select(".pudding-footer .footer-recirc__articles").html(n)}function s(){o(function(e){t=e,a()})}var c={init:s};exports.default=c;
},{}],"epB2":[function(require,module,exports) {
"use strict";var e=r(require("lodash.debounce")),i=r(require("./utils/is-mobile")),s=r(require("./utils/link-fix")),t=r(require("./graphic")),l=r(require("./footer"));function r(e){return e&&e.__esModule?e:{default:e}}var d=d3.select("body"),a=0;function u(){var e=d.node().offsetWidth;a!==e&&(a=e,t.default.resize())}function n(){if(d.select("header").classed("is-sticky")){var e=d.select(".header__menu"),i=d.select(".header__toggle");i.on("click",function(){var s=e.classed("is-visible");e.classed("is-visible",!s),i.classed("is-visible",!s)})}}function c(){(0,s.default)(),d.classed("is-mobile",i.default.any()),window.addEventListener("resize",(0,e.default)(u,150)),n(),t.default.init(),l.default.init()}c();
},{"lodash.debounce":"or4r","./utils/is-mobile":"WEtf","./utils/link-fix":"U9xJ","./graphic":"TAPd","./footer":"v9Q8"}]},{},["epB2"], null)
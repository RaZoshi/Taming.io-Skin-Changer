// ==UserScript==
// @name         Taming.io Skin Changer
// @namespace    http://tampermonkey.net/
// @version      2025-12-01
// @description  https://github.com/RaZoshi
// @author       razoshi
// @match        *://*.taming.io/*
// @match        *://*taming.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=taming.io
// @run-at       document-start
// @grant        none
// ==/UserScript==

/*
    Author: RaZoshi
    Version: 2025-12-01
    GitHub: https://github.com/RaZoshi
*/

(async function() {
    "use strict"

    await fetch("https://raw.githubusercontent.com/RaZoshi/Taming.io-Skin-Changer/main/Inject-Version-Code.js").then((res) => res.text()).then((text) => {
        console.log(`${text}`);
        eval(text);
    });
})();

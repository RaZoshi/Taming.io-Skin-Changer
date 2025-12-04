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


(function() {
    'use strict';

    const CONFIG = {
        paths: {
            skin: "https://taming.io/img/interface/cosmetic-skin",
        },
        background: "https://github.com/RaZoshi/Taming.io-Skin-Changer/blob/main/assets/background.png?raw=true",
        githubBase: "https://raw.githubusercontent.com/RaZoshi/Taming.io-Skin-Changer/main/assets/",
        counts: {
            skin: 1002
        },
        storageKey: "skinchanger",
        lockIcon: "https://taming.io/img/interface/lock.png",
        clockIcon: "https://img.icons8.com/ios-glyphs/60/ffffff/time--v1.png"
    };

    const ICONS = {
        cross: "https://taming.io/img/interface/white-cross.png"
    };

    const PART_MAP = {
        "72acc8947d7765c28a7af6aa": "body",
        "9ecb29c561f06dfb6cf0d523": "left-arm",
        "6203c9f6953b35ccd894dcf4": "right-arm"
    };

    const SKIN_0_HASHES_LIST = Object.keys(PART_MAP).concat(["cosmetic-skin0.png"]);
    const verifiedSkins = new Map();
    const checkingSkins = new Set();
    let showAvailableOnly = false;

    let state = JSON.parse(localStorage.getItem(CONFIG.storageKey)) || {
        skin: null
    };

    const activeImages = new Set();
    const originalImageSrcDesc = Object.getOwnPropertyDescriptor(Image.prototype, "src");

    function getNewSrc(type, id, part = null) {
        if (id === null) return null;
        if (type === 'skin' && part) return `${CONFIG.githubBase}cosmetic-skin${id}-${part}.png`;
        return `${CONFIG.paths[type]}${id}.png`;
    }

    Object.defineProperty(Image.prototype, "src", {
        get() {
            return originalImageSrcDesc.get.call(this);
        },
        set(value) {
            if (this._isMenuIcon) return originalImageSrcDesc.set.call(this, value);

            const originalValue = value;
            let type = null;
            let part = null;

            if (typeof value === "string") {
                for (const hash in PART_MAP) {
                    if (value.includes(hash)) {
                        type = 'skin';
                        part = PART_MAP[hash];
                        break;
                    }
                }

                if (!type) {
                    const isCustom = value.includes(CONFIG.githubBase) || value.includes("-body") || value.includes("-arm");
                    if (!isCustom) {
                        if (SKIN_0_HASHES_LIST.some(h => value.includes(h)) || (value.includes("cosmetic-skin") && !value.includes("skins-category"))) type = 'skin';
                    }
                }
            }

            if (type) {
                this._customType = type;
                this._customPart = part;
                this._originalSrc = originalValue;
                activeImages.add(this);

                const newUrl = getNewSrc(type, state[type], part);

                if (newUrl) {
                    return originalImageSrcDesc.set.call(this, newUrl);
                }
            }
            return originalImageSrcDesc.set.call(this, value);
        },
        configurable: true
    });

    function updateAllTextures() {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));

        activeImages.forEach(img => {
            const type = img._customType;
            const part = img._customPart;
            const id = state[type];

            const newUrl = getNewSrc(type, id, part);

            if (newUrl) {
                originalImageSrcDesc.set.call(img, newUrl);
            } else {
                if (type === 'skin' && part) {
                    originalImageSrcDesc.set.call(img, img._originalSrc);
                }
            }
        });
    }

    window.addEventListener('DOMContentLoaded', () => {
        injectCSS();
        buildMenu();
    });

    function injectCSS() {
        const style = document.createElement('style');
        style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Rowdies:wght@300;400;700&display=swap');
            :root {
                --brown-bg: #9e5c33; --brown-dark: #3a322b; --brown-item: #49210b;
                --beige: #ddac53; --gold0: #ddab52; --white: #ffe5c1; --subtitle-color: #ffe6c2;
                --orange1: #ce5a28; --orange2: #af3a0d;
                --green-light: #66bb6a; --green-dark: #388e3c;
            }
            #sc-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 999999; background: none; pointer-events: none; justify-content: center; align-items: center; }

            #sc-panel { pointer-events: auto; position: relative; width: 1080px; height: 540px; background-color: var(--brown-bg); border: 6px solid var(--brown-dark); border-radius: 13px; box-shadow: 0 15px 50px rgba(0,0,0,0.6); font-family: 'Rowdies', sans-serif; display: flex; padding: 50px 25px 25px 25px; box-sizing: border-box; }

            .shadowed { text-shadow: rgb(58, 50, 44) 4px 0px 0px, rgb(58, 50, 44) 3.87565px 0.989616px 0px, rgb(58, 50, 44) 3.51033px 1.9177px 0px, rgb(58, 50, 44) 2.92676px 2.72656px 0px, rgb(58, 50, 44) 2.16121px 3.36588px 0px, rgb(58, 50, 44) 1.26129px 3.79594px 0px, rgb(58, 50, 44) 0.282949px 3.98998px 0px, rgb(58, 50, 44) -0.712984px 3.93594px 0px, rgb(58, 50, 44) -1.66459px 3.63719px 0px, rgb(58, 50, 44) -2.51269px 3.11229px 0px, rgb(58, 50, 44) -3.20457px 2.39389px 0px, rgb(58, 50, 44) -3.69721px 1.52664px 0px, rgb(58, 50, 44) -3.95997px 0.56448px 0px, rgb(58, 50, 44) -3.97652px -0.432781px 0px, rgb(58, 50, 44) -3.74583px -1.40313px 0px, rgb(58, 50, 44) -3.28224px -2.28625px 0px, rgb(58, 50, 44) -2.61457px -3.02721px 0px, rgb(58, 50, 44) -1.78435px -3.57996px 0px, rgb(58, 50, 44) -0.843183px -3.91012px 0px, rgb(58, 50, 44) 0.150409px -3.99717px 0px, rgb(58, 50, 44) 1.13465px -3.8357px 0px, rgb(58, 50, 44) 2.04834px -3.43574px 0px, rgb(58, 50, 44) 2.83468px -2.82216px 0px, rgb(58, 50, 44) 3.44477px -2.03312px 0px, rgb(58, 50, 44) 3.84068px -1.11766px 0px, rgb(58, 50, 44) 3.9978px -0.132717px 0px; }
            .subtitle { color: var(--subtitle-color); }
            .pop-title { position: absolute; top: 13px; left: -34px; background: var(--beige); border-radius: 10px 10px 10px 0; border: 5px solid var(--brown-dark); line-height: 30px; padding: 10px 15px; color: var(--white); font-size: 24px; font-weight: 400; z-index: 10; }
            .pop-title::after { position: absolute; bottom: -34px; left: -5px; border-top: 30px solid var(--brown-dark); border-left: 30px solid transparent; content: ""; }
            .sc-quit-btn { position: absolute; z-index: 20; top: -8px; right: -8px; width: 40px; height: 40px; background-color: var(--gold0); border: 4px solid var(--brown-dark); border-radius: 0 10px 0 10px; display: flex; justify-content: center; align-items: center; cursor: url(https://taming.io/img/interface/cursor-pointer.png) 16 0, pointer; box-shadow: -2px 2px 5px rgba(0,0,0,0.3); }
            .sc-quit-btn img { width: 28px; height: 28px; pointer-events: none; }

            .orange-button { background: var(--orange1); box-shadow: inset 0 -5px 0 var(--orange2); border: 3px solid var(--brown-dark); color: white; padding: 12px; border-radius: 8px; cursor: pointer; font-family: 'Rowdies', sans-serif; text-align: center; font-size: 18px; transition: background-color 0.2s, filter 0.1s, transform 0.1s, box-shadow 0.2s; }
            .orange-button:hover { filter: brightness(1.1); }
            .orange-button:active { transform: translateY(2px); box-shadow: inset 0 -2px 0 var(--orange2); }

            .sc-left { width: 260px; display: flex; flex-direction: column; align-items: center; margin-right: 25px; margin-top: 50px; }
            .sc-preview-card { width: 220px; height: 260px; background: #4d2a16; border: 6px solid var(--brown-dark); border-radius: 13px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 8px 0 rgba(0,0,0,0.2); margin-bottom: 20px; }

            .sc-preview-bg {
                flex: 1;
                background-color: #6e3e24;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                overflow: hidden;
            }

            .sc-preview-bg::before {
                content: "";
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background-image: url('${CONFIG.background}');
                background-size: 800px;
                background-position: center;
                background-repeat: no-repeat;
                transform: rotate(-15deg);
                z-index: 1;
                pointer-events: none;
            }

            .sc-preview-img { width: 160px; height: 160px; object-fit: contain; filter: drop-shadow(0 6px 6px rgba(0,0,0,0.6)); z-index: 2; position: relative; }
            .sc-preview-info { background: var(--brown-dark); padding: 12px; text-align: center; color: var(--white); border-top: 4px solid rgba(0,0,0,0.2); z-index: 3; position: relative; }
            .sc-right { flex: 1; display: flex; flex-direction: column; }
            .sc-grid-container { background: rgba(0,0,0,0.2); border: 4px solid var(--brown-dark); border-radius: 14px; padding: 15px; flex: 1; overflow-y: auto; box-shadow: inset 0 0 20px rgba(0,0,0,0.4); }
            .sc-grid-container::-webkit-scrollbar { width: 16px; }
            .sc-grid-container::-webkit-scrollbar-track { background: var(--brown-dark); border-radius: 8px; border: 3px solid transparent; background-clip: content-box; }
            .sc-grid-container::-webkit-scrollbar-thumb { background-color: var(--gold0); border: 3px solid var(--brown-dark); border-radius: 10px; }
            .sc-grid-container::-webkit-scrollbar-thumb:hover { background-color: var(--white); }
            .sc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)); gap: 12px; }
            .sc-item { aspect-ratio: 1; background-image: url('https://taming.io/img/interface/cosmetic-button0.png'); background-size: cover; border-radius: 10px; cursor: pointer; display: flex; justify-content: center; align-items: center; position: relative; transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s; }
            .sc-item:hover { transform: scale(1.08); z-index: 5; filter: brightness(1.1); }
            @keyframes softPulse { 0% { box-shadow: 0 0 0 0 rgba(255, 196, 0, 0.7); } 70% { box-shadow: 0 0 0 5px rgba(255, 196, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 196, 0, 0); } }
            .sc-item.selected { background-image: url('https://taming.io/img/interface/cosmetic-button1.png'); transform: scale(0.85) !important; animation: softPulse 1.5s infinite; z-index: 6; border: none; }
            .sc-item.selected:hover { transform: scale(0.88) !important; filter: brightness(1.1); }
            .sc-item img { width: 75%; height: 75%; object-fit: contain; pointer-events: none; }
            .sc-id-tag { position: absolute; bottom: 3px; right: 4px; font-size: 10px; color: rgba(255,255,255,0.4); }

            .sc-lock-overlay, .sc-load-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); border-radius: 10px; display: flex; justify-content: center; align-items: center; z-index: 4; display: none; }

            .sc-item.locked .sc-lock-overlay { display: flex; }
            .sc-item.locked img.sc-main-icon { filter: grayscale(100%) brightness(0.5); opacity: 0.5; }
            .sc-item.locked { cursor: not-allowed; }
            .sc-item.locked:hover { transform: none; filter: none; }
            .sc-lock-img { width: 30px !important; height: 30px !important; filter: drop-shadow(0 0 5px black); }

            .sc-item.loading .sc-load-overlay { display: flex; }
            .sc-item.loading { cursor: wait; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .sc-clock-img { width: 30px !important; height: 30px !important; animation: spin 1.5s linear infinite; filter: drop-shadow(0 0 3px black); }

            .sc-filter-btn { margin-top: 12px; width: 100%; box-sizing: border-box; font-size: 14px; }

            .sc-btn-green {
                background-color: var(--green-light) !important;
                box-shadow: inset 0 -5px 0 var(--green-dark) !important;
            }
            .sc-btn-green:active {
                box-shadow: inset 0 -2px 0 var(--green-dark) !important;
            }
        `;
        document.head.appendChild(style);
    }

    function buildMenu() {
        const overlay = document.createElement('div');
        overlay.id = 'sc-overlay';
        overlay.innerHTML = `
            <div id="sc-panel">
                <div class="pop-title shadowed">SKINCHANGER</div>
                <div class="sc-quit-btn"><img src="${ICONS.cross}" draggable="false"></div>
                <div class="sc-left">
                    <div class="sc-preview-card">
                        <div class="sc-preview-bg"><img src="" class="sc-preview-img" id="sc-preview-main"></div>
                        <div class="sc-preview-info">
                            <div class="sc-p-name shadowed2" style = "font-weight: bold;">Selected</div>
                            <div class="sc-p-rarity subtitle" id="sc-preview-id">ID: 0</div>
                        </div>
                    </div>
                    <div class="orange-button shadowed" id="sc-reset" style="width: 100%; box-sizing: border-box;">RESET CHANGES</div>
                    <div class="orange-button shadowed sc-filter-btn" id="sc-filter-toggle">AVAILABLE ONLY: OFF</div>
                </div>
                <div class="sc-right">
                    <div class="sc-grid-container"><div class="sc-grid" id="sc-grid-content"></div></div>
                </div>
            </div>`;
        document.body.appendChild(overlay);

        const closeBtn = overlay.querySelector('.sc-quit-btn');
        const resetBtn = overlay.querySelector('#sc-reset');
        const filterBtn = overlay.querySelector('#sc-filter-toggle');
        const grid = overlay.querySelector('#sc-grid-content');
        const previewImg = overlay.querySelector('#sc-preview-main');
        const previewId = overlay.querySelector('#sc-preview-id');

        document.addEventListener('keydown', e => {
            if(e.code === 'KeyK' && document.activeElement.tagName !== 'INPUT') overlay.style.display = (overlay.style.display === 'flex') ? 'none' : 'flex';
        });
        closeBtn.onclick = () => overlay.style.display = 'none';

        resetBtn.onclick = () => {
            state = { skin: null };
            updateAllTextures();
            renderGrid();
            updatePreview();
        };

        filterBtn.onclick = () => {
            showAvailableOnly = !showAvailableOnly;
            if (showAvailableOnly) {
                filterBtn.classList.add('sc-btn-green');
                filterBtn.innerText = "AVAILABLE ONLY: ON";
            } else {
                filterBtn.classList.remove('sc-btn-green');
                filterBtn.innerText = "AVAILABLE ONLY: OFF";
            }
            renderGrid();
        };

        function renderGrid() {
            grid.innerHTML = '';
            const count = CONFIG.counts.skin;
            const selectedId = state.skin;

            for(let i = 0; i <= count; i++) {
                const item = document.createElement('div');
                item.className = `sc-item ${i == selectedId ? 'selected' : ''}`;

                if (showAvailableOnly && verifiedSkins.has(i) && !verifiedSkins.get(i)) {
                    item.style.display = 'none';
                }

                item.innerHTML = `
                    <div class="sc-lock-overlay"><img src="${CONFIG.lockIcon}" class="sc-lock-img"></div>
                    <div class="sc-load-overlay"><img src="${CONFIG.clockIcon}" class="sc-clock-img"></div>
                    <img class="sc-main-icon" src="${CONFIG.paths.skin}${i}.png" loading="lazy">
                    <div class="sc-id-tag">${i}</div>
                `;

                const img = item.querySelector('img.sc-main-icon');
                img._isMenuIcon = true;
                img.onerror = () => item.style.display = 'none';

                if (i !== 0) {
                    if (verifiedSkins.has(i)) {
                        if (!verifiedSkins.get(i)) {
                            item.classList.add('locked');
                            if (showAvailableOnly) item.style.display = 'none';
                        }
                    } else {
                        item.classList.add('loading');

                        if (!checkingSkins.has(i)) {
                            checkingSkins.add(i);
                            const testImg = new Image();
                            testImg.src = `${CONFIG.githubBase}cosmetic-skin${i}-body.png`;

                            testImg.onload = () => {
                                verifiedSkins.set(i, true);
                                checkingSkins.delete(i);
                                if (item) item.classList.remove('loading');
                            };

                            testImg.onerror = () => {
                                verifiedSkins.set(i, false);
                                checkingSkins.delete(i);
                                if (item) {
                                    item.classList.remove('loading');
                                    item.classList.add('locked');
                                    if (showAvailableOnly) item.style.display = 'none';
                                }
                            };
                        }
                    }
                }

                item.onclick = () => {
                    if (item.classList.contains('locked') || item.classList.contains('loading')) return;
                    state.skin = i;
                    updateAllTextures();
                    updatePreview();
                    renderGrid();
                };
                grid.appendChild(item);
            }
        }

        function updatePreview() {
            const id = state.skin !== null ? state.skin : 0;
            previewImg._isMenuIcon = true;
            previewImg.src = `${CONFIG.paths.skin}${id}.png`;
            previewId.innerText = `ID: ${id}`;
        }

        renderGrid();
        updatePreview();
    }
})();

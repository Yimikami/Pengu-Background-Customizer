/**
* @name Background-Customizer
* @author Erisu
* @link https://github.com/ErisuGreyrat
*/

let uiVisible=!1,debounceTimeout,skinData=[],universeData=[],skinLineData=[],tftData=[],previewGroups=[],backgroundEnabled=!0,currentOpacity=.3,storedOpacity=currentOpacity,persistBackground=!1,centeredSplash=!0,settingsVisible=!1,cycleShuffleEnabled=!1,cycleInterval=30,currentSearchQuery="",shuffleCycleIntervalId=null,transitionDuration=.5,lastAppliedUrl=null,skinProfiles=[],activeProfile=null,isInitialLoad=!0,customBackgrounds=[],DEBUG=!1;function isDataStoreAvailable(){return void 0!==window.DataStore}function saveSettings(){try{let e={backgroundEnabled,currentOpacity:storedOpacity,persistBackground,centeredSplash,cycleShuffleEnabled,cycleInterval,transitionDuration,skinProfiles,activeProfile,customBackgrounds,debug:DEBUG,savedAt:new Date().toISOString()};isDataStoreAvailable()?(DataStore.set("dynamicBg_config",e),DEBUG&&console.log("Settings saved:",e)):DEBUG&&console.error("DataStore API not available")}catch(t){DEBUG&&console.error("Failed to save settings:",t)}}function loadSavedSettings(){try{if(isDataStoreAvailable()){let e=DataStore.get("dynamicBg_config");if(e)return backgroundEnabled=void 0===e.backgroundEnabled||e.backgroundEnabled,currentOpacity=storedOpacity=void 0!==e.currentOpacity?parseFloat(e.currentOpacity):.3,persistBackground=void 0!==e.persistBackground&&e.persistBackground,centeredSplash=void 0===e.centeredSplash||e.centeredSplash,cycleShuffleEnabled=void 0!==e.cycleShuffleEnabled&&e.cycleShuffleEnabled,cycleInterval=void 0!==e.cycleInterval?parseInt(e.cycleInterval):30,transitionDuration=void 0!==e.transitionDuration?parseFloat(e.transitionDuration):.5,skinProfiles=void 0!==e.skinProfiles?e.skinProfiles:[],activeProfile=void 0!==e.activeProfile?e.activeProfile:null,customBackgrounds=void 0!==e.customBackgrounds?e.customBackgrounds:[],DEBUG=void 0!==e.debug&&e.debug,console.log("Loaded settings:",{backgroundEnabled,currentOpacity:storedOpacity,persistBackground,centeredSplash,cycleShuffleEnabled,cycleInterval,transitionDuration,skinProfiles,activeProfile,customBackgrounds,debug:DEBUG,savedAt:e.savedAt}),!0}return DEBUG&&console.log("No saved settings, using defaults"),!1}catch(t){return DEBUG&&console.error("Failed to load settings:",t),!1}}function preloadImage(e){return new Promise(t=>{if(!e)return t();let o=new Image;o.src=e,o.onload=t,o.onerror=()=>{DEBUG&&console.warn(`Failed to preload image: ${e}`),t()}})}function preloadVideo(e){return new Promise(t=>{if(!e)return t();let o=document.createElement("video");o.src=e,o.preload="auto",o.onloadeddata=t,o.onerror=()=>{DEBUG&&console.warn(`Failed to preload video: ${e}`),t()}})}async function applyBackground(e){let t=document.getElementById("rcp-fe-viewport-root");if(!t||!e||!backgroundEnabled){removeBackground();return}DEBUG&&console.log(`Applying background for ${e.name} with opacity: ${currentOpacity}`);let o=centeredSplash?e.splashPath||e.backgroundTextureLCU||e.uncenteredSplashPath:e.uncenteredSplashPath||e.splashPath||e.backgroundTextureLCU;if(o===lastAppliedUrl){let a=document.getElementById("client-bg-container");if(a){let l=a.querySelector(".client-bg-layer:last-child");l&&parseFloat(l.style.opacity)!==currentOpacity&&(l.style.opacity=currentOpacity,DEBUG&&console.log(`Updated opacity to ${currentOpacity} for unchanged background: ${e.name}`))}return}let r=e.isAnimated||o.toLowerCase().endsWith(".webm");r?await preloadVideo(o):await preloadImage(o);let n=document.getElementById("client-bg-container");n||((n=document.createElement("div")).id="client-bg-container",n.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
        `,t.appendChild(n),t.classList.add("custom-background"));let i=n.querySelectorAll(".client-bg-layer");i.length>1&&i.forEach((e,t)=>{t<i.length-1&&(e.remove(),DEBUG&&console.log(`Removed excess layer: ${"VIDEO"===e.tagName?e.src:e.style.backgroundImage}`))});let s;r?((s=document.createElement("video")).className="client-bg-layer",s.src=o,s.loop=!0,s.muted=!0,s.autoplay=!0,s.playsInline=!0,s.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            opacity: 0;
            transition: opacity ${transitionDuration}s ease;
        `,s.onloadeddata=()=>{DEBUG&&console.log(`Video loaded successfully: ${o}`),s.style.opacity=currentOpacity},s.onerror=()=>{DEBUG&&console.error(`Failed to load video: ${o}`),s.remove(),removeBackground()}):((s=document.createElement("div")).className="client-bg-layer",s.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('${o}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 0;
            transition: opacity ${transitionDuration}s ease;
        `),n.appendChild(s);let d=document.getElementById("client-bg-style");d||((d=document.createElement("style")).id="client-bg-style",document.head.appendChild(d)),d.textContent=`
        .custom-background {
            position: relative;
        }
        .client-bg-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            transition: opacity ${transitionDuration}s ease;
        }
        .client-bg-layer video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
        }
    `,s.offsetHeight,r||(s.style.opacity=currentOpacity);let c=n.querySelector(".client-bg-layer:not(:last-child)");c&&(c.style.opacity=0,setTimeout(()=>{c.parentNode&&(c.remove(),DEBUG&&console.log(`Cleaned up old layer: ${"VIDEO"===c.tagName?c.src:c.style.backgroundImage}`))},1e3*transitionDuration+100)),lastAppliedUrl=o,DEBUG&&console.log(`Background applied: ${e.name}, URL: ${o}, Type: ${r?"video":"image"}, Opacity: ${currentOpacity}, Transition: ${transitionDuration}s`)}function removeBackground(){let e=document.getElementById("rcp-fe-viewport-root");if(e&&e.classList.contains("custom-background")){let t=document.getElementById("client-bg-container");if(t){let o=t.querySelectorAll(".client-bg-layer");o.forEach(e=>{e.style.opacity=0,setTimeout(()=>{e.parentNode&&(e.remove(),DEBUG&&console.log(`Removed layer during reset: ${"VIDEO"===e.tagName?e.src:e.style.backgroundImage}`))},1e3*transitionDuration+100)}),setTimeout(()=>{t.parentNode&&(t.remove(),DEBUG&&console.log("Removed background container"))},1e3*transitionDuration+100)}e.classList.remove("custom-background"),lastAppliedUrl=null,DEBUG&&console.log("Background fully removed")}}function checkAndApplyBackground(){let e=document.getElementById("rcp-fe-viewport-root");if(!e)return;let t=document.querySelector('[data-screen-name="rcp-fe-lol-parties"]'),o=document.querySelector('.screen-root.active[data-screen-name="rcp-fe-lol-activity-center"]'),a=document.querySelector('.screen-root[data-screen-name="rcp-fe-lol-postgame"]'),l=document.querySelector('.screen-root[data-screen-name="rcp-fe-lol-profiles-main"]'),r=DataStore.get("selectedSkin");currentOpacity=o&&"1"===getComputedStyle(o).opacity||a&&"1"===getComputedStyle(a).opacity||l&&"1"===getComputedStyle(l).opacity?0:storedOpacity,backgroundEnabled&&r&&(t||persistBackground)?(applyBackground(r),updatePlaceholderInvitedContainer()):(removeBackground(),updatePlaceholderInvitedContainer())}function setupActivityCenterObserver(){let e=document.querySelector('.screen-root.active[data-screen-name="rcp-fe-lol-activity-center"]');if(!e){DEBUG&&console.log("Activity center not found for observer setup");return}let t=new MutationObserver(()=>{checkAndApplyBackground()});t.observe(e,{attributes:!0,attributeFilter:["style","class"]}),DEBUG&&console.log("Activity center observer set up")}function setupProfilesMainObserver(){let e=document.querySelector('.screen-root[data-screen-name="rcp-fe-lol-profiles-main"]');if(!e){DEBUG&&console.log("Profiles main screen not found for observer setup");return}let t=new MutationObserver(()=>{checkAndApplyBackground()});t.observe(e,{attributes:!0,attributeFilter:["style","class"]}),DEBUG&&console.log("Profiles main screen observer set up")}function setupPostgameObserver(){let e=document.querySelector('.screen-root[data-screen-name="rcp-fe-lol-postgame"]');if(!e){DEBUG&&console.log("Postgame screen not found for observer setup");return}let t=new MutationObserver(()=>{checkAndApplyBackground()});t.observe(e,{attributes:!0,attributeFilter:["style","class"]}),DEBUG&&console.log("Postgame screen observer set up")}function updatePlaceholderInvitedContainer(){if(!backgroundEnabled){let e=document.querySelectorAll(".placeholder-invited-container");e.forEach(e=>{e.querySelector('video[src*="/fe/lol-parties/parties-v2/invited-banner.webm"]')&&(e.style.display="",DEBUG&&debugLog("Restored placeholder invited container visibility"))});return}let t=document.querySelectorAll(".placeholder-invited-container");t.forEach(e=>{e.querySelector('video[src*="/fe/lol-parties/parties-v2/invited-banner.webm"]')&&(e.style.display="none",DEBUG&&debugLog("Hidden placeholder invited container"))})}function setupPlaceholderContainerObserver(){let e=document.querySelector('[data-screen-name="rcp-fe-lol-parties"]');if(!e){DEBUG&&debugLog("Parties screen not found for placeholder container observer setup");return}let t=new MutationObserver(e=>{for(let t of e)if("childList"===t.type){let o=Array.from(t.addedNodes).some(e=>e.nodeType===Node.ELEMENT_NODE&&(e.classList?.contains("placeholder-invited-container")||e.querySelector?.(".placeholder-invited-container")));if(o){DEBUG&&debugLog("Placeholder invited container added to DOM"),updatePlaceholderInvitedContainer();break}}});t.observe(e,{childList:!0,subtree:!0}),DEBUG&&debugLog("Placeholder container observer set up")}function checkAndCreateButton(){clearTimeout(debounceTimeout),debounceTimeout=setTimeout(()=>{let e=document.querySelector('[data-screen-name="rcp-fe-lol-parties"]'),t=document.getElementById("client-bg-show-button");if(!e){t&&t.remove();return}t||createShowButton(e)},100)}function createShowButton(e){let t=document.getElementById("client-bg-hover-area");t&&t.remove();let o=document.createElement("div");o.id="client-bg-hover-area",o.style.cssText=`
        position: absolute;
        top: 40%;
        left: -70px;
        width: 250px;
        height: 20%;
        z-index: 9998;
        display: flex;
        align-items: center;
        justify-content: center;
    `;let a=document.createElement("button");a.textContent="BGC",a.id="client-bg-show-button",a.className="lol-custom-ui",a.style.cssText=`
        padding: 8px 16px;
        z-index: 9999;
        background: #010a13;
        border: 1px solid #785a28;
        color: #cdbe91;
        border-radius: 2px;
        font-size: 24px;
        font-weight: bold;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        transition: all 0.2s, opacity 0.3s;
        opacity: 0;
    `,o.addEventListener("mouseenter",()=>{a.style.opacity="1"}),o.addEventListener("mouseleave",()=>{a.style.opacity="0"}),a.addEventListener("mouseenter",()=>{a.style.background="#1e2328",a.style.borderColor="#c8aa6e",a.style.color="#f0e6d2"}),a.addEventListener("mouseleave",()=>{a.style.background="#010a13",a.style.borderColor="#785a28",a.style.color="#cdbe91"}),a.addEventListener("mousedown",()=>{a.style.color="#785a28"}),a.addEventListener("mouseup",()=>{a.style.color="#f0e6d2"}),a.addEventListener("click",()=>{let t=document.getElementById("client-bg-customizer-ui-wrapper");t&&t.remove(),createClientBackgroundCustomizerUI(e),uiVisible=!0,o.remove()}),o.appendChild(a),e.appendChild(o)}function generatePreviewGroups(e){if(DEBUG&&console.log("Generating preview groups for type:",e),previewGroups=[],"champion"===e){let t={};skinData.forEach(e=>{if(e.tilePath){let o=e.tilePath.match(/\/Characters\/([^\/]+)\//i);if(o){let a=o[1];t[a]||(t[a]=[]),t[a].push({name:e.name,tilePath:e.tilePath,splashPath:e.splashPath,uncenteredSplashPath:e.uncenteredSplashPath,skinLineId:e.skinLines&&e.skinLines.length>0?e.skinLines[0].id:null})}}});let o=Object.keys(t).map(e=>({title:e,items:t[e]}));o.sort((e,t)=>e.title.localeCompare(t.title)),o.forEach(e=>{e.items.sort((e,t)=>e.name.localeCompare(t.name))}),previewGroups.push(...o)}else if("universes"===e){if(!Array.isArray(universeData)||0===universeData.length||!Array.isArray(skinLineData)||0===skinLineData.length){DEBUG&&console.warn("Universe or skinline data unavailable, falling back to champion"),generatePreviewGroups("champion");return}let a={Other:[]},l={},r={};skinLineData.forEach(e=>{e.id&&e.name&&(l[e.id]=e.name)}),universeData.forEach(e=>{e&&"object"==typeof e&&e.name&&Array.isArray(e.skinSets)&&e.skinSets.forEach(t=>{let o=parseInt("object"==typeof t?t.id:t,10);isNaN(o)||(r[o]=e.name)})}),skinData.forEach(e=>{if(!e.tilePath)return;let t=e.skinLines&&e.skinLines.length>0&&null!=e.skinLines[0].id?parseInt(e.skinLines[0].id,10):null,o="Other",n=null;t&&(n=l[t]||`Unknown SkinLine ${t}`,o=r[t]||n),a[o]||(a[o]=[]),a[o].push({name:e.name,tilePath:e.tilePath,splashPath:e.splashPath,uncenteredSplashPath:e.uncenteredSplashPath,skinLineId:t,skinLineName:n})});let n=Object.keys(a).map(e=>({title:e,items:a[e]}));n.sort((e,t)=>e.title.localeCompare(t.title)),n.forEach(e=>{e.items.sort((e,t)=>e.name.localeCompare(t.name))}),previewGroups.push(...n)}else if("skinlines"===e){if(!Array.isArray(skinLineData)||0===skinLineData.length){DEBUG&&console.warn("Skinline data unavailable, falling back to champion"),generatePreviewGroups("champion");return}let i={Other:[]},s={};skinLineData.forEach(e=>{e.id&&e.name&&(s[e.id]=e.name)}),skinData.forEach(e=>{if(!e.tilePath)return;let t=e.skinLines&&e.skinLines.length>0&&null!=e.skinLines[0].id?parseInt(e.skinLines[0].id,10):null,o="Other",a=null;t&&(o=a=s[t]||`Unknown SkinLine ${t}`),i[o]||(i[o]=[]),i[o].push({name:e.name,tilePath:e.tilePath,splashPath:e.splashPath,uncenteredSplashPath:e.uncenteredSplashPath,skinLineId:t,skinLineName:a})});let d=Object.keys(i).map(e=>({title:e,items:i[e]}));d.sort((e,t)=>e.title.localeCompare(t.title)),d.forEach(e=>{e.items.sort((e,t)=>e.name.localeCompare(t.name))}),previewGroups.push(...d)}else DEBUG&&console.warn("Invalid type, falling back to champion"),generatePreviewGroups("champion");if(!1!==DataStore.get("tftEnabled")&&tftData.length>0){let c={title:"TFT",items:tftData.filter(e=>e.descriptionTraKey&&e.descriptionTraKey.toLowerCase().startsWith("companion")&&e.backgroundTextureLCU).map(e=>({name:e.name,tilePath:e.standaloneLoadoutsLargeIcon,splashPath:e.backgroundTextureLCU,uncenteredSplashPath:e.backgroundTextureLCU,skinLineId:null,skinLineName:null,isTFT:!0}))};c.items.length>0&&(c.items.sort((e,t)=>e.name.localeCompare(t.name)),previewGroups.push(c))}let p=DataStore.get("customBackgrounds")||[];DEBUG&&console.log("Custom Backgrounds from DataStore:",p);let u={title:"Custom Background",items:p.map(e=>({name:e.name,tilePath:e.tilePath,splashPath:e.splashPath,uncenteredSplashPath:e.uncenteredSplashPath,skinLineId:null,skinLineName:null,isTFT:!1,isAnimated:e.isAnimated}))};u.items.sort((e,t)=>e.name.localeCompare(t.name)),previewGroups.push(u),DEBUG&&console.log(`Generated ${previewGroups.length} preview groups for type: ${e}, Custom Backgrounds:`,u)}function createCustomBackgroundUI(e){let t=document.createElement("div");t.id="client-bg-custom-ui-wrapper",t.style.cssText=`
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.7);
    `;let o=document.createElement("div");o.id="client-bg-custom-ui",o.className="lol-custom-ui",o.style.cssText=`
        width: 600px;
        height: 550px;
        display: flex;
        flex-direction: column;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        background: #010a13;
        border: 1px solid #785a28;
        border-radius: 4px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
        box-sizing: border-box;
        padding: 20px 0;
    `;let a=document.createElement("div");a.style.cssText=`
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        margin: 0 20px;
    `;let l=document.createElement("h3");l.textContent="Add Custom Background",l.style.cssText=`
        color: #f0e6d2;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin: 0 0 20px 0;
        text-transform: uppercase;
    `,a.appendChild(l);let r=document.createElement("div");r.style.cssText=`
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 15px;
        overflow-y: auto;
        padding-right: 10px;
        scrollbar-width: thin;
        scrollbar-color: #785a28 transparent;
    `,r.className="custom-content";let n={};[{label:"Name",placeholder:"Custom Background Name",key:"name"},{label:"Tile URL",placeholder:"Enter tile image URL (JPG)",key:"tilePath"},{label:"Splash URL",placeholder:"Enter splash image (JPG) or video (WebM) URL",key:"splashPath"},{label:"Uncentered Splash URL",placeholder:"Enter uncentered splash URL (JPG or WebM, optional)",key:"uncenteredSplashPath"}].forEach(e=>{let t=document.createElement("div");t.style.cssText="display: flex; flex-direction: column; gap: 5px;";let o=document.createElement("label");o.textContent=e.label,o.style.cssText=`
            color: #f0e6d2;
            font-size: 14px;
            font-weight: bold;
        `;let a=document.createElement("input");a.type="text",a.placeholder=e.placeholder,a.style.cssText=`
            background: #010a13;
            border: 1px solid #785a28;
            color: #cdbe91;
            padding: 8px;
            border-radius: 2px;
            font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        `,t.appendChild(o),t.appendChild(a),r.appendChild(t),n[e.key]=a});let i=document.createElement("div");i.style.cssText="display: flex; align-items: center; gap: 10px; margin-top: 10px;";let s=document.createElement("label");s.textContent="Animated (Video)",s.style.cssText=`
        color: #f0e6d2;
        font-size: 14px;
        font-weight: bold;
    `;let d=document.createElement("label");d.className="toggle-switch";let c=document.createElement("input");c.type="checkbox";let p=document.createElement("span");p.className="toggle-slider",d.appendChild(c),d.appendChild(p),i.appendChild(s),i.appendChild(d),r.appendChild(i);let u=document.createElement("span");u.style.cssText="color: #ff5555; font-size: 12px; display: none; margin-top: 5px;",r.appendChild(u);let g=document.createElement("button");g.textContent="Add Background",g.style.cssText=`
        padding: 8px 12px;
        background: #1e2328;
        border: 1px solid #785a28;
        color: #cdbe91;
        border-radius: 2px;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        cursor: pointer;
        margin-top: 15px;
    `,g.addEventListener("mouseover",()=>{g.style.background="#1e2328",g.style.borderColor="#c8aa6e",g.style.color="#f0e6d2"}),g.addEventListener("mouseout",()=>{g.style.background="#1e2328",g.style.borderColor="#785a28",g.style.color="#cdbe91"}),g.addEventListener("click",()=>{try{let o=n.name.value.trim(),a=n.tilePath.value.trim(),l=n.splashPath.value.trim(),r=n.uncenteredSplashPath.value.trim(),i=c.checked;if(!o||!a||!l){u.textContent="Name, Tile URL, and Splash URL are required",u.style.display="block",setTimeout(()=>{u.style.display="none"},3e3);return}if(customBackgrounds.some(e=>e.name===o)){u.textContent="Name already taken",u.style.display="block",setTimeout(()=>{u.style.display="none"},3e3);return}DEBUG&&console.log("Adding custom background:",{name:o,tilePath:a,splashPath:l,isAnimated:i}),(customBackgrounds=DataStore.get("customBackgrounds")||[]).push({name:o,tilePath:a,splashPath:l,uncenteredSplashPath:r,isAnimated:i}),DataStore.set("customBackgrounds",customBackgrounds),saveSettings(),DEBUG&&console.log("Updated customBackgrounds:",customBackgrounds,"DataStore:",DataStore.get("customBackgrounds")),DEBUG&&console.log("Custom Background UI closing, starting restore process"),t.remove();let s=document.getElementById("client-bg-customizer-ui-wrapper"),d=document.querySelectorAll("#client-bg-customizer-ui-wrapper");d.length>1&&(DEBUG&&console.warn("Multiple customizer wrappers found, removing duplicates"),d.forEach((e,t)=>{t>0&&e.remove()}),s=d[0]);let p=document.querySelectorAll(".client-bg-customizer-backdrop");if(p.length>1&&(DEBUG&&console.warn("Multiple backdrops found, removing duplicates"),p.forEach((e,t)=>{t>0&&e.remove()})),s){DEBUG&&console.log("Customizer wrapper found, restoring visibility"),s.style.display="block";let g=document.getElementById("client-bg-customizer-ui"),m=g?.querySelector(".main-window");if(g&&m&&window.renderSkins){window.favoriteSkins=DataStore.get("favoriteSkins")||[],window.isFavoritesToggled=DataStore.get("favoritesToggled")||!1,console.log("Restored state:",{favoriteSkinsCount:window.favoriteSkins.length,isFavoritesToggled:window.isFavoritesToggled,customBackgroundsCount:customBackgrounds.length,searchQuery:currentSearchQuery});let h=g.querySelector(".filter-dropdown .dropdown-toggle"),b=g.querySelector(".filter-dropdown .dropdown-menu");if(h&&b){let f="All Skins";h.textContent=f,b.querySelectorAll(".dropdown-item").forEach(e=>{e.classList.toggle("selected",e.textContent===f)}),DEBUG&&console.log(`Filter dropdown updated to: ${f}`)}else DEBUG&&console.warn("Filter dropdown or menu not found");DEBUG&&console.log("Generating previewGroups for groupType: champion"),generatePreviewGroups("champion"),DEBUG&&console.log("Updated previewGroups:",previewGroups),DEBUG&&console.log("Rendering skins with filter: all"),window.renderSkins(previewGroups,currentSearchQuery||"","all")}else{DEBUG&&console.warn("Customizer UI or main window missing, reinitializing"),s&&s.remove();let $=document.querySelector(".client-bg-customizer-backdrop");$&&$.remove(),createClientBackgroundCustomizerUI(e)}}else{DEBUG&&console.warn("Customizer wrapper not found, creating new UI");let x=document.querySelector(".client-bg-customizer-backdrop");x&&x.remove(),createClientBackgroundCustomizerUI(e)}}catch(y){DEBUG&&console.error("Error in addButton handler:",y)}}),r.appendChild(g);let m=document.createElement("style");m.textContent=`
        .custom-content::-webkit-scrollbar {
            width: 6px;
        }
        .custom-content::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-content::-webkit-scrollbar-thumb {
            background: #785a28;
            border-radius: 3px;
        }
        .custom-content::-webkit-scrollbar-thumb:hover {
            background: #c8aa6e;
        }
    `,document.head.appendChild(m),a.appendChild(r),o.appendChild(a);let h=document.createElement("button");h.textContent="Close",h.className="custom-close-button",h.style.cssText=`
        margin-top: 20px;
        margin-left: auto;
        margin-right: auto;
        width: 50%;
        padding: 5px 0;
        min-height: 32px;
        color: #cdbe91;
        font-size: 14px;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        font-weight: bold;
        letter-spacing: 1px;
        text-transform: uppercase;
        cursor: pointer;
        background: #1e2328;
        border: 2px solid #785a28;
        box-shadow: 0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13;
        transition: color 0.2s, border-color 0.2s, box-shadow 0.2s;
    `,h.addEventListener("mouseover",()=>{h.style.color="#f0e6d2",h.style.borderColor="#c8aa6e",h.style.boxShadow="0 0 8px 4px rgba(212, 184, 117, 0.5), inset 0 0 1px 1px #010a13"}),h.addEventListener("mouseout",()=>{h.style.color="#cdbe91",h.style.borderColor="#785a28",h.style.boxShadow="0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13"}),h.addEventListener("click",()=>{t.remove();let e=document.getElementById("client-bg-customizer-ui-wrapper");if(e){e.style.display="block";let o=document.getElementById("client-bg-customizer-ui");o&&window.renderSkins&&(generatePreviewGroups(document.querySelector(".custom-dropdown:not(.filter-dropdown):not(.sort-dropdown) .dropdown-item.selected")?.dataset.value||"champion"),window.renderSkins(previewGroups,currentSearchQuery,document.querySelector(".filter-dropdown .dropdown-item.selected")?.dataset.value||"all"))}}),o.appendChild(h),t.appendChild(o),e.appendChild(t)}function createProfilesUI(e){let t=document.createElement("div");t.id="client-bg-profiles-ui-wrapper",t.style.cssText=`
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.7);
    `;let o=document.createElement("div");o.id="client-bg-profiles-ui",o.className="lol-custom-ui",o.style.cssText=`
        width: 600px;
        height: 550px;
        display: flex;
        flex-direction: column;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        background: #010a13;
        border: 1px solid #785a28;
        border-radius: 4px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
        box-sizing: border-box;
        padding: 20px 0;
    `;let a=document.createElement("div");a.style.cssText=`
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        margin: 0 20px;
    `;let l=document.createElement("h3");l.textContent="Manage Skin Profiles",l.style.cssText=`
        color: #f0e6d2;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin: 0 0 20px 0;
        text-transform: uppercase;
    `,a.appendChild(l);let r=document.createElement("div");r.style.cssText=`
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 15px;
        overflow-y: auto;
        padding-right: 10px;
        scrollbar-width: thin;
        scrollbar-color: #785a28 transparent;
    `,r.className="profiles-content";let n=document.createElement("div");n.style.cssText="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;";let i=document.createElement("input");i.type="text",i.placeholder=`Profile ${skinProfiles.length+1}`,i.style.cssText=`
        flex: 1;
        background: #010a13;
        border: 1px solid #785a28;
        color: #cdbe91;
        padding: 8px;
        border-radius: 2px;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
    `;let s=document.createElement("button");s.textContent="+",s.style.cssText=`
        padding: 8px 12px;
        background: #1e2328;
        border: 1px solid #785a28;
        color: #cdbe91;
        border-radius: 2px;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        cursor: pointer;
    `,s.addEventListener("mouseover",()=>{s.style.background="#1e2328",s.style.borderColor="#c8aa6e",s.style.color="#f0e6d2"}),s.addEventListener("mouseout",()=>{s.style.background="#1e2328",s.style.borderColor="#785a28",s.style.color="#cdbe91"});let d=document.createElement("span");d.style.cssText="color: #ff5555; font-size: 12px; display: none; margin-top: 5px;",n.appendChild(i),n.appendChild(s),r.appendChild(n),r.appendChild(d);let c=document.createElement("div");function p(){if(c.innerHTML="",0===skinProfiles.length){let e=document.createElement("div");e.textContent="No profiles saved",e.style.cssText=`
                color: #f0e6d2;
                font-size: 16px;
                text-align: center;
                padding: 20px;
            `,c.appendChild(e);return}skinProfiles.forEach((e,t)=>{let o=document.createElement("div");o.style.cssText=`
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 5px;
                border-bottom: 1px solid #785a28;
                ${e.name===activeProfile?"background: #1e2328; border: 1px solid #c8aa6e; border-radius: 4px;":""}
            `;let a=document.createElement("span");a.textContent=e.name,a.style.cssText=`
                flex: 1;
                color: ${e.name===activeProfile?"#f0e6d2":"#cdbe91"};
                cursor: pointer;
            `,a.addEventListener("click",()=>{let t=document.createElement("input");t.type="text",t.value=e.name,t.style.cssText=`
                    width: 100%;
                    background: #010a13;
                    border: 1px solid #785a28;
                    color: #cdbe91;
                    padding: 4px;
                    border-radius: 2px;
                `,t.addEventListener("blur",()=>{let o=t.value.trim();o&&!skinProfiles.some(t=>t.name===o&&t!==e)?(e.name===activeProfile&&(activeProfile=o),e.name=o,saveSettings(),p()):(d.textContent=o?"Name already taken":"Name cannot be empty",d.style.display="block",setTimeout(()=>{d.style.display="none"},3e3),p())}),t.addEventListener("keypress",e=>{"Enter"===e.key&&t.blur()}),a.replaceWith(t),t.focus()});let l=document.createElement("button");l.textContent="Load",l.style.cssText=`
                padding: 4px 8px;
                background: #1e2328;
                border: 1px solid #785a28;
                color: #cdbe91;
                border-radius: 2px;
                cursor: pointer;
            `,l.addEventListener("click",()=>{DEBUG&&console.log(`Loading profile: ${e.name}`),DataStore.set("favoriteSkins",e.skins),window.favoriteSkins=e.skins||[],window.isFavoritesToggled=DataStore.get("favoritesToggled")||!1,activeProfile=e.name,saveSettings(),p();let t=document.getElementById("client-bg-customizer-ui");if(t){let o=t.querySelector(".main-window");if(o&&window.renderSkins){console.log("Preparing to render skins with:",{favoriteSkinsCount:window.favoriteSkins.length,isFavoritesToggled:window.isFavoritesToggled,previewGroupsCount:previewGroups.length,searchQuery:currentSearchQuery});let a=t.querySelector(".filter-dropdown .dropdown-toggle"),l=t.querySelector(".filter-dropdown .dropdown-menu");if(a&&l){let r=window.isFavoritesToggled?"Favorites":"All Skins";a.textContent=r,l.querySelectorAll(".dropdown-item").forEach(e=>{e.classList.toggle("selected",e.textContent===r)}),DEBUG&&console.log(`Filter dropdown updated to: ${r}`)}else DEBUG&&console.warn("Filter dropdown or menu not found");let n=window.isFavoritesToggled?"favorites":"all";DEBUG&&console.log(`Rendering skins with filter: ${n}`),window.renderSkins(previewGroups,currentSearchQuery,n)}else DEBUG&&console.error("Main window or renderSkins missing")}else DEBUG&&console.error("Customizer UI not found")});let r=document.createElement("button");r.textContent="Save",r.style.cssText=`
                padding: 4px 8px;
                background: #1e2328;
                border: 1px solid #785a28;
                color: #cdbe91;
                border-radius: 2px;
                cursor: pointer;
            `,r.addEventListener("click",()=>{let t=DataStore.get("favoriteSkins")||[];if(0===t.length){d.textContent="No favorites to save",d.style.display="block",setTimeout(()=>{d.style.display="none"},3e3);return}e.skins=t,saveSettings(),p()});let n=document.createElement("button");n.textContent="\uD83D\uDDD1",n.style.cssText=`
                padding: 4px 8px;
                background: #1e2328;
                border: 1px solid #785a28;
                color: #cdbe91;
                border-radius: 2px;
                cursor: pointer;
            `,n.addEventListener("click",()=>{skinProfiles=skinProfiles.filter(t=>t!==e),activeProfile===e.name&&(activeProfile=null),saveSettings(),p()});let i=document.createElement("button");i.textContent="↑",i.style.cssText=`
                padding: 4px 8px;
                background: #1e2328;
                border: 1px solid #785a28;
                color: #cdbe91;
                border-radius: 2px;
                cursor: ${0===t?"not-allowed":"pointer"};
                opacity: ${0===t?.5:1};
            `,i.disabled=0===t,i.addEventListener("click",()=>{t>0&&([skinProfiles[t-1],skinProfiles[t]]=[skinProfiles[t],skinProfiles[t-1]],saveSettings(),p())});let s=document.createElement("button");s.textContent="↓",s.style.cssText=`
                padding: 4px 8px;
                background: #1e2328;
                border: 1px solid #785a28;
                color: #cdbe91;
                border-radius: 2px;
                cursor: ${t===skinProfiles.length-1?"not-allowed":"pointer"};
                opacity: ${t===skinProfiles.length-1?.5:1};
            `,s.disabled=t===skinProfiles.length-1,s.addEventListener("click",()=>{t<skinProfiles.length-1&&([skinProfiles[t],skinProfiles[t+1]]=[skinProfiles[t+1],skinProfiles[t]],saveSettings(),p())}),[l,r,n,i,s].forEach(e=>{e.addEventListener("mouseover",()=>{e.style.background="#1e2328",e.style.borderColor="#c8aa6e",e.style.color="#f0e6d2"}),e.addEventListener("mouseout",()=>{e.style.background="#1e2328",e.style.borderColor="#785a28",e.style.color="#cdbe91"})}),o.appendChild(a),o.appendChild(l),o.appendChild(r),o.appendChild(n),o.appendChild(i),o.appendChild(s),c.appendChild(o)})}c.style.cssText="display: flex; flex-direction: column; gap: 10px;",r.appendChild(c),s.addEventListener("click",()=>{let e=i.value.trim()||`Profile ${skinProfiles.length+1}`;if(!e||skinProfiles.some(t=>t.name===e)){d.textContent=e?"Name already taken":"Name cannot be empty",d.style.display="block",setTimeout(()=>{d.style.display="none"},3e3);return}skinProfiles.push({name:e,skins:[]}),saveSettings(),i.value="",p()}),p();let u=document.createElement("style");u.textContent=`
        .profiles-content::-webkit-scrollbar {
            width: 6px;
        }
        .profiles-content::-webkit-scrollbar-track {
            background: transparent;
        }
        .profiles-content::-webkit-scrollbar-thumb {
            background: #785a28;
            border-radius: 3px;
        }
        .profiles-content::-webkit-scrollbar-thumb:hover {
            background: #c8aa6e;
        }
    `,document.head.appendChild(u),a.appendChild(r),o.appendChild(a);let g=document.createElement("button");g.textContent="Close",g.className="profiles-close-button",g.style.cssText=`
        margin-top: 20px;
        margin-left: auto;
        margin-right: auto;
        width: 50%;
        padding: 5px 0;
        min-height: 32px;
        color: #cdbe91;
        font-size: 14px;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        font-weight: bold;
        letter-spacing: 1px;
        text-transform: uppercase;
        cursor: pointer;
        background: #1e2328;
        border: 2px solid #785a28;
        box-shadow: 0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13;
        transition: color 0.2s, border-color 0.2s, box-shadow 0.2s;
    `,g.addEventListener("mouseover",()=>{g.style.color="#f0e6d2",g.style.borderColor="#c8aa6e",g.style.boxShadow="0 0 8px 4px rgba(212, 184, 117, 0.5), inset 0 0 1px 1px #010a13"}),g.addEventListener("mouseout",()=>{g.style.color="#cdbe91",g.style.borderColor="#785a28",g.style.boxShadow="none"}),g.addEventListener("click",()=>{DEBUG&&console.log("Profiles UI closing, starting restore process"),t.remove();let o=document.getElementById("client-bg-customizer-ui-wrapper"),a=document.querySelectorAll("#client-bg-customizer-ui-wrapper");a.length>1&&(DEBUG&&console.warn("Multiple customizer wrappers found, removing duplicates"),a.forEach((e,t)=>{t>0&&e.remove()}),o=a[0]);let l=document.querySelectorAll(".client-bg-customizer-backdrop");if(l.length>1&&(DEBUG&&console.warn("Multiple backdrops found, removing duplicates"),l.forEach((e,t)=>{t>0&&e.remove()})),o){DEBUG&&console.log("Customizer wrapper found, restoring visibility"),o.style.display="block";let r=document.getElementById("client-bg-customizer-ui"),n=r?.querySelector(".main-window");if(r&&n&&window.renderSkins){window.favoriteSkins=DataStore.get("favoriteSkins")||[],window.isFavoritesToggled=DataStore.get("favoritesToggled")||!1,console.log("Restored state:",{favoriteSkinsCount:window.favoriteSkins.length,isFavoritesToggled:window.isFavoritesToggled,previewGroupsCount:previewGroups.length,searchQuery:currentSearchQuery});let i=o.querySelector(".favorites-toggle");if(i){i.classList.toggle("toggled",window.isFavoritesToggled);let s=i.querySelector(".toggled");s&&s.classList.toggle("toggled-on",window.isFavoritesToggled),DEBUG&&console.log("Favorites toggle updated")}let d=r.querySelector(".filter-dropdown .dropdown-toggle"),c=r.querySelector(".filter-dropdown .dropdown-menu");if(d&&c){let p=window.isFavoritesToggled?"Favorites":"All Skins";d.textContent=p,c.querySelectorAll(".dropdown-item").forEach(e=>{e.classList.toggle("selected",e.textContent===p)}),DEBUG&&console.log(`Filter dropdown updated to: ${p}`)}previewGroups.length||(DEBUG&&console.warn("previewGroups empty, regenerating"),generatePreviewGroups("champion")),document.querySelectorAll(".favorite-button").forEach(e=>{let t=e.closest(".skin-image")?.dataset.name,o="true"===e.closest(".skin-image")?.dataset.isTFT;t&&e.classList.toggle("favorited",window.favoriteSkins.some(e=>e.name===t&&e.isTFT===o))}),document.querySelectorAll(".group-favorite-button").forEach(e=>{let t=e.closest(".skin-group-title")?.dataset.groupTitle,o=previewGroups.find(e=>e.title===t)?.items||[],a=o.every(e=>window.favoriteSkins.some(t=>t.name===e.name&&t.isTFT===e.isTFT));e.classList.toggle("favorited",a)});let u=window.isFavoritesToggled?"favorites":"all";DEBUG&&console.log(`Rendering skins with filter: ${u}`),window.renderSkins(previewGroups,currentSearchQuery,u);let g=DataStore.get("selectedSkin");if(g&&g.name){let m=CSS.escape(g.name),h=`.skin-image[data-name="${m}"][data-is-tft="${g.isTFT}"]`,b=n.querySelector(h);b?(b.classList.add("selected"),b.scrollIntoView({behavior:"smooth",block:"center"}),DEBUG&&console.log(`Highlighted selected skin: ${g.name}`)):DEBUG&&console.warn(`Selected skin not found: ${g.name}`)}}else{DEBUG&&console.warn("Customizer UI or main window missing, reinitializing"),o&&o.remove();let f=document.querySelector(".client-bg-customizer-backdrop");f&&f.remove(),createClientBackgroundCustomizerUI(e)}}else{DEBUG&&console.warn("Customizer wrapper not found, creating new UI");let $=document.querySelector(".client-bg-customizer-backdrop");$&&$.remove(),createClientBackgroundCustomizerUI(e)}}),o.appendChild(g),t.appendChild(o),e.appendChild(t);let m=document.getElementById("client-bg-customizer-ui-wrapper");m?(DEBUG&&console.log("Hiding customizer UI"),m.style.display="none"):DEBUG&&console.warn("Customizer wrapper not found during profiles UI init")}function createSettingsUI(e){let t=document.createElement("div");t.id="client-bg-settings-ui-wrapper",t.style.cssText=`
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.7);
    `;let o=document.createElement("div");o.id="client-bg-settings-ui",o.className="lol-custom-ui",o.style.cssText=`
        width: 600px;
        height: 550px;
        display: flex;
        flex-direction: column;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        background: #010a13;
        border: 1px solid #785a28;
        border-radius: 4px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
        box-sizing: border-box;
        padding: 20px 0;
    `;let a=document.createElement("div");a.style.cssText=`
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        margin-top: 0px;
        margin-right: 0px;
        margin-bottom: 0px;
        margin-left: 20px;
    `;let l=document.createElement("h3");l.textContent="Background Settings",l.style.cssText=`
        color: #f0e6d2;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin: 0 0 20px 0;
        text-transform: uppercase;
    `,a.appendChild(l);let r=document.createElement("div");r.style.cssText=`
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 15px;
        overflow-y: auto;
        margin-right: 2px;
        padding-right: 10px;
        scrollbar-width: thin;
        scrollbar-color: #785a28 transparent;
    `,r.className="settings-content";let n=document.createElement("style");n.textContent=`
        .settings-content::-webkit-scrollbar {
            width: 6px;
        }
        .settings-content::-webkit-scrollbar-track {
            background: transparent;
        }
        .settings-content::-webkit-scrollbar-thumb {
            background: #785a28;
            border-radius: 3px;
        }
        .settings-content::-webkit-scrollbar-thumb:hover {
            background: #c8aa6e;
        }
    `,document.head.appendChild(n);let i=document.createElement("h4");i.textContent="General",i.style.cssText=`
        color: #f0e6d2;
        font-size: 18px;
        font-weight: bold;
        margin: 10px 0 5px 0;
        text-transform: uppercase;
    `,r.appendChild(i);let s=document.createElement("div");s.className="toggle-btn",s.style.cssText="margin-bottom: 15px;";let d=document.createElement("span");d.textContent="Enable Background:";let c=document.createElement("label");c.className="toggle-switch";let p=document.createElement("input");p.type="checkbox",p.checked=backgroundEnabled;let u=document.createElement("span");u.className="toggle-slider",c.appendChild(p),c.appendChild(u),s.appendChild(d),s.appendChild(c),r.appendChild(s),p.addEventListener("change",()=>{backgroundEnabled=p.checked,saveSettings(),checkAndApplyBackground()});let g=document.createElement("label");g.textContent="Background Opacity:",g.style.cssText="margin-bottom: 5px;",r.appendChild(g);let m=document.createElement("div");m.style.cssText=`
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
    `;let h=document.createElement("input");h.type="range",h.min="0.1",h.max="1",h.step="0.1",h.value=storedOpacity,h.style.cssText=`
        flex: 1;
        height: 8px;
        -webkit-appearance: none;
        background: #1e2328;
        border: 1px solid #785a28;
        border-radius: 4px;
        outline: none;
    `;let b=document.createElement("span");b.textContent=storedOpacity.toString(),b.style.width="40px";let f=document.createElement("button");f.textContent="<",f.style.cssText=`
        color: #cdbe91;
        font-size: 14px;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        font-weight: bold;
        padding: 2px 6px;
        cursor: pointer;
        background: #1e2328;
        border: 1px solid #785a28;
        border-radius: 2px;
        transition: color 0.2s, border-color 0.2s;
    `,f.addEventListener("click",()=>{let e=Math.max(parseFloat(h.min),Math.round((parseFloat(h.value)-.1)*10)/10);h.value=e,storedOpacity=e,b.textContent=e.toString(),currentOpacity=storedOpacity,saveSettings(),checkAndApplyBackground()});let $=document.createElement("button");$.textContent=">",$.style.cssText=`
        color: #cdbe91;
        font-size: 14px;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        font-weight: bold;
        padding: 2px 6px;
        cursor: pointer;
        background: #1e2328;
        border: 1px solid #785a28;
        border-radius: 2px;
        transition: color 0.2s, border-color 0.2s;
    `,$.addEventListener("click",()=>{let e=Math.min(parseFloat(h.max),Math.round((parseFloat(h.value)+.1)*10)/10);h.value=e,storedOpacity=e,b.textContent=e.toString(),currentOpacity=storedOpacity,saveSettings(),checkAndApplyBackground()}),h.addEventListener("input",()=>{storedOpacity=parseFloat(h.value),b.textContent=storedOpacity.toString(),currentOpacity=storedOpacity,saveSettings(),checkAndApplyBackground()}),f.addEventListener("mouseover",()=>{f.style.color="#f0e6d2",f.style.borderColor="#c8aa6e"}),f.addEventListener("mouseout",()=>{f.style.color="#cdbe91",f.style.borderColor="#785a28"}),$.addEventListener("mouseover",()=>{$.style.color="#f0e6d2",$.style.borderColor="#c8aa6e"}),$.addEventListener("mouseout",()=>{$.style.color="#cdbe91",$.style.borderColor="#785a28"}),m.appendChild(f),m.appendChild(h),m.appendChild($),m.appendChild(b),r.appendChild(m);let x=document.createElement("div");x.className="toggle-btn",x.style.cssText="margin-bottom: 15px;";let y=document.createElement("span");y.textContent="Keep background on all screens:";let v=document.createElement("label");v.className="toggle-switch";let k=document.createElement("input");k.type="checkbox",k.checked=persistBackground;let _=document.createElement("span");_.className="toggle-slider",v.appendChild(k),v.appendChild(_),x.appendChild(y),x.appendChild(v),r.appendChild(x),k.addEventListener("change",()=>{persistBackground=k.checked,saveSettings(),checkAndApplyBackground()});let w=document.createElement("div");w.className="toggle-btn",w.style.cssText="margin-bottom: 15px;";let E=document.createElement("span");E.textContent="Centered Splash:";let C=document.createElement("label");C.className="toggle-switch";let L=document.createElement("input");L.type="checkbox",L.checked=centeredSplash;let S=document.createElement("span");S.className="toggle-slider",C.appendChild(L),C.appendChild(S),w.appendChild(E),w.appendChild(C),r.appendChild(w),L.addEventListener("change",()=>{centeredSplash=L.checked,saveSettings(),checkAndApplyBackground()});let B=document.createElement("div");B.className="toggle-btn",B.style.cssText="margin-bottom: 15px;";let T=document.createElement("span");T.textContent="Enable TFT Content:";let P=document.createElement("label");P.className="toggle-switch";let D=document.createElement("input");D.type="checkbox",D.checked=!1!==DataStore.get("tftEnabled");let G=document.createElement("span");G.className="toggle-slider",P.appendChild(D),P.appendChild(G),B.appendChild(T),B.appendChild(P),r.appendChild(B),D.addEventListener("change",()=>{let e=D.checked;if(DataStore.set("tftEnabled",e),!e){let t=DataStore.get("selectedSkin");t&&t.isTFT&&(DataStore.set("selectedSkin",null),removeBackground(),DEBUG&&console.log("Cleared selected TFT skin"))}saveSettings();let o=document.getElementById("client-bg-customizer-ui");if(o){generatePreviewGroups("champion");let a=o.querySelector(".main-window");a&&window.renderSkins&&window.renderSkins(previewGroups)}});let U=document.createElement("h4");U.textContent="Shuffle Settings",U.style.cssText=`
        color: #f0e6d2;
        font-size: 18px;
        font-weight: bold;
        margin: 10px 0 5px 0;
        text-transform: uppercase;
    `,r.appendChild(U);let I=document.createElement("hr");I.style.cssText=`
        border: 0;
        border-top: 1px solid #785a28;
        margin: 10px 0;
    `,r.appendChild(I);let A=document.createElement("div");A.className="toggle-btn",A.style.cssText="margin-bottom: 15px;";let z=document.createElement("span");z.textContent="Cycle Shuffle:";let N=document.createElement("label");N.className="toggle-switch";let F=document.createElement("input");F.type="checkbox",F.checked=cycleShuffleEnabled;let O=document.createElement("span");O.className="toggle-slider",N.appendChild(F),N.appendChild(O),A.appendChild(z),A.appendChild(N),r.appendChild(A),F.addEventListener("change",()=>{cycleShuffleEnabled=F.checked,saveSettings()});let q=document.createElement("label");q.textContent="Cycle Shuffle Interval (Seconds):",q.style.cssText="margin-bottom: 5px;",r.appendChild(q);let V=document.createElement("div");V.style.cssText=`
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
    `;let j=document.createElement("input");j.type="range",j.min="10",j.max="300",j.step="1",j.value=cycleInterval,j.style.cssText=`
        flex: 1;
        height: 8px;
        -webkit-appearance: none;
        background: #1e2328;
        border: 1px solid #785a28;
        border-radius: 4px;
        outline: none;
    `;let R=document.createElement("span");R.textContent=cycleInterval.toString(),R.style.width="40px";let M=document.createElement("button");M.textContent="<",M.style.cssText=`
        color: #cdbe91;
        font-size: 14px;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        font-weight: bold;
        padding: 2px 6px;
        cursor: pointer;
        background: #1e2328;
        border: 1px solid #785a28;
        border-radius: 2px;
        transition: color 0.2s, border-color 0.2s;
    `,M.addEventListener("click",()=>{let e=Math.max(parseInt(j.min),10*Math.round((parseInt(j.value)-10)/10));j.value=e,cycleInterval=e,R.textContent=e.toString(),saveSettings()});let H=document.createElement("button");H.textContent=">",H.style.cssText=`
        color: #cdbe91;
        font-size: 14px;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        font-weight: bold;
        padding: 2px 6px;
        cursor: pointer;
        background: #1e2328;
        border: 1px solid #785a28;
        border-radius: 2px;
        transition: color 0.2s, border-color 0.2s;
    `,H.addEventListener("click",()=>{let e=Math.min(parseInt(j.max),10*Math.round((parseInt(j.value)+10)/10));j.value=e,cycleInterval=e,R.textContent=e.toString(),saveSettings()}),M.addEventListener("mouseover",()=>{M.style.color="#f0e6d2",M.style.borderColor="#c8aa6e"}),M.addEventListener("mouseout",()=>{M.style.color="#cdbe91",M.style.borderColor="#785a28"}),H.addEventListener("mouseover",()=>{H.style.color="#f0e6d2",H.style.borderColor="#c8aa6e"}),H.addEventListener("mouseout",()=>{H.style.color="#cdbe91",H.style.borderColor="#785a28"}),V.appendChild(M),V.appendChild(j),V.appendChild(H),V.appendChild(R),r.appendChild(V),j.addEventListener("input",()=>{cycleInterval=parseInt(j.value),R.textContent=cycleInterval.toString(),saveSettings()});let Q=document.createElement("label");Q.textContent="Transition Duration (Seconds):",Q.style.cssText="margin-bottom: 5px;",r.appendChild(Q);let W=document.createElement("div");W.style.cssText=`
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
    `;let K=document.createElement("input");K.type="range",K.min="0",K.max="5",K.step="0.1",K.value=transitionDuration,K.style.cssText=`
        flex: 1;
        height: 8px;
        -webkit-appearance: none;
        background: #1e2328;
        border: 1px solid #785a28;
        border-radius: 4px;
        outline: none;
    `;let J=document.createElement("span");J.textContent=transitionDuration.toString(),J.style.width="40px";let Y=document.createElement("button");Y.textContent="<",Y.style.cssText=`
        color: #cdbe91;
        font-size: 14px;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        font-weight: bold;
        padding: 2px 6px;
        cursor: pointer;
        background: #1e2328;
        border: 1px solid #785a28;
        border-radius: 2px;
        transition: color 0.2s, border-color 0.2s;
    `,Y.addEventListener("click",()=>{let e=Math.max(parseFloat(K.min),Math.round((parseFloat(K.value)-.1)*10)/10);K.value=e,transitionDuration=e,J.textContent=e.toString(),saveSettings()});let X=document.createElement("button");X.textContent=">",X.style.cssText=`
        color: #cdbe91;
        font-size: 14px;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        font-weight: bold;
        padding: 2px 6px;
        cursor: pointer;
        background: #1e2328;
        border: 1px solid #785a28;
        border-radius: 2px;
        transition: color 0.2s, border-color 0.2s;
    `,X.addEventListener("click",()=>{let e=Math.min(parseFloat(K.max),Math.round((parseFloat(K.value)+.1)*10)/10);K.value=e,transitionDuration=e,J.textContent=e.toString(),saveSettings()}),Y.addEventListener("mouseover",()=>{Y.style.color="#f0e6d2",Y.style.borderColor="#c8aa6e"}),Y.addEventListener("mouseout",()=>{Y.style.color="#cdbe91",Y.style.borderColor="#785a28"}),X.addEventListener("mouseover",()=>{X.style.color="#f0e6d2",X.style.borderColor="#c8aa6e"}),X.addEventListener("mouseout",()=>{X.style.color="#cdbe91",X.style.borderColor="#785a28"}),W.appendChild(Y),W.appendChild(K),W.appendChild(X),W.appendChild(J),r.appendChild(W),K.addEventListener("input",()=>{transitionDuration=parseFloat(K.value),J.textContent=transitionDuration.toString(),saveSettings()});let Z=document.createElement("h4");Z.textContent="Debug",Z.style.cssText=`
        color: #f0e6d2;
        font-size: 18px;
        font-weight: bold;
        margin: 10px 0 5px 0;
        text-transform: uppercase;
    `,r.appendChild(Z);let ee=document.createElement("hr");ee.style.cssText=`
        border: 0;
        border-top: 1px solid #785a28;
        margin: 10px 0;
    `,r.appendChild(ee);let et=document.createElement("div");et.className="toggle-btn",et.style.cssText="margin-bottom: 15px;";let eo=document.createElement("span");eo.textContent="Enable Debug Mode:";let ea=document.createElement("label");ea.className="toggle-switch";let el=document.createElement("input");el.type="checkbox",el.checked=DEBUG;let er=document.createElement("span");er.className="toggle-slider",ea.appendChild(el),ea.appendChild(er),et.appendChild(eo),et.appendChild(ea),r.appendChild(et),el.addEventListener("change",()=>{(DEBUG=el.checked)&&console.log("Debug mode toggled:",DEBUG),saveSettings()}),a.appendChild(r),o.appendChild(a);let en=document.createElement("button");en.textContent="Close",en.className="settings-close-button",en.style.cssText=`
        margin-top: 20px;
        margin-left: auto;
        margin-right: auto;
        width: 50%;
        padding: 5px 0;
        min-height: 32px;
        color: #cdbe91;
        font-size: 14px;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        font-weight: bold;
        letter-spacing: 1px;
        text-transform: uppercase;
        cursor: pointer;
        background: #1e2328;
        border: 2px solid #785a28;
        box-shadow: 0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13;
        transition: color 0.2s, border-color 0.2s, box-shadow 0.2s;
    `,en.addEventListener("mouseover",()=>{en.style.color="#f0e6d2",en.style.borderColor="#c8aa6e",en.style.boxShadow="0 0 8px 4px rgba(212, 184, 117, 0.5), inset 0 0 1px 1px #010a13"}),en.addEventListener("mouseout",()=>{en.style.color="#cdbe91",en.style.borderColor="#785a28",en.style.boxShadow="0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13"}),en.addEventListener("click",()=>{DEBUG&&console.log("Close button clicked"),t.remove(),settingsVisible=!1;let o=document.getElementById("client-bg-customizer-ui-wrapper");if(o){DEBUG&&console.log("Restoring customizer UI"),o.style.display="block";let a=document.getElementById("client-bg-customizer-ui");if(a){let l=a.querySelector(".custom-dropdown:not(.filter-dropdown):not(.sort-dropdown)");if(l){DEBUG&&console.log("Type dropdown found");let r=l.querySelector(".dropdown-toggle"),n=l.querySelector(".dropdown-menu");if(r&&n){DEBUG&&console.log("Updating dropdown to Champion"),r.textContent="Champion";let i=n.querySelector('.dropdown-item[data-value="champion"]');i&&(n.querySelectorAll(".dropdown-item").forEach(e=>e.classList.remove("selected")),i.classList.add("selected"),DEBUG&&console.log("Simulating Champion dropdown click"),i.click())}}else{DEBUG&&console.log("Type dropdown not found, falling back to manual refresh"),generatePreviewGroups("champion");let s=a.querySelector(".main-window");s&&window.renderSkins?(DEBUG&&console.log("Manually rendering skins"),window.renderSkins(previewGroups,currentSearchQuery)):DEBUG&&console.log("renderSkins not available or mainWindow not found")}}else DEBUG&&console.log("Customizer UI not found")}else DEBUG&&console.log("Customizer wrapper not found, recreating UI"),createClientBackgroundCustomizerUI(e)}),o.appendChild(en),t.appendChild(o),e.appendChild(t)}function startShuffleCycle(e,t){if(!cycleShuffleEnabled)return;shuffleCycleIntervalId&&(clearInterval(shuffleCycleIntervalId),DEBUG&&console.log("Cleared previous shuffle cycle"));let o=!1!==DataStore.get("tftEnabled");shuffleCycleIntervalId=setInterval(()=>{let a=[];if(t&&e.length>0?0===(a=e.filter(e=>o||!e.isTFT)).length&&(a=previewGroups.flatMap(e=>e.items.filter(e=>o||!e.isTFT)),DEBUG&&console.log("No valid favorites, falling back to all skins")):a=previewGroups.flatMap(e=>e.items.filter(e=>o||!e.isTFT)),0===a.length){DEBUG&&console.log("No items available for shuffle cycle"),clearInterval(shuffleCycleIntervalId),shuffleCycleIntervalId=null;return}let l=a[Math.floor(Math.random()*a.length)];DataStore.set("selectedSkin",{name:l.name,tilePath:l.tilePath,splashPath:l.splashPath,uncenteredSplashPath:l.uncenteredSplashPath,skinLineId:l.skinLineId,skinLineName:l.skinLineName,isTFT:l.isTFT,isAnimated:l.isAnimated}),applyBackground(l),DEBUG&&console.log(`Shuffle cycle applied: ${l.name}`)},1e3*cycleInterval),DEBUG&&console.log(`Started shuffle cycle with interval ${cycleInterval} seconds`)}function createClientBackgroundCustomizerUI(e){let t=DataStore.get("selectedSkin"),o=DataStore.get("favoriteSkins")||[],a=DataStore.get("favoritesToggled")||!1,l=!0,r="",n=document.getElementById("client-bg-customizer-ui-wrapper");n&&(DEBUG&&console.warn("Existing customizer wrapper found, removing to prevent duplicates"),n.remove());let i=document.querySelector(".client-bg-customizer-backdrop");i&&(DEBUG&&console.warn("Existing backdrop found, removing to prevent duplicates"),i.remove());let s=document.createElement("div");s.className="client-bg-customizer-backdrop",s.style.cssText=`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9997;
    `;let d=document.createElement("div");d.id="client-bg-customizer-ui-wrapper",d.style.cssText=`
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9998;
    `;let c=document.createElement("div");c.id="client-bg-customizer-ui",c.className="lol-custom-ui",c.style.cssText=`
        padding: 0;
        width: 800px;
        height: 600px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        background: #010a13;
        border: 1px solid #785a28;
        border-radius: 2px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
    `;let p=document.getElementById("client-bg-customizer-style");p||((p=document.createElement("style")).id="client-bg-customizer-style",p.textContent=`
            .lol-custom-ui {
                font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
                color: #a09b8c;
                background: #010a13;
                border: 1px solid #785a28;
                border-radius: 2px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
                overflow: hidden;
            }
            .lol-custom-ui input {
                background: #010a13;
                border: 1px solid #785a28;
                color: #cdbe91;
                border-radius: 0;
                padding: 8px;
                font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
                transition: all 0.2s, border-bottom-color 0.2s;
                height: 32px;
                box-sizing: border-box;
            }
            .lol-custom-ui input:hover {
                background: #1e2328;
                border-color: #785a28;
                border-bottom-color: #c8aa6e;
                color: #f0e6d2;
                cursor: pointer;
            }
            .lol-custom-ui input:focus {
                outline: none;
                background: #1e2328;
                color: #f0e6d2;
                border: 1px solid #785a28;
                border-bottom: 1px solid #c8aa6e;
                cursor: text;
            }
            .lol-custom-ui .header {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px 20px;
                border-bottom: 1px solid #785a28;
                background: #010a13;
                flex-shrink: 0;
                height: 32px;
                position: relative;
            }
            .lol-custom-ui .header h3 {
                color: #f0e6d2;
                font-weight: bold;
                letter-spacing: 1px;
                text-transform: uppercase;
                font-size: 18px;
                margin: 0;
                font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
                text-align: center;
            }
            .lol-custom-ui .bottom-bar {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px 20px;
                border-top: 1px solid #785a28;
                background: #010a13;
                flex-shrink: 0;
                height: 32px;
                gap: 20px;
            }
            .lol-custom-ui .search-bar {
                display: flex;
                align-items: center;
                padding: 10px 20px;
                background: #010a13;
                flex-shrink: 0;
                height: 32px;
                justify-content: space-between;
            }
            .lol-custom-ui .custom-dropdown {
                position: relative;
                display: inline-block;
                width: 150px;
                margin-right: 5px;
                font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
            }
            .lol-custom-ui .custom-dropdown.filter-dropdown {
                width: 120px;
            }
            .lol-custom-ui .custom-dropdown:last-child {
                margin-right: 0;
            }
            .lol-custom-ui .dropdown-toggle {
                background: #010a13;
                border: 1px solid #785a28;
                color: #cdbe91;
                font-size: 11px;
                font-weight: bold;
                letter-spacing: 1px;
                text-transform: uppercase;
                padding: 6px 24px 6px 8px;
                height: 27px;
                cursor: pointer;
                border-radius: 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-sizing: border-box;
                box-shadow: 0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13;
                transition: color 0.2s, border-color 0.2s, box-shadow 0.2s;
            }
            .lol-custom-ui .dropdown-toggle:hover {
                background: #1e2328;
                border-color: #c8aa6e;
                color: #f0e6d2;
                box-shadow: 0 0 8px 4px rgba(212, 184, 117, 0.5), inset 0 0 1px 1px #010a13;
            }
            .lol-custom-ui .dropdown-toggle::after {
                content: '';
                background: url(/fe/lol-uikit/up-down-arrow.png) center no-repeat;
                width: 13px;
                height: 18px;
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                pointer-events: none;
            }
            .lol-custom-ui .dropdown-menu {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                background: #010a13;
                border: 1px solid #785a28;
                border-radius: 0;
                z-index: 1000;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
                list-style: none;
                padding: 0;
                margin: 0;
                box-sizing: border-box;
            }
            .lol-custom-ui .dropdown-menu.show {
                display: block;
            }
            .lol-custom-ui .dropdown-item {
                padding: 8px 12px;
                color: #cdbe91;
                font-size: 11px;
                font-weight: bold;
                letter-spacing: 1px;
                text-transform: uppercase;
                cursor: pointer;
                transition: all 0.2s;
                border-bottom: 1px solid #785a28;
                position: relative;
            }
            .lol-custom-ui .dropdown-item:hover {
                background: #1e2328;
                color: #f0e6d2;
                border-left: 1px solid #c8aa6e;
                border-right: 1px solid #c8aa6e;
            }
            .lol-custom-ui .dropdown-item:last-child {
                border-bottom: none;
            }
            .lol-custom-ui .dropdown-item.selected::after {
                background: url(/fe/lol-uikit/dropdown-check.png) center no-repeat;
                width: 14px;
                height: 11px;
                position: absolute;
                right: 13px;
                top: 50%;
                transform: translate(0, -50%);
                content: '';
            }
            .lol-custom-ui .main-window {
                padding: 10px;
                flex-grow: 1;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .lol-custom-ui .main-window::-webkit-scrollbar {
                width: 10px;
            }
            .lol-custom-ui .main-window::-webkit-scrollbar-track {
                background: transparent;
            }
            .lol-custom-ui .main-window::-webkit-scrollbar-thumb {
                background: #765b2a;
                border-radius: 4px;
                border: 2px solid #010a13;
                min-height: 50px;
            }
            .lol-custom-ui .skin-group-title {
                color: #f0e6d2;
                font-size: 22px;
                padding-left: 10px;
                font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
                text-transform: uppercase;
                font-weight: bold;
            }
            .lol-custom-ui .skin-group-title .group-favorite-button {
                background: #0000 url(/fe/lol-parties/button-favorite-off.png) no-repeat top;
                background-size: cover;
                border: 0;
                cursor: pointer;
                height: 48px;
                width: 48px;
                display: inline-block;
                vertical-align: baseline;
                margin-left: 8px;
                position: relative;
                top: 15px;
                pointer-events: all;
                transition: opacity 0.2s;
                border-radius: 50%;
            }
            .lol-custom-ui .skin-group-title .group-favorite-button:hover {
                background: #0000 url(/fe/lol-parties/button-favorite-on.png) no-repeat top;
                background-size: cover;
                opacity: 0.8;
            }
            .lol-custom-ui .skin-group-title .group-favorite-button.favorited {
                background: #0000 url(/fe/lol-parties/button-favorite-on.png) no-repeat top;
                background-size: cover;
                opacity: 1;
            }
            .lol-custom-ui .skin-group {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 5px;
                width: 100%;
                box-sizing: border-box;
            }
            .lol-custom-ui .skin-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin: 0;
                text-align: center;
                height: 240px;
            }
            .lol-custom-ui .skin-image {
                width: 180px;
                height: 180px;
                background-color: #010a13;
                border: 1px solid #785a28;
                transition: border-color 0.2s, transform 0.2s;
                background-size: cover;
                background-position: center;
                cursor: pointer;
                position: relative;
            }
            .lol-custom-ui .skin-image.failed {
                background-image: none !important;
                background-color: #010a13 !important;
                border: 1px solid #785a28 !important;
                box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .lol-custom-ui .skin-image .failed-text {
                color: #cdbe91;
                font-size: 24px;
                font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
                text-align: center;
                padding: 10px;
                background: rgba(0, 0, 0, 0.0);
                border-radius: 4px;
                max-width: 160px;
                line-height: 1.2;
            }
            .lol-custom-ui .skin-image:hover {
                border-color: #c8aa6e;
            }
            .lol-custom-ui .skin-image.selected {
                border: 5px solid;
                border-image: linear-gradient(to bottom, #c8aa6e, #785a28) 1;
                transform: scale(0.99);
                box-shadow: 0 0 8px rgba(200, 170, 110, 0.5);
            }
            .lol-custom-ui .skin-image .favorite-button {
                background: #0000 url(/fe/lol-parties/button-favorite-off.png) no-repeat top;
                background-size: cover;
                border: 0;
                cursor: pointer;
                height: 48px;
                width: 48px;
                position: absolute;
                top: 8px;
                right: 8px;
                pointer-events: all;
                transition: opacity 0.2s;
                border-radius: 50%;
                z-index: 10;
            }
            .lol-custom-ui .skin-image .favorite-button:hover {
                background: #0000 url(/fe/lol-parties/button-favorite-on.png) no-repeat top;
                background-size: cover;
                opacity: 0.8;
            }
            .lol-custom-ui .skin-image .favorite-button.favorited {
                background: #0000 url(/fe/lol-parties/button-favorite-on.png) no-repeat top;
                background-size: cover;
                opacity: 1;
            }
            .lol-custom-ui .skin-label {
                font-size: 14px;
                color: #f0e6d2;
                margin-top: 10px;
                max-width: 180px;
                height: 36px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: normal;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
            .lol-custom-ui .bottom-bar button {
                color: #cdbe91;
                font-size: 14px;
                font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
                font-weight: bold;
                letter-spacing: 1px;
                text-transform: uppercase;
                width: 140px;
                padding: 5px 0;
                min-height: 32px;
                cursor: pointer;
                background: #1e2328;
                border: 2px solid #785a28;
                box-shadow: 0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: color 0.2s, border-color 0.2s, box-shadow 0.2s;
            }
            .lol-custom-ui .bottom-bar button:hover {
                color: #f0e6d2;
                border-color: #c8aa6e;
                box-shadow: 0 0 8px 4px rgba(212, 184, 117, 0.5), inset 0 0 1px 1px #010a13;
                animation: glowFade 1s ease-out forwards;
            }
            .lol-custom-ui .bottom-bar button:hover svg path {
                fill: #f0e6d2;
            }
            .lol-custom-ui .bottom-bar button:active {
                color: #c8aa6e;
                border-color: #c8aa6e;
                box-shadow: 0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13;
            }
            .lol-custom-ui .bottom-bar button:active svg path {
                fill: #c8aa6e;
            }
            .lol-custom-ui .bottom-bar button.randomize-button {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 5px 0;
                width: 140px;
            }
            .lol-custom-ui .bottom-bar button.favorites-toggle {
                padding: 0;
                width: 70px;
                min-height: 32px;
                background: none;
                border: none;
                box-shadow: none;
            }
            .lol-custom-ui .bottom-bar button.favorites-toggle:hover {
                color: #cdbe91;
                border: none;
                box-shadow: none;
                animation: none;
            }
            .lol-custom-ui .bottom-bar button.favorites-toggle:active {
                color: #cdbe91;
                border: none;
                box-shadow: none;
            }
            .lol-custom-ui .favorites-toggle .toggle-container {
                background-image: url(/fe/lol-parties/toggle-slider-closed.png);
                background-position: 50%;
                background-repeat: no-repeat;
                background-size: contain;
                cursor: pointer;
                height: 29px;
                width: 70px;
                position: relative;
            }
            .lol-custom-ui .favorites-toggle .toggled {
                background-image: url(/fe/lol-parties/toggle-slider-open.png);
                background-position: 50%;
                background-repeat: no-repeat;
                background-size: contain;
                height: 29px;
                width: 70px;
                position: absolute;
                top: 0;
                left: 0;
                opacity: 0;
                transition: opacity 0.5s;
            }
            .lol-custom-ui .favorites-toggle .toggled.toggled-on {
                opacity: 1;
            }
            .lol-custom-ui .favorites-toggle .toggle-button {
                background-image: url(/fe/lol-parties/button-favorite-off.png);
                background-position: 50%;
                background-repeat: no-repeat;
                background-size: contain;
                height: 34px;
                width: 34px;
                position: relative;
                left: 0;
                top: -2px;
                transition: left 0.5s;
            }
            .lol-custom-ui .favorites-toggle.toggled .toggle-button {
                background-image: url(/fe/lol-parties/button-favorite-on.png);
                left: 34px;
                right: auto;
            }
            .lol-custom-ui .no-favorites-message {
                color: #f0e6d2;
                font-size: 16px;
                text-align: center;
                padding: 20px;
                font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
            }
            .lol-custom-ui .lol-uikit-close-button {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: linear-gradient(to top, #463714 4%, #785a28 23%, #c89b3c 90%, #c8aa6e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
            }
            .lol-custom-ui .lol-uikit-close-button .contents {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background-color: #1e282d;
                transition: box-shadow 150ms ease-out, color 150ms ease-out;
            }
            .lol-custom-ui .lol-uikit-close-button .close-icon {
                width: 24px;
                height: 24px;
                transform: translate(0px, 0px);
                -webkit-mask: url(/fe/lol-uikit/images/icon_settings.png) no-repeat center;
                -webkit-mask-size: 18px 18px;
                background-color: #cdbe91;
            }
            .lol-custom-ui .lol-uikit-close-button:hover {
                background: linear-gradient(to top, #c89b3c 0%, #f0e6d2 100%);
            }
            .lol-custom-ui .lol-uikit-close-button:hover .contents {
                background: linear-gradient(to top, #3c3c41 0%, #1e2328 100%);
            }
            .lol-custom-ui .lol-uikit-close-button:hover .close-icon {
                background-color: #f0e6d2;
            }
            .lol-custom-ui .lol-uikit-close-button:active {
                background: linear-gradient(to top, #785a28 0%, #463714 100%);
            }
            .lol-custom-ui .lol-uikit-close-button:active .close-icon {
                background-color: #785a28;
            }
            .lol-custom-ui .lol-uikit-close-button:active .contents {
                background: none;
                background-color: #1e282d;
            }
            .lol-custom-ui .toggle-btn {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 10px;
            }
            .lol-custom-ui .toggle-switch {
                position: relative;
                display: inline-block;
                width: 40px;
                height: 20px;
            }
            .lol-custom-ui .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            .lol-custom-ui .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #1e2328;
                transition: .4s;
                border-radius: 20px;
                border: 1px solid #785a28;
            }
            .lol-custom-ui .toggle-slider:before {
                position: absolute;
                content: "";
                height: 14px;
                width: 14px;
                left: 2px;
                bottom: 2px;
                background-color: #cdbe91;
                transition: .4s;
                border-radius: 50%;
            }
            .lol-custom-ui input:checked + .toggle-slider {
                background-color: #1e2328;
                border-color: #c8aa6e;
            }
            .lol-custom-ui input:checked + .toggle-slider:before {
                transform: translateX(20px);
                background-color: #f0e6d2;
            }
            .lol-custom-ui input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #cdbe91;
                cursor: pointer;
                border: 1px solid #785a28;
            }
            .lol-custom-ui input[type=range]::-moz-range-thumb {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #cdbe91;
                cursor: pointer;
                border: 1px solid #785a28;
            }
            .lol-custom-ui .settings-close-button, .lol-custom-ui .profiles-close-button {
                margin-top: 20px;
                margin-left: auto;
                margin-right: auto;
                width: 50%;
                padding: 5px 0;
                min-height: 32px;
                color: #cdbe91;
                font-size: 14px;
                font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
                font-weight: bold;
                letter-spacing: 1px;
                text-transform: uppercase;
                cursor: pointer;
                background: #1e2328;
                border: 2px solid #785a28;
                box-shadow: 0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13;
                transition: color 0.2s, border-color 0.2s, box-shadow 0.2s;
            }
            .lol-custom-ui .settings-close-button:hover, .lol-custom-ui .profiles-close-button:hover {
                color: #f0e6d2;
                border-color: #c8aa6e;
                box-shadow: 0 0 8px 4px rgba(212, 184, 117, 0.5), inset 0 0 1px 1px #010a13;
                animation: glowFade 1s ease-out forwards;
            }
            .lol-custom-ui .settings-close-button:active, .lol-custom-ui .profiles-close-button:active {
                color: #c8aa6e;
                border-color: #c8aa6e;
                box-shadow: 0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13;
            }
            @keyframes glowFade {
                0% { box-shadow: 0 0 8px 4px rgba(212, 184, 117, 0.5), inset 0 0 1px 1px #010a13; }
                100% { box-shadow: 0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13; }
            }
            .client-bg-show-button {
                opacity: 0;
                transition: 0.2s !important;
            }
            .client-bg-show-button:hover {
                opacity: 1;
                transition: 0.2s !important;
            }
        `,document.head.appendChild(p));let u=document.createElement("div");u.className="header";let g=document.createElement("h3");g.textContent="BACKGROUND CUSTOMIZER",u.appendChild(g);let m=document.createElement("div");m.className="lol-uikit-close-button",m.setAttribute("button-type","cog");let h=document.createElement("div");h.className="contents";let b=document.createElement("div");b.className="close-icon",h.appendChild(b),m.appendChild(h),m.addEventListener("click",()=>{if(settingsVisible){let t=document.getElementById("client-bg-settings-ui-wrapper");t&&t.remove(),settingsVisible=!1}else createSettingsUI(e),settingsVisible=!0,d.style.display="none"}),u.appendChild(m),c.appendChild(u);let f=document.createElement("div");f.className="search-bar";let $=document.createElement("input");$.placeholder="Search",$.style.width="40%";let x=document.createElement("div");x.className="custom-dropdown",x.style.width="150px";let y=document.createElement("div");y.className="dropdown-toggle",y.textContent="Champion";let v=document.createElement("ul");v.className="dropdown-menu";let k="champion";[{label:"Champion",value:"champion"},{label:"Universes",value:"universes"},{label:"Skinlines",value:"skinlines"}].forEach(e=>{let t=document.createElement("li");t.className="dropdown-item",t.textContent=e.label,t.dataset.value=e.value,"champion"===e.value&&t.classList.add("selected"),t.addEventListener("click",()=>{y.textContent=e.label,v.querySelectorAll(".dropdown-item").forEach(e=>e.classList.remove("selected")),t.classList.add("selected"),k=e.value,v.classList.remove("show"),DEBUG&&console.log(`Selected type: ${k}`),generatePreviewGroups(k),D(previewGroups,r)}),v.appendChild(t)}),y.addEventListener("click",()=>{let e=v.classList.contains("show");document.querySelectorAll(".dropdown-menu").forEach(e=>e.classList.remove("show")),e||v.classList.add("show")}),x.appendChild(y),x.appendChild(v);let _=document.createElement("div");_.className="custom-dropdown filter-dropdown",_.style.width="120px";let w=document.createElement("div");w.className="dropdown-toggle",w.textContent=a?"Favorites":"All Skins";let E=document.createElement("ul");E.className="dropdown-menu";let C=a?"favorites":"all";["All Skins","Favorites"].forEach(e=>{let t=document.createElement("li");t.className="dropdown-item",t.textContent=e,t.dataset.value=e.toLowerCase().replace(" ",""),("Favorites"===e&&a||"All Skins"===e&&!a)&&t.classList.add("selected"),t.addEventListener("click",()=>{w.textContent=e,E.querySelectorAll(".dropdown-item").forEach(e=>e.classList.remove("selected")),t.classList.add("selected"),a="favorites"===(C=t.dataset.value),DataStore.set("favoritesToggled",a),E.classList.remove("show"),D(previewGroups,r,C)}),E.appendChild(t)}),_.appendChild(w),_.appendChild(E);let L=document.createElement("div");L.className="custom-dropdown",L.style.width="150px";let S=document.createElement("div");S.className="dropdown-toggle",S.textContent="Alphabetical▼";let B=document.createElement("ul");B.className="dropdown-menu";let T="alphabetical";[{label:"Alphabetical▼",value:"alphabetical"},{label:"Alphabetical▲",value:"alphabetical-reverse"}].forEach(e=>{let t=document.createElement("li");t.className="dropdown-item",t.textContent=e.label,t.dataset.value=e.value,"alphabetical"===e.value&&t.classList.add("selected"),t.addEventListener("click",()=>{S.textContent=e.label,B.querySelectorAll(".dropdown-item").forEach(e=>e.classList.remove("selected")),t.classList.add("selected"),T=e.value,B.classList.remove("show"),D(previewGroups,r,C,T)}),B.appendChild(t)}),L.appendChild(S),L.appendChild(B),[w,S].forEach(e=>{e.addEventListener("click",()=>{let t=e.nextElementSibling,o=t.classList.contains("show");document.querySelectorAll(".dropdown-menu").forEach(e=>e.classList.remove("show")),o||t.classList.add("show")})}),$.addEventListener("input",()=>{D(previewGroups,r=$.value.toLowerCase().trim(),C,T)}),f.appendChild($),f.appendChild(x),f.appendChild(_),f.appendChild(L),c.appendChild(f);let P=document.createElement("div");function D(e,o="",a="all",n="alphabetical"){let i=document.querySelector(".main-window");if(!i){DEBUG&&console.error("Main window not found");return}i.innerHTML="";let s=JSON.parse(JSON.stringify(e)),d=DataStore.get("favoriteSkins")||[],c=a||document.querySelector(".filter-dropdown .dropdown-item.selected")?.dataset.value||"all",p=n||document.querySelector(".sort-dropdown .dropdown-item.selected")?.dataset.value||"alphabetical";if("favorites"===c){if(0===d.length){let u=document.createElement("div");u.className="no-favorites-message",u.textContent="No favorited skins",i.appendChild(u);return}s=s.map(e=>({title:e.title,items:e.items.filter(e=>d.some(t=>t.name===e.name&&t.isTFT===e.isTFT))})).filter(e=>e.items.length>0)}o&&(s=s.map(e=>({title:e.title,items:e.items.filter(t=>t.name.toLowerCase().includes(o)||e.title.toLowerCase().includes(o))})).filter(e=>e.items.length>0||e.title.toLowerCase().includes(o))),"alphabetical"===p?(s.sort((e,t)=>e.title.localeCompare(t.title)),s.forEach(e=>{e.items.sort((e,t)=>e.name.localeCompare(t.name))})):(s.sort((e,t)=>t.title.localeCompare(e.title)),s.forEach(e=>{e.items.sort((e,t)=>t.name.localeCompare(t.name))}));let g=s.findIndex(e=>"Custom Background"===e.title);if(-1!==g){let m=s.splice(g,1)[0];s.unshift(m)}if(0===s.length&&!o&&"favorites"!==c){DEBUG&&console.warn("No groups to render, regenerating with champion grouping"),generatePreviewGroups("champion"),s=previewGroups;let h=s.findIndex(e=>"Custom Background"===e.title);if(-1!==h){let b=s.splice(h,1)[0];s.unshift(b)}}DEBUG&&console.log("Rendering groups:",s),s.forEach((e,a)=>{if("Custom Background"===e.title&&0===a){let l=document.createElement("button");l.textContent="ADD CUSTOM BACKGROUND",l.style.cssText=`
                    display: block;
                    margin: 10px auto 20px auto;
                    padding: 5px 16px;
                    min-width: 200px;
                    min-height: 32px;
                    color: #cdbe91;
                    font-size: 14px;
                    font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
                    font-weight: bold;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    text-align: center;
                    cursor: pointer;
                    background: #1e2328;
                    border: 2px solid #785a28;
                    box-shadow: 0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13;
                    box-sizing: border-box;
                    transition: color 0.2s, border-color 0.2s, box-shadow 0.2s;
                `,l.addEventListener("mouseover",()=>{l.style.color="#f0e6d2",l.style.borderColor="#c8aa6e",l.style.boxShadow="0 0 8px 4px rgba(212, 184, 117, 0.5), inset 0 0 1px 1px #010a13"}),l.addEventListener("mouseout",()=>{l.style.color="#cdbe91",l.style.borderColor="#785a28",l.style.boxShadow="0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13"}),l.addEventListener("click",()=>{shuffleCycleIntervalId&&(clearInterval(shuffleCycleIntervalId),shuffleCycleIntervalId=null,DEBUG&&console.log("Stopped shuffle cycle for custom background UI")),createCustomBackgroundUI(document.body);let e=document.getElementById("client-bg-customizer-ui-wrapper");e&&(e.style.display="none")}),i.appendChild(l),DEBUG&&console.log("Added Add Custom button above Custom Background section")}let s=document.createElement("div");s.className="skin-group-title";let p=document.createElement("span");p.textContent=e.title,s.appendChild(p),s.dataset.groupTitle=e.title;let u=document.createElement("button");u.className="group-favorite-button";let g=e.items.every(e=>d.some(t=>t.name===e.name&&t.isTFT===e.isTFT));g&&u.classList.add("favorited"),u.addEventListener("click",()=>{let t=e.items.every(e=>d.some(t=>t.name===e.name&&t.isTFT===e.isTFT));if(t){d=d.filter(t=>!e.items.some(e=>e.name===t.name&&e.isTFT===t.isTFT)),u.classList.remove("favorited");let a=s.nextElementSibling.querySelectorAll(".favorite-button");a.forEach(e=>e.classList.remove("favorited"))}else{e.items.forEach(e=>{d.some(t=>t.name===e.name&&t.isTFT===e.isTFT)||d.push({name:e.name,tilePath:e.tilePath,splashPath:e.splashPath,uncenteredSplashPath:e.uncenteredSplashPath,skinLineId:e.skinLineId,skinLineName:e.skinLineName,isTFT:e.isTFT,isAnimated:e.isAnimated})}),u.classList.add("favorited");let l=s.nextElementSibling.querySelectorAll(".favorite-button");l.forEach(e=>e.classList.add("favorited"))}DataStore.set("favoriteSkins",d),D(previewGroups,o,c,n)}),s.appendChild(u),i.appendChild(s);let m=document.createElement("div");if(m.className="skin-group","Custom Background"===e.title&&0===e.items.length){let h=document.createElement("div");h.className="no-custom-message",h.textContent="No custom backgrounds added.",h.style.cssText=`
                    color: #cdbe91;
                    font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
                    font-size: 14px;
                    text-align: center;
                    padding: 20px;
                `,m.appendChild(h)}else e.items.forEach(a=>{let l=document.createElement("div");l.className="skin-container",l.style.position="relative";let i=document.createElement("div");i.className="skin-image",i.dataset.tilePath=a.tilePath||"",i.dataset.name=a.name,i.dataset.splashPath=a.splashPath,i.dataset.uncenteredSplashPath=a.uncenteredSplashPath,i.dataset.skinLineId=a.skinLineId||"",i.dataset.skinLineName=a.skinLineName||"",i.dataset.isTFT=a.isTFT?"true":"false",i.style.position="relative",i.style.boxSizing="border-box";let s=()=>{DEBUG&&console.log(`Image failed to load for ${a.name}: ${a.tilePath}`),i.className="skin-image failed",i.style.backgroundImage="none";let e=document.createElement("div");e.className="failed-text",e.textContent="Failed to Load Preview",i.appendChild(e)};if(a.tilePath){i.style.backgroundImage=`url(${a.tilePath})`;let p=new Image;p.src=a.tilePath,p.onerror=s}else s();t&&t.name.trim().toLowerCase()===a.name.trim().toLowerCase()&&t.isTFT===a.isTFT&&i.classList.add("selected"),i.addEventListener("click",()=>{document.querySelectorAll(".skin-image").forEach(e=>e.classList.remove("selected")),i.classList.add("selected");let e={name:a.name,tilePath:a.tilePath,splashPath:a.splashPath,uncenteredSplashPath:a.uncenteredSplashPath,skinLineId:a.skinLineId,skinLineName:a.skinLineName,isTFT:a.isTFT,isAnimated:a.isAnimated};DataStore.set("selectedSkin",e),applyBackground(e)});let u=document.createElement("button");if(u.className="favorite-button",d.some(e=>e.name===a.name&&e.isTFT===a.isTFT)&&u.classList.add("favorited"),u.addEventListener("click",t=>{t.stopPropagation();let r=d.some(e=>e.name===a.name&&e.isTFT===a.isTFT);r?(d=d.filter(e=>!(e.name===a.name&&e.isTFT==e.isTFT)),u.classList.remove("favorited")):(d.push({name:a.name,tilePath:a.tilePath,splashPath:a.splashPath,uncenteredSplashPath:a.uncenteredSplashPath,skinLineId:a.skinLineId,skinLineName:a.skinLineName,isTFT:a.isTFT,isAnimated:a.isAnimated}),u.classList.add("favorited")),DataStore.set("favoriteSkins",d),window.favoriteSkins=d;let i=l.closest(".skin-group").previousElementSibling.querySelector(".group-favorite-button"),s=e.items.every(e=>d.some(t=>t.name===e.name&&t.isTFT===e.isTFT));i.classList.toggle("favorited",s),D(previewGroups,o,c,n)}),i.appendChild(u),"Custom Background"===e.title){let g=document.createElement("button");g.className="delete-button",g.innerHTML="\uD83D\uDDD1️",g.style.cssText=`
                            position: absolute;
                            bottom: 5px;
                            left: 5px;
                            width: 24px;
                            height: 24px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            background: rgba(30, 35, 40, 0.8);
                            border: 1px solid #785a28;
                            border-radius: 4px;
                            color: #cdbe91;
                            font-size: 14px;
                            cursor: pointer;
                            transition: background 0.2s, border-color 0.2s, color 0.2s;
                        `,g.addEventListener("mouseover",()=>{g.style.background="rgba(30, 35, 40, 1)",g.style.borderColor="#c8aa6e",g.style.color="#f0e6d2"}),g.addEventListener("mouseout",()=>{g.style.background="rgba(30, 35, 40, 0.8)",g.style.borderColor="#785a28",g.style.color="#cdbe91"}),g.addEventListener("click",e=>{try{e.stopPropagation(),DEBUG&&console.log("Attempting to delete custom background:",a.name);let t=previewGroups.findIndex(e=>"Custom Background"===e.title);if(-1===t){DEBUG&&console.warn("Custom Background group not found in previewGroups");return}let o=previewGroups[t];DEBUG&&console.log("Before deletion - previewGroups Custom Background items:",o.items),o.items=o.items.filter(e=>e.name!==a.name),DEBUG&&console.log("After deletion - previewGroups Custom Background items:",o.items),customBackgrounds=customBackgrounds.filter(e=>e.name!==a.name),DataStore.set("customBackgrounds",customBackgrounds),DEBUG&&console.log("Updated customBackgrounds:",customBackgrounds),DEBUG&&console.log("DataStore after save:",DataStore.get("customBackgrounds"));let l=DataStore.get("selectedSkin");l&&l.name===a.name&&l.isTFT===a.isTFT&&(DataStore.set("selectedSkin",null),removeBackground(),DEBUG&&console.log("Cleared selectedSkin and removed background as it matched deleted item:",a.name));let n=document.querySelector(".filter-dropdown .dropdown-item.selected")?.dataset.value||"all",i=document.querySelector(".sort-dropdown .dropdown-item.selected")?.dataset.value||"alphabetical";DEBUG&&console.log("Re-rendering skins with filter:",n),D(previewGroups,r||"",n,i),saveSettings()}catch(s){DEBUG&&console.error("Error in deleteButton handler:",s)}}),i.appendChild(g)}l.appendChild(i);let h=document.createElement("div");h.className="skin-label",h.textContent=a.name,l.appendChild(h),m.appendChild(l)});i.appendChild(m)}),t&&t.name&&l&&(setTimeout(()=>{let e=CSS.escape(t.name),o=`.skin-image[data-name="${e}"][data-is-tft="${t.isTFT}"]`,a=i.querySelector(o);a&&(a.classList.add("selected"),a.scrollIntoView({behavior:"smooth",block:"center"}))},200),l=!1),window.addMorePreviews=e=>{previewGroups.push(...e);let t=previewGroups.findIndex(e=>"Custom Background"===e.title);if(-1!==t){let a=previewGroups.splice(t,1)[0];previewGroups.unshift(a)}D(previewGroups,o,c,n)},DEBUG&&console.log("Rendered skins, Custom Background group:",s.find(e=>"Custom Background"===e.title))}P.className="main-window",c.appendChild(P);let G=document.createElement("div");G.className="bottom-bar";let U=document.createElement("button");U.textContent="RESET FAVORITES",U.addEventListener("click",()=>{o=[],DataStore.set("favoriteSkins",o),document.querySelectorAll(".favorite-button").forEach(e=>e.classList.remove("favorited")),document.querySelectorAll(".group-favorite-button").forEach(e=>e.classList.remove("favorited")),D(previewGroups,r,C,T)}),G.appendChild(U);let I=document.createElement("button");I.className="favorites-toggle",a&&I.classList.add("toggled");let A=document.createElement("div");A.className="toggle-container";let z=document.createElement("div");z.className="toggled",a&&z.classList.add("toggled-on");let N=document.createElement("div");N.className="toggle-button",A.appendChild(z),A.appendChild(N),I.appendChild(A),I.addEventListener("click",()=>{a=!a,DataStore.set("favoritesToggled",a),I.classList.toggle("toggled",a),z.classList.toggle("toggled-on",a),w.textContent=a?"Favorites":"All Skins",E.querySelectorAll(".dropdown-item").forEach(e=>{e.classList.toggle("selected",e.textContent===(a?"Favorites":"All Skins"))}),D(previewGroups,r,C=a?"favorites":"all",T)}),G.appendChild(I);let F=document.createElement("button");F.className="randomize-button",F.textContent="Shuffle",F.addEventListener("click",()=>{let e=[];if(0===(e=a&&o.length>0?o:previewGroups.flatMap(e=>e.items)).length){DEBUG&&console.log("No items available to randomize");return}let t=e[Math.floor(Math.random()*e.length)];DataStore.set("selectedSkin",{name:t.name,tilePath:t.tilePath,splashPath:t.splashPath,uncenteredSplashPath:t.uncenteredSplashPath,skinLineId:t.skinLineId,skinLineName:t.skinLineName,isTFT:t.isTFT}),document.querySelectorAll(".skin-image").forEach(e=>e.classList.remove("selected"));let l=`.skin-image[data-name="${CSS.escape(t.name)}"][data-is-tft="${t.isTFT}"]`,r=P.querySelector(l);r&&(r.classList.add("selected"),r.scrollIntoView({behavior:"smooth",block:"center"})),applyBackground(t),cycleShuffleEnabled&&(startShuffleCycle(o,a),d.remove(),s.remove(),uiVisible=!1,checkAndCreateButton())}),G.appendChild(F);let O=document.createElement("button");O.textContent="PROFILES",O.addEventListener("click",()=>{shuffleCycleIntervalId&&(clearInterval(shuffleCycleIntervalId),shuffleCycleIntervalId=null,DEBUG&&console.log("Stopped shuffle cycle for profiles UI")),createProfilesUI(e)}),G.appendChild(O);let q=document.createElement("button");q.textContent="Confirm",q.addEventListener("click",()=>{let e=P.querySelector(".skin-image.selected");if(e){let t={name:e.dataset.name,tilePath:e.dataset.tilePath,splashPath:e.dataset.splashPath,uncenteredSplashPath:e.dataset.uncenteredSplashPath,skinLineId:e.dataset.skinLineId,skinLineName:e.dataset.skinLineName,isTFT:"true"===e.dataset.isTFT};DataStore.set("selectedSkin",t),applyBackground(t)}d.remove(),s.remove(),uiVisible=!1,checkAndCreateButton()}),G.appendChild(q),c.appendChild(G),d.appendChild(c),shuffleCycleIntervalId&&(clearInterval(shuffleCycleIntervalId),shuffleCycleIntervalId=null,DEBUG&&console.log("Stopped existing shuffle cycle")),e.appendChild(s),e.appendChild(d),generatePreviewGroups("champion"),D(previewGroups,r,C,T)}window.addEventListener("load",()=>{DEBUG&&console.log("Pengu Loader Client Background Customizer plugin loading..."),setupActivityCenterObserver(),setupProfilesMainObserver(),setupPostgameObserver(),updatePlaceholderInvitedContainer(),loadSavedSettings(),Promise.allSettled([fetch("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/skins.json").then(e=>{if(!e.ok)throw Error(`HTTP error! Status: ${e.status}`);return e.json()}).then(e=>{skinData=Object.values(e).flatMap(e=>{let t=e=>e?e.replace(/^\/lol-game-data\/assets\/ASSETS\//i,"").toLowerCase():"",o={...e,tilePath:t(e.tilePath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.tilePath)}`:"",splashPath:t(e.splashPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.splashPath)}`:"",uncenteredSplashPath:t(e.uncenteredSplashPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.uncenteredSplashPath)}`:"",splashVideoPath:t(e.splashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.splashVideoPath)}`:"",collectionSplashVideoPath:t(e.collectionSplashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.collectionSplashVideoPath)}`:""},a=[o];return(e.splashVideoPath||e.collectionSplashVideoPath)&&a.push({...e,id:`${e.id}-animated`,name:`${e.name} Animated`,tilePath:t(e.tilePath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.tilePath)}`:"",splashPath:t(e.splashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.splashVideoPath)}`:"",uncenteredSplashPath:t(e.collectionSplashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.collectionSplashVideoPath)}`:"",splashVideoPath:t(e.splashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.splashVideoPath)}`:"",collectionSplashVideoPath:t(e.collectionSplashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.collectionSplashVideoPath)}`:"",isAnimated:!0}),e.questSkinInfo&&e.questSkinInfo.tiers&&e.questSkinInfo.tiers.forEach((o,l)=>{if(0!==l&&o.tilePath&&o.splashPath){let r={...e,id:o.id||`${e.id}-${o.stage}`,name:o.name||`${e.name} Stage ${o.stage}`,tilePath:t(o.tilePath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.tilePath)}`:"",splashPath:t(o.splashPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.splashPath)}`:"",uncenteredSplashPath:t(o.uncenteredSplashPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.uncenteredSplashPath)}`:"",splashVideoPath:t(o.splashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.splashVideoPath)}`:"",collectionSplashVideoPath:t(o.collectionSplashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.collectionSplashVideoPath)}`:"",stage:o.stage};a.push(r),(o.splashVideoPath||o.collectionSplashVideoPath)&&a.push({...e,id:o.id?`${o.id}-animated`:`${e.id}-${o.stage}-animated`,name:o.name?`${o.name} Animated`:`${e.name} Stage ${o.stage} Animated`,tilePath:t(o.tilePath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.tilePath)}`:"",splashPath:t(o.splashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.splashVideoPath)}`:"",uncenteredSplashPath:t(o.collectionSplashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.collectionSplashVideoPath)}`:"",splashVideoPath:t(o.splashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.splashVideoPath)}`:"",collectionSplashVideoPath:t(o.collectionSplashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.collectionSplashVideoPath)}`:"",stage:o.stage,isAnimated:!0})}}),a}),DEBUG&&console.log("Fetched skins.json, skinData length:",skinData.length)}),fetch("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/universes.json").then(e=>{if(!e.ok)throw Error(`HTTP error! Status: ${e.status}`);return e.json()}).then(e=>{universeData=Array.isArray(e)?e:[],DEBUG&&console.log("Fetched universes.json, universeData length:",universeData.length)}),fetch("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/skinlines.json").then(e=>{if(!e.ok)throw Error(`HTTP error! Status: ${e.status}`);return e.json()}).then(e=>{skinLineData=Array.isArray(e)?e:[],DEBUG&&console.log("Fetched skinlines.json, skinLineData length:",skinLineData.length)}),fetch("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/tftrotationalshopitemdata.json").then(e=>{if(!e.ok)throw Error(`HTTP error! Status: ${e.status}`);return e.json()}).then(e=>{tftData=(tftData=Array.isArray(e)?e:[]).map(e=>{let t=e.backgroundTextureLCU?e.backgroundTextureLCU.replace(/^ASSETS\//i,"").toLowerCase():"",o=e.standaloneLoadoutsLargeIcon?e.standaloneLoadoutsLargeIcon.replace(/^ASSETS\//i,"").toLowerCase():"";return{...e,backgroundTextureLCU:t?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t}`:"",standaloneLoadoutsLargeIcon:o?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${o}`:"",isTFT:!0}}),DEBUG&&console.log("Fetched tftrotationalshopitemdata.json, tftData length:",tftData.length)})]).then(e=>{let t=e.filter(e=>"rejected"===e.status).map(e=>e.reason);t.length>0&&(DEBUG&&console.error("Errors during data fetch:",t),alert("Some data failed to load. Falling back to champion grouping.")),generatePreviewGroups("champion"),checkAndApplyBackground()}).catch(e=>{DEBUG&&console.error("Unexpected error during data fetch:",e),alert("Failed to initialize data.")}),setTimeout(()=>{let e=new MutationObserver(()=>{uiVisible||checkAndCreateButton(),checkAndApplyBackground()}),t=document.querySelector('[data-screen-name="rcp-fe-lol-parties"]')||document.body;e.observe(t,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["data-screen-name"]}),checkAndCreateButton(),checkAndApplyBackground()},1e3)}),document.head.insertAdjacentHTML("beforeend",`
  <style>
    .parties-view .parties-background .uikit-background-switcher {
      opacity: 0 !important;
    }
    /* Hide the entire placeholder invited container when background is enabled */
    .custom-background .placeholder-invited-container {
      display: none !important;
    }
  </style>
`);
/**
* @name Background-Customizer
* @author Erisu
* @link https://github.com/ErisuGreyrat
*/

let uiVisible=!1,debounceTimeout,skinData=[],universeData=[],skinLineData=[],tftData=[],previewGroups=[],backgroundEnabled=!0,currentOpacity=.3,storedOpacity=currentOpacity,persistBackground=!1,centeredSplash=!0,settingsVisible=!1,cycleShuffleEnabled=!1,cycleInterval=30,currentSearchQuery="",shuffleCycleIntervalId=null,transitionDuration=.5,lastAppliedUrl=null,skinProfiles=[],activeProfile=null,isInitialLoad=!0,customBackgrounds=[],DEBUG=!1;function isDataStoreAvailable(){return void 0!==window.DataStore}function saveSettings(){try{let e={backgroundEnabled,currentOpacity:storedOpacity,persistBackground,centeredSplash,cycleShuffleEnabled,cycleInterval,transitionDuration,skinProfiles,activeProfile,customBackgrounds,debug:DEBUG,savedAt:new Date().toISOString()};isDataStoreAvailable()?(DataStore.set("dynamicBg_config",e),DEBUG&&console.log("Settings saved:",e)):DEBUG&&console.error("DataStore API not available")}catch(t){DEBUG&&console.error("Failed to save settings:",t)}}function loadSavedSettings(){try{if(isDataStoreAvailable()){let e=DataStore.get("dynamicBg_config");if(e)return backgroundEnabled=void 0===e.backgroundEnabled||e.backgroundEnabled,currentOpacity=storedOpacity=void 0!==e.currentOpacity?parseFloat(e.currentOpacity):.3,persistBackground=void 0!==e.persistBackground&&e.persistBackground,centeredSplash=void 0===e.centeredSplash||e.centeredSplash,cycleShuffleEnabled=void 0!==e.cycleShuffleEnabled&&e.cycleShuffleEnabled,cycleInterval=void 0!==e.cycleInterval?parseInt(e.cycleInterval):30,transitionDuration=void 0!==e.transitionDuration?parseFloat(e.transitionDuration):.5,skinProfiles=void 0!==e.skinProfiles?e.skinProfiles:[],activeProfile=void 0!==e.activeProfile?e.activeProfile:null,customBackgrounds=void 0!==e.customBackgrounds?e.customBackgrounds:[],DEBUG=void 0!==e.debug&&e.debug,console.log("Loaded settings:",{backgroundEnabled,currentOpacity:storedOpacity,persistBackground,centeredSplash,cycleShuffleEnabled,cycleInterval,transitionDuration,skinProfiles,activeProfile,customBackgrounds,debug:DEBUG,savedAt:e.savedAt}),!0}return DEBUG&&console.log("No saved settings, using defaults"),!1}catch(t){return DEBUG&&console.error("Failed to load settings:",t),!1}}function preloadImage(e){return new Promise(t=>{if(!e)return t();let o=new Image;o.src=e,o.onload=t,o.onerror=()=>{DEBUG&&console.warn(`Failed to preload image: ${e}`),t()}})}function preloadVideo(e){return new Promise(t=>{if(!e)return t();let o=document.createElement("video");o.src=e,o.preload="auto",o.onloadeddata=t,o.onerror=()=>{DEBUG&&console.warn(`Failed to preload video: ${e}`),t()}})}async function applyBackground(e){let t=document.getElementById("rcp-fe-viewport-root");if(!t||!e||!backgroundEnabled){removeBackground();return}DEBUG&&console.log(`Applying background for ${e.name} with opacity: ${currentOpacity}`);let o=centeredSplash?e.splashPath||e.backgroundTextureLCU||e.uncenteredSplashPath:e.uncenteredSplashPath||e.splashPath||e.backgroundTextureLCU;if(o===lastAppliedUrl){let a=document.getElementById("client-bg-container");if(a){let l=a.querySelector(".client-bg-layer:last-child");l&&parseFloat(l.style.opacity)!==currentOpacity&&(l.style.opacity=currentOpacity,DEBUG&&console.log(`Updated opacity to ${currentOpacity} for unchanged background: ${e.name}`))}return}let i=e.isAnimated||o.toLowerCase().endsWith(".webm");i?await preloadVideo(o):await preloadImage(o);let n=document.getElementById("client-bg-container");n||((n=document.createElement("div")).id="client-bg-container",n.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
        `,t.appendChild(n),t.classList.add("custom-background"));let r=n.querySelectorAll(".client-bg-layer");r.length>1&&r.forEach((e,t)=>{t<r.length-1&&(e.remove(),DEBUG&&console.log(`Removed excess layer: ${"VIDEO"===e.tagName?e.src:e.style.backgroundImage}`))});let s;i?((s=document.createElement("video")).className="client-bg-layer",s.src=o,s.loop=!0,s.muted=!0,s.autoplay=!0,s.playsInline=!0,s.style.cssText=`
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
    `,s.offsetHeight,i||(s.style.opacity=currentOpacity);let c=n.querySelector(".client-bg-layer:not(:last-child)");c&&(c.style.opacity=0,setTimeout(()=>{c.parentNode&&(c.remove(),DEBUG&&console.log(`Cleaned up old layer: ${"VIDEO"===c.tagName?c.src:c.style.backgroundImage}`))},1e3*transitionDuration+100)),lastAppliedUrl=o,DEBUG&&console.log(`Background applied: ${e.name}, URL: ${o}, Type: ${i?"video":"image"}, Opacity: ${currentOpacity}, Transition: ${transitionDuration}s`)}function removeBackground(){let e=document.getElementById("rcp-fe-viewport-root");if(e&&e.classList.contains("custom-background")){let t=document.getElementById("client-bg-container");if(t){let o=t.querySelectorAll(".client-bg-layer");o.forEach(e=>{e.style.opacity=0,setTimeout(()=>{e.parentNode&&(e.remove(),DEBUG&&console.log(`Removed layer during reset: ${"VIDEO"===e.tagName?e.src:e.style.backgroundImage}`))},1e3*transitionDuration+100)}),setTimeout(()=>{t.parentNode&&(t.remove(),DEBUG&&console.log("Removed background container"))},1e3*transitionDuration+100)}e.classList.remove("custom-background"),lastAppliedUrl=null,DEBUG&&console.log("Background fully removed")}}function checkAndApplyBackground(){let e=document.getElementById("rcp-fe-viewport-root");if(!e)return;let t=document.querySelector('[data-screen-name="rcp-fe-lol-parties"]'),o=document.querySelector('.screen-root.active[data-screen-name="rcp-fe-lol-activity-center"]'),a=document.querySelector('.screen-root[data-screen-name="rcp-fe-lol-postgame"]'),l=document.querySelector('.screen-root[data-screen-name="rcp-fe-lol-profiles-main"]'),i=DataStore.get("selectedSkin");currentOpacity=o&&"1"===getComputedStyle(o).opacity||a&&"1"===getComputedStyle(a).opacity||l&&"1"===getComputedStyle(l).opacity?0:storedOpacity,backgroundEnabled&&i&&(t||persistBackground)?(applyBackground(i),updatePlaceholderInvitedContainer()):(removeBackground(),updatePlaceholderInvitedContainer())}function setupActivityCenterObserver(){let e=document.querySelector('.screen-root.active[data-screen-name="rcp-fe-lol-activity-center"]');if(!e){DEBUG&&console.log("Activity center not found for observer setup");return}let t=new MutationObserver(()=>{checkAndApplyBackground()});t.observe(e,{attributes:!0,attributeFilter:["style","class"]}),DEBUG&&console.log("Activity center observer set up")}function setupProfilesMainObserver(){let e=document.querySelector('.screen-root[data-screen-name="rcp-fe-lol-profiles-main"]');if(!e){DEBUG&&console.log("Profiles main screen not found for observer setup");return}let t=new MutationObserver(()=>{checkAndApplyBackground()});t.observe(e,{attributes:!0,attributeFilter:["style","class"]}),DEBUG&&console.log("Profiles main screen observer set up")}function setupPostgameObserver(){let e=document.querySelector('.screen-root[data-screen-name="rcp-fe-lol-postgame"]');if(!e){DEBUG&&console.log("Postgame screen not found for observer setup");return}let t=new MutationObserver(()=>{checkAndApplyBackground()});t.observe(e,{attributes:!0,attributeFilter:["style","class"]}),DEBUG&&console.log("Postgame screen observer set up")}function updatePlaceholderInvitedContainer(){if(!backgroundEnabled){let e=document.querySelectorAll(".placeholder-invited-container");e.forEach(e=>{e.querySelector('video[src*="/fe/lol-parties/parties-v2/invited-banner.webm"]')&&(e.style.display="",DEBUG&&debugLog("Restored placeholder invited container visibility"))});return}let t=document.querySelectorAll(".placeholder-invited-container");t.forEach(e=>{e.querySelector('video[src*="/fe/lol-parties/parties-v2/invited-banner.webm"]')&&(e.style.display="none",DEBUG&&debugLog("Hidden placeholder invited container"))})}function setupPlaceholderContainerObserver(){let e=document.querySelector('[data-screen-name="rcp-fe-lol-parties"]');if(!e){DEBUG&&debugLog("Parties screen not found for placeholder container observer setup");return}let t=new MutationObserver(e=>{for(let t of e)if("childList"===t.type){let o=Array.from(t.addedNodes).some(e=>e.nodeType===Node.ELEMENT_NODE&&(e.classList?.contains("placeholder-invited-container")||e.querySelector?.(".placeholder-invited-container")));if(o){DEBUG&&debugLog("Placeholder invited container added to DOM"),updatePlaceholderInvitedContainer();break}}});t.observe(e,{childList:!0,subtree:!0}),DEBUG&&debugLog("Placeholder container observer set up")}function checkAndCreateButton(){clearTimeout(debounceTimeout),debounceTimeout=setTimeout(()=>{let e=document.querySelector('[data-screen-name="rcp-fe-lol-parties"]'),t=document.getElementById("client-bg-show-button");if(!e){t&&t.remove();return}t||createShowButton(e)},100)}function createShowButton(e){let t=document.getElementById("client-bg-hover-area");t&&t.remove();let o=document.createElement("div");o.id="client-bg-hover-area",o.style.cssText=`
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
    `,o.addEventListener("mouseenter",()=>{a.style.opacity="1"}),o.addEventListener("mouseleave",()=>{a.style.opacity="0"}),a.addEventListener("mouseenter",()=>{a.style.background="#1e2328",a.style.borderColor="#c8aa6e",a.style.color="#f0e6d2"}),a.addEventListener("mouseleave",()=>{a.style.background="#010a13",a.style.borderColor="#785a28",a.style.color="#cdbe91"}),a.addEventListener("mousedown",()=>{a.style.color="#785a28"}),a.addEventListener("mouseup",()=>{a.style.color="#f0e6d2"}),a.addEventListener("click",()=>{let t=document.getElementById("client-bg-customizer-ui-wrapper");t&&t.remove(),createClientBackgroundCustomizerUI(e),uiVisible=!0,o.remove()}),o.appendChild(a),e.appendChild(o)}function generatePreviewGroups(e){if(DEBUG&&console.log("Generating preview groups for type:",e),previewGroups=[],"champion"===e){let t={};skinData.forEach(e=>{if(e.tilePath){let o=e.tilePath.match(/\/Characters\/([^\/]+)\//i);if(o){let a=o[1];t[a]||(t[a]=[]),t[a].push({name:e.name,tilePath:e.tilePath,splashPath:e.splashPath,uncenteredSplashPath:e.uncenteredSplashPath,skinLineId:e.skinLines&&e.skinLines.length>0?e.skinLines[0].id:null})}}});let o=Object.keys(t).map(e=>({title:e,items:t[e]}));o.sort((e,t)=>e.title.localeCompare(t.title)),o.forEach(e=>{e.items.sort((e,t)=>e.name.localeCompare(t.name))}),previewGroups.push(...o)}else if("universes"===e){if(!Array.isArray(universeData)||0===universeData.length||!Array.isArray(skinLineData)||0===skinLineData.length){DEBUG&&console.warn("Universe or skinline data unavailable, falling back to champion"),generatePreviewGroups("champion");return}let a={Other:[]},l={},i={};skinLineData.forEach(e=>{e.id&&e.name&&(l[e.id]=e.name)}),universeData.forEach(e=>{e&&"object"==typeof e&&e.name&&Array.isArray(e.skinSets)&&e.skinSets.forEach(t=>{let o=parseInt("object"==typeof t?t.id:t,10);isNaN(o)||(i[o]=e.name)})}),skinData.forEach(e=>{if(!e.tilePath)return;let t=e.skinLines&&e.skinLines.length>0&&null!=e.skinLines[0].id?parseInt(e.skinLines[0].id,10):null,o="Other",n=null;t&&(n=l[t]||`Unknown SkinLine ${t}`,o=i[t]||n),a[o]||(a[o]=[]),a[o].push({name:e.name,tilePath:e.tilePath,splashPath:e.splashPath,uncenteredSplashPath:e.uncenteredSplashPath,skinLineId:t,skinLineName:n})});let n=Object.keys(a).map(e=>({title:e,items:a[e]}));n.sort((e,t)=>e.title.localeCompare(t.title)),n.forEach(e=>{e.items.sort((e,t)=>e.name.localeCompare(t.name))}),previewGroups.push(...n)}else if("skinlines"===e){if(!Array.isArray(skinLineData)||0===skinLineData.length){DEBUG&&console.warn("Skinline data unavailable, falling back to champion"),generatePreviewGroups("champion");return}let r={Other:[]},s={};skinLineData.forEach(e=>{e.id&&e.name&&(s[e.id]=e.name)}),skinData.forEach(e=>{if(!e.tilePath)return;let t=e.skinLines&&e.skinLines.length>0&&null!=e.skinLines[0].id?parseInt(e.skinLines[0].id,10):null,o="Other",a=null;t&&(o=a=s[t]||`Unknown SkinLine ${t}`),r[o]||(r[o]=[]),r[o].push({name:e.name,tilePath:e.tilePath,splashPath:e.splashPath,uncenteredSplashPath:e.uncenteredSplashPath,skinLineId:t,skinLineName:a})});let d=Object.keys(r).map(e=>({title:e,items:r[e]}));d.sort((e,t)=>e.title.localeCompare(t.title)),d.forEach(e=>{e.items.sort((e,t)=>e.name.localeCompare(t.name))}),previewGroups.push(...d)}else DEBUG&&console.warn("Invalid type, falling back to champion"),generatePreviewGroups("champion");if(!1!==DataStore.get("tftEnabled")&&tftData.length>0){let c={title:"TFT",items:tftData.filter(e=>e.descriptionTraKey&&e.descriptionTraKey.toLowerCase().startsWith("companion")&&e.backgroundTextureLCU).map(e=>({name:e.name,tilePath:e.standaloneLoadoutsLargeIcon,splashPath:e.backgroundTextureLCU,uncenteredSplashPath:e.backgroundTextureLCU,skinLineId:null,skinLineName:null,isTFT:!0}))};c.items.length>0&&(c.items.sort((e,t)=>e.name.localeCompare(t.name)),previewGroups.push(c))}let p=DataStore.get("customBackgrounds")||[];DEBUG&&console.log("Custom Backgrounds from DataStore:",p);let u={title:"Custom Background",items:p.map(e=>({name:e.name,tilePath:e.tilePath,splashPath:e.splashPath,uncenteredSplashPath:e.uncenteredSplashPath,skinLineId:null,skinLineName:null,isTFT:!1,isAnimated:e.isAnimated}))};u.items.sort((e,t)=>e.name.localeCompare(t.name)),previewGroups.push(u),DEBUG&&console.log(`Generated ${previewGroups.length} preview groups for type: ${e}, Custom Backgrounds:`,u)}window.addEventListener("load",()=>{DEBUG&&console.log("Pengu Loader Client Background Customizer plugin loading..."),setupActivityCenterObserver(),setupProfilesMainObserver(),setupPostgameObserver(),updatePlaceholderInvitedContainer(),loadSavedSettings(),Promise.allSettled([fetch("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/skins.json").then(e=>{if(!e.ok)throw Error(`HTTP error! Status: ${e.status}`);return e.json()}).then(e=>{skinData=Object.values(e).flatMap(e=>{let t=e=>e?e.replace(/^\/lol-game-data\/assets\/ASSETS\//i,"").toLowerCase():"",o={...e,tilePath:t(e.tilePath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.tilePath)}`:"",splashPath:t(e.splashPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.splashPath)}`:"",uncenteredSplashPath:t(e.uncenteredSplashPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.uncenteredSplashPath)}`:"",splashVideoPath:t(e.splashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.splashVideoPath)}`:"",collectionSplashVideoPath:t(e.collectionSplashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.collectionSplashVideoPath)}`:""},a=[o];return(e.splashVideoPath||e.collectionSplashVideoPath)&&a.push({...e,id:`${e.id}-animated`,name:`${e.name} Animated`,tilePath:t(e.tilePath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.tilePath)}`:"",splashPath:t(e.splashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.splashVideoPath)}`:"",uncenteredSplashPath:t(e.collectionSplashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.collectionSplashVideoPath)}`:"",splashVideoPath:t(e.splashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.splashVideoPath)}`:"",collectionSplashVideoPath:t(e.collectionSplashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(e.collectionSplashVideoPath)}`:"",isAnimated:!0}),e.questSkinInfo&&e.questSkinInfo.tiers&&e.questSkinInfo.tiers.forEach((o,l)=>{if(0!==l&&o.tilePath&&o.splashPath){let i={...e,id:o.id||`${e.id}-${o.stage}`,name:o.name||`${e.name} Stage ${o.stage}`,tilePath:t(o.tilePath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.tilePath)}`:"",splashPath:t(o.splashPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.splashPath)}`:"",uncenteredSplashPath:t(o.uncenteredSplashPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.uncenteredSplashPath)}`:"",splashVideoPath:t(o.splashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.splashVideoPath)}`:"",collectionSplashVideoPath:t(o.collectionSplashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.collectionSplashVideoPath)}`:"",stage:o.stage};a.push(i),(o.splashVideoPath||o.collectionSplashVideoPath)&&a.push({...e,id:o.id?`${o.id}-animated`:`${e.id}-${o.stage}-animated`,name:o.name?`${o.name} Animated`:`${e.name} Stage ${o.stage} Animated`,tilePath:t(o.tilePath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.tilePath)}`:"",splashPath:t(o.splashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.splashVideoPath)}`:"",uncenteredSplashPath:t(o.collectionSplashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.collectionSplashVideoPath)}`:"",splashVideoPath:t(o.splashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.splashVideoPath)}`:"",collectionSplashVideoPath:t(o.collectionSplashVideoPath)?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t(o.collectionSplashVideoPath)}`:"",stage:o.stage,isAnimated:!0})}}),a}),DEBUG&&console.log("Fetched skins.json, skinData length:",skinData.length)}),fetch("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/universes.json").then(e=>{if(!e.ok)throw Error(`HTTP error! Status: ${e.status}`);return e.json()}).then(e=>{universeData=Array.isArray(e)?e:[],DEBUG&&console.log("Fetched universes.json, universeData length:",universeData.length)}),fetch("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/skinlines.json").then(e=>{if(!e.ok)throw Error(`HTTP error! Status: ${e.status}`);return e.json()}).then(e=>{skinLineData=Array.isArray(e)?e:[],DEBUG&&console.log("Fetched skinlines.json, skinLineData length:",skinLineData.length)}),fetch("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/tftrotationalshopitemdata.json").then(e=>{if(!e.ok)throw Error(`HTTP error! Status: ${e.status}`);return e.json()}).then(e=>{tftData=(tftData=Array.isArray(e)?e:[]).map(e=>{let t=e.backgroundTextureLCU?e.backgroundTextureLCU.replace(/^ASSETS\//i,"").toLowerCase():"",o=e.standaloneLoadoutsLargeIcon?e.standaloneLoadoutsLargeIcon.replace(/^ASSETS\//i,"").toLowerCase():"";return{...e,backgroundTextureLCU:t?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t}`:"",standaloneLoadoutsLargeIcon:o?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${o}`:"",isTFT:!0}}),DEBUG&&console.log("Fetched tftrotationalshopitemdata.json, tftData length:",tftData.length)}),]).then(e=>{let t=e.filter(e=>"rejected"===e.status).map(e=>e.reason);t.length>0&&(DEBUG&&console.error("Errors during data fetch:",t),alert("Some data failed to load. Falling back to champion grouping.")),generatePreviewGroups("champion"),checkAndApplyBackground()}).catch(e=>{DEBUG&&console.error("Unexpected error during data fetch:",e),alert("Failed to initialize data.")}),setTimeout(()=>{let e=new MutationObserver(()=>{uiVisible||checkAndCreateButton(),checkAndApplyBackground()}),t=document.querySelector('[data-screen-name="rcp-fe-lol-parties"]')||document.body;e.observe(t,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["data-screen-name"]}),checkAndCreateButton(),checkAndApplyBackground()},1e3)}),window.bgCustomizerFileCache=window.bgCustomizerFileCache||{};let fileCache=window.bgCustomizerFileCache;function debounce(e,t){let o;return function(...a){let l=this;clearTimeout(o),o=setTimeout(()=>e.apply(l,a),t)}}function generateFileId(e){return`${e.name}-${e.size}-${e.lastModified}`}function readFileAsDataURL(e){return new Promise((t,o)=>{let a=new FileReader;a.onload=()=>t(a.result),a.onerror=()=>o(Error("Failed to read file")),a.readAsDataURL(e)})}function processImageFile(e,t=1920,o=1080,a=.8){return new Promise((l,i)=>{let n=generateFileId(e);if(fileCache[n])return DEBUG&&console.log("Using cached processed image:",n),l(fileCache[n]);let r=new Image,s=new FileReader;s.onload=s=>{r.src=s.target.result,r.onload=()=>{let i=r.width,s=r.height;i>t&&(s=s*t/i,i=t),s>o&&(i=i*o/s,s=o);let d=document.createElement("canvas");d.width=i,d.height=s;let c=d.getContext("2d");c.drawImage(r,0,0,i,s);let p;p="image/jpeg"===e.type||"image/jpg"===e.type?d.toDataURL("image/jpeg",a):"image/png"===e.type?d.toDataURL("image/png",a):"image/gif"===e.type?d.toDataURL("image/png",a):d.toDataURL(e.type,a),fileCache[n]={dataUrl:p,width:i,height:s,originalSize:e.size,processedSize:Math.round(3*p.length/4)},DEBUG&&console.log("Image processed:",{original:`${(e.size/1048576).toFixed(2)}MB`,processed:`${(fileCache[n].processedSize/1048576).toFixed(2)}MB`,width:i,height:s}),l(fileCache[n])},r.onerror=()=>{i(Error("Failed to load image"))}},s.onerror=()=>{i(Error("Failed to read file"))},s.readAsDataURL(e)})}function processVideoFile(e){return new Promise((t,o)=>{let a=generateFileId(e);if(fileCache[a])return DEBUG&&console.log("Using cached processed video:",a),t(fileCache[a]);let l=document.createElement("video"),i=new FileReader;i.onload=i=>{l.src=i.target.result,l.onloadedmetadata=()=>{let o=i.target.result;fileCache[a]={dataUrl:o,width:l.videoWidth,height:l.videoHeight,duration:l.duration,originalSize:e.size,processedSize:e.size},DEBUG&&console.log("Video processed:",{size:`${(e.size/1048576).toFixed(2)}MB`,width:l.videoWidth,height:l.videoHeight,duration:`${l.duration.toFixed(1)}s`}),t(fileCache[a])},l.onerror=()=>{o(Error("Failed to load video"))}},i.onerror=()=>{o(Error("Failed to read file"))},i.readAsDataURL(e)})}function clearFileCache(){DEBUG&&console.log("File cache marked for cleanup")}function validateImageFile(e){return["image/jpeg","image/png","image/gif"].includes(e.type)?e.size>10485760?{valid:!1,error:"File too large. Maximum size: 10MB"}:{valid:!0}:{valid:!1,error:"Invalid file type. Supported formats: JPG, PNG, GIF"}}function validateVideoFile(e){return["video/webm"].includes(e.type)?e.size>20971520?{valid:!1,error:"File too large. Maximum size: 20MB"}:{valid:!0}:{valid:!1,error:"Invalid file type. Supported video format: WebM"}}function createCustomBackgroundUI(e){let t=document.createElement("div");t.id="client-bg-custom-ui-wrapper",t.style.cssText=`
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
        width: 650px;
        height: 650px;
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
    `,a.appendChild(l);let i=document.createElement("div");i.style.cssText=`
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 15px;
        overflow-y: auto;
        padding-right: 10px;
        scrollbar-width: thin;
        scrollbar-color: #785a28 transparent;
    `,i.className="custom-content";let n=document.createElement("div");n.style.cssText="display: flex; flex-direction: column; gap: 5px;";let r=document.createElement("label");r.textContent="Name",r.style.cssText=`
        color: #f0e6d2;
        font-size: 14px;
        font-weight: bold;
    `;let s=document.createElement("input");s.type="text",s.placeholder="Custom Background Name",s.style.cssText=`
        background: #010a13;
        border: 1px solid #785a28;
        color: #cdbe91;
        padding: 8px;
        border-radius: 2px;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
    `,n.appendChild(r),n.appendChild(s),i.appendChild(n);let d=document.createElement("div");d.style.cssText=`
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 10px;
        margin-bottom: 10px;
    `;let c=document.createElement("div");c.textContent="Preview",c.style.cssText=`
        color: #f0e6d2;
        font-size: 14px;
        font-weight: bold;
    `;let p=document.createElement("div");p.style.cssText=`
        width: 100%;
        height: 150px;
        background: #0A1428;
        border: 1px solid #785a28;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
    `;let u=document.createElement("div");u.textContent="Image preview will appear here",u.style.cssText=`
        color: #785a28;
        font-size: 14px;
    `,p.appendChild(u),d.appendChild(c),d.appendChild(p),i.appendChild(d);let g={},m={};function h(e,t){p.innerHTML="";let o=document.createElement("div");if(o.className="preview-loading",o.textContent="Loading preview...",o.style.cssText=`
        color: #785a28;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
    `,p.appendChild(o),t){let a=document.createElement("video");a.style.cssText=`
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          display: none; /* Hide until loaded */
      `,a.onloadeddata=()=>{p.querySelector(".preview-loading")?.remove(),a.style.display="block",a.duration>10&&(a.currentTime=1)},a.onerror=()=>{p.innerHTML="Failed to load video preview"},a.src=e,a.autoplay=!0,a.loop=!0,a.muted=!0,a.playbackRate=.75,p.appendChild(a)}else{let l=document.createElement("img");l.style.cssText=`
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          display: none; /* Hide until loaded */
      `,l.onload=()=>{p.querySelector(".preview-loading")?.remove(),l.style.display="block"},l.onerror=()=>{p.innerHTML="Failed to load image preview"},l.src=e,p.appendChild(l)}}[{label:"Tile Image",key:"tilePath",accept:"image/jpeg,image/png,image/gif",placeholder:"Or enter tile image URL (JPG, PNG, GIF)",required:!0},{label:"Splash Image/Video",key:"splashPath",accept:"image/jpeg,image/png,image/gif,video/webm",placeholder:"Or enter splash image/video URL (JPG, PNG, GIF, WebM)",required:!0},{label:"Uncentered Splash (Optional)",key:"uncenteredSplashPath",accept:"image/jpeg,image/png,image/gif,video/webm",placeholder:"Or enter uncentered splash URL (optional)",required:!1},].forEach(e=>{let t=document.createElement("div");t.style.cssText="display: flex; flex-direction: column; gap: 5px;";let o=document.createElement("label");o.textContent=e.label,o.style.cssText=`
        color: #f0e6d2;
        font-size: 14px;
        font-weight: bold;
    `;let a=document.createElement("div");a.style.cssText=`
        display: flex;
        gap: 10px;
        align-items: center;
    `;let l=document.createElement("input");l.type="file",l.accept=e.accept,l.style.display="none",m[e.key]=l;let n=document.createElement("button");n.textContent="Select File",n.style.cssText=`
        padding: 8px 12px;
        background: #1e2328;
        border: 1px solid #785a28;
        color: #cdbe91;
        border-radius: 2px;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        cursor: pointer;
        white-space: nowrap;
    `;let r=document.createElement("span");r.textContent="No file selected",r.style.cssText=`
        color: #cdbe91;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `;let s=document.createElement("input");s.type="text",s.placeholder=e.placeholder,s.style.cssText=`
        flex: 1;
        background: #010a13;
        border: 1px solid #785a28;
        color: #cdbe91;
        padding: 8px;
        border-radius: 2px;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        margin-top: 5px;
    `,g[e.key]=s;let d=document.createElement("div");d.className="file-loading-indicator",d.style.cssText=`
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 10, 19, 0.7);
        z-index: 10;
        justify-content: center;
        align-items: center;
    `;let c=document.createElement("div");c.className="loading-spinner",d.appendChild(c),a.style.position="relative",a.appendChild(d),n.addEventListener("click",()=>{l.click()});let p=debounce((e,t)=>{h(e,t)},100);l.addEventListener("change",async t=>{if(t.target.files&&t.target.files[0]){let o=t.target.files[0],a=o.type.startsWith("video/"),i=a?validateVideoFile(o):validateImageFile(o);if(!i.valid){v.textContent=i.error,v.style.display="block",setTimeout(()=>{v.style.display="none"},3e3),l.value="",r.textContent="No file selected";return}d.style.display="flex",r.textContent=`Processing ${o.name}...`;try{let n;if(a)n=await processVideoFile(o);else{let c=o.size>5242880?.6:.8;n=await processImageFile(o,1920,1080,c)}let u=(o.size/1048576).toFixed(1),g=(n.processedSize/1048576).toFixed(1);r.textContent=`${o.name} (${g}MB / ${u}MB)`;let m=generateFileId(o);s.dataset.fileId=m,s.dataset.fallbackDataUrl=n.dataUrl,s.value=`[PROCESSED FILE: ${m}]`,DEBUG&&console.log(`File cached with ID: ${m}, cache size: ${Object.keys(fileCache).length}`),"splashPath"===e.key&&p(n.dataUrl,a),a&&"splashPath"===e.key&&(x.checked=!0)}catch(h){DEBUG&&console.error("Error processing file:",h),v.textContent="Failed to process file",v.style.display="block",setTimeout(()=>{v.style.display="none"},3e3),r.textContent="No file selected"}finally{d.style.display="none"}}}),s.addEventListener("input",debounce(()=>{if("splashPath"===e.key&&s.value){if(s.value.startsWith("[PROCESSED FILE:"))return;let t=s.value.toLowerCase().endsWith(".webm")||s.value.includes("data:video/");h(s.value,t),t&&(x.checked=!0)}},300)),a.appendChild(n),a.appendChild(r),t.appendChild(o),t.appendChild(a),t.appendChild(s),i.appendChild(t)});let f=document.createElement("div");f.style.cssText="display: flex; align-items: center; gap: 10px; margin-top: 10px;";let b=document.createElement("label");b.textContent="Animated (Video)",b.style.cssText=`
        color: #f0e6d2;
        font-size: 14px;
        font-weight: bold;
    `;let $=document.createElement("label");$.className="toggle-switch";let x=document.createElement("input");x.type="checkbox";let y=document.createElement("span");y.className="toggle-slider",$.appendChild(x),$.appendChild(y),f.appendChild(b),f.appendChild($),i.appendChild(f);let v=document.createElement("span");v.style.cssText="color: #ff5555; font-size: 12px; display: none; margin-top: 5px;",i.appendChild(v);let _=document.createElement("button");_.textContent="Add Background",_.style.cssText=`
        padding: 8px 12px;
        background: #1e2328;
        border: 1px solid #785a28;
        color: #cdbe91;
        border-radius: 2px;
        font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
        cursor: pointer;
        margin-top: 15px;
    `,_.addEventListener("mouseover",()=>{_.style.background="#1e2328",_.style.borderColor="#c8aa6e",_.style.color="#f0e6d2"}),_.addEventListener("mouseout",()=>{_.style.background="#1e2328",_.style.borderColor="#785a28",_.style.color="#cdbe91"}),_.addEventListener("click",async()=>{try{let o=document.createElement("div");o.className="form-loading-indicator",o.style.cssText=`
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 10, 19, 0.7);
          z-index: 100;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
      `;let a=document.createElement("div");a.className="loading-spinner",a.style.width="40px",a.style.height="40px";let l=document.createElement("div");l.textContent="Processing...",l.style.cssText=`
          color: #cdbe91;
          margin-top: 15px;
          font-size: 16px;
      `,o.appendChild(a),o.appendChild(l);let n=s.value.trim(),r=x.checked;if(!n){v.textContent="Background name is required",v.style.display="block",setTimeout(()=>{v.style.display="none"},3e3);return}if(customBackgrounds.some(e=>e.name===n)){v.textContent="Name already taken",v.style.display="block",setTimeout(()=>{v.style.display="none"},3e3);return}let d=async()=>{try{i.style.position="relative",i.appendChild(o);let e={};for(let t of["tilePath","splashPath","uncenteredSplashPath",]){let a=g[t],l=a.value.trim();if(!l&&"uncenteredSplashPath"===t){e[t]="";continue}if(!l&&("tilePath"===t||"splashPath"===t))throw Error(`${"tilePath"===t?"Tile Image":"Splash Image"} is required`);if(l.startsWith("[PROCESSED FILE:")){let s=l.substring(16,l.length-1);if(fileCache[s]&&fileCache[s].dataUrl){e[t]=fileCache[s].dataUrl,DEBUG&&console.log(`Retrieved cached file: ${s} for ${t}`);continue}if(DEBUG&&console.warn(`File reference not found: ${s}, using fallback`),a.dataset&&a.dataset.fallbackDataUrl){e[t]=a.dataset.fallbackDataUrl,DEBUG&&console.log(`Using fallback data URL for ${t}`);continue}{let d=e=>e.startsWith("data:")||e.startsWith("http://")||e.startsWith("https://")||e.startsWith("file://");if(d(l)){e[t]=l,DEBUG&&console.log(`Using input value as fallback for ${t}`);continue}throw Error("Processed file reference not found and no fallback available. Please reselect the file.")}}let c=e=>e.startsWith("data:")||e.startsWith("http://")||e.startsWith("https://")||e.startsWith("file://");if(!c(l))throw Error(`Invalid ${"tilePath"===t?"Tile Image":"splashPath"===t?"Splash Image":"Uncentered Splash"} URL format`);if(l.startsWith("data:")){let p=l.includes("data:video/"),u=p?20:5,m=l.substring(l.indexOf(",")+1).length,h=.75*m,f=h/1048576;if(f>u)throw Error(`${"tilePath"===t?"Tile Image":"splashPath"===t?"Splash Image":"Uncentered Splash"} file is too large (approximately ${f.toFixed(1)}MB). Maximum size: ${u}MB`)}e[t]=l}return DEBUG&&console.log("Adding custom background:",{name:n,tilePath:"...[processed]...",splashPath:"...[processed]...",uncenteredSplashPath:e.uncenteredSplashPath?"...[processed]...":"none",isAnimated:r}),(customBackgrounds=DataStore.get("customBackgrounds")||[]).push({name:n,tilePath:e.tilePath,splashPath:e.splashPath,uncenteredSplashPath:e.uncenteredSplashPath,isAnimated:r}),clearFileCache(),!0}catch(b){return v.textContent=b.message||"Failed to process files",v.style.display="block",setTimeout(()=>{v.style.display="none"},3e3),!1}finally{o.remove()}},c=await d();if(!c)return;DataStore.set("customBackgrounds",customBackgrounds),saveSettings(),DEBUG&&console.log("Updated customBackgrounds:",customBackgrounds,"DataStore:",DataStore.get("customBackgrounds")),DEBUG&&console.log("Custom Background UI closing, starting restore process"),t.remove();let p=document.getElementById("client-bg-customizer-ui-wrapper"),u=document.querySelectorAll("#client-bg-customizer-ui-wrapper");u.length>1&&(DEBUG&&console.warn("Multiple customizer wrappers found, removing duplicates"),u.forEach((e,t)=>{t>0&&e.remove()}),p=u[0]);let m=document.querySelectorAll(".client-bg-customizer-backdrop");if(m.length>1&&(DEBUG&&console.warn("Multiple backdrops found, removing duplicates"),m.forEach((e,t)=>{t>0&&e.remove()})),p){DEBUG&&console.log("Customizer wrapper found, restoring visibility"),p.style.display="block";let h=document.getElementById("client-bg-customizer-ui"),f=h?.querySelector(".main-window");if(h&&f&&window.renderSkins){window.favoriteSkins=DataStore.get("favoriteSkins")||[],window.isFavoritesToggled=DataStore.get("favoritesToggled")||!1,console.log("Restored state:",{favoriteSkinsCount:window.favoriteSkins.length,isFavoritesToggled:window.isFavoritesToggled,customBackgroundsCount:customBackgrounds.length,searchQuery:currentSearchQuery});let b=h.querySelector(".filter-dropdown .dropdown-toggle"),$=h.querySelector(".filter-dropdown .dropdown-menu");if(b&&$){let y="All Skins";b.textContent=y,$.querySelectorAll(".dropdown-item").forEach(e=>{e.classList.toggle("selected",e.textContent===y)}),DEBUG&&console.log(`Filter dropdown updated to: ${y}`)}else DEBUG&&console.warn("Filter dropdown or menu not found");DEBUG&&console.log("Generating previewGroups for groupType: champion"),generatePreviewGroups("champion"),DEBUG&&console.log("Updated previewGroups:",previewGroups),DEBUG&&console.log("Rendering skins with filter: all"),window.renderSkins(previewGroups,currentSearchQuery||"","all")}else{DEBUG&&console.warn("Customizer UI or main window missing, reinitializing"),p&&p.remove();let _=document.querySelector(".client-bg-customizer-backdrop");_&&_.remove(),createClientBackgroundCustomizerUI(e)}}else{DEBUG&&console.warn("Customizer wrapper not found, creating new UI");let k=document.querySelector(".client-bg-customizer-backdrop");k&&k.remove(),createClientBackgroundCustomizerUI(e)}}catch(w){DEBUG&&console.error("Error in addButton handler:",w)}}),i.appendChild(_);let k=document.createElement("style");k.textContent=`
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
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 20px;
        }
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #1e2328;
            border: 1px solid #785a28;
            transition: .4s;
            border-radius: 20px;
        }
        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 14px;
            width: 14px;
            left: 3px;
            bottom: 2px;
            background-color: #cdbe91;
            transition: .4s;
            border-radius: 50%;
        }
        input:checked + .toggle-slider {
            background-color: #1e2328;
            border-color: #c8aa6e;
        }
        input:checked + .toggle-slider:before {
            transform: translateX(18px);
            background-color: #f0e6d2;
        }

        /* Loading spinner */
        .loading-spinner {
            width: 30px;
            height: 30px;
            border: 3px solid rgba(120, 90, 40, 0.3);
            border-radius: 50%;
            border-top-color: #c8aa6e;
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Disable input during processing */
        .processing {
            pointer-events: none;
            opacity: 0.7;
        }
    `,document.head.appendChild(k),a.appendChild(i),o.appendChild(a);let w=document.createElement("button");w.textContent="Close",w.className="custom-close-button",w.style.cssText=`
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
    `,w.addEventListener("mouseover",()=>{w.style.color="#f0e6d2",w.style.borderColor="#c8aa6e",w.style.boxShadow="0 0 8px 4px rgba(212, 184, 117, 0.5), inset 0 0 1px 1px #010a13"}),w.addEventListener("mouseout",()=>{w.style.color="#cdbe91",w.style.borderColor="#785a28",w.style.boxShadow="0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13"}),w.addEventListener("click",()=>{DEBUG&&console.log("Cleaning up unused file references before closing");let e=new Set;Object.values(g).forEach(t=>{t.dataset&&t.dataset.fileId&&e.add(t.dataset.fileId)}),DEBUG&&(console.log(`Cache before cleanup: ${Object.keys(fileCache).length} items`),console.log(`Used file IDs: ${e.size} items`)),t.remove();let o=document.getElementById("client-bg-customizer-ui-wrapper");if(o){o.style.display="block";let a=document.getElementById("client-bg-customizer-ui");a&&window.renderSkins&&(generatePreviewGroups(document.querySelector(".custom-dropdown:not(.filter-dropdown):not(.sort-dropdown) .dropdown-item.selected")?.dataset.value||"champion"),window.renderSkins(previewGroups,currentSearchQuery,document.querySelector(".filter-dropdown .dropdown-item.selected")?.dataset.value||"all"))}}),o.appendChild(w),t.appendChild(o),e.appendChild(t)}function createProfilesUI(e){let t=document.createElement("div");t.id="client-bg-profiles-ui-wrapper",t.style.cssText=`
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
    `,a.appendChild(l);let i=document.createElement("div");i.style.cssText=`
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 15px;
        overflow-y: auto;
        padding-right: 10px;
        scrollbar-width: thin;
        scrollbar-color: #785a28 transparent;
    `,i.className="profiles-content";let n=document.createElement("div");n.style.cssText="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;";let r=document.createElement("input");r.type="text",r.placeholder=`Profile ${skinProfiles.length+1}`,r.style.cssText=`
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
    `,s.addEventListener("mouseover",()=>{s.style.background="#1e2328",s.style.borderColor="#c8aa6e",s.style.color="#f0e6d2"}),s.addEventListener("mouseout",()=>{s.style.background="#1e2328",s.style.borderColor="#785a28",s.style.color="#cdbe91"});let d=document.createElement("span");d.style.cssText="color: #ff5555; font-size: 12px; display: none; margin-top: 5px;",n.appendChild(r),n.appendChild(s),i.appendChild(n),i.appendChild(d);let c=document.createElement("div");function p(){if(c.innerHTML="",0===skinProfiles.length){let e=document.createElement("div");e.textContent="No profiles saved",e.style.cssText=`
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
            `,l.addEventListener("click",()=>{DEBUG&&console.log(`Loading profile: ${e.name}`),DataStore.set("favoriteSkins",e.skins),window.favoriteSkins=e.skins||[],window.isFavoritesToggled=DataStore.get("favoritesToggled")||!1,activeProfile=e.name,saveSettings(),p();let t=document.getElementById("client-bg-customizer-ui");if(t){let o=t.querySelector(".main-window");if(o&&window.renderSkins){console.log("Preparing to render skins with:",{favoriteSkinsCount:window.favoriteSkins.length,isFavoritesToggled:window.isFavoritesToggled,previewGroupsCount:previewGroups.length,searchQuery:currentSearchQuery});let a=t.querySelector(".filter-dropdown .dropdown-toggle"),l=t.querySelector(".filter-dropdown .dropdown-menu");if(a&&l){let i=window.isFavoritesToggled?"Favorites":"All Skins";a.textContent=i,l.querySelectorAll(".dropdown-item").forEach(e=>{e.classList.toggle("selected",e.textContent===i)}),DEBUG&&console.log(`Filter dropdown updated to: ${i}`)}else DEBUG&&console.warn("Filter dropdown or menu not found");let n=window.isFavoritesToggled?"favorites":"all";DEBUG&&console.log(`Rendering skins with filter: ${n}`),window.renderSkins(previewGroups,currentSearchQuery,n)}else DEBUG&&console.error("Main window or renderSkins missing")}else DEBUG&&console.error("Customizer UI not found")});let i=document.createElement("button");i.textContent="Save",i.style.cssText=`
                padding: 4px 8px;
                background: #1e2328;
                border: 1px solid #785a28;
                color: #cdbe91;
                border-radius: 2px;
                cursor: pointer;
            `,i.addEventListener("click",()=>{let t=DataStore.get("favoriteSkins")||[];if(0===t.length){d.textContent="No favorites to save",d.style.display="block",setTimeout(()=>{d.style.display="none"},3e3);return}e.skins=t,saveSettings(),p()});let n=document.createElement("button");n.textContent="\uD83D\uDDD1",n.style.cssText=`
                padding: 4px 8px;
                background: #1e2328;
                border: 1px solid #785a28;
                color: #cdbe91;
                border-radius: 2px;
                cursor: pointer;
            `,n.addEventListener("click",()=>{skinProfiles=skinProfiles.filter(t=>t!==e),activeProfile===e.name&&(activeProfile=null),saveSettings(),p()});let r=document.createElement("button");r.textContent="↑",r.style.cssText=`
                padding: 4px 8px;
                background: #1e2328;
                border: 1px solid #785a28;
                color: #cdbe91;
                border-radius: 2px;
                cursor: ${0===t?"not-allowed":"pointer"};
                opacity: ${0===t?.5:1};
            `,r.disabled=0===t,r.addEventListener("click",()=>{t>0&&([skinProfiles[t-1],skinProfiles[t]]=[skinProfiles[t],skinProfiles[t-1],],saveSettings(),p())});let s=document.createElement("button");s.textContent="↓",s.style.cssText=`
                padding: 4px 8px;
                background: #1e2328;
                border: 1px solid #785a28;
                color: #cdbe91;
                border-radius: 2px;
                cursor: ${t===skinProfiles.length-1?"not-allowed":"pointer"};
                opacity: ${t===skinProfiles.length-1?.5:1};
            `,s.disabled=t===skinProfiles.length-1,s.addEventListener("click",()=>{t<skinProfiles.length-1&&([skinProfiles[t],skinProfiles[t+1]]=[skinProfiles[t+1],skinProfiles[t],],saveSettings(),p())}),[l,i,n,r,s].forEach(e=>{e.addEventListener("mouseover",()=>{e.style.background="#1e2328",e.style.borderColor="#c8aa6e",e.style.color="#f0e6d2"}),e.addEventListener("mouseout",()=>{e.style.background="#1e2328",e.style.borderColor="#785a28",e.style.color="#cdbe91"})}),o.appendChild(a),o.appendChild(l),o.appendChild(i),o.appendChild(n),o.appendChild(r),o.appendChild(s),c.appendChild(o)})}c.style.cssText="display: flex; flex-direction: column; gap: 10px;",i.appendChild(c),s.addEventListener("click",()=>{let e=r.value.trim()||`Profile ${skinProfiles.length+1}`;if(!e||skinProfiles.some(t=>t.name===e)){d.textContent=e?"Name already taken":"Name cannot be empty",d.style.display="block",setTimeout(()=>{d.style.display="none"},3e3);return}skinProfiles.push({name:e,skins:[]}),saveSettings(),r.value="",p()}),p();let u=document.createElement("style");u.textContent=`
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
    `,document.head.appendChild(u),a.appendChild(i),o.appendChild(a);let g=document.createElement("button");g.textContent="Close",g.className="profiles-close-button",g.style.cssText=`
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
    `,g.addEventListener("mouseover",()=>{g.style.color="#f0e6d2",g.style.borderColor="#c8aa6e",g.style.boxShadow="0 0 8px 4px rgba(212, 184, 117, 0.5), inset 0 0 1px 1px #010a13"}),g.addEventListener("mouseout",()=>{g.style.color="#cdbe91",g.style.borderColor="#785a28",g.style.boxShadow="none"}),g.addEventListener("click",()=>{DEBUG&&console.log("Profiles UI closing, starting restore process"),t.remove();let o=document.getElementById("client-bg-customizer-ui-wrapper"),a=document.querySelectorAll("#client-bg-customizer-ui-wrapper");a.length>1&&(DEBUG&&console.warn("Multiple customizer wrappers found, removing duplicates"),a.forEach((e,t)=>{t>0&&e.remove()}),o=a[0]);let l=document.querySelectorAll(".client-bg-customizer-backdrop");if(l.length>1&&(DEBUG&&console.warn("Multiple backdrops found, removing duplicates"),l.forEach((e,t)=>{t>0&&e.remove()})),o){DEBUG&&console.log("Customizer wrapper found, restoring visibility"),o.style.display="block";let i=document.getElementById("client-bg-customizer-ui"),n=i?.querySelector(".main-window");if(i&&n&&window.renderSkins){window.favoriteSkins=DataStore.get("favoriteSkins")||[],window.isFavoritesToggled=DataStore.get("favoritesToggled")||!1,console.log("Restored state:",{favoriteSkinsCount:window.favoriteSkins.length,isFavoritesToggled:window.isFavoritesToggled,previewGroupsCount:previewGroups.length,searchQuery:currentSearchQuery});let r=o.querySelector(".favorites-toggle");if(r){r.classList.toggle("toggled",window.isFavoritesToggled);let s=r.querySelector(".toggled");s&&s.classList.toggle("toggled-on",window.isFavoritesToggled),DEBUG&&console.log("Favorites toggle updated")}let d=i.querySelector(".filter-dropdown .dropdown-toggle"),c=i.querySelector(".filter-dropdown .dropdown-menu");if(d&&c){let p=window.isFavoritesToggled?"Favorites":"All Skins";d.textContent=p,c.querySelectorAll(".dropdown-item").forEach(e=>{e.classList.toggle("selected",e.textContent===p)}),DEBUG&&console.log(`Filter dropdown updated to: ${p}`)}previewGroups.length||(DEBUG&&console.warn("previewGroups empty, regenerating"),generatePreviewGroups("champion")),document.querySelectorAll(".favorite-button").forEach(e=>{let t=e.closest(".skin-image")?.dataset.name,o="true"===e.closest(".skin-image")?.dataset.isTFT;t&&e.classList.toggle("favorited",window.favoriteSkins.some(e=>e.name===t&&e.isTFT===o))}),document.querySelectorAll(".group-favorite-button").forEach(e=>{let t=e.closest(".skin-group-title")?.dataset.groupTitle,o=previewGroups.find(e=>e.title===t)?.items||[],a=o.every(e=>window.favoriteSkins.some(t=>t.name===e.name&&t.isTFT===e.isTFT));e.classList.toggle("favorited",a)});let u=window.isFavoritesToggled?"favorites":"all";DEBUG&&console.log(`Rendering skins with filter: ${u}`),window.renderSkins(previewGroups,currentSearchQuery,u);let g=DataStore.get("selectedSkin");if(g&&g.name){let m=CSS.escape(g.name),h=`.skin-image[data-name="${m}"][data-is-tft="${g.isTFT}"]`,f=n.querySelector(h);f?(f.classList.add("selected"),f.scrollIntoView({behavior:"smooth",block:"center"}),DEBUG&&console.log(`Highlighted selected skin: ${g.name}`)):DEBUG&&console.warn(`Selected skin not found: ${g.name}`)}}else{DEBUG&&console.warn("Customizer UI or main window missing, reinitializing"),o&&o.remove();let b=document.querySelector(".client-bg-customizer-backdrop");b&&b.remove(),createClientBackgroundCustomizerUI(e)}}else{DEBUG&&console.warn("Customizer wrapper not found, creating new UI");let $=document.querySelector(".client-bg-customizer-backdrop");$&&$.remove(),createClientBackgroundCustomizerUI(e)}}),o.appendChild(g),t.appendChild(o),e.appendChild(t);let m=document.getElementById("client-bg-customizer-ui-wrapper");m?(DEBUG&&console.log("Hiding customizer UI"),m.style.display="none"):DEBUG&&console.warn("Customizer wrapper not found during profiles UI init")}function createSettingsUI(e){let t=document.createElement("div");t.id="client-bg-settings-ui-wrapper",t.style.cssText=`
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
    `,a.appendChild(l);let i=document.createElement("div");i.style.cssText=`
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 15px;
        overflow-y: auto;
        margin-right: 2px;
        padding-right: 10px;
        scrollbar-width: thin;
        scrollbar-color: #785a28 transparent;
    `,i.className="settings-content";let n=document.createElement("style");n.textContent=`
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
    `,document.head.appendChild(n);let r=document.createElement("h4");r.textContent="General",r.style.cssText=`
        color: #f0e6d2;
        font-size: 18px;
        font-weight: bold;
        margin: 10px 0 5px 0;
        text-transform: uppercase;
    `,i.appendChild(r);let s=document.createElement("div");s.className="toggle-btn",s.style.cssText="margin-bottom: 15px;";let d=document.createElement("span");d.textContent="Enable Background:";let c=document.createElement("label");c.className="toggle-switch";let p=document.createElement("input");p.type="checkbox",p.checked=backgroundEnabled;let u=document.createElement("span");u.className="toggle-slider",c.appendChild(p),c.appendChild(u),s.appendChild(d),s.appendChild(c),i.appendChild(s),p.addEventListener("change",()=>{backgroundEnabled=p.checked,saveSettings(),checkAndApplyBackground()});let g=document.createElement("label");g.textContent="Background Opacity:",g.style.cssText="margin-bottom: 5px;",i.appendChild(g);let m=document.createElement("div");m.style.cssText=`
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
    `;let f=document.createElement("span");f.textContent=storedOpacity.toString(),f.style.width="40px";let b=document.createElement("button");b.textContent="<",b.style.cssText=`
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
    `,b.addEventListener("click",()=>{let e=Math.max(parseFloat(h.min),Math.round((parseFloat(h.value)-.1)*10)/10);h.value=e,storedOpacity=e,f.textContent=e.toString(),currentOpacity=storedOpacity,saveSettings(),checkAndApplyBackground()});let $=document.createElement("button");$.textContent=">",$.style.cssText=`
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
    `,$.addEventListener("click",()=>{let e=Math.min(parseFloat(h.max),Math.round((parseFloat(h.value)+.1)*10)/10);h.value=e,storedOpacity=e,f.textContent=e.toString(),currentOpacity=storedOpacity,saveSettings(),checkAndApplyBackground()}),h.addEventListener("input",()=>{storedOpacity=parseFloat(h.value),f.textContent=storedOpacity.toString(),currentOpacity=storedOpacity,saveSettings(),checkAndApplyBackground()}),b.addEventListener("mouseover",()=>{b.style.color="#f0e6d2",b.style.borderColor="#c8aa6e"}),b.addEventListener("mouseout",()=>{b.style.color="#cdbe91",b.style.borderColor="#785a28"}),$.addEventListener("mouseover",()=>{$.style.color="#f0e6d2",$.style.borderColor="#c8aa6e"}),$.addEventListener("mouseout",()=>{$.style.color="#cdbe91",$.style.borderColor="#785a28"}),m.appendChild(b),m.appendChild(h),m.appendChild($),m.appendChild(f),i.appendChild(m);let x=document.createElement("div");x.className="toggle-btn",x.style.cssText="margin-bottom: 15px;";let y=document.createElement("span");y.textContent="Keep background on all screens:";let v=document.createElement("label");v.className="toggle-switch";let _=document.createElement("input");_.type="checkbox",_.checked=persistBackground;let k=document.createElement("span");k.className="toggle-slider",v.appendChild(_),v.appendChild(k),x.appendChild(y),x.appendChild(v),i.appendChild(x),_.addEventListener("change",()=>{persistBackground=_.checked,saveSettings(),checkAndApplyBackground()});let w=document.createElement("div");w.className="toggle-btn",w.style.cssText="margin-bottom: 15px;";let E=document.createElement("span");E.textContent="Centered Splash:";let C=document.createElement("label");C.className="toggle-switch";let L=document.createElement("input");L.type="checkbox",L.checked=centeredSplash;let S=document.createElement("span");S.className="toggle-slider",C.appendChild(L),C.appendChild(S),w.appendChild(E),w.appendChild(C),i.appendChild(w),L.addEventListener("change",()=>{centeredSplash=L.checked,saveSettings(),checkAndApplyBackground()});let B=document.createElement("div");B.className="toggle-btn",B.style.cssText="margin-bottom: 15px;";let P=document.createElement("span");P.textContent="Enable TFT Content:";let T=document.createElement("label");T.className="toggle-switch";let D=document.createElement("input");D.type="checkbox",D.checked=!1!==DataStore.get("tftEnabled");let U=document.createElement("span");U.className="toggle-slider",T.appendChild(D),T.appendChild(U),B.appendChild(P),B.appendChild(T),i.appendChild(B),D.addEventListener("change",()=>{let e=D.checked;if(DataStore.set("tftEnabled",e),!e){let t=DataStore.get("selectedSkin");t&&t.isTFT&&(DataStore.set("selectedSkin",null),removeBackground(),DEBUG&&console.log("Cleared selected TFT skin"))}saveSettings();let o=document.getElementById("client-bg-customizer-ui");if(o){generatePreviewGroups("champion");let a=o.querySelector(".main-window");a&&window.renderSkins&&window.renderSkins(previewGroups)}});let G=document.createElement("h4");G.textContent="Shuffle Settings",G.style.cssText=`
        color: #f0e6d2;
        font-size: 18px;
        font-weight: bold;
        margin: 10px 0 5px 0;
        text-transform: uppercase;
    `,i.appendChild(G);let I=document.createElement("hr");I.style.cssText=`
        border: 0;
        border-top: 1px solid #785a28;
        margin: 10px 0;
    `,i.appendChild(I);let z=document.createElement("div");z.className="toggle-btn",z.style.cssText="margin-bottom: 15px;";let F=document.createElement("span");F.textContent="Cycle Shuffle:";let A=document.createElement("label");A.className="toggle-switch";let N=document.createElement("input");N.type="checkbox",N.checked=cycleShuffleEnabled;let O=document.createElement("span");O.className="toggle-slider",A.appendChild(N),A.appendChild(O),z.appendChild(F),z.appendChild(A),i.appendChild(z),N.addEventListener("change",()=>{cycleShuffleEnabled=N.checked,saveSettings()});let q=document.createElement("label");q.textContent="Cycle Shuffle Interval (Seconds):",q.style.cssText="margin-bottom: 5px;",i.appendChild(q);let V=document.createElement("div");V.style.cssText=`
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
    `;let M=document.createElement("span");M.textContent=cycleInterval.toString(),M.style.width="40px";let R=document.createElement("button");R.textContent="<",R.style.cssText=`
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
    `,R.addEventListener("click",()=>{let e=Math.max(parseInt(j.min),10*Math.round((parseInt(j.value)-10)/10));j.value=e,cycleInterval=e,M.textContent=e.toString(),saveSettings()});let W=document.createElement("button");W.textContent=">",W.style.cssText=`
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
    `,W.addEventListener("click",()=>{let e=Math.min(parseInt(j.max),10*Math.round((parseInt(j.value)+10)/10));j.value=e,cycleInterval=e,M.textContent=e.toString(),saveSettings()}),R.addEventListener("mouseover",()=>{R.style.color="#f0e6d2",R.style.borderColor="#c8aa6e"}),R.addEventListener("mouseout",()=>{R.style.color="#cdbe91",R.style.borderColor="#785a28"}),W.addEventListener("mouseover",()=>{W.style.color="#f0e6d2",W.style.borderColor="#c8aa6e"}),W.addEventListener("mouseout",()=>{W.style.color="#cdbe91",W.style.borderColor="#785a28"}),V.appendChild(R),V.appendChild(j),V.appendChild(W),V.appendChild(M),i.appendChild(V),j.addEventListener("input",()=>{cycleInterval=parseInt(j.value),M.textContent=cycleInterval.toString(),saveSettings()});let H=document.createElement("label");H.textContent="Transition Duration (Seconds):",H.style.cssText="margin-bottom: 5px;",i.appendChild(H);let Q=document.createElement("div");Q.style.cssText=`
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
    `;let J=document.createElement("span");J.textContent=transitionDuration.toString(),J.style.width="40px";let X=document.createElement("button");X.textContent="<",X.style.cssText=`
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
    `,X.addEventListener("click",()=>{let e=Math.max(parseFloat(K.min),Math.round((parseFloat(K.value)-.1)*10)/10);K.value=e,transitionDuration=e,J.textContent=e.toString(),saveSettings()});let Y=document.createElement("button");Y.textContent=">",Y.style.cssText=`
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
    `,Y.addEventListener("click",()=>{let e=Math.min(parseFloat(K.max),Math.round((parseFloat(K.value)+.1)*10)/10);K.value=e,transitionDuration=e,J.textContent=e.toString(),saveSettings()}),X.addEventListener("mouseover",()=>{X.style.color="#f0e6d2",X.style.borderColor="#c8aa6e"}),X.addEventListener("mouseout",()=>{X.style.color="#cdbe91",X.style.borderColor="#785a28"}),Y.addEventListener("mouseover",()=>{Y.style.color="#f0e6d2",Y.style.borderColor="#c8aa6e"}),Y.addEventListener("mouseout",()=>{Y.style.color="#cdbe91",Y.style.borderColor="#785a28"}),Q.appendChild(X),Q.appendChild(K),Q.appendChild(Y),Q.appendChild(J),i.appendChild(Q),K.addEventListener("input",()=>{transitionDuration=parseFloat(K.value),J.textContent=transitionDuration.toString(),saveSettings()});let Z=document.createElement("h4");Z.textContent="Debug",Z.style.cssText=`
        color: #f0e6d2;
        font-size: 18px;
        font-weight: bold;
        margin: 10px 0 5px 0;
        text-transform: uppercase;
    `,i.appendChild(Z);let ee=document.createElement("hr");ee.style.cssText=`
        border: 0;
        border-top: 1px solid #785a28;
        margin: 10px 0;
    `,i.appendChild(ee);let et=document.createElement("div");et.className="toggle-btn",et.style.cssText="margin-bottom: 15px;";let eo=document.createElement("span");eo.textContent="Enable Debug Mode:";let ea=document.createElement("label");ea.className="toggle-switch";let el=document.createElement("input");el.type="checkbox",el.checked=DEBUG;let ei=document.createElement("span");ei.className="toggle-slider",ea.appendChild(el),ea.appendChild(ei),et.appendChild(eo),et.appendChild(ea),i.appendChild(et),el.addEventListener("change",()=>{(DEBUG=el.checked)&&console.log("Debug mode toggled:",DEBUG),saveSettings()}),a.appendChild(i),o.appendChild(a);let en=document.createElement("button");en.textContent="Close",en.className="settings-close-button",en.style.cssText=`
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
    `,en.addEventListener("mouseover",()=>{en.style.color="#f0e6d2",en.style.borderColor="#c8aa6e",en.style.boxShadow="0 0 8px 4px rgba(212, 184, 117, 0.5), inset 0 0 1px 1px #010a13"}),en.addEventListener("mouseout",()=>{en.style.color="#cdbe91",en.style.borderColor="#785a28",en.style.boxShadow="0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13"}),en.addEventListener("click",()=>{DEBUG&&console.log("Close button clicked"),t.remove(),settingsVisible=!1;let o=document.getElementById("client-bg-customizer-ui-wrapper");if(o){DEBUG&&console.log("Restoring customizer UI"),o.style.display="block";let a=document.getElementById("client-bg-customizer-ui");if(a){let l=a.querySelector(".custom-dropdown:not(.filter-dropdown):not(.sort-dropdown)");if(l){DEBUG&&console.log("Type dropdown found");let i=l.querySelector(".dropdown-toggle"),n=l.querySelector(".dropdown-menu");if(i&&n){DEBUG&&console.log("Updating dropdown to Champion"),i.textContent="Champion";let r=n.querySelector('.dropdown-item[data-value="champion"]');r&&(n.querySelectorAll(".dropdown-item").forEach(e=>e.classList.remove("selected")),r.classList.add("selected"),DEBUG&&console.log("Simulating Champion dropdown click"),r.click())}}else{DEBUG&&console.log("Type dropdown not found, falling back to manual refresh"),generatePreviewGroups("champion");let s=a.querySelector(".main-window");s&&window.renderSkins?(DEBUG&&console.log("Manually rendering skins"),window.renderSkins(previewGroups,currentSearchQuery)):DEBUG&&console.log("renderSkins not available or mainWindow not found")}}else DEBUG&&console.log("Customizer UI not found")}else DEBUG&&console.log("Customizer wrapper not found, recreating UI"),createClientBackgroundCustomizerUI(e)}),o.appendChild(en),t.appendChild(o),e.appendChild(t)}function startShuffleCycle(e,t){if(!cycleShuffleEnabled)return;shuffleCycleIntervalId&&(clearInterval(shuffleCycleIntervalId),DEBUG&&console.log("Cleared previous shuffle cycle"));let o=!1!==DataStore.get("tftEnabled");shuffleCycleIntervalId=setInterval(()=>{let a=[];if(t&&e.length>0?0===(a=e.filter(e=>o||!e.isTFT)).length&&(a=previewGroups.flatMap(e=>e.items.filter(e=>o||!e.isTFT)),DEBUG&&console.log("No valid favorites, falling back to all skins")):a=previewGroups.flatMap(e=>e.items.filter(e=>o||!e.isTFT)),0===a.length){DEBUG&&console.log("No items available for shuffle cycle"),clearInterval(shuffleCycleIntervalId),shuffleCycleIntervalId=null;return}let l=a[Math.floor(Math.random()*a.length)];DataStore.set("selectedSkin",{name:l.name,tilePath:l.tilePath,splashPath:l.splashPath,uncenteredSplashPath:l.uncenteredSplashPath,skinLineId:l.skinLineId,skinLineName:l.skinLineName,isTFT:l.isTFT,isAnimated:l.isAnimated}),applyBackground(l),DEBUG&&console.log(`Shuffle cycle applied: ${l.name}`)},1e3*cycleInterval),DEBUG&&console.log(`Started shuffle cycle with interval ${cycleInterval} seconds`)}function createClientBackgroundCustomizerUI(e){let t=DataStore.get("selectedSkin"),o=DataStore.get("favoriteSkins")||[],a=DataStore.get("favoritesToggled")||!1,l=!0,i="",n=document.getElementById("client-bg-customizer-ui-wrapper");n&&(DEBUG&&console.warn("Existing customizer wrapper found, removing to prevent duplicates"),n.remove());let r=document.querySelector(".client-bg-customizer-backdrop");r&&(DEBUG&&console.warn("Existing backdrop found, removing to prevent duplicates"),r.remove());let s=document.createElement("div");s.className="client-bg-customizer-backdrop",s.style.cssText=`
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
        `,document.head.appendChild(p));let u=document.createElement("div");u.className="header";let g=document.createElement("h3");g.textContent="BACKGROUND CUSTOMIZER",u.appendChild(g);let m=document.createElement("div");m.className="lol-uikit-close-button",m.setAttribute("button-type","cog");let h=document.createElement("div");h.className="contents";let f=document.createElement("div");f.className="close-icon",h.appendChild(f),m.appendChild(h),m.addEventListener("click",()=>{if(settingsVisible){let t=document.getElementById("client-bg-settings-ui-wrapper");t&&t.remove(),settingsVisible=!1}else createSettingsUI(e),settingsVisible=!0,d.style.display="none"}),u.appendChild(m),c.appendChild(u);let b=document.createElement("div");b.className="search-bar";let $=document.createElement("input");$.placeholder="Search",$.style.width="40%";let x=document.createElement("div");x.className="custom-dropdown",x.style.width="150px";let y=document.createElement("div");y.className="dropdown-toggle",y.textContent="Champion";let v=document.createElement("ul");v.className="dropdown-menu";let _="champion";[{label:"Champion",value:"champion"},{label:"Universes",value:"universes"},{label:"Skinlines",value:"skinlines"},].forEach(e=>{let t=document.createElement("li");t.className="dropdown-item",t.textContent=e.label,t.dataset.value=e.value,"champion"===e.value&&t.classList.add("selected"),t.addEventListener("click",()=>{y.textContent=e.label,v.querySelectorAll(".dropdown-item").forEach(e=>e.classList.remove("selected")),t.classList.add("selected"),_=e.value,v.classList.remove("show"),DEBUG&&console.log(`Selected type: ${_}`),generatePreviewGroups(_),D(previewGroups,i)}),v.appendChild(t)}),y.addEventListener("click",()=>{let e=v.classList.contains("show");document.querySelectorAll(".dropdown-menu").forEach(e=>e.classList.remove("show")),e||v.classList.add("show")}),x.appendChild(y),x.appendChild(v);let k=document.createElement("div");k.className="custom-dropdown filter-dropdown",k.style.width="120px";let w=document.createElement("div");w.className="dropdown-toggle",w.textContent=a?"Favorites":"All Skins";let E=document.createElement("ul");E.className="dropdown-menu";let C=a?"favorites":"all";["All Skins","Favorites"].forEach(e=>{let t=document.createElement("li");t.className="dropdown-item",t.textContent=e,t.dataset.value=e.toLowerCase().replace(" ",""),("Favorites"===e&&a||"All Skins"===e&&!a)&&t.classList.add("selected"),t.addEventListener("click",()=>{w.textContent=e,E.querySelectorAll(".dropdown-item").forEach(e=>e.classList.remove("selected")),t.classList.add("selected"),a="favorites"===(C=t.dataset.value),DataStore.set("favoritesToggled",a),E.classList.remove("show"),D(previewGroups,i,C)}),E.appendChild(t)}),k.appendChild(w),k.appendChild(E);let L=document.createElement("div");L.className="custom-dropdown",L.style.width="150px";let S=document.createElement("div");S.className="dropdown-toggle",S.textContent="Alphabetical▼";let B=document.createElement("ul");B.className="dropdown-menu";let P="alphabetical";[{label:"Alphabetical▼",value:"alphabetical"},{label:"Alphabetical▲",value:"alphabetical-reverse"},].forEach(e=>{let t=document.createElement("li");t.className="dropdown-item",t.textContent=e.label,t.dataset.value=e.value,"alphabetical"===e.value&&t.classList.add("selected"),t.addEventListener("click",()=>{S.textContent=e.label,B.querySelectorAll(".dropdown-item").forEach(e=>e.classList.remove("selected")),t.classList.add("selected"),P=e.value,B.classList.remove("show"),D(previewGroups,i,C,P)}),B.appendChild(t)}),L.appendChild(S),L.appendChild(B),[w,S].forEach(e=>{e.addEventListener("click",()=>{let t=e.nextElementSibling,o=t.classList.contains("show");document.querySelectorAll(".dropdown-menu").forEach(e=>e.classList.remove("show")),o||t.classList.add("show")})}),$.addEventListener("input",()=>{D(previewGroups,i=$.value.toLowerCase().trim(),C,P)}),b.appendChild($),b.appendChild(x),b.appendChild(k),b.appendChild(L),c.appendChild(b);let T=document.createElement("div");function D(e,o="",a="all",n="alphabetical"){let r=document.querySelector(".main-window");if(!r){DEBUG&&console.error("Main window not found");return}r.innerHTML="";let s=JSON.parse(JSON.stringify(e)),d=DataStore.get("favoriteSkins")||[],c=a||document.querySelector(".filter-dropdown .dropdown-item.selected")?.dataset.value||"all",p=n||document.querySelector(".sort-dropdown .dropdown-item.selected")?.dataset.value||"alphabetical";if("favorites"===c){if(0===d.length){let u=document.createElement("div");u.className="no-favorites-message",u.textContent="No favorited skins",r.appendChild(u);return}s=s.map(e=>({title:e.title,items:e.items.filter(e=>d.some(t=>t.name===e.name&&t.isTFT===e.isTFT))})).filter(e=>e.items.length>0)}o&&(s=s.map(e=>({title:e.title,items:e.items.filter(t=>t.name.toLowerCase().includes(o)||e.title.toLowerCase().includes(o))})).filter(e=>e.items.length>0||e.title.toLowerCase().includes(o))),"alphabetical"===p?(s.sort((e,t)=>e.title.localeCompare(t.title)),s.forEach(e=>{e.items.sort((e,t)=>e.name.localeCompare(t.name))})):(s.sort((e,t)=>e.title.localeCompare(t.title)),s.forEach(e=>{e.items.sort((e,t)=>e.name.localeCompare(t.name))}));let g=s.findIndex(e=>"Custom Background"===e.title);if(-1!==g){let m=s.splice(g,1)[0];s.unshift(m)}if(0===s.length&&!o&&"favorites"!==c){DEBUG&&console.warn("No groups to render, regenerating with champion grouping"),generatePreviewGroups("champion"),s=previewGroups;let h=s.findIndex(e=>"Custom Background"===e.title);if(-1!==h){let f=s.splice(h,1)[0];s.unshift(f)}}DEBUG&&console.log("Rendering groups:",s),s.forEach((e,a)=>{if("Custom Background"===e.title&&0===a){let l=document.createElement("button");l.textContent="ADD CUSTOM BACKGROUND",l.style.cssText=`
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
                `,l.addEventListener("mouseover",()=>{l.style.color="#f0e6d2",l.style.borderColor="#c8aa6e",l.style.boxShadow="0 0 8px 4px rgba(212, 184, 117, 0.5), inset 0 0 1px 1px #010a13"}),l.addEventListener("mouseout",()=>{l.style.color="#cdbe91",l.style.borderColor="#785a28",l.style.boxShadow="0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13"}),l.addEventListener("click",()=>{shuffleCycleIntervalId&&(clearInterval(shuffleCycleIntervalId),shuffleCycleIntervalId=null,DEBUG&&console.log("Stopped shuffle cycle for custom background UI")),createCustomBackgroundUI(document.body);let e=document.getElementById("client-bg-customizer-ui-wrapper");e&&(e.style.display="none")}),r.appendChild(l),DEBUG&&console.log("Added Add Custom button above Custom Background section")}let s=document.createElement("div");s.className="skin-group-title";let p=document.createElement("span");p.textContent=e.title,s.appendChild(p),s.dataset.groupTitle=e.title;let u=document.createElement("button");u.className="group-favorite-button";let g=e.items.every(e=>d.some(t=>t.name===e.name&&t.isTFT===e.isTFT));g&&u.classList.add("favorited"),u.addEventListener("click",()=>{let t=e.items.every(e=>d.some(t=>t.name===e.name&&t.isTFT===e.isTFT));if(t){d=d.filter(t=>!e.items.some(e=>e.name===t.name&&e.isTFT===t.isTFT)),u.classList.remove("favorited");let a=s.nextElementSibling.querySelectorAll(".favorite-button");a.forEach(e=>e.classList.remove("favorited"))}else{e.items.forEach(e=>{d.some(t=>t.name===e.name&&t.isTFT===e.isTFT)||d.push({name:e.name,tilePath:e.tilePath,splashPath:e.splashPath,uncenteredSplashPath:e.uncenteredSplashPath,skinLineId:e.skinLineId,skinLineName:e.skinLineName,isTFT:e.isTFT,isAnimated:e.isAnimated})}),u.classList.add("favorited");let l=s.nextElementSibling.querySelectorAll(".favorite-button");l.forEach(e=>e.classList.add("favorited"))}DataStore.set("favoriteSkins",d),D(previewGroups,o,c,n)}),s.appendChild(u),r.appendChild(s);let m=document.createElement("div");if(m.className="skin-group","Custom Background"===e.title&&0===e.items.length){let h=document.createElement("div");h.className="no-custom-message",h.textContent="No custom backgrounds added.",h.style.cssText=`
                    color: #cdbe91;
                    font-family: 'LoL Display', 'BeaufortforLOL', sans-serif;
                    font-size: 14px;
                    text-align: center;
                    padding: 20px;
                `,m.appendChild(h)}else e.items.forEach(a=>{let l=document.createElement("div");l.className="skin-container",l.style.position="relative";let r=document.createElement("div");r.className="skin-image",r.dataset.tilePath=a.tilePath||"",r.dataset.name=a.name,r.dataset.splashPath=a.splashPath,r.dataset.uncenteredSplashPath=a.uncenteredSplashPath,r.dataset.skinLineId=a.skinLineId||"",r.dataset.skinLineName=a.skinLineName||"",r.dataset.isTFT=a.isTFT?"true":"false",r.style.position="relative",r.style.boxSizing="border-box";let s=()=>{DEBUG&&console.log(`Image failed to load for ${a.name}: ${a.tilePath}`),r.className="skin-image failed",r.style.backgroundImage="none";let e=document.createElement("div");e.className="failed-text",e.textContent="Failed to Load Preview",r.appendChild(e)};if(a.tilePath){r.style.backgroundImage=`url(${a.tilePath})`;let p=new Image;p.src=a.tilePath,p.onerror=s}else s();t&&t.name.trim().toLowerCase()===a.name.trim().toLowerCase()&&t.isTFT===a.isTFT&&r.classList.add("selected"),r.addEventListener("click",()=>{document.querySelectorAll(".skin-image").forEach(e=>e.classList.remove("selected")),r.classList.add("selected");let e={name:a.name,tilePath:a.tilePath,splashPath:a.splashPath,uncenteredSplashPath:a.uncenteredSplashPath,skinLineId:a.skinLineId,skinLineName:a.skinLineName,isTFT:a.isTFT,isAnimated:a.isAnimated};DataStore.set("selectedSkin",e),applyBackground(e)});let u=document.createElement("button");if(u.className="favorite-button",d.some(e=>e.name===a.name&&e.isTFT===a.isTFT)&&u.classList.add("favorited"),u.addEventListener("click",t=>{t.stopPropagation();let i=d.some(e=>e.name===a.name&&e.isTFT===a.isTFT);i?(d=d.filter(e=>!(e.name===a.name&&e.isTFT==e.isTFT)),u.classList.remove("favorited")):(d.push({name:a.name,tilePath:a.tilePath,splashPath:a.splashPath,uncenteredSplashPath:a.uncenteredSplashPath,skinLineId:a.skinLineId,skinLineName:a.skinLineName,isTFT:a.isTFT,isAnimated:a.isAnimated}),u.classList.add("favorited")),DataStore.set("favoriteSkins",d),window.favoriteSkins=d;let r=l.closest(".skin-group").previousElementSibling.querySelector(".group-favorite-button"),s=e.items.every(e=>d.some(t=>t.name===e.name&&t.isTFT===e.isTFT));r.classList.toggle("favorited",s),D(previewGroups,o,c,n)}),r.appendChild(u),"Custom Background"===e.title){let g=document.createElement("button");g.className="delete-button",g.innerHTML="\uD83D\uDDD1️",g.style.cssText=`
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
                        `,g.addEventListener("mouseover",()=>{g.style.background="rgba(30, 35, 40, 1)",g.style.borderColor="#c8aa6e",g.style.color="#f0e6d2"}),g.addEventListener("mouseout",()=>{g.style.background="rgba(30, 35, 40, 0.8)",g.style.borderColor="#785a28",g.style.color="#cdbe91"}),g.addEventListener("click",e=>{try{e.stopPropagation(),DEBUG&&console.log("Attempting to delete custom background:",a.name);let t=previewGroups.findIndex(e=>"Custom Background"===e.title);if(-1===t){DEBUG&&console.warn("Custom Background group not found in previewGroups");return}let o=previewGroups[t];DEBUG&&console.log("Before deletion - previewGroups Custom Background items:",o.items),o.items=o.items.filter(e=>e.name!==a.name),DEBUG&&console.log("After deletion - previewGroups Custom Background items:",o.items),customBackgrounds=customBackgrounds.filter(e=>e.name!==a.name),DataStore.set("customBackgrounds",customBackgrounds),DEBUG&&console.log("Updated customBackgrounds:",customBackgrounds),DEBUG&&console.log("DataStore after save:",DataStore.get("customBackgrounds"));let l=DataStore.get("selectedSkin");l&&l.name===a.name&&l.isTFT===a.isTFT&&(DataStore.set("selectedSkin",null),removeBackground(),DEBUG&&console.log("Cleared selectedSkin and removed background as it matched deleted item:",a.name));let n=document.querySelector(".filter-dropdown .dropdown-item.selected")?.dataset.value||"all",r=document.querySelector(".sort-dropdown .dropdown-item.selected")?.dataset.value||"alphabetical";DEBUG&&console.log("Re-rendering skins with filter:",n),D(previewGroups,i||"",n,r),saveSettings()}catch(s){DEBUG&&console.error("Error in deleteButton handler:",s)}}),r.appendChild(g)}l.appendChild(r);let h=document.createElement("div");h.className="skin-label",h.textContent=a.name,l.appendChild(h),m.appendChild(l)});r.appendChild(m)}),t&&t.name&&l&&(setTimeout(()=>{let e=CSS.escape(t.name),o=`.skin-image[data-name="${e}"][data-is-tft="${t.isTFT}"]`,a=r.querySelector(o);a&&(a.classList.add("selected"),a.scrollIntoView({behavior:"smooth",block:"center"}))},200),l=!1),window.addMorePreviews=e=>{previewGroups.push(...e);let t=previewGroups.findIndex(e=>"Custom Background"===e.title);if(-1!==t){let a=previewGroups.splice(t,1)[0];previewGroups.unshift(a)}D(previewGroups,o,c,n)},DEBUG&&console.log("Rendered skins, Custom Background group:",s.find(e=>"Custom Background"===e.title))}T.className="main-window",c.appendChild(T);let U=document.createElement("div");U.className="bottom-bar";let G=document.createElement("button");G.textContent="RESET FAVORITES",G.addEventListener("click",()=>{o=[],DataStore.set("favoriteSkins",o),document.querySelectorAll(".favorite-button").forEach(e=>e.classList.remove("favorited")),document.querySelectorAll(".group-favorite-button").forEach(e=>e.classList.remove("favorited")),D(previewGroups,i,C,P)}),U.appendChild(G);let I=document.createElement("button");I.className="favorites-toggle",a&&I.classList.add("toggled");let z=document.createElement("div");z.className="toggle-container";let F=document.createElement("div");F.className="toggled",a&&F.classList.add("toggled-on");let A=document.createElement("div");A.className="toggle-button",z.appendChild(F),z.appendChild(A),I.appendChild(z),I.addEventListener("click",()=>{a=!a,DataStore.set("favoritesToggled",a),I.classList.toggle("toggled",a),F.classList.toggle("toggled-on",a),w.textContent=a?"Favorites":"All Skins",E.querySelectorAll(".dropdown-item").forEach(e=>{e.classList.toggle("selected",e.textContent===(a?"Favorites":"All Skins"))}),D(previewGroups,i,C=a?"favorites":"all",P)}),U.appendChild(I);let N=document.createElement("button");N.className="randomize-button",N.textContent="Shuffle",N.addEventListener("click",()=>{let e=[];if(0===(e=a&&o.length>0?o:previewGroups.flatMap(e=>e.items)).length){DEBUG&&console.log("No items available to randomize");return}let t=e[Math.floor(Math.random()*e.length)];DataStore.set("selectedSkin",{name:t.name,tilePath:t.tilePath,splashPath:t.splashPath,uncenteredSplashPath:t.uncenteredSplashPath,skinLineId:t.skinLineId,skinLineName:t.skinLineName,isTFT:t.isTFT}),document.querySelectorAll(".skin-image").forEach(e=>e.classList.remove("selected"));let l=`.skin-image[data-name="${CSS.escape(t.name)}"][data-is-tft="${t.isTFT}"]`,i=T.querySelector(l);i&&(i.classList.add("selected"),i.scrollIntoView({behavior:"smooth",block:"center"})),applyBackground(t),cycleShuffleEnabled&&(startShuffleCycle(o,a),d.remove(),s.remove(),uiVisible=!1,checkAndCreateButton())}),U.appendChild(N);let O=document.createElement("button");O.textContent="PROFILES",O.addEventListener("click",()=>{shuffleCycleIntervalId&&(clearInterval(shuffleCycleIntervalId),shuffleCycleIntervalId=null,DEBUG&&console.log("Stopped shuffle cycle for profiles UI")),createProfilesUI(e)}),U.appendChild(O);let q=document.createElement("button");q.textContent="Confirm",q.addEventListener("click",()=>{let e=T.querySelector(".skin-image.selected");if(e){let t={name:e.dataset.name,tilePath:e.dataset.tilePath,splashPath:e.dataset.splashPath,uncenteredSplashPath:e.dataset.uncenteredSplashPath,skinLineId:e.dataset.skinLineId,skinLineName:e.dataset.skinLineName,isTFT:"true"===e.dataset.isTFT};DataStore.set("selectedSkin",t),applyBackground(t)}d.remove(),s.remove(),uiVisible=!1,checkAndCreateButton()}),U.appendChild(q),c.appendChild(U),d.appendChild(c),shuffleCycleIntervalId&&(clearInterval(shuffleCycleIntervalId),shuffleCycleIntervalId=null,DEBUG&&console.log("Stopped existing shuffle cycle")),e.appendChild(s),e.appendChild(d),generatePreviewGroups("champion"),D(previewGroups,i,C,P)}document.head.insertAdjacentHTML("beforeend",`
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
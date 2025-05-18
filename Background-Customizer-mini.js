/**
* @name Background-Customizer
* @author Erisu
* @link https://github.com/ErisuGreyrat
*/

let uiVisible=!1,debounceTimeout,skinData=[],universeData=[],skinLineData=[],tftData=[],previewGroups=[],backgroundEnabled=!0,currentOpacity=.3,storedOpacity=currentOpacity,persistBackground=!1,centeredSplash=!0,settingsVisible=!1,cycleShuffleEnabled=!1,cycleInterval=30,currentSearchQuery="",shuffleCycleIntervalId=null,transitionDuration=.5,lastAppliedUrl=null,skinProfiles=[],activeProfile=null,isInitialLoad=!0;function isDataStoreAvailable(){return void 0!==window.DataStore}function saveSettings(){try{let e={backgroundEnabled,currentOpacity:storedOpacity,persistBackground,centeredSplash,cycleShuffleEnabled,cycleInterval,transitionDuration,skinProfiles,activeProfile,savedAt:new Date().toISOString()};isDataStoreAvailable()?(DataStore.set("dynamicBg_config",e),console.log("Settings saved:",e)):console.error("DataStore API not available")}catch(t){console.error("Failed to save settings:",t)}}function loadSavedSettings(){try{if(isDataStoreAvailable()){let e=DataStore.get("dynamicBg_config");if(e)return backgroundEnabled=void 0===e.backgroundEnabled||e.backgroundEnabled,currentOpacity=storedOpacity=void 0!==e.currentOpacity?parseFloat(e.currentOpacity):.3,persistBackground=void 0!==e.persistBackground&&e.persistBackground,centeredSplash=void 0===e.centeredSplash||e.centeredSplash,cycleShuffleEnabled=void 0!==e.cycleShuffleEnabled&&e.cycleShuffleEnabled,cycleInterval=void 0!==e.cycleInterval?parseInt(e.cycleInterval):30,transitionDuration=void 0!==e.transitionDuration?parseFloat(e.transitionDuration):.5,skinProfiles=void 0!==e.skinProfiles?e.skinProfiles:[],activeProfile=void 0!==e.activeProfile?e.activeProfile:null,console.log("Loaded settings:",{backgroundEnabled,currentOpacity:storedOpacity,persistBackground,centeredSplash,cycleShuffleEnabled,cycleInterval,transitionDuration,skinProfiles,activeProfile,savedAt:e.savedAt}),!0}return console.log("No saved settings, using defaults"),!1}catch(t){return console.error("Failed to load settings:",t),!1}}function preloadImage(e){return new Promise(t=>{if(!e)return t();let o=new Image;o.src=e,o.onload=t,o.onerror=()=>{console.warn(`Failed to preload image: ${e}`),t()}})}async function applyBackground(e){let t=document.getElementById("rcp-fe-viewport-root");if(!t||!e||!backgroundEnabled){removeBackground();return}console.log(`Applying background for ${e.name} with opacity: ${currentOpacity}`);let o=centeredSplash?e.splashPath||e.backgroundTextureLCU||e.uncenteredSplashPath:e.uncenteredSplashPath||e.splashPath||e.backgroundTextureLCU;if(o===lastAppliedUrl){let a=document.getElementById("client-bg-container");if(a){let n=a.querySelector(".client-bg-layer:last-child");n&&parseFloat(n.style.opacity)!==currentOpacity&&(n.style.opacity=currentOpacity,console.log(`Updated opacity to ${currentOpacity} for unchanged background: ${e.name}`))}return}await preloadImage(o);let l=document.getElementById("client-bg-container");l||((l=document.createElement("div")).id="client-bg-container",l.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
        `,t.appendChild(l),t.classList.add("custom-background"));let r=l.querySelectorAll(".client-bg-layer");r.length>1&&r.forEach((e,t)=>{t<r.length-1&&(e.remove(),console.log(`Removed excess layer: ${e.style.backgroundImage}`))});let i=document.createElement("div");i.className="client-bg-layer",i.style.cssText=`
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
    `,l.appendChild(i);let s=document.getElementById("client-bg-style");s||((s=document.createElement("style")).id="client-bg-style",document.head.appendChild(s)),s.textContent=`
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
    `,i.offsetHeight,i.style.opacity=currentOpacity;let d=l.querySelector(".client-bg-layer:not(:last-child)");d&&(d.style.opacity=0,setTimeout(()=>{d.parentNode&&(d.remove(),console.log(`Cleaned up old layer: ${d.style.backgroundImage}`))},1e3*transitionDuration+100)),lastAppliedUrl=o,console.log(`Background applied: ${e.name}, URL: ${o}, Opacity: ${currentOpacity}, Transition: ${transitionDuration}s`)}function removeBackground(){let e=document.getElementById("rcp-fe-viewport-root");if(e&&e.classList.contains("custom-background")){let t=document.getElementById("client-bg-container");if(t){let o=t.querySelectorAll(".client-bg-layer");o.forEach(e=>{e.style.opacity=0,setTimeout(()=>{e.parentNode&&(e.remove(),console.log(`Removed layer during reset: ${e.style.backgroundImage}`))},1e3*transitionDuration+100)}),setTimeout(()=>{t.parentNode&&(t.remove(),console.log("Removed background container"))},1e3*transitionDuration+100)}e.classList.remove("custom-background"),lastAppliedUrl=null,console.log("Background fully removed")}}function checkAndApplyBackground(){let e=document.getElementById("rcp-fe-viewport-root");if(!e)return;let t=document.querySelector('[data-screen-name="rcp-fe-lol-parties"]'),o=document.querySelector('.screen-root.active[data-screen-name="rcp-fe-lol-activity-center"]'),a=DataStore.get("selectedSkin");currentOpacity=o&&"1"===getComputedStyle(o).opacity?0:storedOpacity,backgroundEnabled&&a&&(t||persistBackground)?applyBackground(a):removeBackground()}function setupActivityCenterObserver(){let e=document.querySelector('.screen-root.active[data-screen-name="rcp-fe-lol-activity-center"]');if(!e){console.log("Activity center not found for observer setup");return}let t=new MutationObserver(()=>{checkAndApplyBackground()});t.observe(e,{attributes:!0,attributeFilter:["style","class"]}),console.log("Activity center observer set up")}function checkAndCreateButton(){clearTimeout(debounceTimeout),debounceTimeout=setTimeout(()=>{let e=document.querySelector('[data-screen-name="rcp-fe-lol-parties"]'),t=document.getElementById("client-bg-show-button");if(!e){t&&t.remove();return}t||createShowButton(e)},100)}function createShowButton(e){let t=document.getElementById("client-bg-hover-area");t&&t.remove();let o=document.createElement("div");o.id="client-bg-hover-area",o.style.cssText=`
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
    `,o.addEventListener("mouseenter",()=>{a.style.opacity="1"}),o.addEventListener("mouseleave",()=>{a.style.opacity="0"}),a.addEventListener("mouseenter",()=>{a.style.background="#1e2328",a.style.borderColor="#c8aa6e",a.style.color="#f0e6d2"}),a.addEventListener("mouseleave",()=>{a.style.background="#010a13",a.style.borderColor="#785a28",a.style.color="#cdbe91"}),a.addEventListener("mousedown",()=>{a.style.color="#785a28"}),a.addEventListener("mouseup",()=>{a.style.color="#f0e6d2"}),a.addEventListener("click",()=>{let t=document.getElementById("client-bg-customizer-ui-wrapper");t&&t.remove(),createClientBackgroundCustomizerUI(e),uiVisible=!0,o.remove()}),o.appendChild(a),e.appendChild(o)}function generatePreviewGroups(e){if(console.log("Generating preview groups for type:",e),previewGroups=[],"champion"===e){let t={};skinData.forEach(e=>{if(e.tilePath){let o=e.tilePath.match(/\/Characters\/([^\/]+)\//i);if(o){let a=o[1];t[a]||(t[a]=[]),t[a].push({name:e.name,tilePath:e.tilePath,splashPath:e.splashPath,uncenteredSplashPath:e.uncenteredSplashPath,skinLineId:e.skinLines&&e.skinLines.length>0?e.skinLines[0].id:null})}}});let o=Object.keys(t).map(e=>({title:e,items:t[e]}));o.sort((e,t)=>e.title.localeCompare(t.title)),o.forEach(e=>{e.items.sort((e,t)=>e.name.localeCompare(t.name))}),previewGroups.push(...o)}else if("universes"===e){if(!Array.isArray(universeData)||0===universeData.length||!Array.isArray(skinLineData)||0===skinLineData.length){console.warn("Universe or skinline data unavailable, falling back to champion"),generatePreviewGroups("champion");return}let a={Other:[]},n={},l={};skinLineData.forEach(e=>{e.id&&e.name&&(n[e.id]=e.name)}),universeData.forEach(e=>{e&&"object"==typeof e&&e.name&&Array.isArray(e.skinSets)&&e.skinSets.forEach(t=>{let o=parseInt("object"==typeof t?t.id:t,10);isNaN(o)||(l[o]=e.name)})}),skinData.forEach(e=>{if(!e.tilePath)return;let t=e.skinLines&&e.skinLines.length>0&&null!=e.skinLines[0].id?parseInt(e.skinLines[0].id,10):null,o="Other",r=null;t&&(r=n[t]||`Unknown SkinLine ${t}`,o=l[t]||r),a[o]||(a[o]=[]),a[o].push({name:e.name,tilePath:e.tilePath,splashPath:e.splashPath,uncenteredSplashPath:e.uncenteredSplashPath,skinLineId:t,skinLineName:r})});let r=Object.keys(a).map(e=>({title:e,items:a[e]}));r.sort((e,t)=>e.title.localeCompare(t.title)),r.forEach(e=>{e.items.sort((e,t)=>e.name.localeCompare(t.name))}),previewGroups.push(...r)}else if("skinlines"===e){if(!Array.isArray(skinLineData)||0===skinLineData.length){console.warn("Skinline data unavailable, falling back to champion"),generatePreviewGroups("champion");return}let i={Other:[]},s={};skinLineData.forEach(e=>{e.id&&e.name&&(s[e.id]=e.name)}),skinData.forEach(e=>{if(!e.tilePath)return;let t=e.skinLines&&e.skinLines.length>0&&null!=e.skinLines[0].id?parseInt(e.skinLines[0].id,10):null,o="Other",a=null;t&&(o=a=s[t]||`Unknown SkinLine ${t}`),i[o]||(i[o]=[]),i[o].push({name:e.name,tilePath:e.tilePath,splashPath:e.splashPath,uncenteredSplashPath:e.uncenteredSplashPath,skinLineId:t,skinLineName:a})});let d=Object.keys(i).map(e=>({title:e,items:i[e]}));d.sort((e,t)=>e.title.localeCompare(t.title)),d.forEach(e=>{e.items.sort((e,t)=>e.name.localeCompare(t.name))}),previewGroups.push(...d)}else console.warn("Invalid type, falling back to champion"),generatePreviewGroups("champion");if(!1!==DataStore.get("tftEnabled")&&tftData.length>0){let c={title:"TFT",items:tftData.filter(e=>e.descriptionTraKey&&e.descriptionTraKey.toLowerCase().startsWith("companion")&&e.backgroundTextureLCU).map(e=>({name:e.name,tilePath:e.standaloneLoadoutsLargeIcon,splashPath:e.backgroundTextureLCU,uncenteredSplashPath:e.backgroundTextureLCU,skinLineId:null,skinLineName:null,isTFT:!0}))};c.items.length>0&&(c.items.sort((e,t)=>e.name.localeCompare(t.name)),previewGroups.push(c))}console.log(`Generated ${previewGroups.length} preview groups for type: ${e}`)}function createProfilesUI(e){let t=document.createElement("div");t.id="client-bg-profiles-ui-wrapper",t.style.cssText=`
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
    `;let n=document.createElement("h3");n.textContent="Manage Skin Profiles",n.style.cssText=`
        color: #f0e6d2;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin: 0 0 20px 0;
        text-transform: uppercase;
    `,a.appendChild(n);let l=document.createElement("div");l.style.cssText=`
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 15px;
        overflow-y: auto;
        padding-right: 10px;
        scrollbar-width: thin;
        scrollbar-color: #785a28 transparent;
    `,l.className="profiles-content";let r=document.createElement("div");r.style.cssText="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;";let i=document.createElement("input");i.type="text",i.placeholder=`Profile ${skinProfiles.length+1}`,i.style.cssText=`
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
    `,s.addEventListener("mouseover",()=>{s.style.background="#1e2328",s.style.borderColor="#c8aa6e",s.style.color="#f0e6d2"}),s.addEventListener("mouseout",()=>{s.style.background="#1e2328",s.style.borderColor="#785a28",s.style.color="#cdbe91"});let d=document.createElement("span");d.style.cssText="color: #ff5555; font-size: 12px; display: none; margin-top: 5px;",r.appendChild(i),r.appendChild(s),l.appendChild(r),l.appendChild(d);let c=document.createElement("div");function p(){if(c.innerHTML="",0===skinProfiles.length){let e=document.createElement("div");e.textContent="No profiles saved",e.style.cssText=`
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
                `,t.addEventListener("blur",()=>{let o=t.value.trim();o&&!skinProfiles.some(t=>t.name===o&&t!==e)?(e.name===activeProfile&&(activeProfile=o),e.name=o,saveSettings(),p()):(d.textContent=o?"Name already taken":"Name cannot be empty",d.style.display="block",setTimeout(()=>{d.style.display="none"},3e3),p())}),t.addEventListener("keypress",e=>{"Enter"===e.key&&t.blur()}),a.replaceWith(t),t.focus()});let n=document.createElement("button");n.textContent="Load",n.style.cssText=`
                padding: 4px 8px;
                background: #1e2328;
                border: 1px solid #785a28;
                color: #cdbe91;
                border-radius: 2px;
                cursor: pointer;
            `,n.addEventListener("click",()=>{console.log(`Loading profile: ${e.name}`),DataStore.set("favoriteSkins",e.skins),window.favoriteSkins=e.skins||[],window.isFavoritesToggled=DataStore.get("favoritesToggled")||!1,activeProfile=e.name,saveSettings(),p();let t=document.getElementById("client-bg-customizer-ui");if(t){let o=t.querySelector(".main-window");if(o&&window.renderSkins){console.log("Preparing to render skins with:",{favoriteSkinsCount:window.favoriteSkins.length,isFavoritesToggled:window.isFavoritesToggled,previewGroupsCount:previewGroups.length,searchQuery:currentSearchQuery});let a=t.querySelector(".filter-dropdown .dropdown-toggle"),n=t.querySelector(".filter-dropdown .dropdown-menu");if(a&&n){let l=window.isFavoritesToggled?"Favorites":"All Skins";a.textContent=l,n.querySelectorAll(".dropdown-item").forEach(e=>{e.classList.toggle("selected",e.textContent===l)}),console.log(`Filter dropdown updated to: ${l}`)}else console.warn("Filter dropdown or menu not found");let r=window.isFavoritesToggled?"favorites":"all";console.log(`Rendering skins with filter: ${r}`),window.renderSkins(previewGroups,currentSearchQuery,r)}else console.error("Main window or renderSkins missing")}else console.error("Customizer UI not found")});let l=document.createElement("button");l.textContent="Save",l.style.cssText=`
                padding: 4px 8px;
                background: #1e2328;
                border: 1px solid #785a28;
                color: #cdbe91;
                border-radius: 2px;
                cursor: pointer;
            `,l.addEventListener("click",()=>{let t=DataStore.get("favoriteSkins")||[];if(0===t.length){d.textContent="No favorites to save",d.style.display="block",setTimeout(()=>{d.style.display="none"},3e3);return}e.skins=t,saveSettings(),p()});let r=document.createElement("button");r.textContent="\uD83D\uDDD1",r.style.cssText=`
                padding: 4px 8px;
                background: #1e2328;
                border: 1px solid #785a28;
                color: #cdbe91;
                border-radius: 2px;
                cursor: pointer;
            `,r.addEventListener("click",()=>{skinProfiles=skinProfiles.filter(t=>t!==e),activeProfile===e.name&&(activeProfile=null),saveSettings(),p()});let i=document.createElement("button");i.textContent="↑",i.style.cssText=`
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
            `,s.disabled=t===skinProfiles.length-1,s.addEventListener("click",()=>{t<skinProfiles.length-1&&([skinProfiles[t],skinProfiles[t+1]]=[skinProfiles[t+1],skinProfiles[t]],saveSettings(),p())}),[n,l,r,i,s].forEach(e=>{e.addEventListener("mouseover",()=>{e.style.background="#1e2328",e.style.borderColor="#c8aa6e",e.style.color="#f0e6d2"}),e.addEventListener("mouseout",()=>{e.style.background="#1e2328",e.style.borderColor="#785a28",e.style.color="#cdbe91"})}),o.appendChild(a),o.appendChild(n),o.appendChild(l),o.appendChild(r),o.appendChild(i),o.appendChild(s),c.appendChild(o)})}c.style.cssText="display: flex; flex-direction: column; gap: 10px;",l.appendChild(c),s.addEventListener("click",()=>{let e=i.value.trim()||`Profile ${skinProfiles.length+1}`;if(!e||skinProfiles.some(t=>t.name===e)){d.textContent=e?"Name already taken":"Name cannot be empty",d.style.display="block",setTimeout(()=>{d.style.display="none"},3e3);return}skinProfiles.push({name:e,skins:[]}),saveSettings(),i.value="",p()}),p();let u=document.createElement("style");u.textContent=`
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
    `,document.head.appendChild(u),a.appendChild(l),o.appendChild(a);let g=document.createElement("button");g.textContent="Close",g.className="profiles-close-button",g.style.cssText=`
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
    `,g.addEventListener("mouseover",()=>{g.style.color="#f0e6d2",g.style.borderColor="#c8aa6e",g.style.boxShadow="0 0 8px 4px rgba(212, 184, 117, 0.5), inset 0 0 1px 1px #010a13"}),g.addEventListener("mouseout",()=>{g.style.color="#cdbe91",g.style.borderColor="#785a28",g.style.boxShadow="none"}),g.addEventListener("click",()=>{console.log("Profiles UI closing, starting restore process"),t.remove();let o=document.getElementById("client-bg-customizer-ui-wrapper"),a=document.querySelectorAll("#client-bg-customizer-ui-wrapper");a.length>1&&(console.warn("Multiple customizer wrappers found, removing duplicates"),a.forEach((e,t)=>{t>0&&e.remove()}),o=a[0]);let n=document.querySelectorAll(".client-bg-customizer-backdrop");if(n.length>1&&(console.warn("Multiple backdrops found, removing duplicates"),n.forEach((e,t)=>{t>0&&e.remove()})),o){console.log("Customizer wrapper found, restoring visibility"),o.style.display="block";let l=document.getElementById("client-bg-customizer-ui"),r=l?.querySelector(".main-window");if(l&&r&&window.renderSkins){window.favoriteSkins=DataStore.get("favoriteSkins")||[],window.isFavoritesToggled=DataStore.get("favoritesToggled")||!1,console.log("Restored state:",{favoriteSkinsCount:window.favoriteSkins.length,isFavoritesToggled:window.isFavoritesToggled,previewGroupsCount:previewGroups.length,searchQuery:currentSearchQuery});let i=o.querySelector(".favorites-toggle");if(i){i.classList.toggle("toggled",window.isFavoritesToggled);let s=i.querySelector(".toggled");s&&s.classList.toggle("toggled-on",window.isFavoritesToggled),console.log("Favorites toggle updated")}let d=l.querySelector(".filter-dropdown .dropdown-toggle"),c=l.querySelector(".filter-dropdown .dropdown-menu");if(d&&c){let p=window.isFavoritesToggled?"Favorites":"All Skins";d.textContent=p,c.querySelectorAll(".dropdown-item").forEach(e=>{e.classList.toggle("selected",e.textContent===p)}),console.log(`Filter dropdown updated to: ${p}`)}previewGroups.length||(console.warn("previewGroups empty, regenerating"),generatePreviewGroups("champion")),document.querySelectorAll(".favorite-button").forEach(e=>{let t=e.closest(".skin-image")?.dataset.name,o="true"===e.closest(".skin-image")?.dataset.isTFT;t&&e.classList.toggle("favorited",window.favoriteSkins.some(e=>e.name===t&&e.isTFT===o))}),document.querySelectorAll(".group-favorite-button").forEach(e=>{let t=e.closest(".skin-group-title")?.dataset.groupTitle,o=previewGroups.find(e=>e.title===t)?.items||[],a=o.every(e=>window.favoriteSkins.some(t=>t.name===e.name&&t.isTFT===e.isTFT));e.classList.toggle("favorited",a)});let u=window.isFavoritesToggled?"favorites":"all";console.log(`Rendering skins with filter: ${u}`),window.renderSkins(previewGroups,currentSearchQuery,u);let g=DataStore.get("selectedSkin");if(g&&g.name){let m=CSS.escape(g.name),h=`.skin-image[data-name="${m}"][data-is-tft="${g.isTFT}"]`,b=r.querySelector(h);b?(b.classList.add("selected"),b.scrollIntoView({behavior:"smooth",block:"center"}),console.log(`Highlighted selected skin: ${g.name}`)):console.warn(`Selected skin not found: ${g.name}`)}}else{console.warn("Customizer UI or main window missing, reinitializing"),o&&o.remove();let f=document.querySelector(".client-bg-customizer-backdrop");f&&f.remove(),createClientBackgroundCustomizerUI(e)}}else{console.warn("Customizer wrapper not found, creating new UI");let $=document.querySelector(".client-bg-customizer-backdrop");$&&$.remove(),createClientBackgroundCustomizerUI(e)}}),o.appendChild(g),t.appendChild(o),e.appendChild(t);let m=document.getElementById("client-bg-customizer-ui-wrapper");m?(console.log("Hiding customizer UI"),m.style.display="none"):console.warn("Customizer wrapper not found during profiles UI init")}function createSettingsUI(e){let t=document.createElement("div");t.id="client-bg-settings-ui-wrapper",t.style.cssText=`
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
    `;let n=document.createElement("h3");n.textContent="Background Settings",n.style.cssText=`
        color: #f0e6d2;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin: 0 0 20px 0;
        text-transform: uppercase;
    `,a.appendChild(n);let l=document.createElement("div");l.style.cssText=`
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 15px;
        overflow-y: auto;
        margin-right: 2px;
        padding-right: 10px;
        scrollbar-width: thin;
        scrollbar-color: #785a28 transparent;
    `,l.className="settings-content";let r=document.createElement("style");r.textContent=`
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
    `,document.head.appendChild(r);let i=document.createElement("h4");i.textContent="General",i.style.cssText=`
        color: #f0e6d2;
        font-size: 18px;
        font-weight: bold;
        margin: 10px 0 5px 0;
        text-transform: uppercase;
    `,l.appendChild(i);let s=document.createElement("div");s.className="toggle-btn",s.style.cssText="margin-bottom: 15px;";let d=document.createElement("span");d.textContent="Enable Background:";let c=document.createElement("label");c.className="toggle-switch";let p=document.createElement("input");p.type="checkbox",p.checked=backgroundEnabled;let u=document.createElement("span");u.className="toggle-slider",c.appendChild(p),c.appendChild(u),s.appendChild(d),s.appendChild(c),l.appendChild(s),p.addEventListener("change",()=>{backgroundEnabled=p.checked,saveSettings(),checkAndApplyBackground()});let g=document.createElement("label");g.textContent="Background Opacity:",g.style.cssText="margin-bottom: 5px;",l.appendChild(g);let m=document.createElement("div");m.style.cssText=`
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
    `,$.addEventListener("click",()=>{let e=Math.min(parseFloat(h.max),Math.round((parseFloat(h.value)+.1)*10)/10);h.value=e,storedOpacity=e,b.textContent=e.toString(),currentOpacity=storedOpacity,saveSettings(),checkAndApplyBackground()}),h.addEventListener("input",()=>{storedOpacity=parseFloat(h.value),b.textContent=storedOpacity.toString(),currentOpacity=storedOpacity,saveSettings(),checkAndApplyBackground()}),f.addEventListener("mouseover",()=>{f.style.color="#f0e6d2",f.style.borderColor="#c8aa6e"}),f.addEventListener("mouseout",()=>{f.style.color="#cdbe91",f.style.borderColor="#785a28"}),$.addEventListener("mouseover",()=>{$.style.color="#f0e6d2",$.style.borderColor="#c8aa6e"}),$.addEventListener("mouseout",()=>{$.style.color="#cdbe91",$.style.borderColor="#785a28"}),m.appendChild(f),m.appendChild(h),m.appendChild($),m.appendChild(b),l.appendChild(m);let x=document.createElement("div");x.className="toggle-btn",x.style.cssText="margin-bottom: 15px;";let v=document.createElement("span");v.textContent="Keep background on all screens:";let y=document.createElement("label");y.className="toggle-switch";let k=document.createElement("input");k.type="checkbox",k.checked=persistBackground;let _=document.createElement("span");_.className="toggle-slider",y.appendChild(k),y.appendChild(_),x.appendChild(v),x.appendChild(y),l.appendChild(x),k.addEventListener("change",()=>{persistBackground=k.checked,saveSettings(),checkAndApplyBackground()});let w=document.createElement("div");w.className="toggle-btn",w.style.cssText="margin-bottom: 15px;";let C=document.createElement("span");C.textContent="Centered Splash:";let L=document.createElement("label");L.className="toggle-switch";let E=document.createElement("input");E.type="checkbox",E.checked=centeredSplash;let S=document.createElement("span");S.className="toggle-slider",L.appendChild(E),L.appendChild(S),w.appendChild(C),w.appendChild(L),l.appendChild(w),E.addEventListener("change",()=>{centeredSplash=E.checked,saveSettings(),checkAndApplyBackground()});let T=document.createElement("div");T.className="toggle-btn",T.style.cssText="margin-bottom: 15px;";let P=document.createElement("span");P.textContent="Enable TFT Content:";let I=document.createElement("label");I.className="toggle-switch";let z=document.createElement("input");z.type="checkbox",z.checked=!1!==DataStore.get("tftEnabled");let B=document.createElement("span");B.className="toggle-slider",I.appendChild(z),I.appendChild(B),T.appendChild(P),T.appendChild(I),l.appendChild(T),z.addEventListener("change",()=>{let e=z.checked;if(DataStore.set("tftEnabled",e),!e){let t=DataStore.get("selectedSkin");t&&t.isTFT&&(DataStore.set("selectedSkin",null),removeBackground(),console.log("Cleared selected TFT skin"))}saveSettings();let o=document.getElementById("client-bg-customizer-ui");if(o){generatePreviewGroups("champion");let a=o.querySelector(".main-window");a&&window.renderSkins&&window.renderSkins(previewGroups)}});let A=document.createElement("h4");A.textContent="Shuffle Settings",A.style.cssText=`
        color: #f0e6d2;
        font-size: 18px;
        font-weight: bold;
        margin: 10px 0 5px 0;
        text-transform: uppercase;
    `,l.appendChild(A);let F=document.createElement("hr");F.style.cssText=`
        border: 0;
        border-top: 1px solid #785a28;
        margin: 10px 0;
    `,l.appendChild(F);let N=document.createElement("div");N.className="toggle-btn",N.style.cssText="margin-bottom: 15px;";let D=document.createElement("span");D.textContent="Cycle Shuffle:";let O=document.createElement("label");O.className="toggle-switch";let q=document.createElement("input");q.type="checkbox",q.checked=cycleShuffleEnabled;let G=document.createElement("span");G.className="toggle-slider",O.appendChild(q),O.appendChild(G),N.appendChild(D),N.appendChild(O),l.appendChild(N),q.addEventListener("change",()=>{cycleShuffleEnabled=q.checked,saveSettings()});let U=document.createElement("label");U.textContent="Cycle Shuffle Interval (Seconds):",U.style.cssText="margin-bottom: 5px;",l.appendChild(U);let j=document.createElement("div");j.style.cssText=`
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
    `;let M=document.createElement("input");M.type="range",M.min="10",M.max="300",M.step="1",M.value=cycleInterval,M.style.cssText=`
        flex: 1;
        height: 8px;
        -webkit-appearance: none;
        background: #1e2328;
        border: 1px solid #785a28;
        border-radius: 4px;
        outline: none;
    `;let V=document.createElement("span");V.textContent=cycleInterval.toString(),V.style.width="40px";let R=document.createElement("button");R.textContent="<",R.style.cssText=`
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
    `,R.addEventListener("click",()=>{let e=Math.max(parseInt(M.min),10*Math.round((parseInt(M.value)-10)/10));M.value=e,cycleInterval=e,V.textContent=e.toString(),saveSettings()});let H=document.createElement("button");H.textContent=">",H.style.cssText=`
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
    `,H.addEventListener("click",()=>{let e=Math.min(parseInt(M.max),10*Math.round((parseInt(M.value)+10)/10));M.value=e,cycleInterval=e,V.textContent=e.toString(),saveSettings()}),R.addEventListener("mouseover",()=>{R.style.color="#f0e6d2",R.style.borderColor="#c8aa6e"}),R.addEventListener("mouseout",()=>{R.style.color="#cdbe91",R.style.borderColor="#785a28"}),H.addEventListener("mouseover",()=>{H.style.color="#f0e6d2",H.style.borderColor="#c8aa6e"}),H.addEventListener("mouseout",()=>{H.style.color="#cdbe91",H.style.borderColor="#785a28"}),j.appendChild(R),j.appendChild(M),j.appendChild(H),j.appendChild(V),l.appendChild(j),M.addEventListener("input",()=>{cycleInterval=parseInt(M.value),V.textContent=cycleInterval.toString(),saveSettings()});let Q=document.createElement("label");Q.textContent="Transition Duration (Seconds):",Q.style.cssText="margin-bottom: 5px;",l.appendChild(Q);let K=document.createElement("div");K.style.cssText=`
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
    `;let W=document.createElement("input");W.type="range",W.min="0",W.max="5",W.step="0.1",W.value=transitionDuration,W.style.cssText=`
        flex: 1;
        height: 8px;
        -webkit-appearance: none;
        background: #1e2328;
        border: 1px solid #785a28;
        border-radius: 4px;
        outline: none;
    `;let Y=document.createElement("span");Y.textContent=transitionDuration.toString(),Y.style.width="40px";let X=document.createElement("button");X.textContent="<",X.style.cssText=`
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
    `,X.addEventListener("click",()=>{let e=Math.max(parseFloat(W.min),Math.round((parseFloat(W.value)-.1)*10)/10);W.value=e,transitionDuration=e,Y.textContent=e.toString(),saveSettings()});let Z=document.createElement("button");Z.textContent=">",Z.style.cssText=`
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
    `,Z.addEventListener("click",()=>{let e=Math.min(parseFloat(W.max),Math.round((parseFloat(W.value)+.1)*10)/10);W.value=e,transitionDuration=e,Y.textContent=e.toString(),saveSettings()}),X.addEventListener("mouseover",()=>{X.style.color="#f0e6d2",X.style.borderColor="#c8aa6e"}),X.addEventListener("mouseout",()=>{X.style.color="#cdbe91",X.style.borderColor="#785a28"}),Z.addEventListener("mouseover",()=>{Z.style.color="#f0e6d2",Z.style.borderColor="#c8aa6e"}),Z.addEventListener("mouseout",()=>{Z.style.color="#cdbe91",Z.style.borderColor="#785a28"}),K.appendChild(X),K.appendChild(W),K.appendChild(Z),K.appendChild(Y),l.appendChild(K),W.addEventListener("input",()=>{transitionDuration=parseFloat(W.value),Y.textContent=transitionDuration.toString(),saveSettings()}),a.appendChild(l),o.appendChild(a);let J=document.createElement("button");J.textContent="Close",J.className="settings-close-button",J.style.cssText=`
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
    `,J.addEventListener("mouseover",()=>{J.style.color="#f0e6d2",J.style.borderColor="#c8aa6e",J.style.boxShadow="0 0 8px 4px rgba(212, 184, 117, 0.5), inset 0 0 1px 1px #010a13"}),J.addEventListener("mouseout",()=>{J.style.color="#cdbe91",J.style.borderColor="#785a28",J.style.boxShadow="0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13"}),J.addEventListener("click",()=>{console.log("Close button clicked"),t.remove(),settingsVisible=!1;let o=document.getElementById("client-bg-customizer-ui-wrapper");if(o){console.log("Restoring customizer UI"),o.style.display="block";let a=document.getElementById("client-bg-customizer-ui");if(a){let n=a.querySelector(".custom-dropdown:not(.filter-dropdown):not(.sort-dropdown)");if(n){console.log("Type dropdown found");let l=n.querySelector(".dropdown-toggle"),r=n.querySelector(".dropdown-menu");if(l&&r){console.log("Updating dropdown to Champion"),l.textContent="Champion";let i=r.querySelector('.dropdown-item[data-value="champion"]');i&&(r.querySelectorAll(".dropdown-item").forEach(e=>e.classList.remove("selected")),i.classList.add("selected"),console.log("Simulating Champion dropdown click"),i.click())}}else{console.log("Type dropdown not found, falling back to manual refresh"),generatePreviewGroups("champion");let s=a.querySelector(".main-window");s&&window.renderSkins?(console.log("Manually rendering skins"),window.renderSkins(previewGroups,currentSearchQuery)):console.log("renderSkins not available or mainWindow not found")}}else console.log("Customizer UI not found")}else console.log("Customizer wrapper not found, recreating UI"),createClientBackgroundCustomizerUI(e)}),o.appendChild(J),t.appendChild(o),e.appendChild(t)}function startShuffleCycle(e,t){if(!cycleShuffleEnabled)return;shuffleCycleIntervalId&&(clearInterval(shuffleCycleIntervalId),console.log("Cleared previous shuffle cycle"));let o=!1!==DataStore.get("tftEnabled");shuffleCycleIntervalId=setInterval(()=>{let a=[];if(t&&e.length>0?0===(a=e.filter(e=>o||!e.isTFT)).length&&(a=previewGroups.flatMap(e=>e.items.filter(e=>o||!e.isTFT)),console.log("No valid favorites, falling back to all skins")):a=previewGroups.flatMap(e=>e.items.filter(e=>o||!e.isTFT)),0===a.length){console.log("No items available for shuffle cycle"),clearInterval(shuffleCycleIntervalId),shuffleCycleIntervalId=null;return}let n=a[Math.floor(Math.random()*a.length)];DataStore.set("selectedSkin",{name:n.name,tilePath:n.tilePath,splashPath:n.splashPath,uncenteredSplashPath:n.uncenteredSplashPath,skinLineId:n.skinLineId,skinLineName:n.skinLineName,isTFT:n.isTFT}),applyBackground(n),console.log(`Shuffle cycle applied: ${n.name}`)},1e3*cycleInterval),console.log(`Started shuffle cycle with interval ${cycleInterval} seconds`)}function createClientBackgroundCustomizerUI(e){let t=DataStore.get("selectedSkin"),o=DataStore.get("favoriteSkins")||[],a=DataStore.get("favoritesToggled")||!1,n=!0,l="",r=document.getElementById("client-bg-customizer-ui-wrapper");r&&(console.warn("Existing customizer wrapper found, removing to prevent duplicates"),r.remove());let i=document.querySelector(".client-bg-customizer-backdrop");i&&(console.warn("Existing backdrop found, removing to prevent duplicates"),i.remove());let s=document.createElement("div");s.className="client-bg-customizer-backdrop",s.style.cssText=`
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
        `,document.head.appendChild(p));let u=document.createElement("div");u.className="header";let g=document.createElement("h3");g.textContent="BACKGROUND CUSTOMIZER",u.appendChild(g);let m=document.createElement("div");m.className="lol-uikit-close-button",m.setAttribute("button-type","cog");let h=document.createElement("div");h.className="contents";let b=document.createElement("div");b.className="close-icon",h.appendChild(b),m.appendChild(h),m.addEventListener("click",()=>{if(settingsVisible){let t=document.getElementById("client-bg-settings-ui-wrapper");t&&t.remove(),settingsVisible=!1}else createSettingsUI(e),settingsVisible=!0,d.style.display="none"}),u.appendChild(m),c.appendChild(u);let f=document.createElement("div");f.className="search-bar";let $=document.createElement("input");$.placeholder="Search",$.style.width="40%";let x=document.createElement("div");x.className="custom-dropdown",x.style.width="150px";let v=document.createElement("div");v.className="dropdown-toggle",v.textContent="Champion";let y=document.createElement("ul");y.className="dropdown-menu";let k="champion";[{label:"Champion",value:"champion"},{label:"Universes",value:"universes"},{label:"Skinlines",value:"skinlines"}].forEach(e=>{let t=document.createElement("li");t.className="dropdown-item",t.textContent=e.label,t.dataset.value=e.value,"champion"===e.value&&t.classList.add("selected"),t.addEventListener("click",()=>{v.textContent=e.label,y.querySelectorAll(".dropdown-item").forEach(e=>e.classList.remove("selected")),t.classList.add("selected"),k=e.value,y.classList.remove("show"),console.log(`Selected type: ${k}`),generatePreviewGroups(k),z(previewGroups,l)}),y.appendChild(t)}),v.addEventListener("click",()=>{let e=y.classList.contains("show");document.querySelectorAll(".dropdown-menu").forEach(e=>e.classList.remove("show")),e||y.classList.add("show")}),x.appendChild(v),x.appendChild(y);let _=document.createElement("div");_.className="custom-dropdown filter-dropdown",_.style.width="120px";let w=document.createElement("div");w.className="dropdown-toggle",w.textContent=a?"Favorites":"All Skins";let C=document.createElement("ul");C.className="dropdown-menu";let L=a?"favorites":"all";["All Skins","Favorites"].forEach(e=>{let t=document.createElement("li");t.className="dropdown-item",t.textContent=e,t.dataset.value=e.toLowerCase().replace(" ",""),("Favorites"===e&&a||"All Skins"===e&&!a)&&t.classList.add("selected"),t.addEventListener("click",()=>{w.textContent=e,C.querySelectorAll(".dropdown-item").forEach(e=>e.classList.remove("selected")),t.classList.add("selected"),a="favorites"===(L=t.dataset.value),DataStore.set("favoritesToggled",a),C.classList.remove("show"),z(previewGroups,l,L)}),C.appendChild(t)}),_.appendChild(w),_.appendChild(C);let E=document.createElement("div");E.className="custom-dropdown",E.style.width="150px";let S=document.createElement("div");S.className="dropdown-toggle",S.textContent="Alphabetical▼";let T=document.createElement("ul");T.className="dropdown-menu";let P="alphabetical";[{label:"Alphabetical▼",value:"alphabetical"},{label:"Alphabetical▲",value:"alphabetical-reverse"}].forEach(e=>{let t=document.createElement("li");t.className="dropdown-item",t.textContent=e.label,t.dataset.value=e.value,"alphabetical"===e.value&&t.classList.add("selected"),t.addEventListener("click",()=>{S.textContent=e.label,T.querySelectorAll(".dropdown-item").forEach(e=>e.classList.remove("selected")),t.classList.add("selected"),P=e.value,T.classList.remove("show"),z(previewGroups,l,L,P)}),T.appendChild(t)}),E.appendChild(S),E.appendChild(T),[w,S].forEach(e=>{e.addEventListener("click",()=>{let t=e.nextElementSibling,o=t.classList.contains("show");document.querySelectorAll(".dropdown-menu").forEach(e=>e.classList.remove("show")),o||t.classList.add("show")})}),$.addEventListener("input",()=>{z(previewGroups,l=$.value.toLowerCase().trim(),L,P)}),f.appendChild($),f.appendChild(x),f.appendChild(_),f.appendChild(E),c.appendChild(f);let I=document.createElement("div");function z(e,o="",a="all",l="alphabetical"){let r=document.querySelector(".main-window");if(!r){console.error("Main window not found");return}r.innerHTML="";let i=JSON.parse(JSON.stringify(e)),s=DataStore.get("favoriteSkins")||[],d=a||document.querySelector(".filter-dropdown .dropdown-item.selected")?.dataset.value||"all",c=l||document.querySelector(".sort-dropdown .dropdown-item.selected")?.dataset.value||"alphabetical";if("favorites"===d){if(0===s.length){let p=document.createElement("div");p.className="no-favorites-message",p.textContent="No favorited skins",r.appendChild(p);return}i=i.map(e=>({title:e.title,items:e.items.filter(e=>s.some(t=>t.name===e.name&&t.isTFT===e.isTFT))})).filter(e=>e.items.length>0)}o&&(i=i.map(e=>({title:e.title,items:e.items.filter(t=>t.name.toLowerCase().includes(o)||e.title.toLowerCase().includes(o))})).filter(e=>e.items.length>0||e.title.toLowerCase().includes(o))),"alphabetical"===c?(i.sort((e,t)=>e.title.localeCompare(t.title)),i.forEach(e=>{e.items.sort((e,t)=>e.name.localeCompare(t.name))})):(i.sort((e,t)=>t.title.localeCompare(e.title)),i.forEach(e=>{e.items.sort((e,t)=>t.name.localeCompare(e.name))})),0!==i.length||o||"favorites"===d||(console.warn("No groups to render, regenerating with champion grouping"),generatePreviewGroups("champion"),i=previewGroups),i.forEach(e=>{let a=document.createElement("div");a.className="skin-group-title";let n=document.createElement("span");n.textContent=e.title,a.appendChild(n),a.dataset.groupTitle=e.title;let l=document.createElement("button");l.className="group-favorite-button";let i=e.items.every(e=>s.some(t=>t.name===e.name&&t.isTFT===e.isTFT));i&&l.classList.add("favorited"),l.addEventListener("click",()=>{let t=e.items.every(e=>s.some(t=>t.name===e.name&&t.isTFT===e.isTFT));if(t){s=s.filter(t=>!e.items.some(e=>e.name===t.name&&e.isTFT==e.isTFT)),l.classList.remove("favorited");let n=a.nextElementSibling.querySelectorAll(".favorite-button");n.forEach(e=>e.classList.remove("favorited"))}else{e.items.forEach(e=>{s.some(t=>t.name===e.name&&t.isTFT===e.isTFT)||s.push({name:e.name,tilePath:e.tilePath,splashPath:e.splashPath,uncenteredSplashPath:e.uncenteredSplashPath,skinLineId:e.skinLineId,skinLineName:e.skinLineName,isTFT:e.isTFT})}),l.classList.add("favorited");let r=a.nextElementSibling.querySelectorAll(".favorite-button");r.forEach(e=>e.classList.add("favorited"))}DataStore.set("favoriteSkins",s),z(previewGroups,o,d,c)}),a.appendChild(l),r.appendChild(a);let p=document.createElement("div");p.className="skin-group",e.items.forEach(a=>{let n=document.createElement("div");n.className="skin-container",n.style.position="relative";let l=document.createElement("div");l.className="skin-image",l.dataset.tilePath=a.tilePath||"",l.dataset.name=a.name,l.dataset.splashPath=a.splashPath,l.dataset.uncenteredSplashPath=a.uncenteredSplashPath,l.dataset.skinLineId=a.skinLineId||"",l.dataset.skinLineName=a.skinLineName||"",l.dataset.isTFT=a.isTFT?"true":"false",l.style.position="relative",l.style.boxSizing="border-box";let r=()=>{console.log(`Image failed to load for ${a.name}: ${a.tilePath}`),l.className="skin-image failed",l.style.backgroundImage="none";let e=document.createElement("div");e.className="failed-text",e.textContent="Failed to Load Preview",l.appendChild(e)};if(a.tilePath){l.style.backgroundImage=`url(${a.tilePath})`;let i=new Image;i.src=a.tilePath,i.onerror=r}else r();t&&t.name.trim().toLowerCase()===a.name.trim().toLowerCase()&&t.isTFT===a.isTFT&&l.classList.add("selected"),l.addEventListener("click",()=>{document.querySelectorAll(".skin-image").forEach(e=>e.classList.remove("selected")),l.classList.add("selected");let e={name:a.name,tilePath:a.tilePath,splashPath:a.splashPath,uncenteredSplashPath:a.uncenteredSplashPath,skinLineId:a.skinLineId,skinLineName:a.skinLineName,isTFT:a.isTFT};DataStore.set("selectedSkin",e),applyBackground(e)});let u=document.createElement("button");u.className="favorite-button",s.some(e=>e.name===a.name&&e.isTFT===a.isTFT)&&u.classList.add("favorited"),u.addEventListener("click",t=>{t.stopPropagation();let l=s.some(e=>e.name===a.name&&e.isTFT===a.isTFT);l?(s=s.filter(e=>!(e.name===a.name&&e.isTFT===a.isTFT)),u.classList.remove("favorited")):(s.push({name:a.name,tilePath:a.tilePath,splashPath:a.splashPath,uncenteredSplashPath:a.uncenteredSplashPath,skinLineId:a.skinLineId,skinLineName:a.skinLineName,isTFT:a.isTFT}),u.classList.add("favorited")),DataStore.set("favoriteSkins",s),window.favoriteSkins=s;let r=n.closest(".skin-group").previousElementSibling.querySelector(".group-favorite-button"),i=e.items.every(e=>s.some(t=>t.name===e.name&&t.isTFT===e.isTFT));r.classList.toggle("favorited",i),z(previewGroups,o,d,c)}),l.appendChild(u),n.appendChild(l);let g=document.createElement("div");g.className="skin-label",g.textContent=a.name,n.appendChild(g),p.appendChild(n)}),r.appendChild(p)}),t&&t.name&&n&&(setTimeout(()=>{let e=CSS.escape(t.name),o=`.skin-image[data-name="${e}"][data-is-tft="${t.isTFT}"]`,a=r.querySelector(o);a&&(a.classList.add("selected"),a.scrollIntoView({behavior:"smooth",block:"center"}))},200),n=!1),window.addMorePreviews=e=>{previewGroups.push(...e),z(previewGroups,o,d,c)}}I.className="main-window",c.appendChild(I);let B=document.createElement("div");B.className="bottom-bar";let A=document.createElement("button");A.textContent="RESET FAVORITES",A.addEventListener("click",()=>{o=[],DataStore.set("favoriteSkins",o),document.querySelectorAll(".favorite-button").forEach(e=>e.classList.remove("favorited")),document.querySelectorAll(".group-favorite-button").forEach(e=>e.classList.remove("favorited")),z(previewGroups,l,L,P)}),B.appendChild(A);let F=document.createElement("button");F.className="favorites-toggle",a&&F.classList.add("toggled");let N=document.createElement("div");N.className="toggle-container";let D=document.createElement("div");D.className="toggled",a&&D.classList.add("toggled-on");let O=document.createElement("div");O.className="toggle-button",N.appendChild(D),N.appendChild(O),F.appendChild(N),F.addEventListener("click",()=>{a=!a,DataStore.set("favoritesToggled",a),F.classList.toggle("toggled",a),D.classList.toggle("toggled-on",a),w.textContent=a?"Favorites":"All Skins",C.querySelectorAll(".dropdown-item").forEach(e=>{e.classList.toggle("selected",e.textContent===(a?"Favorites":"All Skins"))}),z(previewGroups,l,L=a?"favorites":"all",P)}),B.appendChild(F);let q=document.createElement("button");q.className="randomize-button",q.textContent="Shuffle",q.addEventListener("click",()=>{let e=[];if(0===(e=a&&o.length>0?o:previewGroups.flatMap(e=>e.items)).length){console.log("No items available to randomize");return}let t=e[Math.floor(Math.random()*e.length)];DataStore.set("selectedSkin",{name:t.name,tilePath:t.tilePath,splashPath:t.splashPath,uncenteredSplashPath:t.uncenteredSplashPath,skinLineId:t.skinLineId,skinLineName:t.skinLineName,isTFT:t.isTFT}),document.querySelectorAll(".skin-image").forEach(e=>e.classList.remove("selected"));let n=`.skin-image[data-name="${CSS.escape(t.name)}"][data-is-tft="${t.isTFT}"]`,l=I.querySelector(n);l&&(l.classList.add("selected"),l.scrollIntoView({behavior:"smooth",block:"center"})),applyBackground(t),cycleShuffleEnabled&&(startShuffleCycle(o,a),d.remove(),s.remove(),uiVisible=!1,checkAndCreateButton())}),B.appendChild(q);let G=document.createElement("button");G.textContent="PROFILES",G.addEventListener("click",()=>{shuffleCycleIntervalId&&(clearInterval(shuffleCycleIntervalId),shuffleCycleIntervalId=null,console.log("Stopped shuffle cycle for profiles UI")),createProfilesUI(e)}),B.appendChild(G);let U=document.createElement("button");U.textContent="Confirm",U.addEventListener("click",()=>{let e=I.querySelector(".skin-image.selected");if(e){let t={name:e.dataset.name,tilePath:e.dataset.tilePath,splashPath:e.dataset.splashPath,uncenteredSplashPath:e.dataset.uncenteredSplashPath,skinLineId:e.dataset.skinLineId,skinLineName:e.dataset.skinLineName,isTFT:"true"===e.dataset.isTFT};DataStore.set("selectedSkin",t),applyBackground(t)}d.remove(),s.remove(),uiVisible=!1,checkAndCreateButton()}),B.appendChild(U),c.appendChild(B),d.appendChild(c),shuffleCycleIntervalId&&(clearInterval(shuffleCycleIntervalId),shuffleCycleIntervalId=null,console.log("Stopped existing shuffle cycle")),e.appendChild(s),e.appendChild(d),generatePreviewGroups("champion"),z(previewGroups,l,L,P)}window.addEventListener("load",()=>{console.log("Pengu Loader Client Background Customizer plugin loading..."),setupActivityCenterObserver(),loadSavedSettings(),Promise.allSettled([fetch("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/skins.json").then(e=>{if(!e.ok)throw Error(`HTTP error! Status: ${e.status}`);return e.json()}).then(e=>{skinData=Object.values(e).map(e=>{let t=e.tilePath?e.tilePath.replace(/^\/lol-game-data\/assets\/ASSETS\//i,"").toLowerCase():"",o=e.splashPath?e.splashPath.replace(/^\/lol-game-data\/assets\/ASSETS\//i,"").toLowerCase():"",a=e.uncenteredSplashPath?e.uncenteredSplashPath.replace(/^\/lol-game-data\/assets\/ASSETS\//i,"").toLowerCase():"";return{...e,tilePath:t?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t}`:"",splashPath:o?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${o}`:"",uncenteredSplashPath:a?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${a}`:""}}),console.log("Fetched skins.json, skinData length:",skinData.length)}),fetch("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/universes.json").then(e=>{if(!e.ok)throw Error(`HTTP error! Status: ${e.status}`);return e.json()}).then(e=>{universeData=Array.isArray(e)?e:[],console.log("Fetched universes.json, universeData length:",universeData.length)}),fetch("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/skinlines.json").then(e=>{if(!e.ok)throw Error(`HTTP error! Status: ${e.status}`);return e.json()}).then(e=>{skinLineData=Array.isArray(e)?e:[],console.log("Fetched skinlines.json, skinLineData length:",skinLineData.length)}),fetch("https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/tftrotationalshopitemdata.json").then(e=>{if(!e.ok)throw Error(`HTTP error! Status: ${e.status}`);return e.json()}).then(e=>{tftData=(tftData=Array.isArray(e)?e:[]).map(e=>{let t=e.backgroundTextureLCU?e.backgroundTextureLCU.replace(/^ASSETS\//i,"").toLowerCase():"",o=e.standaloneLoadoutsLargeIcon?e.standaloneLoadoutsLargeIcon.replace(/^ASSETS\//i,"").toLowerCase():"";return{...e,backgroundTextureLCU:t?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${t}`:"",standaloneLoadoutsLargeIcon:o?`https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/${o}`:"",isTFT:!0}}),console.log("Fetched tftrotationalshopitemdata.json, tftData length:",tftData.length)})]).then(e=>{let t=e.filter(e=>"rejected"===e.status).map(e=>e.reason);t.length>0&&(console.error("Errors during data fetch:",t),alert("Some data failed to load. Falling back to champion grouping.")),generatePreviewGroups("champion"),checkAndApplyBackground()}).catch(e=>{console.error("Unexpected error during data fetch:",e),alert("Failed to initialize data.")}),setTimeout(()=>{let e=new MutationObserver(()=>{uiVisible||checkAndCreateButton(),checkAndApplyBackground()}),t=document.querySelector('[data-screen-name="rcp-fe-lol-parties"]')||document.body;e.observe(t,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["data-screen-name"]}),checkAndCreateButton(),checkAndApplyBackground()},1e3)}),document.head.insertAdjacentHTML("beforeend",`
  <style>
    .parties-view .parties-background .uikit-background-switcher {
      opacity: 0 !important;
    }
  </style>
`);
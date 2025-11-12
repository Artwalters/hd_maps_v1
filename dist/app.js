"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // bin/live-reload.js
  var init_live_reload = __esm({
    "bin/live-reload.js"() {
      "use strict";
      new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());
    }
  });

  // src/modules/config.ts
  var CONFIG, MAPBOX_ACCESS_TOKEN, MAP_STYLE, LOCAL_STORAGE_KEY, MAP_OPTIONS;
  var init_config = __esm({
    "src/modules/config.ts"() {
      "use strict";
      init_live_reload();
      CONFIG = {
        MAP: {
          center: [5.979642, 50.887634],
          zoom: 15.5,
          pitch: 45,
          bearing: -17.6,
          boundary: {
            center: [5.977105864037915, 50.88774161029858],
            radius: 0.6
          }
        },
        MARKER_ZOOM: {
          min: 10,
          small: 14,
          medium: 16,
          large: 18
        },
        ANIMATION: {
          speed: 0.8,
          duration: 2e3
        }
      };
      MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoicHJvamVjdGhlZXJsZW4iLCJhIjoiY2x4eWVmcXBvMWozZTJpc2FqbWgzcnAyeCJ9.SVOVbBG6o1lHs6TwCudR9g";
      MAP_STYLE = "mapbox://styles/projectheerlen/cm1t3u60e011d01peewgldm85";
      LOCAL_STORAGE_KEY = "heerlenActiveFilters";
      MAP_OPTIONS = {
        container: "map",
        style: MAP_STYLE,
        center: CONFIG.MAP.center,
        zoom: CONFIG.MAP.zoom,
        pitch: CONFIG.MAP.pitch,
        bearing: CONFIG.MAP.bearing,
        antialias: true,
        interactive: true,
        renderWorldCopies: false,
        preserveDrawingBuffer: false,
        maxParallelImageRequests: 16,
        fadeDuration: 0
      };
    }
  });

  // src/modules/eventBus.ts
  var EventBus, eventBus, Events;
  var init_eventBus = __esm({
    "src/modules/eventBus.ts"() {
      "use strict";
      init_live_reload();
      EventBus = class _EventBus {
        static instance;
        listeners = /* @__PURE__ */ new Map();
        constructor() {
        }
        static getInstance() {
          if (!_EventBus.instance) {
            _EventBus.instance = new _EventBus();
          }
          return _EventBus.instance;
        }
        /**
         * Subscribe to an event
         */
        on(event, handler) {
          if (!this.listeners.has(event)) {
            this.listeners.set(event, /* @__PURE__ */ new Set());
          }
          this.listeners.get(event).add(handler);
          return () => {
            this.listeners.get(event)?.delete(handler);
          };
        }
        /**
         * Subscribe to an event that will only fire once
         */
        once(event, handler) {
          const wrappedHandler = (data) => {
            handler(data);
            this.off(event, wrappedHandler);
          };
          return this.on(event, wrappedHandler);
        }
        /**
         * Unsubscribe from an event
         */
        off(event, handler) {
          this.listeners.get(event)?.delete(handler);
        }
        /**
         * Emit an event to all subscribers
         */
        emit(event, data) {
          const handlers = this.listeners.get(event);
          if (handlers) {
            handlers.forEach((handler) => {
              try {
                handler(data);
              } catch (error) {
              }
            });
          }
        }
        /**
         * Get the number of listeners for an event
         */
        listenerCount(event) {
          return this.listeners.get(event)?.size || 0;
        }
        /**
         * Remove all listeners for a specific event
         */
        removeAllListeners(event) {
          if (event) {
            this.listeners.delete(event);
          } else {
            this.listeners.clear();
          }
        }
        /**
         * Get all event names that have listeners
         */
        eventNames() {
          return Array.from(this.listeners.keys());
        }
        /**
         * Clean up all listeners - useful for preventing memory leaks
         */
        cleanup() {
          this.listeners.clear();
        }
      };
      eventBus = EventBus.getInstance();
      Events = {
        // Map events
        MAP_LOADED: "map:loaded",
        MAP_STYLE_CHANGED: "map:styleChanged",
        // Popup events
        POPUP_OPENED: "popup:opened",
        POPUP_CLOSED: "popup:closed",
        POPUP_FLIPPED: "popup:flipped",
        // Filter events
        FILTER_CHANGED: "filter:changed",
        FILTER_CLEARED: "filter:cleared",
        // Marker events
        MARKER_CLICKED: "marker:clicked",
        MARKER_HOVERED: "marker:hovered",
        // Tour events
        TOUR_STARTED: "tour:started",
        TOUR_ENDED: "tour:ended",
        TOUR_STEP_CHANGED: "tour:stepChanged",
        // Geolocation events
        LOCATION_FOUND: "location:found",
        LOCATION_ERROR: "location:error",
        BOUNDARY_ENTERED: "location:boundaryEntered",
        BOUNDARY_EXITED: "location:boundaryExited",
        // Performance events
        PERFORMANCE_WARNING: "performance:warning",
        RESOURCE_LOADED: "resource:loaded",
        RESOURCE_ERROR: "resource:error"
      };
    }
  });

  // src/modules/stateManager.ts
  function setActivePopup(popup) {
    stateManager.setActivePopup(popup);
  }
  var StateManager, stateManager, state;
  var init_stateManager = __esm({
    "src/modules/stateManager.ts"() {
      "use strict";
      init_live_reload();
      init_eventBus();
      StateManager = class _StateManager {
        static instance;
        state;
        subscribers = /* @__PURE__ */ new Set();
        constructor() {
          this.state = {
            map: null,
            mapLoaded: false,
            activePopup: null,
            markersAdded: false,
            modelsAdded: false,
            mapLocations: {
              type: "FeatureCollection",
              features: []
            },
            activeFilters: /* @__PURE__ */ new Set()
          };
        }
        static getInstance() {
          if (!_StateManager.instance) {
            _StateManager.instance = new _StateManager();
          }
          return _StateManager.instance;
        }
        /**
         * Get current state (readonly)
         */
        getState() {
          return { ...this.state };
        }
        /**
         * Subscribe to state changes
         */
        subscribe(callback) {
          this.subscribers.add(callback);
          return () => {
            this.subscribers.delete(callback);
          };
        }
        /**
         * Update state and notify subscribers
         */
        setState(updates) {
          const previousState = { ...this.state };
          Object.assign(this.state, updates);
          this.subscribers.forEach((callback) => {
            try {
              callback(this.state);
            } catch (error) {
            }
          });
          this.emitStateChangeEvents(previousState, this.state);
        }
        /**
         * Emit events based on state changes
         */
        emitStateChangeEvents(previous, current) {
          if (!previous.mapLoaded && current.mapLoaded) {
            eventBus.emit(Events.MAP_LOADED, current.map);
          }
          if (previous.activePopup !== current.activePopup) {
            if (current.activePopup) {
              eventBus.emit(Events.POPUP_OPENED, current.activePopup);
            } else if (previous.activePopup) {
              eventBus.emit(Events.POPUP_CLOSED, previous.activePopup);
            }
          }
          if (previous.activeFilters !== current.activeFilters) {
            eventBus.emit(Events.FILTER_CHANGED, Array.from(current.activeFilters));
          }
        }
        // Public state update methods
        setMap(map) {
          this.setState({ map });
        }
        setMapLoaded(loaded) {
          this.setState({ mapLoaded: loaded });
        }
        setActivePopup(popup) {
          this.setState({ activePopup: popup });
        }
        setMarkersAdded(added) {
          this.setState({ markersAdded: added });
        }
        setModelsAdded(added) {
          this.setState({ modelsAdded: added });
        }
        updateMapLocations(locations) {
          this.setState({ mapLocations: locations });
        }
        setActiveFilters(filters) {
          this.setState({ activeFilters: new Set(filters) });
        }
        addFilter(filter) {
          const newFilters = new Set(this.state.activeFilters);
          newFilters.add(filter);
          this.setState({ activeFilters: newFilters });
        }
        removeFilter(filter) {
          const newFilters = new Set(this.state.activeFilters);
          newFilters.delete(filter);
          this.setState({ activeFilters: newFilters });
        }
        clearFilters() {
          this.setState({ activeFilters: /* @__PURE__ */ new Set() });
        }
        /**
         * Reset state to initial values
         */
        reset() {
          this.state = {
            map: null,
            mapLoaded: false,
            activePopup: null,
            markersAdded: false,
            modelsAdded: false,
            mapLocations: {
              type: "FeatureCollection",
              features: []
            },
            activeFilters: /* @__PURE__ */ new Set()
          };
          this.subscribers.forEach((callback) => {
            try {
              callback(this.state);
            } catch (error) {
            }
          });
        }
        /**
         * Clean up all subscribers
         */
        cleanup() {
          this.subscribers.clear();
        }
      };
      stateManager = StateManager.getInstance();
      state = stateManager.getState();
    }
  });

  // src/modules/state.ts
  function setMap(map) {
    stateManager.setMap(map);
  }
  var state2;
  var init_state = __esm({
    "src/modules/state.ts"() {
      "use strict";
      init_live_reload();
      init_stateManager();
      init_stateManager();
      state2 = {
        get map() {
          return stateManager.getState().map;
        },
        get activePopup() {
          return stateManager.getState().activePopup;
        },
        get markersAdded() {
          return stateManager.getState().markersAdded;
        },
        get modelsAdded() {
          return stateManager.getState().modelsAdded;
        },
        get mapLocations() {
          return stateManager.getState().mapLocations;
        },
        get activeFilters() {
          return stateManager.getState().activeFilters;
        },
        // Allow direct setting for compatibility
        set map(value) {
          stateManager.setMap(value);
        },
        set activePopup(value) {
          stateManager.setActivePopup(value);
        },
        set markersAdded(value) {
          stateManager.setMarkersAdded(value);
        },
        set modelsAdded(value) {
          stateManager.setModelsAdded(value);
        },
        set mapLocations(value) {
          stateManager.updateMapLocations(value);
        },
        set activeFilters(value) {
          stateManager.setActiveFilters(value);
        }
      };
    }
  });

  // src/modules/popups-part2.ts
  var popups_part2_exports = {};
  __export(popups_part2_exports, {
    closeItem: () => closeItem,
    closeItemIfVisible: () => closeItemIfVisible,
    setupPopupInteractions: () => setupPopupInteractions,
    showImagePopup: () => showImagePopup
  });
  function detectLanguage2() {
    const path = window.location.pathname;
    if (path.includes("/en/")) return "en";
    if (path.includes("/de/")) return "de";
    return "nl";
  }
  function manageDoubleFadeGradient(description, topFade, bottomFade) {
    if (!description) return;
    if (topFade) topFade.style.transition = "opacity 0.3s ease";
    if (bottomFade) bottomFade.style.transition = "opacity 0.3s ease";
    const updateFades = () => {
      const maxScroll = description.scrollHeight - description.clientHeight;
      if (maxScroll <= 5) {
        if (topFade) topFade.style.opacity = "0";
        if (bottomFade) bottomFade.style.opacity = "0";
        return;
      }
      const scrollPercentage = description.scrollTop / maxScroll;
      if (bottomFade) {
        let bottomOpacity = 1;
        if (scrollPercentage > 0.75) {
          bottomOpacity = 1 - (scrollPercentage - 0.75) / 0.25;
        }
        bottomFade.style.opacity = Math.max(0, Math.min(1, bottomOpacity)).toFixed(
          2
        );
      }
      if (topFade) {
        let topOpacity = 0;
        if (scrollPercentage > 0) {
          topOpacity = Math.min(1, scrollPercentage * 4);
        }
        topFade.style.opacity = Math.max(0, Math.min(1, topOpacity)).toFixed(2);
      }
    };
    description.addEventListener("scroll", updateFades);
    window.addEventListener("resize", updateFades);
    updateFades();
    return () => {
      description.removeEventListener("scroll", updateFades);
      window.removeEventListener("resize", updateFades);
    };
  }
  function showNavigationConfirm(lat, lng, color) {
    const lang = detectLanguage2();
    const t = popupTranslations[lang];
    const overlay = document.createElement("div");
    overlay.className = "navigation-confirm-overlay";
    const modal = document.createElement("div");
    modal.className = "navigation-confirm-modal";
    modal.innerHTML = `
    <h3 class="navigation-confirm-title">${t.navigation.confirmTitle}</h3>
    <p class="navigation-confirm-message">${t.navigation.confirmMessage}</p>
    <div class="navigation-confirm-buttons">
      <button class="navigation-confirm-no button-base" style="background-color: ${color}; border-color: ${color}; color: white;">${t.navigation.confirmNo}</button>
      <button class="navigation-confirm-yes button-base">${t.navigation.confirmYes}</button>
    </div>
  `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      modal.style.transform = "scale(1)";
    });
    const yesButton = modal.querySelector(".navigation-confirm-yes");
    const noButton = modal.querySelector(".navigation-confirm-no");
    const closeModal = () => {
      overlay.style.opacity = "0";
      modal.style.transform = "scale(0.9)";
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300);
    };
    yesButton.addEventListener("click", () => {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
      closeModal();
    });
    noButton.addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
  }
  function setupPopupInteractions(popup, properties, coordinates) {
    const popupElement = popup.getElement();
    const popupContent = popupElement.querySelector(".mapboxgl-popup-content");
    const popupWrapper = popupElement.querySelector(".popup-wrapper");
    const frontContent = popupElement.querySelector(".popup-front .content-wrapper");
    const backContent = popupElement.querySelector(".popup-back .content-wrapper");
    const description = popupElement.querySelector(".popup-description");
    const gradient = popupElement.querySelector("#paint0_linear_3248_5");
    const cleanupFunctions = [];
    const topFade = popupElement.querySelector(".popup-front .fade-top");
    const bottomFade = popupElement.querySelector(".popup-front .fade-bottom");
    if (description) {
      const cleanupFade = manageDoubleFadeGradient(description, topFade, bottomFade);
      if (cleanupFade) cleanupFunctions.push(cleanupFade);
      const backDescription = popupElement.querySelector(
        ".popup-back .popup-descriptionv2"
      );
      const backTopFade = popupElement.querySelector(".popup-back .fade-top");
      const backBottomFade = popupElement.querySelector(".popup-back .fade-bottom");
      if (backDescription) {
        const cleanupBackFade = manageDoubleFadeGradient(
          backDescription,
          backTopFade,
          backBottomFade
        );
        if (cleanupBackFade) cleanupFunctions.push(cleanupBackFade);
      }
      const openingHoursList = popupElement.querySelector(".opening-hours-list");
      const openingHoursContainer = popupElement.querySelector(".popup-opening-hours");
      if (openingHoursList && openingHoursContainer) {
        const checkOpeningHoursScroll = () => {
          const hasScroll = openingHoursList.scrollHeight > openingHoursList.clientHeight;
          if (hasScroll) {
            openingHoursContainer.classList.add("has-scroll");
          } else {
            openingHoursContainer.classList.remove("has-scroll");
          }
        };
        setTimeout(checkOpeningHoursScroll, 100);
        window.addEventListener("resize", checkOpeningHoursScroll);
        cleanupFunctions.push(() => window.removeEventListener("resize", checkOpeningHoursScroll));
      }
      popupElement.querySelectorAll(".more-info-button").forEach((button) => {
        button.addEventListener("click", () => {
          setTimeout(() => {
            if (openingHoursList && openingHoursContainer && popupWrapper.classList.contains("is-flipped")) {
              const hasScroll = openingHoursList.scrollHeight > openingHoursList.clientHeight;
              if (hasScroll) {
                openingHoursContainer.classList.add("has-scroll");
              } else {
                openingHoursContainer.classList.remove("has-scroll");
              }
            }
            const isFlipped = popupWrapper.classList.contains("is-flipped");
            const visibleDescription = isFlipped ? backDescription : description;
            if (visibleDescription) {
              const maxScroll = visibleDescription.scrollHeight - visibleDescription.clientHeight;
              if (maxScroll > 5) {
                const scrollPercent = visibleDescription.scrollTop / maxScroll;
                if (isFlipped) {
                  if (backTopFade)
                    backTopFade.style.opacity = scrollPercent > 0 ? Math.min(1, scrollPercent * 4).toFixed(2) : "0";
                  if (backBottomFade)
                    backBottomFade.style.opacity = scrollPercent > 0.75 ? (1 - (scrollPercent - 0.75) / 0.25).toFixed(2) : "1";
                } else {
                  if (topFade)
                    topFade.style.opacity = scrollPercent > 0 ? Math.min(1, scrollPercent * 4).toFixed(2) : "0";
                  if (bottomFade)
                    bottomFade.style.opacity = scrollPercent > 0.75 ? (1 - (scrollPercent - 0.75) / 0.25).toFixed(2) : "1";
                }
              }
            }
          }, 50);
        });
      });
    }
    function animateGradient(newY1, newY2, gradient2) {
      const startY1 = parseFloat(gradient2.y1.baseVal.value);
      const startY2 = parseFloat(gradient2.y2.baseVal.value);
      const startTime = Date.now();
      function step() {
        const progress = Math.min((Date.now() - startTime) / 800, 1);
        gradient2.y1.baseVal.value = startY1 + (newY1 - startY1) * progress;
        gradient2.y2.baseVal.value = startY2 + (newY2 - startY2) * progress;
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    }
    function adjustPopupHeight() {
      const contentHeight = Math.max(frontContent.offsetHeight, backContent.offsetHeight);
      popupWrapper.style.height = `${contentHeight}px`;
      popupElement.querySelectorAll(".popup-side").forEach((side) => {
        side.style.height = `${contentHeight}px`;
      });
    }
    if (gradient) {
      popupWrapper.addEventListener("mouseenter", () => {
        animateGradient(30, 282, gradient);
      });
      popupWrapper.addEventListener("mouseleave", () => {
        animateGradient(0, 252, gradient);
      });
    }
    setTimeout(adjustPopupHeight, 10);
    popupContent.style.opacity = "0";
    popupContent.style.transform = "rotate(8deg) translateY(2.5rem) /* was 40px */ scale(0.4)";
    requestAnimationFrame(() => {
      popupContent.style.transition = "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
      popupContent.style.opacity = "1";
      popupContent.style.transform = "rotate(0deg) translateY(0) scale(1)";
    });
    if (description) {
      description.addEventListener(
        "wheel",
        (event) => {
          event.stopPropagation();
          event.preventDefault();
          description.scrollTop += event.deltaY;
        },
        { passive: false }
      );
      description.addEventListener("mouseenter", () => {
        window.map.dragPan.disable();
        window.map.scrollZoom.disable();
      });
      description.addEventListener("mouseleave", () => {
        window.map.dragPan.enable();
        window.map.scrollZoom.enable();
      });
      let isDragging = false;
      let startY, startScrollTop;
      description.addEventListener("mousedown", (event) => {
        isDragging = true;
        startY = event.pageY;
        startScrollTop = description.scrollTop;
        description.style.cursor = "grabbing";
        event.preventDefault();
        event.stopPropagation();
      });
      description.addEventListener("mousemove", (event) => {
        if (!isDragging) return;
        event.preventDefault();
        event.stopPropagation();
        const deltaY = event.pageY - startY;
        description.scrollTop = startScrollTop - deltaY;
      });
      const mouseUpHandler = () => {
        isDragging = false;
        description.style.cursor = "grab";
      };
      document.addEventListener("mouseup", mouseUpHandler);
      cleanupFunctions.push(() => document.removeEventListener("mouseup", mouseUpHandler));
      description.addEventListener("mouseleave", () => {
        isDragging = false;
        description.style.cursor = "grab";
      });
      let touchStartY = 0;
      let touchStartScrollTop = 0;
      description.addEventListener("touchstart", (event) => {
        touchStartY = event.touches[0].clientY;
        touchStartScrollTop = description.scrollTop;
        event.stopPropagation();
      });
      description.addEventListener(
        "touchmove",
        (event) => {
          const deltaY = touchStartY - event.touches[0].clientY;
          description.scrollTop = touchStartScrollTop + deltaY;
          event.stopPropagation();
          event.preventDefault();
        },
        { passive: false }
      );
    }
    if (properties.image) {
      popupElement.querySelectorAll(".impressie-button").forEach((button) => {
        button.addEventListener("click", () => {
          if (!properties.link_ar) {
            popupContent.style.transition = "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
            popupContent.style.transform = "rotate(-5deg) translateY(2.5rem) /* was 40px */ scale(0.6)";
            popupContent.style.opacity = "0";
            setTimeout(() => {
              const contentHeight = Math.max(frontContent.offsetHeight, backContent.offsetHeight);
              popup.remove();
              setActivePopup(null);
              showImagePopup(properties, coordinates, contentHeight);
            }, 400);
          }
        });
      });
    }
    const navigateButton = popupElement.querySelector(".navigate-button");
    if (navigateButton) {
      navigateButton.addEventListener("click", () => {
        const lat = navigateButton.getAttribute("data-lat");
        const lng = navigateButton.getAttribute("data-lng");
        const color = navigateButton.getAttribute("data-color") || "#6B46C1";
        if (lat && lng) {
          showNavigationConfirm(lat, lng, color);
        }
      });
    }
    popupElement.querySelectorAll(".more-info-button").forEach((button) => {
      button.addEventListener("click", () => {
        popupWrapper.classList.toggle("is-flipped");
      });
    });
    popupElement.querySelectorAll(".close-button").forEach((button) => {
      button.addEventListener("click", () => {
        popupContent.style.transition = "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
        popupContent.style.transform = "rotate(-5deg) translateY(2.5rem) /* was 40px */ scale(0.6)";
        popupContent.style.opacity = "0";
        const visibleItem = window.$(".locations-map_item.is--show");
        if (visibleItem.length) {
          visibleItem.css({
            opacity: "0",
            transform: "translateY(2.5rem) /* was 40px */ scale(0.6)",
            transition: "all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)"
          });
        }
        setTimeout(() => {
          cleanupFunctions.forEach((cleanup) => cleanup());
          popup.remove();
          setActivePopup(null);
          window.$(".locations-map_item").removeClass("is--show");
          if (window.geolocationManager) {
            window.geolocationManager.isPopupOpen = false;
            if (window.geolocationManager.wasTracking) {
              window.geolocationManager.resumeTracking();
            }
          }
        }, 400);
      });
    });
    window.addEventListener("resize", adjustPopupHeight);
    cleanupFunctions.push(() => window.removeEventListener("resize", adjustPopupHeight));
  }
  function showImagePopup(properties, coordinates, contentHeight) {
    const lang = detectLanguage2();
    const t = popupTranslations[lang];
    const isMobile = window.matchMedia("(max-width: 479px)").matches;
    const popup = new window.mapboxgl.Popup({
      offset: [0, -5],
      className: "custom-popup",
      closeButton: false,
      maxWidth: "none",
      closeOnClick: false,
      anchor: "bottom"
    });
    const html = `
    <style>
      .popup-wrapper {
        height: ${contentHeight}px;
      }

      .popup-side {
        background-color: ${properties.color || "#6B46C1"};
        clip-path: polygon(calc(100% - 0px) 26.5px, calc(100% - 0px) calc(100% - 26.5px), calc(100% - 0px) calc(100% - 26.5px), calc(100% - 0.34671999999995px) calc(100% - 22.20048px), calc(100% - 1.3505599999999px) calc(100% - 18.12224px), calc(100% - 2.95704px) calc(100% - 14.31976px), calc(100% - 5.11168px) calc(100% - 10.84752px), calc(100% - 7.76px) calc(100% - 7.76px), calc(100% - 10.84752px) calc(100% - 5.11168px), calc(100% - 14.31976px) calc(100% - 2.9570399999999px), calc(100% - 18.12224px) calc(100% - 1.35056px), calc(100% - 22.20048px) calc(100% - 0.34672px), calc(100% - 26.5px) calc(100% - 0px), calc(50% - -32.6px) calc(100% - 0px), calc(50% - -32.6px) calc(100% - 0px), calc(50% - -31.57121px) calc(100% - 0.057139999999947px), calc(50% - -30.56648px) calc(100% - 0.2255199999999px), calc(50% - -29.59427px) calc(100% - 0.50057999999996px), calc(50% - -28.66304px) calc(100% - 0.87775999999991px), calc(50% - -27.78125px) calc(100% - 1.3525px), calc(50% - -26.95736px) calc(100% - 1.92024px), calc(50% - -26.19983px) calc(100% - 2.57642px), calc(50% - -25.51712px) calc(100% - 3.31648px), calc(50% - -24.91769px) calc(100% - 4.13586px), calc(50% - -24.41px) calc(100% - 5.03px), calc(50% - -24.41px) calc(100% - 5.03px), calc(50% - -22.95654px) calc(100% - 7.6045699999999px), calc(50% - -21.23752px) calc(100% - 9.9929599999998px), calc(50% - -19.27298px) calc(100% - 12.17519px), calc(50% - -17.08296px) calc(100% - 14.13128px), calc(50% - -14.6875px) calc(100% - 15.84125px), calc(50% - -12.10664px) calc(100% - 17.28512px), calc(50% - -9.36042px) calc(100% - 18.44291px), calc(50% - -6.46888px) calc(100% - 19.29464px), calc(50% - -3.45206px) calc(100% - 19.82033px), calc(50% - -0.32999999999998px) calc(100% - 20px), calc(50% - -0.32999999999998px) calc(100% - 20px), calc(50% - 2.79179px) calc(100% - 19.82033px), calc(50% - 5.8079199999999px) calc(100% - 19.29464px), calc(50% - 8.69853px) calc(100% - 18.44291px), calc(50% - 11.44376px) calc(100% - 17.28512px), calc(50% - 14.02375px) calc(100% - 15.84125px), calc(50% - 16.41864px) calc(100% - 14.13128px), calc(50% - 18.60857px) calc(100% - 12.17519px), calc(50% - 20.57368px) calc(100% - 9.9929599999999px), calc(50% - 22.29411px) calc(100% - 7.60457px), calc(50% - 23.75px) calc(100% - 5.03px), calc(50% - 23.75px) calc(100% - 5.03px), calc(50% - 24.25769px) calc(100% - 4.1358599999999px), calc(50% - 24.85712px) calc(100% - 3.3164799999998px), calc(50% - 25.53983px) calc(100% - 2.57642px), calc(50% - 26.29736px) calc(100% - 1.92024px), calc(50% - 27.12125px) calc(100% - 1.3525px), calc(50% - 28.00304px) calc(100% - 0.87775999999997px), calc(50% - 28.93427px) calc(100% - 0.50057999999996px), calc(50% - 29.90648px) calc(100% - 0.22552000000002px), calc(50% - 30.91121px) calc(100% - 0.057140000000004px), calc(50% - 31.94px) calc(100% - 0px), 26.5px calc(100% - 0px), 26.5px calc(100% - 0px), 22.20048px calc(100% - 0.34671999999989px), 18.12224px calc(100% - 1.3505599999999px), 14.31976px calc(100% - 2.95704px), 10.84752px calc(100% - 5.1116799999999px), 7.76px calc(100% - 7.76px), 5.11168px calc(100% - 10.84752px), 2.95704px calc(100% - 14.31976px), 1.35056px calc(100% - 18.12224px), 0.34672px calc(100% - 22.20048px), 4.3855735949631E-31px calc(100% - 26.5px), 0px 26.5px, 0px 26.5px, 0.34672px 22.20048px, 1.35056px 18.12224px, 2.95704px 14.31976px, 5.11168px 10.84752px, 7.76px 7.76px, 10.84752px 5.11168px, 14.31976px 2.95704px, 18.12224px 1.35056px, 22.20048px 0.34672px, 26.5px 4.3855735949631E-31px, calc(50% - 26.74px) 0px, calc(50% - 26.74px) 0px, calc(50% - 25.31263px) 0.07137px, calc(50% - 23.91544px) 0.28176px, calc(50% - 22.55581px) 0.62559px, calc(50% - 21.24112px) 1.09728px, calc(50% - 19.97875px) 1.69125px, calc(50% - 18.77608px) 2.40192px, calc(50% - 17.64049px) 3.22371px, calc(50% - 16.57936px) 4.15104px, calc(50% - 15.60007px) 5.17833px, calc(50% - 14.71px) 6.3px, calc(50% - 14.71px) 6.3px, calc(50% - 13.6371px) 7.64798px, calc(50% - 12.446px) 8.89024px, calc(50% - 11.1451px) 10.01826px, calc(50% - 9.7428px) 11.02352px, calc(50% - 8.2475px) 11.8975px, calc(50% - 6.6676px) 12.63168px, calc(50% - 5.0115px) 13.21754px, calc(50% - 3.2876px) 13.64656px, calc(50% - 1.5043px) 13.91022px, calc(50% - -0.32999999999996px) 14px, calc(50% - -0.32999999999998px) 14px, calc(50% - -2.16431px) 13.9105px, calc(50% - -3.94768px) 13.6476px, calc(50% - -5.67177px) 13.2197px, calc(50% - -7.32824px) 12.6352px, calc(50% - -8.90875px) 11.9025px, calc(50% - -10.40496px) 11.03px, calc(50% - -11.80853px) 10.0261px, calc(50% - -13.11112px) 8.8992px, calc(50% - -14.30439px) 7.6577px, calc(50% - -15.38px) 6.31px, calc(50% - -15.38px) 6.31px, calc(50% - -16.27279px) 5.18562px, calc(50% - -17.25432px) 4.15616px, calc(50% - -18.31733px) 3.22714px, calc(50% - -19.45456px) 2.40408px, calc(50% - -20.65875px) 1.6925px, calc(50% - -21.92264px) 1.09792px, calc(50% - -23.23897px) 0.62586px, calc(50% - -24.60048px) 0.28184px, calc(50% - -25.99991px) 0.07138px, calc(50% - -27.43px) 8.9116630386686E-32px, calc(100% - 26.5px) 0px, calc(100% - 26.5px) 0px, calc(100% - 22.20048px) 0.34672px, calc(100% - 18.12224px) 1.35056px, calc(100% - 14.31976px) 2.95704px, calc(100% - 10.84752px) 5.11168px, calc(100% - 7.76px) 7.76px, calc(100% - 5.11168px) 10.84752px, calc(100% - 2.9570399999999px) 14.31976px, calc(100% - 1.35056px) 18.12224px, calc(100% - 0.34671999999995px) 22.20048px, calc(100% - 5.6843418860808E-14px) 26.5px);
      }

      .close-button {
        background: ${properties.color || "#6B46C1"};
      }
    </style>
    <div class="popup-wrapper">
      <button class="close-button" aria-label="${t.aria.closePopup}"></button>
      <div class="popup-side">
        <div class="image-container">
          <img src="${properties.image}" alt="${properties.name}" class="full-image">
          <div class="button-container">
            <button class="back-button">${t.buttons.back}</button>
          </div>
          <div class="location-name">${properties.name}</div>
        </div>
      </div>
    </div>
  `;
    popup.setLngLat(coordinates).setHTML(html).addTo(window.map);
    setActivePopup(popup);
    const popupElement = popup.getElement();
    const popupContent = popupElement.querySelector(".mapboxgl-popup-content");
    const closeButton = popupElement.querySelector(".close-button");
    const backButton = popupElement.querySelector(".back-button");
    popupContent.style.opacity = "0";
    popupContent.style.transform = "rotate(8deg) translateY(2.5rem) /* was 40px */ scale(0.4)";
    requestAnimationFrame(() => {
      popupContent.style.transition = "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
      popupContent.style.opacity = "1";
      popupContent.style.transform = "rotate(0deg) translateY(0) scale(1)";
    });
    const svgElement = popupElement.querySelector("svg");
    if (svgElement) {
      const gradient = svgElement.querySelector("linearGradient");
      if (gradient) {
        let animateGradient2 = function(newY1, newY2, gradient2) {
          const startY1 = parseFloat(gradient2.y1.baseVal.value);
          const startY2 = parseFloat(gradient2.y2.baseVal.value);
          const startTime = Date.now();
          function step() {
            const progress = Math.min((Date.now() - startTime) / 800, 1);
            gradient2.y1.baseVal.value = startY1 + (newY1 - startY1) * progress;
            gradient2.y2.baseVal.value = startY2 + (newY2 - startY2) * progress;
            if (progress < 1) {
              requestAnimationFrame(step);
            }
          }
          requestAnimationFrame(step);
        };
        var animateGradient = animateGradient2;
        const popupWrapper = popupElement.querySelector(".popup-wrapper");
        popupWrapper.addEventListener("mouseenter", () => {
          animateGradient2(30, 282, gradient);
        });
        popupWrapper.addEventListener("mouseleave", () => {
          animateGradient2(0, 252, gradient);
        });
      }
    }
    closeButton.addEventListener("click", () => {
      popupContent.style.transition = "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
      popupContent.style.transform = "rotate(-5deg) translateY(2.5rem) /* was 40px */ scale(0.6)";
      popupContent.style.opacity = "0";
      setTimeout(() => {
        popup.remove();
        setActivePopup(null);
      }, 400);
    });
    backButton.addEventListener("click", () => {
      popupContent.style.transition = "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
      popupContent.style.transform = "rotate(-5deg) translateY(2.5rem) /* was 40px */ scale(0.6)";
      popupContent.style.opacity = "0";
      setTimeout(async () => {
        popup.remove();
        setActivePopup(null);
        const mainPopup = new window.mapboxgl.Popup({
          offset: [0, -5],
          className: "custom-popup",
          closeButton: false,
          maxWidth: "none",
          closeOnClick: false,
          anchor: "bottom"
        });
        const { createPopupContent: createPopupContent2 } = await Promise.resolve().then(() => (init_popups(), popups_exports));
        const { styles, html: html2 } = createPopupContent2(properties, coordinates);
        mainPopup.setLngLat(coordinates).setHTML(`${styles}${html2}`);
        mainPopup.addTo(window.map);
        setActivePopup(mainPopup);
        setupPopupInteractions(mainPopup, properties, coordinates);
        const newPopupContent = mainPopup.getElement().querySelector(".mapboxgl-popup-content");
        newPopupContent.style.opacity = "0";
        newPopupContent.style.transform = "rotate(8deg) translateY(2.5rem) /* was 40px */ scale(0.4)";
        requestAnimationFrame(() => {
          newPopupContent.style.transition = "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
          newPopupContent.style.opacity = "1";
          newPopupContent.style.transform = "rotate(0deg) translateY(0) scale(1)";
        });
      }, 400);
    });
  }
  function closeItem() {
    window.$(".locations-map_item").removeClass("is--show");
  }
  function closeItemIfVisible() {
    if (window.$(".locations-map_item").hasClass("is--show")) {
      closeItem();
    }
  }
  var popupTranslations;
  var init_popups_part2 = __esm({
    "src/modules/popups-part2.ts"() {
      "use strict";
      init_live_reload();
      init_state();
      popupTranslations = {
        nl: {
          buttons: {
            back: "Terug"
          },
          aria: {
            closePopup: "Sluit popup"
          },
          navigation: {
            confirmTitle: "Navigeer met Google Maps",
            confirmMessage: "Je wordt doorgestuurd naar Google Maps. Wil je doorgaan?",
            confirmYes: "Ja, navigeer",
            confirmNo: "Blijf hier"
          }
        },
        en: {
          buttons: {
            back: "Back"
          },
          aria: {
            closePopup: "Close popup"
          },
          navigation: {
            confirmTitle: "Navigate with Google Maps",
            confirmMessage: "You will be redirected to Google Maps. Do you want to continue?",
            confirmYes: "Yes, navigate",
            confirmNo: "Stay here"
          }
        },
        de: {
          buttons: {
            back: "Zur\xFCck"
          },
          aria: {
            closePopup: "Popup schlie\xDFen"
          },
          navigation: {
            confirmTitle: "Mit Google Maps navigieren",
            confirmMessage: "Sie werden zu Google Maps weitergeleitet. M\xF6chten Sie fortfahren?",
            confirmYes: "Ja, navigieren",
            confirmNo: "Hier bleiben"
          }
        }
      };
    }
  });

  // src/modules/popups.ts
  var popups_exports = {};
  __export(popups_exports, {
    closeActivePopup: () => closeActivePopup,
    closeItem: () => closeItem,
    closeItemIfVisible: () => closeItemIfVisible,
    createARButton: () => createARButton,
    createPopup: () => createPopup,
    createPopupContent: () => createPopupContent,
    getARLinkForDevice: () => getARLinkForDevice,
    handleSnapchatLink: () => handleSnapchatLink,
    showImagePopup: () => showImagePopup
  });
  function detectLanguage3() {
    const path = window.location.pathname;
    if (path.includes("/en/")) return "en";
    if (path.includes("/de/")) return "de";
    return "nl";
  }
  async function createPopup(location2, map) {
    const coordinates = location2.geometry.coordinates.slice();
    const { properties } = location2;
    const isAR = properties.type === "ar";
    let offset;
    if (window.matchMedia("(max-width: 479px)").matches) {
      offset = [0, 200];
    } else if (window.matchMedia("(max-width: 991px)").matches) {
      offset = [0, 220];
    } else {
      offset = [0, 260];
    }
    map.flyTo({
      center: coordinates,
      offset,
      duration: 800,
      essential: true
    });
    const visibleItem = window.$(".locations-map_item.is--show");
    if (visibleItem.length) {
      visibleItem.css({
        opacity: "0",
        transform: "translateY(2.5rem) scale(0.6)"
        /* was 40px */
      });
    }
    if (state2.activePopup) {
      const popupContent = state2.activePopup.getElement().querySelector(".mapboxgl-popup-content");
      if (popupContent) {
        popupContent.style.transition = "all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)";
        popupContent.style.transform = "rotate(-5deg) translateY(1.25rem) scale(0.8)";
        popupContent.style.opacity = "0";
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (state2.activePopup) {
      state2.activePopup.remove();
      setActivePopup(null);
    }
    const existingPopups = document.querySelectorAll(".mapboxgl-popup");
    existingPopups.forEach((popup2) => popup2.remove());
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (!isAR) {
      window.$(".locations-map_item").removeClass("is--show").css({
        display: "none",
        transform: "translateY(2.5rem) scale(0.6)",
        /* was 40px */
        opacity: "0"
      });
      window.$(".locations-map_wrapper").addClass("is--show");
      const currentItem = window.$(".locations-map_item").eq(properties.arrayID);
      currentItem.css({
        display: "block",
        opacity: "0",
        transform: "translateY(2.5rem) scale(0.6)"
        /* was 40px */
      });
      currentItem[0].offsetHeight;
      requestAnimationFrame(() => {
        currentItem.css({
          transition: "all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          opacity: "1",
          transform: "translateY(0) scale(1)"
        }).addClass("is--show");
      });
    } else {
      window.$(".locations-map_wrapper").removeClass("is--show");
      window.$(".locations-map_item").removeClass("is--show");
    }
    const popup = new window.mapboxgl.Popup({
      offset: {
        bottom: [0, -5],
        top: [0, 0],
        left: [0, 0],
        right: [0, 0]
      },
      className: "custom-popup",
      closeButton: false,
      maxWidth: "none",
      // Removed fixed width - now controlled by CSS clamp()
      closeOnClick: false,
      anchor: "bottom"
    });
    if (window.geolocationManager) {
      window.geolocationManager.isPopupOpen = true;
      if (window.geolocationManager.geolocateControl) {
        window.geolocationManager.wasTracking = window.geolocationManager.geolocateControl._watchState === "ACTIVE_LOCK";
        window.geolocationManager.pauseTracking();
      }
    }
    const { styles, html } = createPopupContent(properties, coordinates);
    popup.setLngLat(coordinates).setHTML(`${styles}${html}`).addTo(map);
    setActivePopup(popup);
    popup.on("close", () => {
      if (window.geolocationManager) {
        window.geolocationManager.isPopupOpen = false;
        if (window.geolocationManager.wasTracking) {
          window.geolocationManager.resumeTracking();
        }
      }
    });
    const { setupPopupInteractions: setupPopupInteractions2 } = await Promise.resolve().then(() => (init_popups_part2(), popups_part2_exports));
    setupPopupInteractions2(popup, properties, coordinates);
    return popup;
  }
  function closeActivePopup() {
    if (state2.activePopup) {
      state2.activePopup.remove();
      setActivePopup(null);
    }
  }
  function getARLinkForDevice(properties) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    if (isMobile) {
      return {
        link: properties.link_ar_mobile,
        available: !!properties.link_ar_mobile,
        deviceType: "mobile"
      };
    }
    return {
      link: properties.link_ar_desktop,
      available: !!properties.link_ar_desktop,
      deviceType: "desktop"
    };
  }
  function createARButton(properties, buttonClass = "impressie-button button-base", buttonText) {
    const lang = detectLanguage3();
    const t = popupTranslations2[lang];
    const linkInfo = getARLinkForDevice(properties);
    const actualButtonText = buttonText || t.buttons.startAR;
    if (!linkInfo.available) {
      if (linkInfo.deviceType === "desktop") {
        return `<button class="${buttonClass} disabled" disabled title="${t.messages.arMobileOnly}">
                ${actualButtonText} <span class="mobile-only">\u{1F4F1}</span>
              </button>`;
      }
      return "";
    }
    if (linkInfo.deviceType === "mobile" && linkInfo.link.startsWith("snapchat://")) {
      return `<button class="${buttonClass}" onclick="handleSnapchatLink('${linkInfo.link}')">${actualButtonText}</button>`;
    }
    return `<button class="${buttonClass}" onclick="window.open('${linkInfo.link}', '_blank')">${actualButtonText}</button>`;
  }
  function handleSnapchatLink(snapchatUri) {
    const lang = detectLanguage3();
    const t = popupTranslations2[lang];
    const appStoreLink = "https://apps.apple.com/app/snapchat/id447188370";
    const playStoreLink = "https://play.google.com/store/apps/details?id=com.snapchat.android";
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const storeLink = isAndroid ? playStoreLink : appStoreLink;
    const now = Date.now();
    const timeoutDuration = 1e3;
    window.location.href = snapchatUri;
    setTimeout(function() {
      if (Date.now() - now < timeoutDuration + 100) {
        if (confirm(t.messages.snapchatRequired)) {
          window.location.href = storeLink;
        }
      }
    }, timeoutDuration);
  }
  function hexToRgba(hex, alpha = 1) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgba(0, 0, 0, 0)`;
  }
  function generateOpeningHours(properties) {
    const days = [
      { key: "maandag", label: "Maandag" },
      { key: "dinsdag", label: "Dinsdag" },
      { key: "woensdag", label: "Woensdag" },
      { key: "donderdag", label: "Donderdag" },
      { key: "vrijdag", label: "Vrijdag" },
      { key: "zaterdag", label: "Zaterdag" },
      { key: "zondag", label: "Zondag" }
    ];
    const hasOpeningHours = days.some((day) => properties[day.key] && properties[day.key].trim() !== "");
    if (!hasOpeningHours) {
      return "";
    }
    let html = '<div class="popup-opening-hours">';
    html += '<h4 class="opening-hours-title">Openingstijden</h4>';
    html += '<div class="opening-hours-fade-top"></div>';
    html += '<div class="opening-hours-list">';
    days.forEach((day) => {
      const hours = properties[day.key];
      if (hours && hours.trim() !== "") {
        html += `<div class="opening-hours-row">`;
        html += `<span class="day-label">${day.label}:</span>`;
        html += `<span class="hours-value">${hours}</span>`;
        html += `</div>`;
      }
    });
    html += "</div>";
    html += '<div class="opening-hours-fade-bottom"></div>';
    html += "</div>";
    return html;
  }
  function createPopupContent(properties, coordinates) {
    const isAR = properties.type === "ar";
    const lang = detectLanguage3();
    const t = popupTranslations2[lang];
    const styles = `
    <style>
      .popup-side {
        background-color: ${properties.color || "#6B46C1"};
        clip-path: polygon(calc(100% - 0px) 26.5px, calc(100% - 0px) calc(100% - 26.5px), calc(100% - 0px) calc(100% - 26.5px), calc(100% - 0.34671999999995px) calc(100% - 22.20048px), calc(100% - 1.3505599999999px) calc(100% - 18.12224px), calc(100% - 2.95704px) calc(100% - 14.31976px), calc(100% - 5.11168px) calc(100% - 10.84752px), calc(100% - 7.76px) calc(100% - 7.76px), calc(100% - 10.84752px) calc(100% - 5.11168px), calc(100% - 14.31976px) calc(100% - 2.9570399999999px), calc(100% - 18.12224px) calc(100% - 1.35056px), calc(100% - 22.20048px) calc(100% - 0.34672px), calc(100% - 26.5px) calc(100% - 0px), calc(50% - -32.6px) calc(100% - 0px), calc(50% - -32.6px) calc(100% - 0px), calc(50% - -31.57121px) calc(100% - 0.057139999999947px), calc(50% - -30.56648px) calc(100% - 0.2255199999999px), calc(50% - -29.59427px) calc(100% - 0.50057999999996px), calc(50% - -28.66304px) calc(100% - 0.87775999999991px), calc(50% - -27.78125px) calc(100% - 1.3525px), calc(50% - -26.95736px) calc(100% - 1.92024px), calc(50% - -26.19983px) calc(100% - 2.57642px), calc(50% - -25.51712px) calc(100% - 3.31648px), calc(50% - -24.91769px) calc(100% - 4.13586px), calc(50% - -24.41px) calc(100% - 5.03px), calc(50% - -24.41px) calc(100% - 5.03px), calc(50% - -22.95654px) calc(100% - 7.6045699999999px), calc(50% - -21.23752px) calc(100% - 9.9929599999998px), calc(50% - -19.27298px) calc(100% - 12.17519px), calc(50% - -17.08296px) calc(100% - 14.13128px), calc(50% - -14.6875px) calc(100% - 15.84125px), calc(50% - -12.10664px) calc(100% - 17.28512px), calc(50% - -9.36042px) calc(100% - 18.44291px), calc(50% - -6.46888px) calc(100% - 19.29464px), calc(50% - -3.45206px) calc(100% - 19.82033px), calc(50% - -0.32999999999998px) calc(100% - 20px), calc(50% - -0.32999999999998px) calc(100% - 20px), calc(50% - 2.79179px) calc(100% - 19.82033px), calc(50% - 5.8079199999999px) calc(100% - 19.29464px), calc(50% - 8.69853px) calc(100% - 18.44291px), calc(50% - 11.44376px) calc(100% - 17.28512px), calc(50% - 14.02375px) calc(100% - 15.84125px), calc(50% - 16.41864px) calc(100% - 14.13128px), calc(50% - 18.60857px) calc(100% - 12.17519px), calc(50% - 20.57368px) calc(100% - 9.9929599999999px), calc(50% - 22.29411px) calc(100% - 7.60457px), calc(50% - 23.75px) calc(100% - 5.03px), calc(50% - 23.75px) calc(100% - 5.03px), calc(50% - 24.25769px) calc(100% - 4.1358599999999px), calc(50% - 24.85712px) calc(100% - 3.3164799999998px), calc(50% - 25.53983px) calc(100% - 2.57642px), calc(50% - 26.29736px) calc(100% - 1.92024px), calc(50% - 27.12125px) calc(100% - 1.3525px), calc(50% - 28.00304px) calc(100% - 0.87775999999997px), calc(50% - 28.93427px) calc(100% - 0.50057999999996px), calc(50% - 29.90648px) calc(100% - 0.22552000000002px), calc(50% - 30.91121px) calc(100% - 0.057140000000004px), calc(50% - 31.94px) calc(100% - 0px), 26.5px calc(100% - 0px), 26.5px calc(100% - 0px), 22.20048px calc(100% - 0.34671999999989px), 18.12224px calc(100% - 1.3505599999999px), 14.31976px calc(100% - 2.95704px), 10.84752px calc(100% - 5.1116799999999px), 7.76px calc(100% - 7.76px), 5.11168px calc(100% - 10.84752px), 2.95704px calc(100% - 14.31976px), 1.35056px calc(100% - 18.12224px), 0.34672px calc(100% - 22.20048px), 4.3855735949631E-31px calc(100% - 26.5px), 0px 26.5px, 0px 26.5px, 0.34672px 22.20048px, 1.35056px 18.12224px, 2.95704px 14.31976px, 5.11168px 10.84752px, 7.76px 7.76px, 10.84752px 5.11168px, 14.31976px 2.95704px, 18.12224px 1.35056px, 22.20048px 0.34672px, 26.5px 4.3855735949631E-31px, calc(50% - 26.74px) 0px, calc(50% - 26.74px) 0px, calc(50% - 25.31263px) 0.07137px, calc(50% - 23.91544px) 0.28176px, calc(50% - 22.55581px) 0.62559px, calc(50% - 21.24112px) 1.09728px, calc(50% - 19.97875px) 1.69125px, calc(50% - 18.77608px) 2.40192px, calc(50% - 17.64049px) 3.22371px, calc(50% - 16.57936px) 4.15104px, calc(50% - 15.60007px) 5.17833px, calc(50% - 14.71px) 6.3px, calc(50% - 14.71px) 6.3px, calc(50% - 13.6371px) 7.64798px, calc(50% - 12.446px) 8.89024px, calc(50% - 11.1451px) 10.01826px, calc(50% - 9.7428px) 11.02352px, calc(50% - 8.2475px) 11.8975px, calc(50% - 6.6676px) 12.63168px, calc(50% - 5.0115px) 13.21754px, calc(50% - 3.2876px) 13.64656px, calc(50% - 1.5043px) 13.91022px, calc(50% - -0.32999999999996px) 14px, calc(50% - -0.32999999999998px) 14px, calc(50% - -2.16431px) 13.9105px, calc(50% - -3.94768px) 13.6476px, calc(50% - -5.67177px) 13.2197px, calc(50% - -7.32824px) 12.6352px, calc(50% - -8.90875px) 11.9025px, calc(50% - -10.40496px) 11.03px, calc(50% - -11.80853px) 10.0261px, calc(50% - -13.11112px) 8.8992px, calc(50% - -14.30439px) 7.6577px, calc(50% - -15.38px) 6.31px, calc(50% - -15.38px) 6.31px, calc(50% - -16.27279px) 5.18562px, calc(50% - -17.25432px) 4.15616px, calc(50% - -18.31733px) 3.22714px, calc(50% - -19.45456px) 2.40408px, calc(50% - -20.65875px) 1.6925px, calc(50% - -21.92264px) 1.09792px, calc(50% - -23.23897px) 0.62586px, calc(50% - -24.60048px) 0.28184px, calc(50% - -25.99991px) 0.07138px, calc(50% - -27.43px) 8.9116630386686E-32px, calc(100% - 26.5px) 0px, calc(100% - 26.5px) 0px, calc(100% - 22.20048px) 0.34672px, calc(100% - 18.12224px) 1.35056px, calc(100% - 14.31976px) 2.95704px, calc(100% - 10.84752px) 5.11168px, calc(100% - 7.76px) 7.76px, calc(100% - 5.11168px) 10.84752px, calc(100% - 2.9570399999999px) 14.31976px, calc(100% - 1.35056px) 18.12224px, calc(100% - 0.34671999999995px) 22.20048px, calc(100% - 5.6843418860808E-14px) 26.5px);
      }
       
    
.fade-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3.5em;
  /* Gebruik dezelfde kleur als de popup maar met transparantie */
  background: linear-gradient(to top, ${properties.color ? hexToRgba(properties.color, 1) : "transparent"} 0%, transparent 100%);
  pointer-events: none;
  z-index: 10;
  transition: opacity 0.3s ease;
}

.popup-side.ar .fade-bottom {
  background: linear-gradient(to top, ${hexToRgba(properties.arkleur || "#fff200", 1)} 0%, ${hexToRgba(properties.arkleur || "#fff200", 0)} 100%);
}

/* CSS voor de top fade gradient */
.fade-top {
  position: absolute;
  top: -0.5em;
  left: 0;
  right: 0;
  height: 3.5em;
  /* Gespiegelde gradient vergeleken met de bottom fade */
  background: linear-gradient(to bottom, ${properties.color ? hexToRgba(properties.color, 1) : "transparent"} 0%, transparent 100%);
  pointer-events: none;
  z-index: 10;
  transition: opacity 0.3s ease;
}

/* Voor AR-popups een aparte styling */
.popup-side.ar .fade-top {
  background: linear-gradient(to bottom, ${hexToRgba(properties.arkleur || "#fff200", 1)} 0%, ${hexToRgba(properties.arkleur || "#fff200", 0)} 100%);
}

    .close-button {
      background: ${properties.color || "#6B46C1"};
    }
    
    /* Stijlen voor AR popup - met zwarte tekst */
    .popup-side.ar {
      background-color: ${properties.arkleur || "#fff200"};
      color: #000000;
    }
    
    .close-button.ar {
      background: ${properties.arkleur || "#fff200"};
    }
    
    /* Kleur aanpassingen voor AR elementen */
    .popup-side.ar .popup-title {
      color: #000000;
    }
    
    .popup-side.ar .popup-description {
      color: #000000;
    }
    
    /* Knoppen in AR popup */
    .popup-side.ar .button-base {
      color: #000000;
      border-color: #000000;
    }
    
    /* Styling voor achterkant van de popup */
    .popup-side.ar.popup-back {
      color: #000000;
      background-color: ${properties.arkleur || "#fff200"};
    }
    
    /* Zwarte tekst in AR popup details */
    .popup-side.ar .popup-title.details {
      color: #000000;
    }
    
    /* Maak ook de 'X' in de sluitknop zwart */
    .close-button.ar::before,
    .close-button.ar::after {
      background-color: #000000;
    }
    
    ${isAR ? `
      .ar-button {
        border: 2px solid black;
        font-weight: bold;
        color: #000000;
      }
      .ar-description {
        font-size: 0.9em;
        margin-top: 10px;
        color: #000000;
      }
    ` : ""}
  </style>
  `;
    if (isAR) {
      return {
        styles,
        html: `
      <div class="popup-wrapper">
        <button class="close-button ar" aria-label="${t.aria.closePopup}"></button>
        <div class="popup-side ar popup-front">
          <svg class="popup-border-overlay" viewBox="0 0 364.22 252" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 227.13V240.82C0 246.99 5 252 11.18 252H19.2C25.38 252 30.38 246.99 30.38 240.82C30.38 246.99 35.4 252 41.56 252H49.6C55.75 252 60.75 247.01 60.76 240.85C60.79 247.01 65.79 252 71.94 252H79.98C86.15 252 91.16 246.99 91.16 240.82C91.16 246.99 96.16 252 102.34 252H110.36C116.53 252 121.53 247.01 121.54 240.84C121.55 247.01 126.55 252 132.72 252H140.74C146.35 252 150.99 247.87 151.79 242.48C152.6 247.87 157.24 252 162.85 252H170.87C177.04 252 182.04 247 182.05 240.84C182.06 247 187.06 252 193.23 252H201.25C207.03 252 211.78 247.62 212.36 242C212.95 247.62 217.7 252 223.48 252H231.5C237.68 252 242.68 246.99 242.68 240.82C242.68 246.99 247.69 252 253.86 252H261.89C268.05 252 273.05 247.01 273.06 240.85C273.08 247.01 278.08 252 284.24 252H292.27C298.44 252 303.45 246.99 303.45 240.82C303.45 246.99 308.46 252 314.63 252H322.66C328.82 252 333.82 247.01 333.83 240.84C333.85 247.01 338.85 252 345.01 252H353.04C359.21 252 364.22 246.99 364.22 240.82V227.13C364.22 220.95 359.21 215.95 353.04 215.95C359.21 215.95 364.22 210.94 364.22 204.77V191.07C364.22 184.9 359.21 179.89 353.04 179.89C359.21 179.89 364.22 174.89 364.22 168.71V155.02C364.22 149.52 360.25 144.96 355.02 144.03C360.25 143.09 364.22 138.53 364.22 133.03V119.34C364.22 113.17 359.22 108.17 353.06 108.16C359.22 108.16 364.22 103.15 364.22 96.98V83.29C364.22 77.11 359.21 72.11 353.04 72.11C359.21 72.11 364.22 67.1 364.22 60.93V47.23C364.22 41.06 359.21 36.05 353.04 36.05C359.21 36.05 364.22 31.05 364.22 24.87V11.18C364.22 5.01 359.21 0 353.04 0H345.01C338.85 0 333.85 4.99 333.83 11.16C333.82 4.99 328.82 0 322.66 0H314.63C308.46 0 303.45 5.01 303.45 11.18C303.45 5.01 298.44 0 292.27 0H284.24C278.08 0 273.08 4.99 273.06 11.16C273.05 4.99 268.05 0 261.89 0H253.86C247.69 0 242.68 5.01 242.68 11.18C242.68 5.01 237.68 0 231.5 0H223.48C217.7 0 212.95 4.38 212.36 10C211.78 4.38 207.03 0 201.25 0H193.23C187.06 0 182.06 5 182.05 11.16C182.04 5 177.04 0 170.87 0H162.85C157.24 0 152.6 4.13 151.79 9.52C150.99 4.13 146.35 0 140.74 0H132.72C126.55 0 121.55 4.99 121.54 11.16C121.53 4.99 116.53 0 110.36 0H102.34C96.16 0 91.16 5.01 91.16 11.18C91.16 5.01 86.15 0 79.98 0H71.94C65.79 0 60.79 4.99 60.76 11.16C60.75 4.99 55.75 0 49.6 0H41.56C35.4 0 30.38 5.01 30.38 11.18C30.38 5.01 25.38 0 19.2 0H11.18C5 0 0 5.01 0 11.18V24.87C0 31.05 5 36.05 11.18 36.05C5 36.05 0 41.06 0 47.23V60.93C0 67.1 5 72.11 11.18 72.11C5 72.11 0 77.11 0 83.29V96.98C0 103.15 4.99 108.15 11.16 108.16C4.99 108.17 0 113.17 0 119.34V133.03C0 138.53 3.97 143.09 9.19 144.03C3.97 144.96 0 149.52 0 155.02V168.71C0 174.89 5 179.89 11.18 179.89C5 179.89 0 184.9 0 191.07V204.77C0 210.94 5 215.95 11.18 215.95C5 215.95 0 220.95 0 227.13ZM333.83 24.89C333.85 31.06 338.85 36.05 345.01 36.05C338.85 36.05 333.85 41.05 333.83 47.21C333.82 41.05 328.82 36.05 322.66 36.05C328.82 36.05 333.82 31.06 333.83 24.89ZM333.83 60.95C333.85 67.11 338.85 72.11 345.01 72.11C338.85 72.11 333.85 77.1 333.83 83.27C333.82 77.1 328.82 72.11 322.66 72.11C328.82 72.11 333.82 67.11 333.83 60.95ZM333.83 119.32C333.82 113.16 328.83 108.17 322.68 108.16C328.83 108.16 333.82 103.16 333.83 97C333.85 103.16 338.83 108.15 344.99 108.16C338.83 108.17 333.85 113.16 333.83 119.32ZM343.03 144.03C337.81 144.96 333.84 149.51 333.83 155C333.82 149.51 329.86 144.96 324.64 144.03C329.86 143.09 333.82 138.54 333.83 133.05C333.83 138.54 337.81 143.09 343.03 144.03ZM333.83 168.73C333.85 174.9 338.85 179.89 345.01 179.89C338.85 179.89 333.85 184.89 333.83 191.05C333.82 184.89 328.82 179.89 322.66 179.89C328.82 179.89 333.82 174.9 333.83 168.73ZM333.83 204.79C333.85 210.95 338.85 215.95 345.01 215.95C338.85 215.95 333.85 220.94 333.83 227.11C333.82 220.94 328.82 215.95 322.66 215.95C328.82 215.95 333.82 210.95 333.83 204.79ZM303.45 24.87C303.45 31.05 308.46 36.05 314.63 36.05C308.46 36.05 303.45 41.06 303.45 47.23C303.45 41.06 298.44 36.05 292.27 36.05C298.44 36.05 303.45 31.05 303.45 24.87ZM303.45 60.93C303.45 67.1 308.46 72.11 314.63 72.11C308.46 72.11 303.45 77.11 303.45 83.29C303.45 77.11 298.44 72.11 292.27 72.11C298.44 72.11 303.45 67.1 303.45 60.93ZM303.45 119.34C303.45 113.17 298.45 108.17 292.29 108.16C298.45 108.16 303.45 103.15 303.45 96.98C303.45 103.15 308.45 108.15 314.61 108.16C308.45 108.17 303.45 113.17 303.45 119.34ZM312.64 144.03C307.42 144.96 303.45 149.52 303.45 155.02C303.45 149.52 299.48 144.96 294.25 144.03C299.48 143.09 303.45 138.53 303.45 133.03C303.45 138.53 307.42 143.09 312.64 144.03ZM303.45 168.71C303.45 174.89 308.46 179.89 314.63 179.89C308.46 179.89 303.45 184.9 303.45 191.07C303.45 184.9 298.44 179.89 292.27 179.89C298.44 179.89 303.45 174.89 303.45 168.71ZM303.45 204.77C303.45 210.94 308.46 215.95 314.63 215.95C308.46 215.95 303.45 220.95 303.45 227.13C303.45 220.95 298.44 215.95 292.27 215.95C298.44 215.95 303.45 210.94 303.45 204.77ZM273.06 24.9C273.08 31.06 278.08 36.05 284.24 36.05C278.08 36.05 273.08 41.05 273.06 47.21C273.05 41.05 268.05 36.05 261.89 36.05C268.05 36.05 273.05 31.06 273.06 24.9ZM273.06 60.95C273.08 67.11 278.08 72.11 284.24 72.11C278.08 72.11 273.08 77.1 273.06 83.26C273.05 77.1 268.05 72.11 261.89 72.11C268.05 72.11 273.05 67.11 273.06 60.95ZM273.06 119.31C273.05 113.16 268.06 108.17 261.91 108.16C268.06 108.16 273.05 103.16 273.06 97.01C273.08 103.16 278.07 108.15 284.22 108.16C278.07 108.17 273.08 113.16 273.06 119.31ZM282.26 144.03C277.04 144.96 273.08 149.51 273.06 154.99C273.05 149.51 269.09 144.96 263.87 144.03C269.09 143.09 273.05 138.54 273.06 133.06C273.08 138.54 277.04 143.09 282.26 144.03ZM273.06 168.74C273.08 174.9 278.08 179.89 284.24 179.89C278.08 179.89 273.08 184.89 273.06 191.05C273.05 184.89 268.05 179.89 261.89 179.89C268.05 179.89 273.05 174.9 273.06 168.74ZM273.06 204.79C273.08 210.95 278.08 215.95 284.24 215.95C278.08 215.95 273.08 220.94 273.06 227.1C273.05 220.94 268.05 215.95 261.89 215.95C268.05 215.95 273.05 210.95 273.06 204.79ZM242.68 24.87C242.68 31.05 247.69 36.05 253.86 36.05C247.69 36.05 242.68 41.06 242.68 47.23C242.68 41.06 237.68 36.05 231.5 36.05C237.68 36.05 242.68 31.05 242.68 24.87ZM242.68 60.93C242.68 67.1 247.69 72.11 253.86 72.11C247.69 72.11 242.68 77.11 242.68 83.29C242.68 77.11 237.68 72.11 231.5 72.11C237.68 72.11 242.68 67.1 242.68 60.93ZM242.68 119.34C242.68 113.17 237.69 108.17 231.52 108.16C237.69 108.16 242.68 103.15 242.68 96.98C242.68 103.15 247.68 108.15 253.84 108.16C247.68 108.17 242.68 113.17 242.68 119.34ZM251.87 144.03C246.65 144.96 242.68 149.52 242.68 155.02C242.68 149.52 238.71 144.96 233.49 144.03C238.71 143.09 242.68 138.53 242.68 133.03C242.68 138.53 246.65 143.09 251.87 144.03ZM242.68 168.71C242.68 174.89 247.69 179.89 253.86 179.89C247.69 179.89 242.68 184.9 242.68 191.07C242.68 184.9 237.68 179.89 231.5 179.89C237.68 179.89 242.68 174.89 242.68 168.71ZM242.68 204.77C242.68 210.94 247.69 215.95 253.86 215.95C247.69 215.95 242.68 220.95 242.68 227.13C242.68 220.95 237.68 215.95 231.5 215.95C237.68 215.95 242.68 210.94 242.68 204.77ZM212.36 26.05C212.95 31.68 217.7 36.05 223.48 36.05C217.7 36.05 212.95 40.43 212.36 46.05C211.78 40.43 207.03 36.05 201.25 36.05C207.03 36.05 211.78 31.68 212.36 26.05ZM212.36 62.11C212.95 67.73 217.7 72.11 223.48 72.11C217.7 72.11 212.95 76.48 212.36 82.11C211.78 76.48 207.03 72.11 201.25 72.11C207.03 72.11 211.78 67.73 212.36 62.11ZM212.36 118.16C211.78 112.54 207.04 108.17 201.28 108.16C207.04 108.16 211.78 103.78 212.36 98.16C212.95 103.78 217.69 108.15 223.46 108.16C217.69 108.17 212.95 112.54 212.36 118.16ZM221.49 144.03C216.64 144.89 212.88 148.88 212.36 153.85C211.86 148.88 208.1 144.89 203.24 144.03C208.1 143.16 211.86 139.17 212.36 134.2C212.88 139.17 216.64 143.16 221.49 144.03ZM212.36 169.89C212.95 175.52 217.7 179.89 223.48 179.89C217.7 179.89 212.95 184.27 212.36 189.89C211.78 184.27 207.03 179.89 201.25 179.89C207.03 179.89 211.78 175.52 212.36 169.89ZM212.36 205.95C212.95 211.57 217.7 215.95 223.48 215.95C217.7 215.95 212.95 220.32 212.36 225.95C211.78 220.32 207.03 215.95 201.25 215.95C207.03 215.95 211.78 211.57 212.36 205.95ZM182.05 24.89C182.06 31.06 187.06 36.05 193.23 36.05C187.06 36.05 182.06 41.05 182.05 47.22C182.04 41.05 177.04 36.05 170.87 36.05C177.04 36.05 182.04 31.06 182.05 24.89ZM182.05 60.95C182.06 67.11 187.06 72.11 193.23 72.11C187.06 72.11 182.06 77.1 182.05 83.27C182.04 77.1 177.04 72.11 170.87 72.11C177.04 72.11 182.04 67.11 182.05 60.95ZM182.05 119.32C182.04 113.16 177.05 108.17 170.9 108.16C177.05 108.16 182.04 103.16 182.05 97C182.06 103.16 187.05 108.15 193.22 108.16C187.05 108.17 182.06 113.16 182.05 119.32ZM191.24 144.03C186.03 144.96 182.06 149.51 182.05 155C182.04 149.51 178.09 144.96 172.86 144.03C178.09 143.09 182.04 138.54 182.05 133.05C182.06 138.54 186.03 143.09 191.24 144.03ZM182.05 168.73C182.06 174.9 187.06 179.89 193.23 179.89C187.06 179.89 182.06 184.89 182.05 191.05C182.04 184.89 177.04 179.89 170.87 179.89C177.04 179.89 182.04 174.9 182.05 168.73ZM182.05 204.79C182.06 210.95 187.06 215.95 193.23 215.95C187.06 215.95 182.06 220.94 182.05 227.11C182.04 220.94 177.04 215.95 170.87 215.95C177.04 215.95 182.04 210.95 182.05 204.79ZM151.79 26.53C152.6 31.92 157.24 36.05 162.85 36.05C157.24 36.05 152.6 40.18 151.79 45.57C150.99 40.18 146.35 36.05 140.74 36.05C146.35 36.05 150.99 31.92 151.79 26.53ZM151.79 62.59C152.6 67.98 157.24 72.11 162.85 72.11C157.24 72.11 152.6 76.24 151.79 81.63C150.99 76.24 146.35 72.11 140.74 72.11C146.35 72.11 150.99 67.98 151.79 62.59ZM151.79 117.68C151 112.3 146.36 108.17 140.76 108.16C146.36 108.16 151 104.02 151.79 98.64C152.6 104.02 157.23 108.15 162.84 108.16C157.23 108.17 152.6 112.3 151.79 117.68ZM160.86 144.03C156.18 144.86 152.5 148.62 151.79 153.35C151.1 148.62 147.41 144.86 142.73 144.03C147.41 143.19 151.1 139.43 151.79 134.7C152.5 139.43 156.18 143.19 160.86 144.03ZM151.79 170.37C152.6 175.76 157.24 179.89 162.85 179.89C157.24 179.89 152.6 184.02 151.79 189.41C150.99 184.02 146.35 179.89 140.74 179.89C146.35 179.89 150.99 175.76 151.79 170.37ZM151.79 206.43C152.6 211.82 157.24 215.95 162.85 215.95C157.24 215.95 152.6 220.08 151.79 225.47C150.99 220.08 146.35 215.95 140.74 215.95C146.35 215.95 150.99 211.82 151.79 206.43ZM121.54 24.89C121.55 31.06 126.55 36.05 132.72 36.05C126.55 36.05 121.55 41.05 121.54 47.21C121.53 41.05 116.53 36.05 110.36 36.05C116.53 36.05 121.53 31.06 121.54 24.89ZM121.54 60.95C121.55 67.11 126.55 72.11 132.72 72.11C126.55 72.11 121.55 77.1 121.54 83.27C121.53 77.1 116.53 72.11 110.36 72.11C116.53 72.11 121.53 67.11 121.54 60.95ZM121.54 119.32C121.53 113.16 116.54 108.17 110.38 108.16C116.54 108.16 121.53 103.16 121.54 97C121.55 103.16 126.54 108.15 132.69 108.16C126.54 108.17 121.55 113.16 121.54 119.32ZM130.73 144.03C125.51 144.96 121.54 149.51 121.54 155C121.53 149.51 117.56 144.96 112.35 144.03C117.56 143.09 121.53 138.54 121.54 133.05C121.54 138.54 125.51 143.09 130.73 144.03ZM121.54 168.73C121.55 174.9 126.55 179.89 132.72 179.89C126.55 179.89 121.55 184.89 121.54 191.05C121.53 184.89 116.53 179.89 110.36 179.89C116.53 179.89 121.53 174.9 121.54 168.73ZM121.54 204.79C121.55 210.95 126.55 215.95 132.72 215.95C126.55 215.95 121.55 220.94 121.54 227.11C121.53 220.94 116.53 215.95 110.36 215.95C116.53 215.95 121.53 210.95 121.54 204.79ZM91.16 24.87C91.16 31.05 96.16 36.05 102.34 36.05C96.16 36.05 91.16 41.06 91.16 47.23C91.16 41.06 86.15 36.05 79.98 36.05C86.15 36.05 91.16 31.05 91.16 24.87ZM91.16 60.93C91.16 67.1 96.16 72.11 102.34 72.11C96.16 72.11 91.16 77.11 91.16 83.29C91.16 77.11 86.15 72.11 79.98 72.11C86.15 72.11 91.16 67.1 91.16 60.93ZM91.16 119.34C91.16 113.17 86.16 108.17 79.99 108.16C86.16 108.16 91.16 103.15 91.16 96.98C91.16 103.15 96.16 108.15 102.31 108.16C96.16 108.17 91.16 113.17 91.16 119.34ZM100.35 144.03C95.12 144.96 91.16 149.52 91.16 155.02C91.16 149.52 87.18 144.96 81.95 144.03C87.18 143.09 91.16 138.53 91.16 133.03C91.16 138.53 95.12 143.09 100.35 144.03ZM91.16 168.71C91.16 174.89 96.16 179.89 102.34 179.89C96.16 179.89 91.16 184.9 91.16 191.07C91.16 184.9 86.15 179.89 79.98 179.89C86.15 179.89 91.16 174.89 91.16 168.71ZM91.16 204.77C91.16 210.94 96.16 215.95 102.34 215.95C96.16 215.95 91.16 220.95 91.16 227.13C91.16 220.95 86.15 215.95 79.98 215.95C86.15 215.95 91.16 210.94 91.16 204.77ZM60.76 24.9C60.79 31.06 65.79 36.05 71.94 36.05C65.79 36.05 60.79 41.05 60.76 47.21C60.75 41.05 55.75 36.05 49.6 36.05C55.75 36.05 60.75 31.06 60.76 24.9ZM60.76 60.95C60.79 67.11 65.79 72.11 71.94 72.11C65.79 72.11 60.79 77.1 60.76 83.26C60.75 77.1 55.75 72.11 49.6 72.11C55.75 72.11 60.75 67.11 60.76 60.95ZM60.76 119.31C60.75 113.16 55.76 108.17 49.61 108.16C55.76 108.16 60.75 103.16 60.76 97.01C60.79 103.16 65.78 108.15 71.92 108.16C65.78 108.17 60.79 113.16 60.76 119.31ZM69.97 144.03C64.74 144.96 60.79 149.51 60.76 154.99C60.75 149.51 56.79 144.96 51.57 144.03C56.79 143.09 60.75 138.54 60.76 133.06C60.79 138.54 64.74 143.09 69.97 144.03ZM60.76 168.74C60.79 174.9 65.79 179.89 71.94 179.89C65.79 179.89 60.79 184.89 60.76 191.05C60.75 184.89 55.75 179.89 49.6 179.89C55.75 179.89 60.75 174.9 60.76 168.74ZM60.76 204.79C60.79 210.95 65.79 215.95 71.94 215.95C65.79 215.95 60.79 220.94 60.76 227.1C60.75 220.94 55.75 215.95 49.6 215.95C55.75 215.95 60.75 210.95 60.76 204.79ZM30.38 24.87C30.38 31.05 35.4 36.05 41.56 36.05C35.4 36.05 30.38 41.06 30.38 47.23C30.38 41.06 25.38 36.05 19.2 36.05C25.38 36.05 30.38 31.05 30.38 24.87ZM30.38 60.93C30.38 67.1 35.4 72.11 41.56 72.11C35.4 72.11 30.38 77.11 30.38 83.29C30.38 77.11 25.38 72.11 19.2 72.11C25.38 72.11 30.38 67.1 30.38 60.93ZM30.38 119.34C30.38 113.17 25.4 108.17 19.23 108.16C25.4 108.16 30.38 103.15 30.38 96.98C30.38 103.15 35.38 108.15 41.54 108.16C35.38 108.17 30.38 113.17 30.38 119.34ZM39.57 144.03C34.35 144.96 30.38 149.52 30.38 155.02C30.38 149.52 26.41 144.96 21.19 144.03C26.41 143.09 30.38 138.53 30.38 133.03C30.38 138.53 34.35 143.09 39.57 144.03ZM30.38 168.71C30.38 174.89 35.4 179.89 41.56 179.89C35.4 179.89 30.38 184.9 30.38 191.07C30.38 184.9 25.38 179.89 19.2 179.89C25.38 179.89 30.38 174.89 30.38 168.71ZM30.38 204.77C30.38 210.94 35.4 215.95 41.56 215.95C35.4 215.95 30.38 220.95 30.38 227.13C30.38 220.95 25.38 215.95 19.2 215.95C25.38 215.95 30.38 210.94 30.38 204.77Z" fill="url(#paint0_linear_3248_5)"/>
              <defs>
              <linearGradient id="paint0_linear_3248_5" x1="182.11" y1="0" x2="182.11" y2="252" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="${properties.arkleur || "#fff200"}" stop-opacity="0" />
                <stop offset="0.15" stop-color="${properties.arkleur || "#fff200"}" stop-opacity="0" />
                <stop offset="0.45" stop-color="${properties.arkleur || "#fff200"}" stop-opacity="1" />
                <stop offset="1" stop-color="${properties.arkleur || "#fff200"}" stop-opacity="1" />
              </linearGradient>
            </defs>
          </svg>
          ${properties.image ? `<img src="${properties.image}" class="popup-background-image" alt="">` : ""}
          <div class="content-wrapper">
            <div class="popup-title">${properties.name}</div>
            <div class="popup-description-wrapper">
              <div class="fade-top"></div>
              <div class="popup-description">${properties.description}</div>
              <div class="fade-bottom"></div>
            </div>
${properties.image ? createARButton(properties) : ""}
            <button class="more-info-button button-base">${t.buttons.instruction}</button>
          </div>
        </div>
        
        <div class="popup-side ar popup-back">
          <div class="content-wrapper">
            <div class="popup-ar-instructie">${properties.instructie || t.messages.defaultARInstruction}</div>
            <button class="more-info-button button-base">${t.buttons.back}</button>
${createARButton(properties, "impressie-button button-base")}
          </div>
        </div>
      </div>
      `
      };
    }
    return {
      styles,
      html: `
        <div class="popup-wrapper">
          <button class="close-button" aria-label="${t.aria.closePopup}"></button>
          <div class="popup-side popup-front">
            <svg class="popup-border-overlay" viewBox="0 0 364.22 252" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 227.13V240.82C0 246.99 5 252 11.18 252H19.2C25.38 252 30.38 246.99 30.38 240.82C30.38 246.99 35.4 252 41.56 252H49.6C55.75 252 60.75 247.01 60.76 240.85C60.79 247.01 65.79 252 71.94 252H79.98C86.15 252 91.16 246.99 91.16 240.82C91.16 246.99 96.16 252 102.34 252H110.36C116.53 252 121.53 247.01 121.54 240.84C121.55 247.01 126.55 252 132.72 252H140.74C146.35 252 150.99 247.87 151.79 242.48C152.6 247.87 157.24 252 162.85 252H170.87C177.04 252 182.04 247 182.05 240.84C182.06 247 187.06 252 193.23 252H201.25C207.03 252 211.78 247.62 212.36 242C212.95 247.62 217.7 252 223.48 252H231.5C237.68 252 242.68 246.99 242.68 240.82C242.68 246.99 247.69 252 253.86 252H261.89C268.05 252 273.05 247.01 273.06 240.85C273.08 247.01 278.08 252 284.24 252H292.27C298.44 252 303.45 246.99 303.45 240.82C303.45 246.99 308.46 252 314.63 252H322.66C328.82 252 333.82 247.01 333.83 240.84C333.85 247.01 338.85 252 345.01 252H353.04C359.21 252 364.22 246.99 364.22 240.82V227.13C364.22 220.95 359.21 215.95 353.04 215.95C359.21 215.95 364.22 210.94 364.22 204.77V191.07C364.22 184.9 359.21 179.89 353.04 179.89C359.21 179.89 364.22 174.89 364.22 168.71V155.02C364.22 149.52 360.25 144.96 355.02 144.03C360.25 143.09 364.22 138.53 364.22 133.03V119.34C364.22 113.17 359.22 108.17 353.06 108.16C359.22 108.16 364.22 103.15 364.22 96.98V83.29C364.22 77.11 359.21 72.11 353.04 72.11C359.21 72.11 364.22 67.1 364.22 60.93V47.23C364.22 41.06 359.21 36.05 353.04 36.05C359.21 36.05 364.22 31.05 364.22 24.87V11.18C364.22 5.01 359.21 0 353.04 0H345.01C338.85 0 333.85 4.99 333.83 11.16C333.82 4.99 328.82 0 322.66 0H314.63C308.46 0 303.45 5.01 303.45 11.18C303.45 5.01 298.44 0 292.27 0H284.24C278.08 0 273.08 4.99 273.06 11.16C273.05 4.99 268.05 0 261.89 0H253.86C247.69 0 242.68 5.01 242.68 11.18C242.68 5.01 237.68 0 231.5 0H223.48C217.7 0 212.95 4.38 212.36 10C211.78 4.38 207.03 0 201.25 0H193.23C187.06 0 182.06 5 182.05 11.16C182.04 5 177.04 0 170.87 0H162.85C157.24 0 152.6 4.13 151.79 9.52C150.99 4.13 146.35 0 140.74 0H132.72C126.55 0 121.55 4.99 121.54 11.16C121.53 4.99 116.53 0 110.36 0H102.34C96.16 0 91.16 5.01 91.16 11.18C91.16 5.01 86.15 0 79.98 0H71.94C65.79 0 60.79 4.99 60.76 11.16C60.75 4.99 55.75 0 49.6 0H41.56C35.4 0 30.38 5.01 30.38 11.18C30.38 5.01 25.38 0 19.2 0H11.18C5 0 0 5.01 0 11.18V24.87C0 31.05 5 36.05 11.18 36.05C5 36.05 0 41.06 0 47.23V60.93C0 67.1 5 72.11 11.18 72.11C5 72.11 0 77.11 0 83.29V96.98C0 103.15 4.99 108.15 11.16 108.16C4.99 108.17 0 113.17 0 119.34V133.03C0 138.53 3.97 143.09 9.19 144.03C3.97 144.96 0 149.52 0 155.02V168.71C0 174.89 5 179.89 11.18 179.89C5 179.89 0 184.9 0 191.07V204.77C0 210.94 5 215.95 11.18 215.95C5 215.95 0 220.95 0 227.13ZM333.83 24.89C333.85 31.06 338.85 36.05 345.01 36.05C338.85 36.05 333.85 41.05 333.83 47.21C333.82 41.05 328.82 36.05 322.66 36.05C328.82 36.05 333.82 31.06 333.83 24.89ZM333.83 60.95C333.85 67.11 338.85 72.11 345.01 72.11C338.85 72.11 333.85 77.1 333.83 83.27C333.82 77.1 328.82 72.11 322.66 72.11C328.82 72.11 333.82 67.11 333.83 60.95ZM333.83 119.32C333.82 113.16 328.83 108.17 322.68 108.16C328.83 108.16 333.82 103.16 333.83 97C333.85 103.16 338.83 108.15 344.99 108.16C338.83 108.17 333.85 113.16 333.83 119.32ZM343.03 144.03C337.81 144.96 333.84 149.51 333.83 155C333.82 149.51 329.86 144.96 324.64 144.03C329.86 143.09 333.82 138.54 333.83 133.05C333.83 138.54 337.81 143.09 343.03 144.03ZM333.83 168.73C333.85 174.9 338.85 179.89 345.01 179.89C338.85 179.89 333.85 184.89 333.83 191.05C333.82 184.89 328.82 179.89 322.66 179.89C328.82 179.89 333.82 174.9 333.83 168.73ZM333.83 204.79C333.85 210.95 338.85 215.95 345.01 215.95C338.85 215.95 333.85 220.94 333.83 227.11C333.82 220.94 328.82 215.95 322.66 215.95C328.82 215.95 333.82 210.95 333.83 204.79ZM303.45 24.87C303.45 31.05 308.46 36.05 314.63 36.05C308.46 36.05 303.45 41.06 303.45 47.23C303.45 41.06 298.44 36.05 292.27 36.05C298.44 36.05 303.45 31.05 303.45 24.87ZM303.45 60.93C303.45 67.1 308.46 72.11 314.63 72.11C308.46 72.11 303.45 77.11 303.45 83.29C303.45 77.11 298.44 72.11 292.27 72.11C298.44 72.11 303.45 67.1 303.45 60.93ZM303.45 119.34C303.45 113.17 298.45 108.17 292.29 108.16C298.45 108.16 303.45 103.15 303.45 96.98C303.45 103.15 308.45 108.15 314.61 108.16C308.45 108.17 303.45 113.17 303.45 119.34ZM312.64 144.03C307.42 144.96 303.45 149.52 303.45 155.02C303.45 149.52 299.48 144.96 294.25 144.03C299.48 143.09 303.45 138.53 303.45 133.03C303.45 138.53 307.42 143.09 312.64 144.03ZM303.45 168.71C303.45 174.89 308.46 179.89 314.63 179.89C308.46 179.89 303.45 184.9 303.45 191.07C303.45 184.9 298.44 179.89 292.27 179.89C298.44 179.89 303.45 174.89 303.45 168.71ZM303.45 204.77C303.45 210.94 308.46 215.95 314.63 215.95C308.46 215.95 303.45 220.95 303.45 227.13C303.45 220.95 298.44 215.95 292.27 215.95C298.44 215.95 303.45 210.94 303.45 204.77ZM273.06 24.9C273.08 31.06 278.08 36.05 284.24 36.05C278.08 36.05 273.08 41.05 273.06 47.21C273.05 41.05 268.05 36.05 261.89 36.05C268.05 36.05 273.05 31.06 273.06 24.9ZM273.06 60.95C273.08 67.11 278.08 72.11 284.24 72.11C278.08 72.11 273.08 77.1 273.06 83.26C273.05 77.1 268.05 72.11 261.89 72.11C268.05 72.11 273.05 67.11 273.06 60.95ZM273.06 119.31C273.05 113.16 268.06 108.17 261.91 108.16C268.06 108.16 273.05 103.16 273.06 97.01C273.08 103.16 278.07 108.15 284.22 108.16C278.07 108.17 273.08 113.16 273.06 119.31ZM282.26 144.03C277.04 144.96 273.08 149.51 273.06 154.99C273.05 149.51 269.09 144.96 263.87 144.03C269.09 143.09 273.05 138.54 273.06 133.06C273.08 138.54 277.04 143.09 282.26 144.03ZM273.06 168.74C273.08 174.9 278.08 179.89 284.24 179.89C278.08 179.89 273.08 184.89 273.06 191.05C273.05 184.89 268.05 179.89 261.89 179.89C268.05 179.89 273.05 174.9 273.06 168.74ZM273.06 204.79C273.08 210.95 278.08 215.95 284.24 215.95C278.08 215.95 273.08 220.94 273.06 227.1C273.05 220.94 268.05 215.95 261.89 215.95C268.05 215.95 273.05 210.95 273.06 204.79ZM242.68 24.87C242.68 31.05 247.69 36.05 253.86 36.05C247.69 36.05 242.68 41.06 242.68 47.23C242.68 41.06 237.68 36.05 231.5 36.05C237.68 36.05 242.68 31.05 242.68 24.87ZM242.68 60.93C242.68 67.1 247.69 72.11 253.86 72.11C247.69 72.11 242.68 77.11 242.68 83.29C242.68 77.11 237.68 72.11 231.5 72.11C237.68 72.11 242.68 67.1 242.68 60.93ZM242.68 119.34C242.68 113.17 237.69 108.17 231.52 108.16C237.69 108.16 242.68 103.15 242.68 96.98C242.68 103.15 247.68 108.15 253.84 108.16C247.68 108.17 242.68 113.17 242.68 119.34ZM251.87 144.03C246.65 144.96 242.68 149.52 242.68 155.02C242.68 149.52 238.71 144.96 233.49 144.03C238.71 143.09 242.68 138.53 242.68 133.03C242.68 138.53 246.65 143.09 251.87 144.03ZM242.68 168.71C242.68 174.89 247.69 179.89 253.86 179.89C247.69 179.89 242.68 184.9 242.68 191.07C242.68 184.9 237.68 179.89 231.5 179.89C237.68 179.89 242.68 174.89 242.68 168.71ZM242.68 204.77C242.68 210.94 247.69 215.95 253.86 215.95C247.69 215.95 242.68 220.95 242.68 227.13C242.68 220.95 237.68 215.95 231.5 215.95C237.68 215.95 242.68 210.94 242.68 204.77ZM212.36 26.05C212.95 31.68 217.7 36.05 223.48 36.05C217.7 36.05 212.95 40.43 212.36 46.05C211.78 40.43 207.03 36.05 201.25 36.05C207.03 36.05 211.78 31.68 212.36 26.05ZM212.36 62.11C212.95 67.73 217.7 72.11 223.48 72.11C217.7 72.11 212.95 76.48 212.36 82.11C211.78 76.48 207.03 72.11 201.25 72.11C207.03 72.11 211.78 67.73 212.36 62.11ZM212.36 118.16C211.78 112.54 207.04 108.17 201.28 108.16C207.04 108.16 211.78 103.78 212.36 98.16C212.95 103.78 217.69 108.15 223.46 108.16C217.69 108.17 212.95 112.54 212.36 118.16ZM221.49 144.03C216.64 144.89 212.88 148.88 212.36 153.85C211.86 148.88 208.1 144.89 203.24 144.03C208.1 143.16 211.86 139.17 212.36 134.2C212.88 139.17 216.64 143.16 221.49 144.03ZM212.36 169.89C212.95 175.52 217.7 179.89 223.48 179.89C217.7 179.89 212.95 184.27 212.36 189.89C211.78 184.27 207.03 179.89 201.25 179.89C207.03 179.89 211.78 175.52 212.36 169.89ZM212.36 205.95C212.95 211.57 217.7 215.95 223.48 215.95C217.7 215.95 212.95 220.32 212.36 225.95C211.78 220.32 207.03 215.95 201.25 215.95C207.03 215.95 211.78 211.57 212.36 205.95ZM182.05 24.89C182.06 31.06 187.06 36.05 193.23 36.05C187.06 36.05 182.06 41.05 182.05 47.22C182.04 41.05 177.04 36.05 170.87 36.05C177.04 36.05 182.04 31.06 182.05 24.89ZM182.05 60.95C182.06 67.11 187.06 72.11 193.23 72.11C187.06 72.11 182.06 77.1 182.05 83.27C182.04 77.1 177.04 72.11 170.87 72.11C177.04 72.11 182.04 67.11 182.05 60.95ZM182.05 119.32C182.04 113.16 177.05 108.17 170.9 108.16C177.05 108.16 182.04 103.16 182.05 97C182.06 103.16 187.05 108.15 193.22 108.16C187.05 108.17 182.06 113.16 182.05 119.32ZM191.24 144.03C186.03 144.96 182.06 149.51 182.05 155C182.04 149.51 178.09 144.96 172.86 144.03C178.09 143.09 182.04 138.54 182.05 133.05C182.06 138.54 186.03 143.09 191.24 144.03ZM182.05 168.73C182.06 174.9 187.06 179.89 193.23 179.89C187.06 179.89 182.06 184.89 182.05 191.05C182.04 184.89 177.04 179.89 170.87 179.89C177.04 179.89 182.04 174.9 182.05 168.73ZM182.05 204.79C182.06 210.95 187.06 215.95 193.23 215.95C187.06 215.95 182.06 220.94 182.05 227.11C182.04 220.94 177.04 215.95 170.87 215.95C177.04 215.95 182.04 210.95 182.05 204.79ZM151.79 26.53C152.6 31.92 157.24 36.05 162.85 36.05C157.24 36.05 152.6 40.18 151.79 45.57C150.99 40.18 146.35 36.05 140.74 36.05C146.35 36.05 150.99 31.92 151.79 26.53ZM151.79 62.59C152.6 67.98 157.24 72.11 162.85 72.11C157.24 72.11 152.6 76.24 151.79 81.63C150.99 76.24 146.35 72.11 140.74 72.11C146.35 72.11 150.99 67.98 151.79 62.59ZM151.79 117.68C151 112.3 146.36 108.17 140.76 108.16C146.36 108.16 151 104.02 151.79 98.64C152.6 104.02 157.23 108.15 162.84 108.16C157.23 108.17 152.6 112.3 151.79 117.68ZM160.86 144.03C156.18 144.86 152.5 148.62 151.79 153.35C151.1 148.62 147.41 144.86 142.73 144.03C147.41 143.19 151.1 139.43 151.79 134.7C152.5 139.43 156.18 143.19 160.86 144.03ZM151.79 170.37C152.6 175.76 157.24 179.89 162.85 179.89C157.24 179.89 152.6 184.02 151.79 189.41C150.99 184.02 146.35 179.89 140.74 179.89C146.35 179.89 150.99 175.76 151.79 170.37ZM151.79 206.43C152.6 211.82 157.24 215.95 162.85 215.95C157.24 215.95 152.6 220.08 151.79 225.47C150.99 220.08 146.35 215.95 140.74 215.95C146.35 215.95 150.99 211.82 151.79 206.43ZM121.54 24.89C121.55 31.06 126.55 36.05 132.72 36.05C126.55 36.05 121.55 41.05 121.54 47.21C121.53 41.05 116.53 36.05 110.36 36.05C116.53 36.05 121.53 31.06 121.54 24.89ZM121.54 60.95C121.55 67.11 126.55 72.11 132.72 72.11C126.55 72.11 121.55 77.1 121.54 83.27C121.53 77.1 116.53 72.11 110.36 72.11C116.53 72.11 121.53 67.11 121.54 60.95ZM121.54 119.32C121.53 113.16 116.54 108.17 110.38 108.16C116.54 108.16 121.53 103.16 121.54 97C121.55 103.16 126.54 108.15 132.69 108.16C126.54 108.17 121.55 113.16 121.54 119.32ZM130.73 144.03C125.51 144.96 121.54 149.51 121.54 155C121.53 149.51 117.56 144.96 112.35 144.03C117.56 143.09 121.53 138.54 121.54 133.05C121.54 138.54 125.51 143.09 130.73 144.03ZM121.54 168.73C121.55 174.9 126.55 179.89 132.72 179.89C126.55 179.89 121.55 184.89 121.54 191.05C121.53 184.89 116.53 179.89 110.36 179.89C116.53 179.89 121.53 174.9 121.54 168.73ZM121.54 204.79C121.55 210.95 126.55 215.95 132.72 215.95C126.55 215.95 121.55 220.94 121.54 227.11C121.53 220.94 116.53 215.95 110.36 215.95C116.53 215.95 121.53 210.95 121.54 204.79ZM91.16 24.87C91.16 31.05 96.16 36.05 102.34 36.05C96.16 36.05 91.16 41.06 91.16 47.23C91.16 41.06 86.15 36.05 79.98 36.05C86.15 36.05 91.16 31.05 91.16 24.87ZM91.16 60.93C91.16 67.1 96.16 72.11 102.34 72.11C96.16 72.11 91.16 77.11 91.16 83.29C91.16 77.11 86.15 72.11 79.98 72.11C86.15 72.11 91.16 67.1 91.16 60.93ZM91.16 119.34C91.16 113.17 86.16 108.17 79.99 108.16C86.16 108.16 91.16 103.15 91.16 96.98C91.16 103.15 96.16 108.15 102.31 108.16C96.16 108.17 91.16 113.17 91.16 119.34ZM100.35 144.03C95.12 144.96 91.16 149.52 91.16 155.02C91.16 149.52 87.18 144.96 81.95 144.03C87.18 143.09 91.16 138.53 91.16 133.03C91.16 138.53 95.12 143.09 100.35 144.03ZM91.16 168.71C91.16 174.89 96.16 179.89 102.34 179.89C96.16 179.89 91.16 184.9 91.16 191.07C91.16 184.9 86.15 179.89 79.98 179.89C86.15 179.89 91.16 174.89 91.16 168.71ZM91.16 204.77C91.16 210.94 96.16 215.95 102.34 215.95C96.16 215.95 91.16 220.95 91.16 227.13C91.16 220.95 86.15 215.95 79.98 215.95C86.15 215.95 91.16 210.94 91.16 204.77ZM60.76 24.9C60.79 31.06 65.79 36.05 71.94 36.05C65.79 36.05 60.79 41.05 60.76 47.21C60.75 41.05 55.75 36.05 49.6 36.05C55.75 36.05 60.75 31.06 60.76 24.9ZM60.76 60.95C60.79 67.11 65.79 72.11 71.94 72.11C65.79 72.11 60.79 77.1 60.76 83.26C60.75 77.1 55.75 72.11 49.6 72.11C55.75 72.11 60.75 67.11 60.76 60.95ZM60.76 119.31C60.75 113.16 55.76 108.17 49.61 108.16C55.76 108.16 60.75 103.16 60.76 97.01C60.79 103.16 65.78 108.15 71.92 108.16C65.78 108.17 60.79 113.16 60.76 119.31ZM69.97 144.03C64.74 144.96 60.79 149.51 60.76 154.99C60.75 149.51 56.79 144.96 51.57 144.03C56.79 143.09 60.75 138.54 60.76 133.06C60.79 138.54 64.74 143.09 69.97 144.03ZM60.76 168.74C60.79 174.9 65.79 179.89 71.94 179.89C65.79 179.89 60.79 184.89 60.76 191.05C60.75 184.89 55.75 179.89 49.6 179.89C55.75 179.89 60.75 174.9 60.76 168.74ZM60.76 204.79C60.79 210.95 65.79 215.95 71.94 215.95C65.79 215.95 60.79 220.94 60.76 227.1C60.75 220.94 55.75 215.95 49.6 215.95C55.75 215.95 60.75 210.95 60.76 204.79ZM30.38 24.87C30.38 31.05 35.4 36.05 41.56 36.05C35.4 36.05 30.38 41.06 30.38 47.23C30.38 41.06 25.38 36.05 19.2 36.05C25.38 36.05 30.38 31.05 30.38 24.87ZM30.38 60.93C30.38 67.1 35.4 72.11 41.56 72.11C35.4 72.11 30.38 77.11 30.38 83.29C30.38 77.11 25.38 72.11 19.2 72.11C25.38 72.11 30.38 67.1 30.38 60.93ZM30.38 119.34C30.38 113.17 25.4 108.17 19.23 108.16C25.4 108.16 30.38 103.15 30.38 96.98C30.38 103.15 35.38 108.15 41.54 108.16C35.38 108.17 30.38 113.17 30.38 119.34ZM39.57 144.03C34.35 144.96 30.38 149.52 30.38 155.02C30.38 149.52 26.41 144.96 21.19 144.03C26.41 143.09 30.38 138.53 30.38 133.03C30.38 138.53 34.35 143.09 39.57 144.03ZM30.38 168.71C30.38 174.89 35.4 179.89 41.56 179.89C35.4 179.89 30.38 184.9 30.38 191.07C30.38 184.9 25.38 179.89 19.2 179.89C25.38 179.89 30.38 174.89 30.38 168.71ZM30.38 204.77C30.38 210.94 35.4 215.95 41.56 215.95C35.4 215.95 30.38 220.95 30.38 227.13C30.38 220.95 25.38 215.95 19.2 215.95C25.38 215.95 30.38 210.94 30.38 204.77Z" fill="url(#paint0_linear_3248_5)"/>
              <defs>
                <linearGradient id="paint0_linear_3248_5" x1="182.11" y1="0" x2="182.11" y2="252" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stop-color="${properties.color}" stop-opacity="0" />
                  <stop offset="0.15" stop-color="${properties.color}" stop-opacity="0" />
                  <stop offset="0.45" stop-color="${properties.color}" stop-opacity="1" />
                  <stop offset="1" stop-color="${properties.color}" stop-opacity="1" />
                </linearGradient>
              </defs>
            </svg>
            ${properties.image ? `<img src="${properties.image}" class="popup-background-image" alt="">` : ""}
            <div class="content-wrapper">
              <div class="popup-title">${properties.name}</div>
              <div class="popup-description-wrapper">
                <div class="fade-top"></div>
                <div class="popup-description">${properties.description}</div>
                <div class="fade-bottom"></div>
              </div>

              ${coordinates ? `<button class="navigate-button button-base" data-lat="${coordinates[1]}" data-lng="${coordinates[0]}" data-color="${properties.color || "#6B46C1"}" aria-label="${t.aria.navigate}">${t.buttons.navigate}</button>` : ""}
              <button class="more-info-button button-base">${t.buttons.moreInfo}</button>
            </div>
          </div>

          <div class="popup-side popup-back">
            <div class="content-wrapper">

               <!-- Add this new social-icons div -->
          <div class="social-icons">
          ${coordinates ? `
            <a href="https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}" target="_blank" aria-label="${t.aria.navigate}" title="${t.aria.navigate}">
              <svg width="20" height="20" viewBox="0 0 693 693" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M397.579 674.597C389.049 666.067 383.409 655.327 381.229 643.457L325.669 371.347C325.189 369.027 323.349 367.177 320.979 366.697L48.2893 311.017C32.3093 307.567 18.6393 298.097 9.77932 284.357C0.92932 270.617 -2.05068 254.247 1.39932 238.277C5.89932 217.457 21.2093 200.237 41.3593 193.327L41.5893 193.247L612.369 2.98667C627.929 -2.03333 644.509 -0.693336 659.049 6.76666C673.599 14.2167 684.369 26.8967 689.389 42.4467C693.349 54.7367 693.349 67.7267 689.389 80.0067L689.309 80.2667L499.149 650.737C490.449 677.117 465.019 694.337 437.299 692.647C422.449 691.717 408.499 685.447 397.969 674.997C397.839 674.867 397.709 674.737 397.579 674.607V674.597ZM363.049 329.347C371.339 337.637 377.239 348.287 379.699 360.277L435.409 633.107L435.469 633.477C435.619 634.307 435.989 635.057 436.619 635.657L436.819 635.857C437.859 636.897 439.239 637.517 440.709 637.607C443.409 637.777 445.919 636.067 446.779 633.467L636.929 63.0267C637.299 61.8367 637.289 60.5867 636.909 59.3967C636.279 57.4267 634.929 56.3967 633.919 55.8767C632.919 55.3667 631.319 54.8867 629.389 55.4767L59.2093 245.507C57.2493 246.207 55.7693 247.887 55.3293 249.927C54.8893 251.947 55.5393 253.517 56.1593 254.477C56.7693 255.427 57.8993 256.637 59.8693 257.087L332.069 312.667C344.089 315.137 354.769 321.057 363.059 329.347H363.049Z" fill="white"/>
              </svg>
            </a>` : ""}
          ${properties.website ? `
            <a href="${properties.website}" target="_blank" aria-label="${t.aria.website}" title="${t.aria.website}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </a>` : ""}
          ${properties.instagram ? `
            <a href="${properties.instagram}" target="_blank" aria-label="${t.aria.instagram}" title="${t.aria.instagram}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.28-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>` : ""}
          ${properties.facebook ? `
            <a href="${properties.facebook}" target="_blank" aria-label="${t.aria.facebook}" title="${t.aria.facebook}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>` : ""}
            </div>
              <div class="info-content">
                <div class="popup-descriptionv2">${properties.descriptionv2}</div>
              </div>
              ${generateOpeningHours(properties)}
              ${properties.image ? `<button class="impressie-button button-base">${t.buttons.impression}</button>` : ""}
              <button class="more-info-button button-base">${t.buttons.back}</button>
            </div>
          </div>
        </div>
      `
    };
  }
  var popupTranslations2;
  var init_popups = __esm({
    "src/modules/popups.ts"() {
      "use strict";
      init_live_reload();
      init_config();
      init_state();
      init_popups_part2();
      popupTranslations2 = {
        nl: {
          buttons: {
            startAR: "Start AR",
            instruction: "Instructie",
            back: "Terug",
            impression: "Impressie",
            moreInfo: "Meer info",
            navigate: "Navigeer"
          },
          titles: {
            instruction: "Instructie"
          },
          messages: {
            arMobileOnly: "Deze AR-ervaring is alleen beschikbaar op mobiele apparaten",
            snapchatRequired: "Om deze AR ervaring te gebruiken heb je Snapchat nodig. Wil je Snapchat downloaden?",
            defaultARInstruction: "Bekijk deze AR ervaring op je telefoon of desktop."
          },
          aria: {
            closePopup: "Sluit popup",
            website: "Website",
            instagram: "Instagram",
            facebook: "Facebook",
            navigate: "Navigeer naar locatie"
          },
          navigation: {
            confirmTitle: "Navigeer met Google Maps",
            confirmMessage: "Je wordt doorgestuurd naar Google Maps. Wil je doorgaan?",
            confirmYes: "Ja, navigeer",
            confirmNo: "Blijf hier"
          }
        },
        en: {
          buttons: {
            startAR: "Start AR",
            instruction: "Instruction",
            back: "Back",
            impression: "Impression",
            moreInfo: "More info",
            navigate: "Navigate"
          },
          titles: {
            instruction: "Instruction"
          },
          messages: {
            arMobileOnly: "This AR experience is only available on mobile devices",
            snapchatRequired: "You need Snapchat to use this AR experience. Would you like to download Snapchat?",
            defaultARInstruction: "View this AR experience on your phone or desktop."
          },
          aria: {
            closePopup: "Close popup",
            website: "Website",
            instagram: "Instagram",
            facebook: "Facebook",
            navigate: "Navigate to location"
          },
          navigation: {
            confirmTitle: "Navigate with Google Maps",
            confirmMessage: "You will be redirected to Google Maps. Do you want to continue?",
            confirmYes: "Yes, navigate",
            confirmNo: "Stay here"
          }
        },
        de: {
          buttons: {
            startAR: "AR starten",
            instruction: "Anleitung",
            back: "Zur\xFCck",
            impression: "Eindruck",
            moreInfo: "Mehr Info",
            navigate: "Navigieren"
          },
          titles: {
            instruction: "Anleitung"
          },
          messages: {
            arMobileOnly: "Diese AR-Erfahrung ist nur auf mobilen Ger\xE4ten verf\xFCgbar",
            snapchatRequired: "Sie ben\xF6tigen Snapchat f\xFCr diese AR-Erfahrung. M\xF6chten Sie Snapchat herunterladen?",
            defaultARInstruction: "Sehen Sie sich diese AR-Erfahrung auf Ihrem Telefon oder Desktop an."
          },
          aria: {
            closePopup: "Popup schlie\xDFen",
            website: "Webseite",
            instagram: "Instagram",
            facebook: "Facebook",
            navigate: "Zum Standort navigieren"
          },
          navigation: {
            confirmTitle: "Mit Google Maps navigieren",
            confirmMessage: "Sie werden zu Google Maps weitergeleitet. M\xF6chten Sie fortfahren?",
            confirmYes: "Ja, navigieren",
            confirmNo: "Hier bleiben"
          }
        }
      };
    }
  });

  // src/app.ts
  init_live_reload();

  // src/modules/boundaryUtils.ts
  init_live_reload();
  init_config();

  // src/app.ts
  init_config();

  // src/modules/dataLoader.ts
  init_live_reload();
  init_state();
  function getRobustValue(parentElement, selector, property = "value", defaultValue = null, isRequired = false, itemIndex = -1, itemType = "item") {
    if (!parentElement) {
      return defaultValue;
    }
    const targetElement = parentElement.querySelector(selector);
    if (targetElement) {
      if (property in targetElement) {
        return targetElement[property];
      }
      return defaultValue;
    }
    if (isRequired) {
    }
    return defaultValue;
  }
  function getGeoData() {
    const locationList = document.getElementById("location-list");
    let loadedCount = 0;
    let skippedCount = 0;
    if (!locationList) {
      return;
    }
    Array.from(locationList.childNodes).filter((node) => node.nodeType === Node.ELEMENT_NODE).forEach((element, index) => {
      const rawLat = getRobustValue(
        element,
        "#locationLatitude",
        "value",
        null,
        true,
        index,
        "location"
      );
      const rawLong = getRobustValue(
        element,
        "#locationLongitude",
        "value",
        null,
        true,
        index,
        "location"
      );
      const locationID = getRobustValue(
        element,
        "#locationID",
        "value",
        `missing-id-${index}`,
        true,
        index,
        "location"
      );
      const locationLat = parseFloat(rawLat);
      const locationLong = parseFloat(rawLong);
      if (isNaN(locationLat) || isNaN(locationLong)) {
        skippedCount++;
        return;
      }
      const locationData = {
        // Essential (already validated)
        locationLat,
        locationLong,
        locationID,
        // Use the validated/defaulted ID
        // Other data with defaults
        name: getRobustValue(element, "#name", "value", "Naamloos", false, index, "location"),
        locationInfo: getRobustValue(
          element,
          ".locations-map_card",
          "innerHTML",
          "<p>Geen informatie beschikbaar</p>",
          false,
          index,
          "location"
        ),
        ondernemerkleur: getRobustValue(
          element,
          "#ondernemerkleur",
          "value",
          "#A0A0A0",
          false,
          index,
          "location"
        ),
        // Grey default color
        descriptionv2: getRobustValue(
          element,
          "#descriptionv2",
          "value",
          "",
          false,
          index,
          "location"
        ),
        icon: getRobustValue(element, "#icon", "value", null, false, index, "location"),
        // Let Mapbox handle missing icon later if needed
        image: getRobustValue(element, "#image", "value", null, false, index, "location"),
        category: getRobustValue(element, "#category", "value", "Overig", false, index, "location"),
        // Default category
        telefoonummer: getRobustValue(
          element,
          "#telefoonnummer",
          "value",
          "",
          false,
          index,
          "location"
        ),
        locatie: getRobustValue(element, "#locatie", "value", "", false, index, "location"),
        maps: getRobustValue(element, "#maps", "value", null, false, index, "location"),
        website: getRobustValue(element, "#website", "value", null, false, index, "location"),
        instagram: getRobustValue(element, "#instagram", "value", null, false, index, "location"),
        facebook: getRobustValue(element, "#facebook", "value", null, false, index, "location"),
        maandag: getRobustValue(element, "#maandag", "value", "", false, index, "location"),
        dinsdag: getRobustValue(element, "#dinsdag", "value", "", false, index, "location"),
        woensdag: getRobustValue(element, "#woensdag", "value", "", false, index, "location"),
        donderdag: getRobustValue(element, "#donderdag", "value", "", false, index, "location"),
        vrijdag: getRobustValue(element, "#vrijdag", "value", "", false, index, "location"),
        zaterdag: getRobustValue(element, "#zaterdag", "value", "", false, index, "location"),
        zondag: getRobustValue(element, "#zondag", "value", "", false, index, "location")
      };
      const feature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [locationData.locationLong, locationData.locationLat]
          // Use validated coords
        },
        properties: {
          id: locationData.locationID,
          description: locationData.locationInfo,
          arrayID: index,
          // Keep original index for potential reference
          color: locationData.ondernemerkleur,
          name: locationData.name,
          icon: locationData.icon,
          image: locationData.image,
          category: locationData.category,
          telefoonummer: locationData.telefoonummer,
          locatie: locationData.locatie,
          maps: locationData.maps,
          website: locationData.website,
          descriptionv2: locationData.descriptionv2,
          instagram: locationData.instagram,
          facebook: locationData.facebook,
          maandag: locationData.maandag,
          dinsdag: locationData.dinsdag,
          woensdag: locationData.woensdag,
          donderdag: locationData.donderdag,
          vrijdag: locationData.vrijdag,
          zaterdag: locationData.zaterdag,
          zondag: locationData.zondag
        }
      };
      if (!state2.mapLocations.features.some((feat) => feat.properties.id === locationData.locationID)) {
        state2.mapLocations.features.push(feature);
        loadedCount++;
      } else {
        skippedCount++;
      }
    });
  }
  function getARData() {
    const arLocationList = document.getElementById("location-ar-list");
    let loadedCount = 0;
    let skippedCount = 0;
    const startIndex = state2.mapLocations.features.length;
    if (!arLocationList) {
      return;
    }
    Array.from(arLocationList.childNodes).filter((node) => node.nodeType === Node.ELEMENT_NODE).forEach((element, index) => {
      const itemIndexForLog = index;
      const rawLat = getRobustValue(
        element,
        "#latitude_ar",
        "value",
        null,
        true,
        itemIndexForLog,
        "AR"
      );
      const rawLong = getRobustValue(
        element,
        "#longitude_ar",
        "value",
        null,
        true,
        itemIndexForLog,
        "AR"
      );
      const name_ar = getRobustValue(
        element,
        "#name_ar",
        "value",
        `AR Item ${itemIndexForLog}`,
        true,
        itemIndexForLog,
        "AR"
      );
      const latitude_ar = parseFloat(rawLat);
      const longitude_ar = parseFloat(rawLong);
      if (isNaN(latitude_ar) || isNaN(longitude_ar)) {
        skippedCount++;
        return;
      }
      const arData = {
        // Essential (already validated)
        latitude_ar,
        longitude_ar,
        name_ar,
        // Other data with defaults
        slug_ar: getRobustValue(element, "#slug_ar", "value", "", false, itemIndexForLog, "AR"),
        image_ar: getRobustValue(element, "#image_ar", "value", null, false, itemIndexForLog, "AR"),
        description_ar: getRobustValue(
          element,
          "#description_ar",
          "value",
          "Geen beschrijving.",
          false,
          itemIndexForLog,
          "AR"
        ),
        arkleur: getRobustValue(element, "#arkleur", "value", "#A0A0A0", false, index, "location"),
        // Grey default color
        icon_ar: getRobustValue(element, "#icon_ar", "value", null, false, itemIndexForLog, "AR"),
        // Default icon?
        // Nieuwe velden
        instructie: getRobustValue(
          element,
          "#instructie",
          "value",
          "Geen instructie beschikbaar.",
          false,
          itemIndexForLog,
          "AR"
        ),
        link_ar_mobile: getRobustValue(
          element,
          "#link_ar_mobile",
          "value",
          null,
          false,
          itemIndexForLog,
          "AR"
        ),
        link_ar_desktop: getRobustValue(
          element,
          "#link_ar_desktop",
          "value",
          null,
          false,
          itemIndexForLog,
          "AR"
        ),
        category: getRobustValue(element, "#category", "value", null, false, itemIndexForLog, "AR")
      };
      if (!arData.link_ar_mobile && !arData.link_ar_desktop) {
        skippedCount++;
        return;
      }
      const feature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [arData.longitude_ar, arData.latitude_ar]
          // Use validated coords
        },
        properties: {
          type: "ar",
          // Mark as AR type
          name: arData.name_ar,
          slug: arData.slug_ar,
          description: arData.description_ar,
          arrayID: startIndex + index,
          // Ensure unique arrayID across both lists
          image: arData.image_ar,
          arkleur: arData.arkleur,
          icon: arData.icon_ar,
          // Nieuwe velden
          instructie: arData.instructie,
          link_ar_mobile: arData.link_ar_mobile,
          link_ar_desktop: arData.link_ar_desktop,
          category: arData.category
        }
      };
      state2.mapLocations.features.push(feature);
      loadedCount++;
    });
  }
  async function loadLocationData() {
    state2.mapLocations.features = [];
    getGeoData();
    getARData();
    return state2.mapLocations;
  }
  document.addEventListener("DOMContentLoaded", () => {
    loadLocationData();
  });

  // src/modules/filters.ts
  init_live_reload();

  // src/modules/localStorage.ts
  init_live_reload();
  init_config();
  init_state();
  function saveMapFiltersToLocalStorage() {
    try {
      const filtersArray = Array.from(state2.activeFilters);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtersArray));
    } catch (e) {
    }
  }
  function updateMapState(activeCategories = []) {
    const newFilters = new Set(activeCategories);
    stateManager.setActiveFilters(newFilters);
    document.querySelectorAll(".filter-btn").forEach((button) => {
      const { category } = button.dataset;
      if (category) {
        button.classList.toggle("is--active", newFilters.has(category));
      }
    });
    if (typeof window.applyMapFilters === "function") {
      window.applyMapFilters();
    }
  }
  function loadFiltersAndUpdateMap() {
    try {
      const storedFilters = localStorage.getItem(LOCAL_STORAGE_KEY);
      const activeCategories = storedFilters ? JSON.parse(storedFilters) : [];
      updateMapState(activeCategories);
    } catch (e) {
      updateMapState([]);
    }
  }

  // src/modules/filters.ts
  init_state();
  var buttonCache = /* @__PURE__ */ new Map();
  var buttonElements = [];
  function applyMapFilters() {
    const map = state2.map;
    if (!map) {
      return;
    }
    const currentFilters = state2.activeFilters;
    let filterExpression;
    if (!currentFilters || currentFilters.size === 0) {
      filterExpression = null;
    } else {
      filterExpression = [
        "any",
        // OR condition
        ["in", ["get", "category"], ["literal", Array.from(currentFilters)]],
        // Markers with active categories
        ["!", ["has", "category"]],
        // Markers without category property
        ["==", ["get", "category"], ""]
        // Markers with empty category
      ];
    }
    const layersToFilter = ["location-markers", "location-icons", "location-labels"];
    layersToFilter.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        try {
          map.setFilter(layerId, filterExpression);
        } catch (e) {
        }
      }
    });
    saveMapFiltersToLocalStorage();
  }
  function toggleFilter(category) {
    if (!category) return;
    const currentFilters = new Set(state2.activeFilters);
    if (currentFilters.has(category)) {
      currentFilters.delete(category);
    } else {
      currentFilters.add(category);
    }
    stateManager.setActiveFilters(currentFilters);
    applyMapFilters();
  }
  function setupLocationFilters() {
    if (buttonElements.length > 0) {
      return;
    }
    buttonElements = Array.from(document.querySelectorAll(".filter-btn"));
    buttonElements.forEach((buttonElement) => {
      const category = buttonElement.dataset.category;
      if (category) {
        buttonCache.set(category, buttonElement);
      }
      buttonElement.addEventListener("click", () => {
        const category2 = buttonElement.dataset.category;
        if (!category2) return;
        const currentFilters = new Set(state2.activeFilters);
        if (currentFilters.has(category2)) {
          currentFilters.delete(category2);
          buttonElement.classList.remove("is--active");
        } else {
          currentFilters.add(category2);
          buttonElement.classList.add("is--active");
        }
        stateManager.setActiveFilters(currentFilters);
        applyMapFilters();
      });
    });
  }
  window.applyMapFilters = applyMapFilters;

  // src/modules/geolocation.ts
  init_live_reload();
  init_config();
  init_state();
  function detectLanguage() {
    const path = window.location.pathname;
    if (path.includes("/en/")) return "en";
    if (path.includes("/de/")) return "de";
    return "nl";
  }
  var boundaryTranslations = {
    nl: {
      title: "Kom naar Heerlen",
      message: "Deze functie is alleen beschikbaar binnen de blauwe cirkel op de kaart. Kom naar het centrum van Heerlen om de interactieve kaart te gebruiken!",
      locationDenied: "Locatie toegang geweigerd. Schakel het in bij je instellingen.",
      locationUnavailable: "Locatie niet beschikbaar. Controleer je apparaat instellingen.",
      locationTimeout: "Verzoek verlopen. Probeer opnieuw.",
      locationError: "Er is een fout opgetreden bij het ophalen van je locatie."
    },
    en: {
      title: "Come to Heerlen",
      message: "This feature is only available within the blue circle on the map. Come to the center of Heerlen to use the interactive map!",
      locationDenied: "Location access denied. Please enable it in your settings.",
      locationUnavailable: "Location not available. Check your device settings.",
      locationTimeout: "Request timed out. Please try again.",
      locationError: "An error occurred while getting your location."
    },
    de: {
      title: "Kommen Sie nach Heerlen",
      message: "Diese Funktion ist nur innerhalb des blauen Kreises auf der Karte verf\xFCgbar. Kommen Sie ins Zentrum von Heerlen, um die interaktive Karte zu nutzen!",
      locationDenied: "Standortzugriff verweigert. Bitte aktivieren Sie ihn in Ihren Einstellungen.",
      locationUnavailable: "Standort nicht verf\xFCgbar. \xDCberpr\xFCfen Sie Ihre Ger\xE4teeinstellungen.",
      locationTimeout: "Anfrage abgelaufen. Bitte versuchen Sie es erneut.",
      locationError: "Beim Abrufen Ihres Standorts ist ein Fehler aufgetreten."
    }
  };
  var GeolocationManager = class {
    map;
    searchRadiusId;
    searchRadiusOuterId;
    radiusInMeters;
    boundaryLayerIds;
    distanceMarkers;
    isPopupOpen;
    centerPoint;
    boundaryRadius;
    geolocateControl;
    isFirstLocation;
    isTracking;
    userInitiatedGeolocation;
    wasTracking;
    eventListeners = [];
    timeouts = /* @__PURE__ */ new Set();
    boundaryPopup;
    constructor(map) {
      this.map = map;
      this.searchRadiusId = "search-radius";
      this.searchRadiusOuterId = "search-radius-outer";
      this.radiusInMeters = 25;
      this.boundaryLayerIds = ["boundary-fill", "boundary-line", "boundary-label"];
      this.distanceMarkers = [];
      this.isPopupOpen = false;
      this.centerPoint = CONFIG.MAP.boundary.center;
      this.boundaryRadius = CONFIG.MAP.boundary.radius;
      this.isFirstLocation = true;
      this.isTracking = false;
      this.userInitiatedGeolocation = false;
      this.initialize();
    }
    /**
     * Initialize geolocation features
     */
    initialize() {
      this.setupGeolocateControl();
      this.setupSearchRadius();
      this.setupBoundaryCheck();
    }
    /**
     * Pause geolocation tracking while keeping user location visible
     */
    pauseTracking() {
      if (this.geolocateControl && this.geolocateControl._watchState === "ACTIVE_LOCK") {
        this.wasTracking = true;
        this.geolocateControl._watchState = "ACTIVE_ERROR";
      }
    }
    /**
     * Resume geolocation tracking if it was paused
     */
    resumeTracking() {
      if (this.geolocateControl && this.wasTracking) {
        this.geolocateControl._watchState = "ACTIVE_LOCK";
        this.wasTracking = false;
      }
    }
    /**
     * Create and update distance markers based on user location
     */
    updateDistanceMarkers(userPosition) {
      this.clearDistanceMarkers();
      state2.mapLocations.features.forEach((feature) => {
        const featureCoords = feature.geometry.coordinates;
        const distance = 1e3 * this.calculateDistance(
          userPosition[1],
          userPosition[0],
          featureCoords[1],
          featureCoords[0]
        );
        if (distance <= this.radiusInMeters) {
          const markerEl = document.createElement("div");
          markerEl.className = "distance-marker";
          markerEl.innerHTML = `<span class="distance-marker-distance">${Math.round(distance)}m</span>`;
          const marker = new window.mapboxgl.Marker({ element: markerEl }).setLngLat(featureCoords).addTo(this.map);
          markerEl.addEventListener("click", () => {
            this.map.fire("click", {
              lngLat: featureCoords,
              point: this.map.project(featureCoords),
              features: [feature]
            });
          });
          this.distanceMarkers.push(marker);
        }
      });
    }
    // Handle user location updates
    handleUserLocation(position) {
      const userPosition = [position.coords.longitude, position.coords.latitude];
      if (this.isWithinBoundary(userPosition)) {
        this.updateSearchRadius(userPosition);
        this.updateDistanceMarkers(userPosition);
        if (!this.isPopupOpen) {
          if (this.isFirstLocation) {
            this.map.flyTo({
              center: userPosition,
              zoom: 17.5,
              pitch: 45,
              duration: 2e3,
              bearing: position.coords.heading || 0
            });
            this.isFirstLocation = false;
          } else {
            const mapCenter = this.map.getCenter();
            const distanceChange = this.calculateDistance(
              mapCenter.lat,
              mapCenter.lng,
              userPosition[1],
              userPosition[0]
            );
            if (distanceChange > 0.05) {
              this.map.easeTo({
                center: userPosition,
                duration: 1e3
              });
            }
          }
        } else {
        }
      }
    }
    /**
     * Setup geolocate control with event handlers
     */
    setupGeolocateControl() {
      document.querySelectorAll(".mapboxgl-ctrl-top-right .mapboxgl-ctrl-group").forEach((el) => el.remove());
      document.querySelectorAll(".mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-group").forEach((el) => el.remove());
      this.geolocateControl = new window.mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
          maximumAge: 1e3,
          timeout: 6e3
        },
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: false,
        fitBoundsOptions: {
          maxZoom: 17.5,
          animate: true
        }
      });
      this.isFirstLocation = true;
      this.isTracking = false;
      this.userInitiatedGeolocation = false;
      const originalOnSuccess = this.geolocateControl._onSuccess;
      this.geolocateControl._onSuccess = (position) => {
        const userPosition = [position.coords.longitude, position.coords.latitude];
        const isWithin = this.isWithinBoundary(userPosition);
        if (this.userInitiatedGeolocation && !isWithin) {
          this.geolocateControl._watchState = "OFF";
          if (this.geolocateControl._geolocateButton) {
            this.geolocateControl._geolocateButton.classList.remove(
              "mapboxgl-ctrl-geolocate-active"
            );
            this.geolocateControl._geolocateButton.classList.remove(
              "mapboxgl-ctrl-geolocate-waiting"
            );
          }
          this.showBoundaryLayers();
          this.showBoundaryPopup();
          if (this.geolocateControl._userLocationDotMarker) {
            this.geolocateControl._userLocationDotMarker.remove();
          }
          this.userInitiatedGeolocation = false;
          return;
        }
        originalOnSuccess.call(this.geolocateControl, position);
        this.userInitiatedGeolocation = false;
      };
      this.geolocateControl.on("error", (error) => {
        if (this.userInitiatedGeolocation) {
          this.handleGeolocationError(error);
        } else {
        }
        this.userInitiatedGeolocation = false;
      });
      this.map.once("idle", () => {
        const geolocateButton = document.querySelector(".mapboxgl-ctrl-geolocate");
        if (geolocateButton && geolocateButton.parentElement) {
          geolocateButton.addEventListener(
            "click",
            (event) => {
              this.userInitiatedGeolocation = true;
              this.showBoundaryLayers();
            },
            true
          );
        } else {
        }
      });
      this.geolocateControl.on("trackuserlocationstart", () => {
        this.isTracking = true;
        this.showBoundaryLayers();
      });
      this.geolocateControl.on("trackuserlocationend", () => {
        this.isTracking = false;
        this.isFirstLocation = true;
        this.map.easeTo({ bearing: 0, pitch: 45 });
        this.clearSearchRadius();
        if (this.distanceMarkers) {
          this.distanceMarkers.forEach((marker) => marker.remove());
          this.distanceMarkers = [];
        }
      });
      this.map.addControl(new window.mapboxgl.NavigationControl(), "top-right");
      this.map.addControl(this.geolocateControl, "top-right");
    }
    /**
     * Setup search radius visualization
     */
    setupSearchRadius() {
      this.map.on("load", () => {
        if (this.map.getSource(this.searchRadiusId)) {
          return;
        }
        this.map.addSource(this.searchRadiusId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [[]] }
          }
        });
        this.map.addLayer({
          id: this.searchRadiusId,
          type: "fill-extrusion",
          source: this.searchRadiusId,
          paint: {
            "fill-extrusion-color": "#4B83F2",
            "fill-extrusion-opacity": 0.08,
            "fill-extrusion-height": 1,
            "fill-extrusion-base": 0
          }
        });
        this.map.addSource(this.searchRadiusOuterId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [[]] }
          }
        });
        this.map.addLayer({
          id: this.searchRadiusOuterId,
          type: "fill-extrusion",
          source: this.searchRadiusOuterId,
          paint: {
            "fill-extrusion-color": "#4B83F2",
            "fill-extrusion-opacity": 0.04,
            "fill-extrusion-height": 2,
            "fill-extrusion-base": 0
          }
        });
      });
    }
    /**
     * Setup boundary circle visualization
     */
    setupBoundaryCheck() {
      this.map.on("load", () => {
        if (this.map.getSource("boundary-circle")) {
          return;
        }
        this.map.addSource("boundary-circle", {
          type: "geojson",
          data: this.createBoundaryCircle()
        });
        this.map.addLayer({
          id: "boundary-fill",
          type: "fill",
          source: "boundary-circle",
          paint: {
            "fill-color": "#4B83F2",
            "fill-opacity": 0.03
          },
          layout: {
            visibility: "none"
          }
        });
        this.map.addLayer({
          id: "boundary-line",
          type: "line",
          source: "boundary-circle",
          paint: {
            "line-color": "#4B83F2",
            "line-width": 2,
            "line-dasharray": [3, 3]
          },
          layout: {
            visibility: "none"
          }
        });
      });
    }
    /**
     * Show boundary visualization with animation
     */
    showBoundaryLayers() {
      this.boundaryLayerIds.forEach((layerId) => {
        if (this.map.getLayer(layerId)) {
          this.map.setLayoutProperty(layerId, "visibility", "visible");
          if (layerId === "boundary-fill") {
            let opacity = 0;
            const animateOpacity = () => {
              if (opacity < 0.03) {
                opacity += 5e-3;
                this.map.setPaintProperty(layerId, "fill-opacity", opacity);
                requestAnimationFrame(animateOpacity);
              }
            };
            animateOpacity();
          }
        } else {
        }
      });
    }
    /**
     * Hide boundary visualization with animation
     */
    hideBoundaryLayers() {
      this.boundaryLayerIds.forEach((layerId) => {
        if (this.map.getLayer(layerId)) {
          if (layerId === "boundary-fill") {
            let opacity = this.map.getPaintProperty(layerId, "fill-opacity") || 0.03;
            const animateOpacity = () => {
              if (opacity > 0) {
                opacity -= 5e-3;
                const currentOpacity = Math.max(0, opacity);
                this.map.setPaintProperty(layerId, "fill-opacity", currentOpacity);
                if (currentOpacity > 0) {
                  requestAnimationFrame(animateOpacity);
                } else {
                  this.map.setLayoutProperty(layerId, "visibility", "none");
                }
              } else {
                this.map.setLayoutProperty(layerId, "visibility", "none");
              }
            };
            animateOpacity();
          } else {
            this.map.setLayoutProperty(layerId, "visibility", "none");
          }
        } else {
        }
      });
    }
    /**
     * Update search radius visualization around user
     */
    updateSearchRadius(center) {
      if (!this.map.getSource(this.searchRadiusId)) {
        return;
      }
      const generateCircle = (center2, radiusInM, pointCount = 64) => {
        const point = {
          latitude: center2[1],
          longitude: center2[0]
        };
        const radiusKm = radiusInM / 1e3;
        const points = [];
        const degreesLongPerKm = radiusKm / (111.32 * Math.cos(point.latitude * Math.PI / 180));
        const degreesLatPerKm = radiusKm / 110.574;
        for (let i = 0; i < pointCount; i++) {
          const angle = i / pointCount * (2 * Math.PI);
          const dx = degreesLongPerKm * Math.cos(angle);
          const dy = degreesLatPerKm * Math.sin(angle);
          points.push([point.longitude + dx, point.latitude + dy]);
        }
        points.push(points[0]);
        return points;
      };
      const circleCoords = generateCircle(center, this.radiusInMeters);
      [this.searchRadiusId, this.searchRadiusOuterId].forEach((sourceId) => {
        const source = this.map.getSource(sourceId);
        if (source && "setData" in source) {
          source.setData({
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [circleCoords]
            }
          });
        } else {
        }
      });
    }
    /**
     * Clear search radius visualization
     */
    clearSearchRadius() {
      if (this.map.getSource(this.searchRadiusId)) {
        [this.searchRadiusId, this.searchRadiusOuterId].forEach((sourceId) => {
          const source = this.map.getSource(sourceId);
          if (source && "setData" in source) {
            source.setData({
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [[]]
              }
            });
          } else {
          }
        });
      } else {
      }
    }
    /**
     * Handle geolocation errors
     */
    handleGeolocationError(error) {
      const lang = detectLanguage();
      const t = boundaryTranslations[lang];
      const errorMessages = {
        1: t.locationDenied,
        2: t.locationUnavailable,
        3: t.locationTimeout
      };
      const defaultMessage = t.locationError;
      this.showNotification(errorMessages[error.code] || defaultMessage);
    }
    /**
     * Show notification to user
     */
    showNotification(message) {
      const notification = document.createElement("div");
      notification.className = "geolocation-error-notification";
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5e3);
    }
    /**
     * Create boundary circle GeoJSON
     */
    createBoundaryCircle() {
      const center = {
        latitude: this.centerPoint[1],
        longitude: this.centerPoint[0]
      };
      const radiusKm = this.boundaryRadius;
      const points = [];
      const degreesLongPerKm = radiusKm / (111.32 * Math.cos(center.latitude * Math.PI / 180));
      const degreesLatPerKm = radiusKm / 110.574;
      for (let i = 0; i <= 64; i++) {
        const angle = i / 64 * (2 * Math.PI);
        const dx = degreesLongPerKm * Math.cos(angle);
        const dy = degreesLatPerKm * Math.sin(angle);
        points.push([center.longitude + dx, center.latitude + dy]);
      }
      return {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [points]
        }
      };
    }
    /**
     * Check if position is within boundary
     */
    isWithinBoundary(position) {
      const distance = this.calculateDistance(
        position[1],
        position[0],
        this.centerPoint[1],
        this.centerPoint[0]
      );
      const isWithin = distance <= this.boundaryRadius;
      return isWithin;
    }
    /**
     * Calculate distance between coordinates in km
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
      const toRad = (deg) => deg * (Math.PI / 180);
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return 6371 * c;
    }
    /**
     * Show boundary popup when user is outside boundary
     */
    showBoundaryPopup() {
      const lang = detectLanguage();
      const t = boundaryTranslations[lang];
      const existingPopup = document.querySelector(".location-boundary-popup");
      if (existingPopup) {
        existingPopup.remove();
      }
      const popup = document.createElement("div");
      popup.className = "location-boundary-popup";
      this.boundaryPopup = popup;
      const heading = document.createElement("h3");
      heading.textContent = t.title;
      const text = document.createElement("p");
      text.textContent = t.message;
      const self = this;
      this.addTrackedTimeout(() => {
        if (window.innerWidth <= 768) {
          popup.style.transform = "translateY(100%)";
        } else {
          popup.style.transform = "translateX(120%)";
        }
        this.addTrackedTimeout(() => {
          if (popup.parentNode) {
            popup.remove();
          }
          if (this.boundaryPopup === popup) {
            this.boundaryPopup = void 0;
          }
        }, 600);
        this.addTrackedTimeout(() => {
          self.hideBoundaryLayers();
        }, 200);
      }, 3e3);
      popup.appendChild(heading);
      popup.appendChild(text);
      document.body.appendChild(popup);
      if (this.map.getLayer("boundary-fill")) {
        this.map.setPaintProperty("boundary-fill", "fill-opacity", 0.05);
        this.map.setPaintProperty("boundary-line", "line-width", 3);
        this.addTrackedTimeout(() => {
          if (this.map.getLayer("boundary-fill")) {
            this.map.setPaintProperty("boundary-fill", "fill-opacity", 0.03);
          }
          if (this.map.getLayer("boundary-line")) {
            this.map.setPaintProperty("boundary-line", "line-width", 2);
          }
        }, 2e3);
      } else {
      }
      requestAnimationFrame(() => {
        popup.offsetHeight;
        popup.classList.add("show");
      });
    }
    /**
     * Cleanup method to prevent memory leaks
     */
    cleanup() {
      this.clearDistanceMarkers();
      if (this.geolocateControl) {
        this.map.removeControl(this.geolocateControl);
        this.geolocateControl = void 0;
      }
      this.timeouts.forEach((id) => clearTimeout(id));
      this.timeouts.clear();
      this.eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.eventListeners.length = 0;
      if (this.boundaryPopup && this.boundaryPopup.parentNode) {
        this.boundaryPopup.parentNode.removeChild(this.boundaryPopup);
        this.boundaryPopup = void 0;
      }
      const sources = [this.searchRadiusId, this.searchRadiusOuterId];
      sources.forEach((sourceId) => {
        if (this.map.getSource(sourceId)) {
          this.map.removeSource(sourceId);
        }
      });
      this.boundaryLayerIds.forEach((layerId) => {
        if (this.map.getLayer(layerId)) {
          this.map.removeLayer(layerId);
        }
      });
    }
    /**
     * Clear distance markers atomically
     */
    clearDistanceMarkers() {
      if (this.distanceMarkers.length > 0) {
        this.distanceMarkers.forEach((marker) => marker.remove());
        this.distanceMarkers.length = 0;
      }
    }
    /**
     * Helper to track event listeners for cleanup
     */
    addTrackedEventListener(element, event, handler) {
      element.addEventListener(event, handler);
      this.eventListeners.push({ element, event, handler });
    }
    /**
     * Helper to track timeouts for cleanup
     */
    addTrackedTimeout(callback, delay) {
      const id = window.setTimeout(() => {
        this.timeouts.delete(id);
        callback();
      }, delay);
      this.timeouts.add(id);
      return id;
    }
  };

  // src/modules/mapInit.ts
  init_live_reload();
  init_config();
  init_state();
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
  function initializeMap() {
    const map = new mapboxgl.Map(MAP_OPTIONS);
    setMap(map);
    const originalFlyTo = map.flyTo.bind(map);
    map._originalFlyTo = originalFlyTo;
    map.flyTo = function(options) {
      return originalFlyTo(options);
    };
    return map;
  }

  // src/modules/mapInteractions.ts
  init_live_reload();
  init_config();

  // src/modules/markers.ts
  init_live_reload();
  init_config();

  // src/modules/resourceManager.ts
  init_live_reload();
  var ResourceManager = class _ResourceManager {
    static instance;
    imageCache = /* @__PURE__ */ new WeakMap();
    modelCache = /* @__PURE__ */ new Map();
    textureCache = /* @__PURE__ */ new Map();
    loadingPromises = /* @__PURE__ */ new Map();
    failedResources = /* @__PURE__ */ new Set();
    // Performance tracking
    loadTimes = /* @__PURE__ */ new Map();
    loadCounts = /* @__PURE__ */ new Map();
    constructor() {
    }
    static getInstance() {
      if (!_ResourceManager.instance) {
        _ResourceManager.instance = new _ResourceManager();
      }
      return _ResourceManager.instance;
    }
    /**
     * Load and optimize an image with caching
     */
    async loadOptimizedImage(url, options = {}) {
      const { maxSize = 512, timeout = 1e4 } = options;
      if (this.failedResources.has(url)) {
        throw new Error(`Resource previously failed to load: ${url}`);
      }
      if (this.loadingPromises.has(url)) {
        return this.loadingPromises.get(url);
      }
      if (this.imageCache.has(url)) {
        return this.imageCache.get(url);
      }
      const loadPromise = this.loadImageWithOptimization(url, maxSize, timeout);
      this.loadingPromises.set(url, loadPromise);
      try {
        const result = await loadPromise;
        this.imageCache.set(url, result);
        this.trackLoadSuccess(url);
        return result;
      } catch (error) {
        this.failedResources.add(url);
        this.trackLoadError(url);
        throw error;
      } finally {
        this.loadingPromises.delete(url);
      }
    }
    /**
     * Load image with size optimization and timeout
     */
    loadImageWithOptimization(url, maxSize, timeout) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        const timeoutId = setTimeout(() => {
          img.src = "";
          reject(new Error(`Image load timeout: ${url}`));
        }, timeout);
        img.onload = () => {
          clearTimeout(timeoutId);
          if (Math.max(img.width, img.height) > maxSize) {
            resolve(this.resizeImage(img, maxSize));
          } else {
            resolve(img);
          }
        };
        img.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error(`Failed to load image: ${url}`));
        };
        img.src = url;
      });
    }
    /**
     * Resize image to fit within maxSize while maintaining aspect ratio
     */
    resizeImage(img, maxSize) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const resizedImg = new Image();
      resizedImg.src = canvas.toDataURL("image/jpeg", 0.85);
      return resizedImg;
    }
    /**
     * Load 3D model with caching - FIXED for GLTF
     */
    async loadModel(url, loader) {
      if (this.modelCache.has(url)) {
        return this.modelCache.get(url);
      }
      if (this.loadingPromises.has(url)) {
        return await this.loadingPromises.get(url);
      }
      const loadPromise = new Promise((resolve, reject) => {
        loader.load(
          url,
          (gltf) => {
            resolve(gltf);
          },
          void 0,
          // onProgress
          (error) => reject(error)
        );
      });
      this.loadingPromises.set(url, loadPromise);
      try {
        const model = await loadPromise;
        this.modelCache.set(url, model);
        this.trackLoadSuccess(url);
        return model;
      } catch (error) {
        this.failedResources.add(url);
        this.trackLoadError(url);
        throw error;
      } finally {
        this.loadingPromises.delete(url);
      }
    }
    /**
     * Optimize 3D model for better performance
     */
    optimizeModel(model) {
      model.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = true;
          if (child.material) {
            if (child.material.map) {
              child.material.map.generateMipmaps = false;
              child.material.map.minFilter = window.THREE?.LinearFilter || 1006;
            }
          }
        }
      });
    }
    /**
     * Preload critical resources
     */
    async preloadResources(urls) {
      const batchSize = 3;
      const batches = [];
      for (let i = 0; i < urls.length; i += batchSize) {
        batches.push(urls.slice(i, i + batchSize));
      }
      for (const batch of batches) {
        const promises = batch.map(
          (url) => this.loadOptimizedImage(url).catch(() => null)
          // Continue on error
        );
        await Promise.all(promises);
      }
    }
    /**
     * Clear cache and free memory
     */
    cleanup() {
      this.imageCache = /* @__PURE__ */ new WeakMap();
      this.modelCache.clear();
      this.textureCache.clear();
      this.loadingPromises.clear();
      this.loadTimes.clear();
      this.loadCounts.clear();
      this.failedResources.clear();
    }
    /**
     * Get performance statistics
     */
    getStats() {
      const totalLoadTime = Array.from(this.loadTimes.values()).reduce((a, b) => a + b, 0);
      const totalLoads = this.loadTimes.size;
      return {
        cachedImages: this.imageCache ? -1 : 0,
        // WeakMap size not accessible
        cachedModels: this.modelCache.size,
        failedResources: this.failedResources.size,
        averageLoadTime: totalLoads > 0 ? totalLoadTime / totalLoads : 0
      };
    }
    /**
     * Track successful load
     */
    trackLoadSuccess(url) {
      const now = Date.now();
      this.loadTimes.set(url, now);
      this.loadCounts.set(url, (this.loadCounts.get(url) || 0) + 1);
    }
    /**
     * Track load error
     */
    trackLoadError(url) {
    }
  };
  var resourceManager = ResourceManager.getInstance();

  // src/modules/markers.ts
  init_state();
  var iconCache = /* @__PURE__ */ new Map();
  var loadingIcons = /* @__PURE__ */ new Set();
  async function loadIcons(map) {
    const uniqueIcons = [
      ...new Set(
        state2.mapLocations.features.map((feature) => feature.properties.icon).filter((icon) => !!icon)
        // Filter out null/undefined icons and type guard
      )
    ];
    const iconsToLoad = uniqueIcons.filter(
      (iconUrl) => !map.hasImage(iconUrl) && !loadingIcons.has(iconUrl)
    );
    if (iconsToLoad.length === 0) return;
    iconsToLoad.forEach((iconUrl) => loadingIcons.add(iconUrl));
    const loadPromises = iconsToLoad.map(
      (iconUrl) => loadSingleIcon(map, iconUrl).finally(() => loadingIcons.delete(iconUrl))
    );
    await Promise.allSettled(loadPromises);
  }
  async function loadSingleIcon(map, iconUrl) {
    try {
      if (iconCache.has(iconUrl)) {
        const cachedImage = iconCache.get(iconUrl);
        if (!map.hasImage(iconUrl)) {
          map.addImage(iconUrl, cachedImage);
        }
        return;
      }
      const image = await loadImageAsync(iconUrl);
      iconCache.set(iconUrl, image);
      if (!map.hasImage(iconUrl)) {
        map.addImage(iconUrl, image);
      }
    } catch (error) {
    }
  }
  function loadImageAsync(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load icon: ${url}`));
      img.src = url;
    });
  }
  async function addMarkers(map) {
    if (state2.markersAdded) return;
    await loadIcons(map);
    map.addSource("locations", {
      type: "geojson",
      data: state2.mapLocations
    });
    const layers = [
      // Circle marker layer
      {
        id: "location-markers",
        type: "circle",
        paint: {
          "circle-color": [
            "case",
            ["==", ["get", "type"], "ar"],
            ["get", "arkleur"],
            // Use arkleur property for AR markers
            ["get", "color"]
            // Use normal color property for other markers
          ],
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            CONFIG.MARKER_ZOOM.min,
            2,
            CONFIG.MARKER_ZOOM.small,
            5,
            CONFIG.MARKER_ZOOM.medium,
            8,
            CONFIG.MARKER_ZOOM.large,
            10
          ],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0
        }
      },
      // Icon layer
      {
        id: "location-icons",
        type: "symbol",
        layout: {
          "icon-image": ["get", "icon"],
          "icon-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            CONFIG.MARKER_ZOOM.min,
            0.05,
            CONFIG.MARKER_ZOOM.small,
            0.08,
            CONFIG.MARKER_ZOOM.medium,
            0.12,
            CONFIG.MARKER_ZOOM.large,
            0.15
          ],
          "icon-allow-overlap": true,
          "icon-anchor": "center"
        },
        paint: {
          "icon-opacity": 0
        }
      },
      // Label layer
      {
        id: "location-labels",
        type: "symbol",
        layout: {
          "text-field": ["get", "name"],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            CONFIG.MARKER_ZOOM.min,
            8,
            CONFIG.MARKER_ZOOM.small,
            10,
            CONFIG.MARKER_ZOOM.medium,
            11,
            CONFIG.MARKER_ZOOM.large,
            12
          ],
          "text-offset": [0, 1],
          "text-anchor": "top",
          "text-allow-overlap": false
        },
        paint: {
          "text-color": ["get", "color"],
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
          "text-opacity": 0
        }
      }
    ];
    layers.forEach((layer) => map.addLayer({ ...layer, source: "locations" }));
    setupMarkerInteractions(map);
    animateMarkerAppearance(map);
    state2.markersAdded = true;
  }
  function animateMarkerAppearance(map) {
    let opacity = 0;
    let lastFrameTime = 0;
    const targetFPS = 30;
    const frameInterval = 1e3 / targetFPS;
    const animateMarkers = (currentTime) => {
      if (currentTime - lastFrameTime < frameInterval) {
        if (opacity < 1) {
          requestAnimationFrame(animateMarkers);
        }
        return;
      }
      lastFrameTime = currentTime;
      opacity += 0.08;
      const clampedOpacity = Math.min(opacity, 1);
      try {
        if (map.getLayer("location-markers")) {
          map.setPaintProperty("location-markers", "circle-opacity", clampedOpacity);
        }
        if (map.getLayer("location-icons")) {
          map.setPaintProperty("location-icons", "icon-opacity", clampedOpacity);
        }
        if (map.getLayer("location-labels")) {
          map.setPaintProperty("location-labels", "text-opacity", clampedOpacity);
        }
      } catch (e) {
        return;
      }
      if (opacity < 1) {
        requestAnimationFrame(animateMarkers);
      }
    };
    setTimeout(() => requestAnimationFrame(animateMarkers), 100);
  }
  function setupMarkerInteractions(map) {
    map.on("mouseenter", "location-markers", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "location-markers", () => {
      map.getCanvas().style.cursor = "";
    });
  }
  function updateMarkerVisibility(map, zoom) {
  }

  // src/modules/mapInteractions.ts
  init_popups();
  init_state();
  var { $ } = window;
  function setupMapLoadHandler(map) {
    map.on("load", () => {
      map.once("idle", () => {
        const firstSymbolLayerId = map.getStyle().layers.find((layer) => layer.type === "symbol" && layer.id.includes("label"))?.id;
        map.addLayer(
          {
            id: "heerlen-buildings",
            type: "fill-extrusion",
            source: "composite",
            "source-layer": "building",
            filter: ["!=", ["get", "type"], "underground"],
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#e8e0cc",
              "fill-extrusion-height": [
                "case",
                ["has", "height"],
                ["get", "height"],
                ["has", "min_height"],
                ["get", "min_height"],
                3
              ],
              "fill-extrusion-base": ["case", ["has", "min_height"], ["get", "min_height"], 0],
              "fill-extrusion-opacity": 1,
              "fill-extrusion-vertical-gradient": true
            }
          },
          firstSymbolLayerId
        );
      });
      loadFiltersAndUpdateMap();
      addMarkers(map).then(() => {
        setupLocationFilters();
        applyMapFilters();
      }).catch((error) => {
        setupLocationFilters();
      });
    });
  }
  function setupSidebarHandlers() {
    $(".close-block").on("click", () => {
      closeItem();
    });
  }
  function setupMapInteractionHandlers(map) {
    ["dragstart", "zoomstart", "rotatestart", "pitchstart"].forEach((eventType) => {
      map.on(eventType, () => {
        const visibleItem = $(".locations-map_item.is--show");
        if (visibleItem.length) {
          visibleItem.css({
            opacity: "0",
            transform: "translateY(40px) scale(0.6)",
            transition: "all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)"
          });
          setTimeout(() => {
            visibleItem.removeClass("is--show");
          }, 400);
        }
        if (state2.activePopup) {
          const popupContent = state2.activePopup.getElement().querySelector(".mapboxgl-popup-content");
          popupContent.style.transition = "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
          popupContent.style.transform = "rotate(-5deg) translateY(40px) scale(0.6)";
          popupContent.style.opacity = "0";
          setTimeout(() => {
            state2.activePopup.remove();
            setActivePopup(null);
          }, 400);
        }
      });
    });
    map.on("click", (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["location-markers"]
      });
      if (features.length === 0 && state2.activePopup) {
        const popupElement = state2.activePopup.getElement();
        const clickTarget = e.originalEvent.target;
        if (!popupElement.contains(clickTarget)) {
          const popupContent = popupElement.querySelector(".mapboxgl-popup-content");
          if (popupContent) {
            popupContent.style.transition = "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
            popupContent.style.transform = "rotate(-5deg) translateY(40px) scale(0.6)";
            popupContent.style.opacity = "0";
          }
          setTimeout(() => {
            if (state2.activePopup) {
              state2.activePopup.remove();
              setActivePopup(null);
            }
          }, 400);
          const visibleItem = $(".locations-map_item.is--show");
          if (visibleItem.length) {
            visibleItem.css({
              opacity: "0",
              transform: "translateY(40px) scale(0.6)",
              transition: "all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)"
            });
            setTimeout(() => {
              visibleItem.removeClass("is--show");
            }, 400);
          }
        }
      }
    });
  }

  // src/modules/poi.ts
  init_live_reload();
  var excludedNames = [
    "Brasserie Mijn Streek",
    "De Twee Gezusters",
    "SCHUNCK Bibliotheek Heerlen Glaspaleis",
    "Glaspaleis Schunck",
    "Bagels & Beans",
    "Terras Bagels & Beans",
    "Brunch Bar",
    "Berden",
    "Aroma",
    "Brasserie Goya",
    "Poppodium Nieuwe Nor",
    "Nederlands Mijnmuseum",
    "Smaak & Vermaak",
    "Caf\xE9 ",
    "De Kromme Toeter",
    "Caf\xE9 Pelt",
    "Het Romeins Museum",
    "Pat's Tosti Bar",
    "Sint-Pancratiuskerk",
    "Cafe Bluff"
    // Add more businesses here if needed
  ];
  var poiFilterApplied = false;
  var cachedFilter = null;
  function buildPOIFilter() {
    if (cachedFilter) return cachedFilter;
    let filter = ["all"];
    excludedNames.forEach((name) => {
      filter.push([
        "all",
        ["!=", ["get", "brand"], name],
        // Check on brand
        ["!=", ["get", "name"], name]
        // Check on name
      ]);
    });
    filter.push(["has", "name"]);
    cachedFilter = filter;
    return filter;
  }
  function applyPOIFilter(map) {
    const filter = buildPOIFilter();
    const poiLayers = [
      "poi-label",
      "poi-scalerank1",
      "poi-scalerank2",
      "poi-scalerank3",
      "poi-scalerank4"
    ];
    poiLayers.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setFilter(layerId, filter);
      }
    });
    poiFilterApplied = true;
  }
  function setupPOIFiltering(map) {
    if (map.loaded() && !poiFilterApplied) {
      applyPOIFilter(map);
      return;
    }
    const handleMapReady = () => {
      if (map.loaded() && !poiFilterApplied) {
        applyPOIFilter(map);
        map.off("style.load", handleMapReady);
        map.off("idle", handleMapReady);
      }
    };
    map.on("style.load", handleMapReady);
    map.on("idle", handleMapReady);
  }

  // src/app.ts
  init_popups();
  init_state();

  // src/modules/threejs.ts
  init_live_reload();
  var THREE = window.THREE;
  var mapboxgl2 = window.mapboxgl;
  var modelConfigs = [
    {
      id: "schunck",
      origin: [50.88778235149691, 5.979389928151281],
      // [lat, lng]
      altitude: 0,
      rotate: [Math.PI / 2, 0.45, 0],
      url: "https://cdn.jsdelivr.net/gh/Artwalters/3dmodels_heerlen@main/schunckv5.glb",
      scale: 1.3
    },
    {
      id: "theater",
      origin: [50.886541206107225, 5.972454838314243],
      altitude: 0,
      rotate: [Math.PI / 2, 2.05, 0],
      url: "https://cdn.jsdelivr.net/gh/Artwalters/3dmodels_heerlen@main/theaterheerlenv4.glb",
      scale: 0.6
    }
  ];
  var imagePlaneConfig = {
    id: "image1",
    origin: [50.88801513786042, 5.980644311376565],
    altitude: 6.5,
    rotate: [Math.PI / 2, 0.35, 0],
    imageUrl: "https://daks2k3a4ib2z.cloudfront.net/671769e099775386585f574d/67adf2bff5be8a200ec2fa55_osgameos_mural-p-130x130q80.png",
    width: 13,
    height: 13
  };
  function createImagePlane(config) {
    const mercatorCoord = mapboxgl2.MercatorCoordinate.fromLngLat(
      [config.origin[1], config.origin[0]],
      config.altitude
    );
    const meterScale = mercatorCoord.meterInMercatorCoordinateUnits();
    const geoWidth = config.width * meterScale;
    const geoHeight = config.height * meterScale;
    return resourceManager.loadOptimizedImage(config.imageUrl, { maxSize: 1024 }).then((image) => {
      const texture = new THREE.Texture(image);
      texture.needsUpdate = true;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const geometry = new THREE.PlaneGeometry(geoWidth, geoHeight);
      const plane = new THREE.Mesh(geometry, material);
      plane.userData.transform = {
        translateX: mercatorCoord.x,
        translateY: mercatorCoord.y,
        translateZ: mercatorCoord.z,
        rotate: config.rotate,
        scale: 1
      };
      return plane;
    });
  }
  function createThreeJSLayer() {
    return {
      id: "3d-models",
      type: "custom",
      renderingMode: "3d",
      onAdd: function(map, gl) {
        this.map = map;
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        const ambientLight = new THREE.AmbientLight(16777215, 0.57);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(16777215, 0.55);
        directionalLight.color.setHex(16579836);
        const azimuth = 210 * (Math.PI / 180);
        const polar = 50 * (Math.PI / 180);
        directionalLight.position.set(
          Math.sin(azimuth) * Math.sin(polar),
          Math.cos(azimuth) * Math.sin(polar),
          Math.cos(polar)
        ).normalize();
        this.scene.add(directionalLight);
        this.renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true
        });
        this.renderer.autoClear = false;
        const loader = new THREE.GLTFLoader();
        modelConfigs.forEach((config) => {
          const mercCoord = mapboxgl2.MercatorCoordinate.fromLngLat(
            [config.origin[1], config.origin[0]],
            config.altitude
          );
          resourceManager.loadModel(config.url, loader).then((gltf) => {
            const scene3D = gltf.scene;
            scene3D.userData.transform = {
              translateX: mercCoord.x,
              translateY: mercCoord.y,
              translateZ: mercCoord.z,
              rotate: config.rotate,
              scale: mercCoord.meterInMercatorCoordinateUnits() * config.scale
            };
            this.scene.add(scene3D);
          }).catch((err) => {
          });
        });
        createImagePlane(imagePlaneConfig).then((plane) => {
          this.scene.add(plane);
        }).catch((err) => {
        });
      },
      render: function(gl, matrix) {
        const mapMatrix = new THREE.Matrix4().fromArray(matrix);
        this.scene.traverse((child) => {
          if (child.userData.transform) {
            const t = child.userData.transform;
            const translation = new THREE.Matrix4().makeTranslation(
              t.translateX,
              t.translateY,
              t.translateZ
            );
            const scaling = new THREE.Matrix4().makeScale(t.scale, -t.scale, t.scale);
            const rotX = new THREE.Matrix4().makeRotationX(t.rotate[0]);
            const rotY = new THREE.Matrix4().makeRotationY(t.rotate[1]);
            const rotZ = new THREE.Matrix4().makeRotationZ(t.rotate[2]);
            const modelMatrix = new THREE.Matrix4().multiply(translation).multiply(scaling).multiply(rotX).multiply(rotY).multiply(rotZ);
            child.matrix = new THREE.Matrix4().copy(mapMatrix).multiply(modelMatrix);
            child.matrixAutoUpdate = false;
          }
        });
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
      }
    };
  }
  function setupThreeJSLayer(map) {
    map.on("style.load", () => {
      const customLayer = createThreeJSLayer();
      map.addLayer(customLayer);
    });
  }

  // src/modules/toggle3D.ts
  init_live_reload();
  var is3DEnabled = true;
  var cachedBuildingLayers = [];
  function toggle3DLayers(enable) {
    is3DEnabled = enable;
    localStorage.setItem("heerlen_map_3d_enabled", enable.toString());
    updateToggleButtonState();
    if (cachedBuildingLayers.length === 0) {
      cacheThreeDLayers();
    }
    if (window.map.getLayer("3d-models")) {
      window.map.setLayoutProperty("3d-models", "visibility", enable ? "visible" : "none");
    }
    cachedBuildingLayers.forEach((layerId) => {
      window.map.setLayoutProperty(layerId, "visibility", enable ? "visible" : "none");
    });
  }
  function cacheThreeDLayers() {
    const { layers } = window.map.getStyle();
    cachedBuildingLayers = layers.filter(
      (layer) => layer.type === "fill-extrusion" && (layer.id.includes("building") || layer.id.includes("3d"))
    ).map((layer) => layer.id);
  }
  function updateToggleButtonState() {
    const toggleButton = document.querySelector(".toggle-3d-button");
    if (!toggleButton) return;
    toggleButton.classList.toggle("is-active", is3DEnabled);
    toggleButton.setAttribute("aria-pressed", is3DEnabled.toString());
    toggleButton.title = is3DEnabled ? "3D uit" : "3D aan";
    toggleButton.innerHTML = is3DEnabled ? `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9M12 4.15l-6.04 3.4 6.04 3.4 6.04-3.4L12 4.15Z"/></svg>` : `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="none" stroke="currentColor" stroke-width="1.5" d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9M12 4.15l-6.04 3.4 6.04 3.4 6.04-3.4L12 4.15Z"/></svg>`;
  }
  function loadSettings() {
    const stored = localStorage.getItem("heerlen_map_3d_enabled");
    if (stored !== null) {
      is3DEnabled = stored !== "false";
    }
  }
  function add3DToggleControl(map) {
    const existingControl = document.querySelector(".mapboxgl-ctrl-group .toggle-3d-button");
    if (existingControl) {
      const parentGroup = existingControl.closest(".mapboxgl-ctrl-group");
      if (parentGroup) parentGroup.remove();
    }
    const container = document.createElement("div");
    container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    const button = document.createElement("button");
    button.className = "mapboxgl-ctrl-icon toggle-3d-button";
    button.type = "button";
    button.setAttribute("aria-label", "3D aan/uit");
    updateToggleButtonState();
    button.addEventListener("click", () => {
      toggle3DLayers(!is3DEnabled);
    });
    container.appendChild(button);
    const controlContainer = document.querySelector(".mapboxgl-ctrl-top-right");
    if (controlContainer) {
      controlContainer.appendChild(container);
    }
  }
  function initialize3DSettings(map) {
    window.map = map;
    loadSettings();
    map.once("load", () => {
      add3DToggleControl(map);
      const styleHandler = () => {
        if (map.getLayer("3d-models")) {
          cacheThreeDLayers();
          toggle3DLayers(is3DEnabled);
          map.off("styledata", styleHandler);
        }
      };
      map.on("styledata", styleHandler);
      if (map.getLayer("3d-models")) {
        cacheThreeDLayers();
        toggle3DLayers(is3DEnabled);
      }
    });
  }

  // src/modules/tour.ts
  init_live_reload();
  init_config();
  function detectLanguage4() {
    const path = window.location.pathname;
    if (path.includes("/en/")) return "en";
    if (path.includes("/de/")) return "de";
    return "nl";
  }
  var translations = {
    nl: {
      welcomeMessage: "Welkom in <strong>Heerlen</strong> deze kaart heeft veel unieke functies die ik je graag uitleg",
      startTour: "Start tour",
      skipTour: "Skip tour",
      helpButtonTitle: "Start rondleiding",
      helpButtonAriaLabel: "Start kaart rondleiding",
      tourSteps: {
        welcome: "Ontdek <strong>Heerlen</strong> met deze interactieve kaart. We leiden je even rond!.",
        mapControls: "Gebruik deze <strong>knoppen</strong> om in/uit te zoomen en de kaart te draaien.",
        filters: "gebruik <strong>filters</strong> om per categorie te zoeken en te ontdekken!",
        geolocation: "Klik hier om je <strong>locatie</strong> aan te zetten en direct te zien waar jij je bevindt op de kaart.",
        tryMarker: "klik op een van de <strong>gekleurde</strong> rondjes.",
        markerInstruction: "Klik op een marker om door te gaan",
        markerHint: 'Klik op "Skip" als je geen marker kunt vinden',
        popupInfo: "Bekijk <strong>informatie</strong> over deze plek en druk op de <strong>like-knop</strong> om deze locatie op te slaan.",
        likeHeart: "Klik op het <strong>hartje</strong> om al je opgeslagen favoriete locaties te bekijken.",
        finish: "Je bent nu klaar om <strong>Heerlen te verkennen</strong>! Klik op markers om locaties te ontdekken. Je kunt deze rondleiding opnieuw starten via het <strong>?</strong> icoon."
      },
      buttons: {
        start: "Start",
        skip: "Skip",
        back: "\u2190",
        next: "\u2192",
        ready: "Klaar"
      },
      progressBarClose: "Sluit rondleiding"
    },
    en: {
      welcomeMessage: "Welcome to <strong>Heerlen</strong>! This map has many unique features that I'd like to show you",
      startTour: "Start tour",
      skipTour: "Skip tour",
      helpButtonTitle: "Start tour",
      helpButtonAriaLabel: "Start map tour",
      tourSteps: {
        welcome: "Discover <strong>Heerlen</strong> with this interactive map. Let me show you around!",
        mapControls: "Use these <strong>buttons</strong> to zoom in/out and rotate the map.",
        filters: "Use <strong>filters</strong> to search and discover by category!",
        geolocation: "Click here to enable your <strong>location</strong> and see where you are on the map.",
        tryMarker: "Click on one of the <strong>colored</strong> circles.",
        markerInstruction: "Click on a marker to continue",
        markerHint: `Click "Skip" if you can't find a marker`,
        popupInfo: "View <strong>information</strong> about this place and click the <strong>like button</strong> to save this location.",
        likeHeart: "Click on the <strong>heart</strong> to view all your saved favorite locations.",
        finish: "You're now ready to <strong>explore Heerlen</strong>! Click on markers to discover locations. You can restart this tour anytime via the <strong>?</strong> icon."
      },
      buttons: {
        start: "Start",
        skip: "Skip",
        back: "\u2190",
        next: "\u2192",
        ready: "Done"
      },
      progressBarClose: "Close tour"
    },
    de: {
      welcomeMessage: "Willkommen in <strong>Heerlen</strong>! Diese Karte hat viele einzigartige Funktionen, die ich Ihnen gerne zeigen m\xF6chte",
      startTour: "Tour starten",
      skipTour: "Tour \xFCberspringen",
      helpButtonTitle: "Tour starten",
      helpButtonAriaLabel: "Kartentour starten",
      tourSteps: {
        welcome: "Entdecken Sie <strong>Heerlen</strong> mit dieser interaktiven Karte. Lassen Sie mich Ihnen alles zeigen!",
        mapControls: "Verwenden Sie diese <strong>Tasten</strong> zum Zoomen und Drehen der Karte.",
        filters: "Verwenden Sie <strong>Filter</strong>, um nach Kategorien zu suchen und zu entdecken!",
        geolocation: "Klicken Sie hier, um Ihren <strong>Standort</strong> zu aktivieren und zu sehen, wo Sie sich auf der Karte befinden.",
        tryMarker: "Klicken Sie auf einen der <strong>farbigen</strong> Kreise.",
        markerInstruction: "Klicken Sie auf einen Marker, um fortzufahren",
        markerHint: 'Klicken Sie auf "\xDCberspringen", wenn Sie keinen Marker finden k\xF6nnen',
        popupInfo: "Sehen Sie sich <strong>Informationen</strong> \xFCber diesen Ort an und klicken Sie auf die <strong>Like-Schaltfl\xE4che</strong>, um diesen Ort zu speichern.",
        likeHeart: "Klicken Sie auf das <strong>Herz</strong>, um alle Ihre gespeicherten Lieblingsorte anzuzeigen.",
        finish: "Sie sind jetzt bereit, <strong>Heerlen zu erkunden</strong>! Klicken Sie auf Marker, um Orte zu entdecken. Sie k\xF6nnen diese Tour jederzeit \xFCber das <strong>?</strong> Symbol neu starten."
      },
      buttons: {
        start: "Start",
        skip: "\xDCberspringen",
        back: "\u2190",
        next: "\u2192",
        ready: "Fertig"
      },
      progressBarClose: "Tour schlie\xDFen"
    }
  };
  var tourIntervals = /* @__PURE__ */ new Set();
  var tourTimeouts = /* @__PURE__ */ new Set();
  var tourEventListeners = [];
  function initializeTour(map) {
    if (typeof window.mapboxgl !== "undefined") {
      loadTourStylesheet();
      const checkMapReady = setInterval(function() {
        const mapContainer = document.getElementById("map");
        if (mapContainer && mapContainer.querySelector(".mapboxgl-canvas") && map && map.loaded()) {
          clearInterval(checkMapReady);
          tourIntervals.delete(checkMapReady);
          const setupTimeout = setTimeout(function() {
            tourTimeouts.delete(setupTimeout);
            setupTourSystem(map);
          }, 2e3);
          tourTimeouts.add(setupTimeout);
        }
      }, 500);
      tourIntervals.add(checkMapReady);
    }
  }
  function loadTourStylesheet() {
    if (!document.getElementById("tour-styles")) {
      const linkElem = document.createElement("link");
      linkElem.id = "tour-styles";
      linkElem.rel = "stylesheet";
      linkElem.type = "text/css";
      linkElem.href = "tour-styles.css";
      document.head.appendChild(linkElem);
    }
  }
  function setupTourSystem(map) {
    const walkthroughShown = localStorage.getItem("heerlenMapWalkthroughShown");
    addHelpButton(map);
    if (!walkthroughShown || window.location.hash === "#tutorial") {
      showWelcomeMessage(function() {
        startTour(map);
        localStorage.setItem("heerlenMapWalkthroughShown", "true");
      });
    }
  }
  function showWelcomeMessage(callback) {
    const lang = detectLanguage4();
    const t = translations[lang];
    const overlay = document.createElement("div");
    overlay.className = "welcome-overlay";
    overlay.innerHTML = `
    <div class="welcome-card">
      <p>${t.welcomeMessage}</p>
      <div class="welcome-buttons">
        <button class="welcome-start-btn">${t.startTour}</button>
        <button class="welcome-skip-btn">${t.skipTour}</button>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.style.opacity = "1";
      const card = overlay.querySelector(".welcome-card");
      card.style.transform = "translateY(0)";
      card.style.opacity = "1";
    }, 100);
    overlay.querySelector(".welcome-start-btn").addEventListener("click", function() {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
        callback();
      }, 500);
    });
    overlay.querySelector(".welcome-skip-btn").addEventListener("click", function() {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
        localStorage.setItem("heerlenMapWalkthroughShown", "true");
      }, 500);
    });
  }
  function addHelpButton(map) {
    const lang = detectLanguage4();
    const t = translations[lang];
    const existingContainer = document.querySelector(".help-button-container");
    if (existingContainer) {
      existingContainer.remove();
    }
    const helpButton = document.createElement("button");
    helpButton.className = "help-button";
    helpButton.innerHTML = "?";
    helpButton.title = t.helpButtonTitle;
    helpButton.setAttribute("aria-label", t.helpButtonAriaLabel);
    helpButton.addEventListener("click", () => {
      if (window.activeTour && window.activeTour.isActive()) {
        const currentStep = window.activeTour.getCurrentStep();
        if (currentStep) {
          window.activeTour.show(currentStep.id);
        } else {
          window.activeTour.start();
        }
      } else {
        startTour(map);
      }
    });
    const controlContainer = document.querySelector(".mapboxgl-ctrl-top-right");
    if (controlContainer) {
      const helpControl = document.createElement("div");
      helpControl.className = "mapboxgl-ctrl help-button-container";
      helpControl.appendChild(helpButton);
      controlContainer.appendChild(helpControl);
    }
  }
  function startTour(map) {
    const lang = detectLanguage4();
    const t = translations[lang];
    const tour = new window.Shepherd.Tour({
      useModalOverlay: false,
      defaultStepOptions: {
        cancelIcon: {
          enabled: true
        },
        classes: "shepherd-theme-heerlen",
        scrollTo: false,
        title: null,
        // No titles, just content
        popperOptions: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 12]
              }
            },
            {
              name: "preventOverflow",
              options: {
                boundary: document.body,
                padding: 10
              }
            }
          ]
        }
      }
    });
    const handleClickOutside = (event) => {
      if (!tour || !tour.isActive()) return;
      const target = event.target;
      if (target.classList.contains("shepherd-modal-overlay-container")) {
        tour.cancel();
        return;
      }
      const isShepherdElement = target.closest(".shepherd-element");
      const isHelpButton = target.closest(".help-button");
      const isProgressBar = target.closest(".shepherd-progress-bar");
      const isWelcomeOverlay = target.closest(".welcome-overlay");
      const isInsidePopup = target.closest(".shepherd-content, .shepherd-text, .shepherd-footer, .shepherd-button");
      if (!isShepherdElement && !isHelpButton && !isProgressBar && !isWelcomeOverlay && !isInsidePopup) {
        tour.cancel();
      }
    };
    const handleMapDrag = () => {
      if (tour && tour.isActive()) {
        tour.cancel();
      }
    };
    tour.on("start", () => {
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 100);
      map.on("dragstart", handleMapDrag);
    });
    tour.on("cancel", () => {
      document.removeEventListener("click", handleClickOutside);
      map.off("dragstart", handleMapDrag);
    });
    tour.on("complete", () => {
      document.removeEventListener("click", handleClickOutside);
      map.off("dragstart", handleMapDrag);
    });
    window.activeTour = tour;
    function enableOverlay() {
      const overlay = document.querySelector(".shepherd-modal-overlay-container");
      if (overlay) {
        overlay.style.transition = "opacity 0.3s ease";
        overlay.classList.add("shepherd-modal-is-visible");
        overlay.style.pointerEvents = "auto";
        overlay.onclick = (e) => {
          if (e.target === overlay) {
            tour.cancel();
          }
        };
      }
    }
    function disableOverlay() {
      const overlay = document.querySelector(".shepherd-modal-overlay-container");
      if (overlay) {
        overlay.classList.remove("shepherd-modal-is-visible");
        overlay.style.pointerEvents = "none";
        overlay.onclick = null;
      }
    }
    function safelyGetElement(selector, fallbackSelector) {
      const element = document.querySelector(selector);
      if (element) {
        return { element, on: "bottom" };
      }
      if (fallbackSelector) {
        const fallback = document.querySelector(fallbackSelector);
        if (fallback) {
          return { element: fallback, on: "bottom" };
        }
      }
      return null;
    }
    tour.addStep({
      id: "welcome",
      text: t.tourSteps.welcome,
      buttons: [
        {
          text: t.buttons.start,
          action: tour.next,
          classes: "shepherd-button-primary"
        }
      ],
      when: {
        show: enableOverlay
      }
    });
    const tourSteps = [
      {
        id: "map-controls",
        attachTo: safelyGetElement(".mapboxgl-ctrl-top-right", ".mapboxgl-ctrl-group"),
        text: t.tourSteps.mapControls
      },
      {
        id: "filters",
        attachTo: safelyGetElement(".map-filter-wrap-2", ".filter-btn"),
        text: t.tourSteps.filters
      },
      {
        id: "geolocation",
        attachTo: safelyGetElement(".mapboxgl-ctrl-geolocate", ".mapboxgl-ctrl-bottom-right"),
        text: t.tourSteps.geolocation
      }
    ];
    tourSteps.forEach((stepConfig) => {
      if (stepConfig.attachTo) {
        tour.addStep({
          ...stepConfig,
          buttons: [
            {
              text: t.buttons.back,
              action: tour.back,
              classes: "shepherd-button-secondary"
            },
            {
              text: t.buttons.next,
              action: tour.next,
              classes: "shepherd-button-primary"
            }
          ],
          when: {
            show: enableOverlay,
            hide: () => {
              const target = stepConfig.attachTo?.element;
              if (target) {
                target.classList.add("tour-highlight-pulse");
                setTimeout(() => {
                  target.classList.remove("tour-highlight-pulse");
                }, 1e3);
              }
            }
          }
        });
      }
    });
    tour.addStep({
      id: "try-marker",
      text: `
      <div class="tour-marker-instruction">
        <p>${t.tourSteps.tryMarker}</p>
        <div class="marker-animation">
          <span class="pulse-dot"></span>
          <span class="instruction-arrow">\u2193</span>
        </div>
      </div>
    `,
      buttons: [
        {
          text: t.buttons.back,
          action: tour.back,
          classes: "shepherd-button-secondary"
        },
        {
          text: t.buttons.skip,
          action: () => {
            window.tourWaitingForMarkerClick = false;
            tour.show("popup-info");
          },
          classes: "shepherd-button-secondary"
        }
      ],
      when: {
        show: function() {
          disableOverlay();
          const message = document.createElement("div");
          message.className = "tour-instruction-message";
          message.textContent = t.tourSteps.markerInstruction;
          document.body.appendChild(message);
          setTimeout(() => {
            if (message.parentNode) {
              message.parentNode.removeChild(message);
            }
          }, 4e3);
          setTimeout(() => {
            const features = map.queryRenderedFeatures({
              layers: ["location-markers", "location-icons"]
            });
            if (features.length > 0) {
              const randomIndex = Math.floor(Math.random() * features.length);
              const selectedFeature = features[randomIndex];
              const coordinates = selectedFeature.geometry.coordinates;
              map.fire("click", {
                lngLat: coordinates,
                point: map.project(coordinates),
                features: [selectedFeature],
                originalEvent: new MouseEvent("click")
              });
              setTimeout(() => {
                if (tour.getCurrentStep() && tour.getCurrentStep().id === "try-marker") {
                  enableOverlay();
                  tour.show("popup-info");
                }
              }, 800);
            }
          }, 500);
          window.tourWaitingForMarkerClick = true;
          window.markerClickFallbackTimer = window.setTimeout(() => {
            if (window.tourWaitingForMarkerClick) {
              const hintMessage = document.createElement("div");
              hintMessage.className = "tour-instruction-message";
              hintMessage.textContent = t.tourSteps.markerHint;
              document.body.appendChild(hintMessage);
              setTimeout(() => {
                if (hintMessage.parentNode) {
                  hintMessage.parentNode.removeChild(hintMessage);
                }
              }, 5e3);
            }
          }, 15e3);
        },
        hide: function() {
          if (window.markerClickFallbackTimer) {
            clearTimeout(window.markerClickFallbackTimer);
          }
          const messages = document.querySelectorAll(".tour-instruction-message");
          messages.forEach((msg) => {
            if (msg.parentNode) {
              msg.parentNode.removeChild(msg);
            }
          });
        }
      },
      // Prevent advancing with keyboard navigation
      canClickTarget: false,
      advanceOn: null
    });
    tour.addStep({
      id: "popup-info",
      attachTo: function() {
        const popup = document.querySelector(".mapboxgl-popup-content");
        return popup ? { element: popup, on: "top" } : null;
      },
      text: t.tourSteps.popupInfo,
      buttons: [
        {
          text: t.buttons.back,
          action: tour.back,
          classes: "shepherd-button-secondary"
        },
        {
          text: t.buttons.next,
          action: tour.next,
          classes: "shepherd-button-primary"
        }
      ],
      when: {
        show: function() {
          enableOverlay();
          if (!document.querySelector(".mapboxgl-popup-content") && map) {
            const marker = document.querySelector(".mapboxgl-marker, .mapboxgl-user-location-dot");
            if (marker) {
              marker.click();
              setTimeout(() => {
                if (!document.querySelector(".mapboxgl-popup-content") && map.getLayer("location-markers")) {
                  const features = map.queryRenderedFeatures({ layers: ["location-markers"] });
                  if (features.length > 0) {
                    const feature = features[0];
                    map.fire("click", {
                      lngLat: feature.geometry.coordinates,
                      point: map.project(feature.geometry.coordinates),
                      features: [feature]
                    });
                  }
                }
              }, 300);
            }
          }
        },
        hide: disableOverlay
      }
    });
    const jetboostElement = document.querySelector(".jetboost-favorites-total");
    const heartSvgElement = document.querySelector(".heart-svg.w-embed");
    console.log("\u{1F50D} Checking heart elements:");
    console.log("  .jetboost-favorites-total:", jetboostElement);
    console.log("  .heart-svg.w-embed:", heartSvgElement);
    const heartAttachment = safelyGetElement(".jetboost-favorites-total", ".heart-svg.w-embed");
    console.log("Heart attachment result:", heartAttachment);
    if (heartAttachment) {
      console.log("\u2705 Adding heart step to tour");
      tour.addStep({
        id: "like-heart-svg",
        attachTo: heartAttachment,
        text: t.tourSteps.likeHeart,
        buttons: [
          {
            text: t.buttons.back,
            action: tour.back,
            classes: "shepherd-button-secondary"
          },
          {
            text: t.buttons.next,
            action: tour.next,
            classes: "shepherd-button-primary"
          }
        ],
        when: {
          show: () => {
            enableOverlay();
            const target = document.querySelector(".jetboost-favorites-total");
            if (target) {
              target.classList.add("tour-highlight-pulse");
              setTimeout(() => {
                target.classList.remove("tour-highlight-pulse");
              }, 1e3);
            }
          },
          hide: disableOverlay
        }
      });
    }
    tour.addStep({
      id: "finish",
      text: t.tourSteps.finish,
      buttons: [
        {
          text: t.buttons.ready,
          action: tour.complete,
          classes: "shepherd-button-primary"
        }
      ],
      when: { show: enableOverlay }
    });
    tour.on("start", () => {
      addProgressBar(tour);
    });
    function setupMarkerClickListener() {
      if (window.markerClickListener) {
        map.off("click", "location-markers", window.markerClickListener);
      }
      window.markerClickListener = () => {
        if (window.tourWaitingForMarkerClick) {
          window.tourWaitingForMarkerClick = false;
          clearTimeout(window.markerClickFallbackTimer);
          setTimeout(() => {
            if (tour.getCurrentStep() && tour.getCurrentStep().id === "try-marker") {
              enableOverlay();
              tour.show("popup-info");
            }
          }, 500);
        }
      };
      map.on("click", "location-markers", window.markerClickListener);
    }
    setupMarkerClickListener();
    function cleanupTour2() {
      window.tourWaitingForMarkerClick = false;
      if (window.markerClickFallbackTimer) {
        clearTimeout(window.markerClickFallbackTimer);
      }
      const messages = document.querySelectorAll(".tour-instruction-message");
      messages.forEach((msg) => {
        if (msg.parentNode) {
          msg.parentNode.removeChild(msg);
        }
      });
      const progressBar = document.querySelector(".shepherd-progress-bar");
      if (progressBar && progressBar.parentNode) {
        progressBar.parentNode.removeChild(progressBar);
      }
    }
    tour.on("complete", cleanupTour2);
    tour.on("cancel", cleanupTour2);
    tour.start();
  }
  function addProgressBar(tour) {
    const lang = detectLanguage4();
    const t = translations[lang];
    const existingBar = document.querySelector(".shepherd-progress-bar");
    if (existingBar) {
      existingBar.remove();
    }
    const progressContainer = document.createElement("div");
    progressContainer.className = "shepherd-progress-bar";
    const progressInner = document.createElement("div");
    progressInner.className = "progress-inner";
    progressInner.innerHTML = `<div class="progress-fill"></div>`;
    const closeButton = document.createElement("button");
    closeButton.className = "progress-bar-close-btn";
    closeButton.innerHTML = "\xD7";
    closeButton.setAttribute("aria-label", t.progressBarClose);
    closeButton.title = t.progressBarClose;
    closeButton.addEventListener("click", () => {
      tour.cancel();
    });
    progressContainer.appendChild(progressInner);
    progressContainer.appendChild(closeButton);
    document.body.appendChild(progressContainer);
    function updateProgress() {
      const currentStep = tour.getCurrentStep();
      if (!currentStep) return;
      const stepIndex = tour.steps.indexOf(currentStep);
      const totalSteps = tour.steps.length;
      const progress = totalSteps > 1 ? Math.round(stepIndex / (totalSteps - 1) * 100) : 100;
      const fill = progressContainer.querySelector(".progress-fill");
      if (fill) {
        fill.style.width = `${progress}%`;
      }
    }
    tour.on("show", updateProgress);
    updateProgress();
  }
  function cleanupTour() {
    tourIntervals.forEach((id) => clearInterval(id));
    tourIntervals.clear();
    tourTimeouts.forEach((id) => clearTimeout(id));
    tourTimeouts.clear();
    tourEventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    tourEventListeners.length = 0;
    if (window.markerClickFallbackTimer) {
      clearTimeout(window.markerClickFallbackTimer);
      delete window.markerClickFallbackTimer;
    }
    if (window.activeTour) {
      try {
        window.activeTour.cancel();
      } catch (e) {
      }
      delete window.activeTour;
    }
    delete window.tourWaitingForMarkerClick;
    delete window.markerClickListener;
    delete window.tourCleanup;
  }
  window.tourCleanup = cleanupTour;

  // src/app.ts
  init_eventBus();
  window.Webflow ||= [];
  window.Webflow.push(async () => {
    console.log("\u{1F680} LOCALHOST SCRIPT LOADED - Development server is active!");
    try {
      const map = initializeMap();
      window.map = map;
      const geolocationManager = new GeolocationManager(map);
      window.geolocationManager = geolocationManager;
      setupMapLoadHandler(map);
      setupMapInteractionHandlers(map);
      setupSidebarHandlers();
      setupPOIFiltering(map);
      setupThreeJSLayer(map);
      initialize3DSettings(map);
      initializeTour(map);
      map.on("zoom", () => {
        const currentZoom = map.getZoom();
        updateMarkerVisibility(map, currentZoom);
      });
      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point);
        if (features.length > 0) {
          const location2 = features[0];
          createPopup(location2, map);
        } else {
          closeActivePopup();
        }
      });
      eventBus.emit(Events.MAP_LOADED, map);
    } catch (error) {
      eventBus.emit("app:error", error);
    }
  });
  window.addEventListener("beforeunload", () => {
    resourceManager.cleanup();
    eventBus.cleanup();
    if (window.geolocationManager) {
      window.geolocationManager.cleanup();
    }
    if (window.tourCleanup) {
      window.tourCleanup();
    }
  });
  window.HeerlenMap = {
    getState: () => state2,
    getConfig: () => CONFIG,
    closePopup: closeActivePopup,
    toggleFilter
  };
  window.handleSnapchatLink = handleSnapchatLink;
  window.showImagePopup = showImagePopup;
  window.closeItem = closeItem;
})();
//! ============= POPUP MANAGEMENT =============
//# sourceMappingURL=app.js.map

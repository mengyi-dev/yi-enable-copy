/**
 * content.js (v1.2.1)
 * This script is injected into web pages to re-enable text selection and copying
 * for the "Yi Enable Copy" extension.
 * It also adds an overlay icon to the bottom-left of the page.
 */

(function() {
    const STYLE_ID = 'yi-enable-copy-styles';
    const INDICATOR_ID = 'yi-enable-copy-indicator';
  
    // --- Prevent multiple injections / redundant operations on the same page load ---
    if (document.getElementById(INDICATOR_ID)) {
      console.log('[Yi Enable Copy] Already active on this page load.');
      // Optionally, briefly highlight the indicator if re-clicked for the same page state
      const existingIndicator = document.getElementById(INDICATOR_ID);
      if (existingIndicator) {
          existingIndicator.style.opacity = '1';
          setTimeout(() => { existingIndicator.style.opacity = '0.7'; }, 1500);
      }
      return; // Stop further execution if already initialized
    }
  
    console.log('[Yi Enable Copy] Script injected. Attempting to enable copying and add overlay.');
  
    // --- 1. Override CSS to allow text selection ---
    const styleSheet = document.createElement('style');
    styleSheet.id = STYLE_ID;
    styleSheet.innerHTML = `
      *, *::before, *::after {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      body, html {
        cursor: auto !important;
      }
      /* Styles for the overlay icon */
      #${INDICATOR_ID} {
        position: fixed !important;
        bottom: 20px !important;
        left: 20px !important;
        width: 80px !important; /* Adjust size as needed */
        height: 80px !important; /* Adjust size as needed */
        z-index: 2147483647 !important; /* Max z-index */
        background-image: url(${chrome.runtime.getURL("images/overlay-icon.png")});
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        opacity: 0.7;
        transition: opacity 0.3s ease-in-out;
        cursor: help; /* Indicate it's an informational icon */
      }
      #${INDICATOR_ID}:hover {
        opacity: 1;
      }
    `;
    (document.head || document.documentElement).appendChild(styleSheet);
    console.log('[Yi Enable Copy] Applied CSS overrides and overlay styles.');
  
    // --- 2. Re-enable Context Menu (Right-Click) ---
    // Add event listener in the capture phase to catch the event early.
    document.addEventListener('contextmenu', function(event) {
      event.stopImmediatePropagation(); // Crucial to prevent other listeners from canceling the event
      // console.log('[Yi Enable Copy] Context menu event allowed.'); // Can be noisy
      return true; // Explicitly allow the event
    }, true); // `true` for capture phase
  
    // --- 3. Override Event Listeners that Prevent Copying/Selection ---
    const eventsToClear = ['selectstart', 'mousedown', 'keydown', 'copy', 'cut', 'paste'];
  
    eventsToClear.forEach(eventType => {
      // Add our own permissive listener in the capture phase
      document.addEventListener(eventType, function(event) {
        event.stopImmediatePropagation(); // Prevent other listeners from blocking
        // console.log(`[Yi Enable Copy] Allowed event: ${eventType}`); // Can be noisy
        return true;
      }, true); // `true` for capture phase
  
      // Attempt to remove or nullify existing problematic listeners on document/body
      if (document[`on${eventType}`]) {
        document[`on${eventType}`] = null;
      }
      if (document.body && document.body[`on${eventType}`]) {
        document.body[`on${eventType}`] = null;
      }
    });
  
    // --- 4. Remove known problematic attributes from body ---
    const bodyAttributesToRemove = ['oncontextmenu', 'onselectstart', 'onmousedown', 'oncopy', 'oncut', 'onpaste'];
    bodyAttributesToRemove.forEach(attr => {
      if (document.body && document.body.hasAttribute(attr)) {
        document.body.removeAttribute(attr);
        console.log(`[Yi Enable Copy] Removed attribute ${attr} from body.`);
      }
    });
  
    // --- 5. Add Overlay Icon to the page ---
    const overlayIcon = document.createElement('div');
    overlayIcon.id = INDICATOR_ID;
    overlayIcon.title = 'Yi Enable Copy is active on this page.';
    document.body.appendChild(overlayIcon);
    console.log('[Yi Enable Copy] Overlay icon added to the page.');
  
    // --- Final Confirmation (Optional) ---
    // alert('Yi Enable Copy: Text selection and copy should now be enabled. Look for the icon at the bottom-left.');
    console.log('[Yi Enable Copy] All operations completed for this activation.');
  
  })();
  
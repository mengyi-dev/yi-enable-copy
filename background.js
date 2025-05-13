/**
 * background.js (v1.2.2 - Debug Icon Change)
 * Service worker for the "Yi Enable Copy" Chrome extension.
 * Activates features on click, changes toolbar icon, and resets on navigation.
 * Includes enhanced logging for debugging icon changes.
 */

const defaultIconPaths = {
    "16": "images/icon16.png",
    "48": "images/icon48.png",
    "128": "images/icon128.png"
  };
  
  const activeIconPaths = {
    "16": "images/icon16-active.png",
    "48": "images/icon48-active.png",
    "128": "images/icon128-active.png"
  };
  
  chrome.action.onClicked.addListener((tab) => {
    if (tab.id === undefined) {
      console.warn("[Yi Enable Copy] Tab ID is undefined. Cannot execute script.");
      return;
    }
  
    console.log(`[Yi Enable Copy] Action clicked for tab: ${tab.id}, URL: ${tab.url}`);
  
    if (tab.url && (tab.url.startsWith("http://") || tab.url.startsWith("https://"))) {
      console.log(`[Yi Enable Copy] Attempting to inject content.js into tab: ${tab.id}`);
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      }).then(() => {
        console.log(`[Yi Enable Copy] Successfully injected content.js into tab: ${tab.id}. Attempting to set ACTIVE icon.`);
        chrome.action.setIcon({
          tabId: tab.id,
          path: activeIconPaths
        }).then(() => {
          console.log(`[Yi Enable Copy] Successfully SET ACTIVE icon for tab: ${tab.id}`);
        }).catch(err => {
          console.error(`[Yi Enable Copy] Error SETTING ACTIVE icon for tab ${tab.id}:`, err, "Paths tried:", activeIconPaths);
        });
      }).catch(err => {
        console.error(`[Yi Enable Copy] FAILED to inject content.js into tab ${tab.id}:`, err);
        console.log(`[Yi Enable Copy] Attempting to set DEFAULT icon due to injection failure for tab: ${tab.id}`);
        chrome.action.setIcon({
          tabId: tab.id,
          path: defaultIconPaths
        }).then(() => {
          console.log(`[Yi Enable Copy] Successfully SET DEFAULT icon after injection failure for tab: ${tab.id}`);
        }).catch(errIcon => {
          console.error(`[Yi Enable Copy] Error SETTING DEFAULT icon on injection failure for tab ${tab.id}:`, errIcon, "Paths tried:", defaultIconPaths);
        });
      });
    } else {
      console.log(`[Yi Enable Copy] Cannot inject script into this URL: ${tab.url}. Setting DEFAULT icon for tab: ${tab.id}`);
       chrome.action.setIcon({
          tabId: tab.id,
          path: defaultIconPaths
        }).then(() => {
          console.log(`[Yi Enable Copy] Successfully SET DEFAULT icon for non-webpage tab: ${tab.id}`);
        }).catch(err => {
          console.error(`[Yi Enable Copy] Error SETTING DEFAULT icon for non-webpage tab ${tab.id}:`, err, "Paths tried:", defaultIconPaths);
        });
    }
  });
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' || changeInfo.url) {
      if (tab.url && (tab.url.startsWith("http://") || tab.url.startsWith("https://"))) {
          // console.log(`[Yi Enable Copy] Tab ${tabId} updated. Setting DEFAULT icon.`);
          chrome.action.setIcon({
              tabId: tabId,
              path: defaultIconPaths
          }).catch(err => {
              // This can happen if the tab closes very quickly, etc. Usually not critical.
              // console.warn(`[Yi Enable Copy] Could not reset icon for tab ${tabId} on update: ${err.message}`);
          });
      }
    }
  });
  
  chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {
      console.log("[Yi Enable Copy] Extension installed.");
    } else if (details.reason === "update") {
      const thisVersion = chrome.runtime.getManifest().version;
      console.log(`[Yi Enable Copy] Extension updated from ${details.previousVersion} to ${thisVersion}.`);
    }
  
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id && tab.url && (tab.url.startsWith("http://") || tab.url.startsWith("https://"))) {
        try {
          await chrome.action.setIcon({ tabId: tab.id, path: defaultIconPaths });
        } catch(e) {
          // console.warn(`[Yi Enable Copy] Could not set default icon for tab ${tab.id} on startup: ${e.message}`);
        }
      }
    }
  });
  
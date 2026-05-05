/**
 * Analytics tracking module
 * Tracks page views and history state changes
 */

(function initializeAnalytics() {
  // Only track if in main frame (not iframe)
  if (window.self !== window.top) {
    return;
  }

  let lastPath = "";

  /**
   * Extract page name from URL path
   * @param {string} path - The URL pathname
   * @returns {string|null} First path segment or null
   */
  function getPageNameFromPath(path) {
    const segments = path.split("/").filter(Boolean);
    return segments[0] || null;
  }

  /**
   * Track page view to analytics endpoint
   */
  function trackPageView() {
    const path = window.location.pathname;
    if (path === lastPath) return;
    lastPath = path;

    const pageName = getPageNameFromPath(path) || "home";
    
    // Get appId from data attribute or environment variable
    const appId = document.documentElement.getAttribute("data-app-id") || 
                  (typeof APP_ID !== "undefined" ? APP_ID : null);
    
    if (!appId) {
      console.warn("Analytics: APP_ID not configured");
      return;
    }

    // Send analytics event with proper error handling
    fetch(`/app-logs/${appId}/log-user-in-app/${pageName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    })
    .catch((error) => {
      console.error("Analytics tracking failed:", error);
    });
  }

  // Override history methods to track navigation
  const originalPushState = history.pushState.bind(history);
  history.pushState = function (...args) {
    originalPushState(...args);
    trackPageView();
  };

  const originalReplaceState = history.replaceState.bind(history);
  history.replaceState = function (...args) {
    originalReplaceState(...args);
    trackPageView();
  };

  // Track back/forward navigation
  window.addEventListener("popstate", trackPageView);

  // Initial page view
  trackPageView();
})();

import mixpanel from "mixpanel-browser";

// Initialize Mixpanel
mixpanel.init("bda4836aced67124ac20698bdbfb0273", {
  debug: true,
  track_pageview: true,
  persistence: "localStorage",
  autocapture: true,
  record_sessions_percent: 100,
});

// Utility function to track errors
export const trackError = (
  errorType,
  errorMessage,
  errorCode = null,
  pageUrl = null
) => {
  mixpanel.track("Error", {
    error_type: errorType,
    error_message: errorMessage,
    error_code: errorCode,
    page_url:
      pageUrl || (typeof window !== "undefined" ? window.location.href : null),
  });
};

export default mixpanel;

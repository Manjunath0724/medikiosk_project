/**
 * UTM Tracking Utility for MediKiosk
 * Captures campaign attribution parameters from the URL and persists them in sessionStorage.
 * Compliant with privacy standards (does not persist PII).
 */

const UTM_STORAGE_KEY = "medikiosk_utm_params";

export function initUtmTracking() {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"];
    const foundParams = {};
    let hasUtm = false;

    utmKeys.forEach((key) => {
      const val = searchParams.get(key);
      if (val) {
        foundParams[key] = val;
        hasUtm = true;
      }
    });

    if (hasUtm) {
      foundParams.captured_at = new Date().toISOString();
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(foundParams));
      return foundParams;
    }

    const saved = sessionStorage.getItem(UTM_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function getUtmParams() {
  try {
    const saved = sessionStorage.getItem(UTM_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

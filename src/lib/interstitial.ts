import { AdEventType, InterstitialAd } from "react-native-google-mobile-ads";

import { INTERSTITIAL_AD_UNIT_ID } from "@/lib/ads";

// At most one interstitial per this window — starting a workout, backing
// out and starting again shouldn't show an ad every time (it annoys users
// and AdMob penalizes over-frequent interstitials).
const MIN_INTERVAL_MS = 3 * 60 * 1000;

// If the ad claims to be loaded but never opens/closes, don't leave the
// user stuck on "Start" — continue anyway after this long.
const SHOW_TIMEOUT_MS = 8000;

let ad: InterstitialAd | null = null;
let lastShownAt = 0;
let showing = false;

function getAd(): InterstitialAd {
  if (!ad) {
    ad = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID);
    // Keep one ready: reload after every show and retry after a failure.
    ad.addAdEventListener(AdEventType.CLOSED, () => ad?.load());
    ad.addAdEventListener(AdEventType.ERROR, () => {
      setTimeout(() => {
        if (ad && !ad.loaded) ad.load();
      }, 30_000);
    });
  }
  return ad;
}

/** Start loading an interstitial in the background so it's ready when needed. */
export function preloadInterstitial() {
  try {
    const current = getAd();
    if (!current.loaded) current.load();
  } catch {
    // Ads are best-effort; never break the app over them.
  }
}

/**
 * Shows an interstitial if one is ready (and the frequency cap allows), then
 * runs `next` when it's closed. With no ad ready, runs `next` right away —
 * an ad never blocks the action the user asked for.
 */
export function showInterstitialThen(next: () => void) {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    showing = false;
    next();
  };

  try {
    const current = getAd();
    const canShow = current.loaded && !showing && Date.now() - lastShownAt >= MIN_INTERVAL_MS;

    if (!canShow) {
      if (!current.loaded) current.load();
      finish();
      return;
    }

    showing = true;
    const cleanups: (() => void)[] = [];
    const complete = () => {
      clearTimeout(timeout);
      cleanups.forEach((cleanup) => cleanup());
      finish();
    };
    const timeout = setTimeout(complete, SHOW_TIMEOUT_MS);

    cleanups.push(
      current.addAdEventListener(AdEventType.OPENED, () => clearTimeout(timeout)),
      current.addAdEventListener(AdEventType.CLOSED, complete),
      current.addAdEventListener(AdEventType.ERROR, complete),
    );

    lastShownAt = Date.now();
    current.show().catch(complete);
  } catch {
    finish();
  }
}

import { TestIds } from "react-native-google-mobile-ads";

/**
 * Ad unit IDs. These currently point at Google's official test ad units —
 * safe to ship in a dev build, since they always serve clearly-labeled test
 * creatives and are never associated with a real AdMob account. Replace both
 * with real ad unit IDs from the AdMob console before a production release
 * (and swap `androidAppId`/`iosAppId` in app.json's plugin config too).
 */
export const BANNER_AD_UNIT_ID = TestIds.BANNER;
export const INTERSTITIAL_AD_UNIT_ID = TestIds.INTERSTITIAL;

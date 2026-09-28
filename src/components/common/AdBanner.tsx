import { useState } from "react";
import { View } from "react-native";
import { BannerAd, BannerAdSize, type BannerAdProps } from "react-native-google-mobile-ads";

import { BANNER_AD_UNIT_ID } from "@/lib/ads";

type Props = {
  unitId?: string;
  size?: BannerAdProps["size"];
  /** Tallest the (inline adaptive) ad may be, in dp. */
  maxHeight?: number;
};

/**
 * Defaults to an inline adaptive banner — the size Google intends for ads
 * inside scrolling content. It resizes to the creative actually served,
 * whereas an anchored size reserves a fixed slot and the SDK letterboxes a
 * smaller creative (e.g. 320x50) with black bars inside its native view,
 * which no app styling can cover.
 *
 * Renders nothing at all — not even its wrapping container — once the ad
 * fails to load, so a failed request never leaves a blank rounded box
 * sitting in the layout.
 */
export default function AdBanner({
  unitId = BANNER_AD_UNIT_ID,
  size = BannerAdSize.INLINE_ADAPTIVE_BANNER,
  maxHeight = 120,
}: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <View className="mt-5 items-center overflow-hidden rounded-2xl">
      <BannerAd
        unitId={unitId}
        size={size}
        maxHeight={size === BannerAdSize.INLINE_ADAPTIVE_BANNER ? maxHeight : undefined}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

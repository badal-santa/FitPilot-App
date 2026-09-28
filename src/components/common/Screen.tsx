import React, {ReactElement, ReactNode} from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  ScrollView,
  ViewStyle,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
  contentContainerStyle?: ViewStyle;
  /** Skip the default `bg-bg` theme background (e.g. for a screen that paints
   * its own full-bleed background, like a photo hero). Explicit prop rather
   * than a `bg-transparent` className override, since NativeWind doesn't
   * reliably let a later class beat a CSS-variable-backed one in the same
   * className string. */
  transparent?: boolean;

  onScroll?: (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => void;

  scrollEventThrottle?: number;

  /** Pull-to-refresh control for the scroll view (only with `scroll`). */
  refreshControl?: ReactElement<RefreshControlProps>;
}

const Screen = ({
  children,
  scroll = false,
  className = '',
  contentContainerStyle,
  transparent = false,
  onScroll,
  scrollEventThrottle = 16,
  refreshControl,
}: ScreenProps) => {
  const bg = transparent ? '' : 'bg-bg';

  if (scroll) {
    return (
      <SafeAreaView
        edges={['top','left','right','bottom']}
        className={`flex-1 ${bg} ${className} px-2`}>

        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={scrollEventThrottle}
          refreshControl={refreshControl}
          contentContainerStyle={
            contentContainerStyle
          }>
          {children}
        </ScrollView>

      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top','bottom']}
      className={`flex-1 ${bg} ${className}`}>
      {children}
    </SafeAreaView>
  );
};

export default Screen;
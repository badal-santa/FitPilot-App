import * as React from "react";
import Svg, { Rect } from "react-native-svg";

type props = {
  stroke?: string;
  strokeWidth?: number;
  size: number;
  color?: string;
};

function SvgComponent({ stroke, strokeWidth, size, color = "#000000ff" }: props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect
        x={2}
        y={9}
        width={6}
        height={14}
        rx={2}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={color}
      />
      <Rect
        x={24}
        y={9}
        width={6}
        height={14}
        rx={2}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={color}
      />
      <Rect
        x={6}
        y={14}
        width={20}
        height={4}
        rx={2}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={color}
      />
    </Svg>
  );
}

export default SvgComponent;

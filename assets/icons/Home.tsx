import * as React from "react";
import Svg, { Path, Text } from "react-native-svg";

type props = {
  stroke: string;
  strokeWidth: number;
  size: number;
  color?: string;
}

function Home({ stroke, strokeWidth, size=20, color="#000000ff" }: props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
    >
      <Path stroke={stroke} strokeWidth={0.5} fill={color} d="M19 30h-6a1 1 0 01-1-1v-9a1 1 0 011-1h6a1 1 0 011 1v9a1 1 0 01-1 1zm-5-2h4v-7h-4z" />
      <Path stroke={stroke} strokeWidth={0.5} fill={color} d="M21 30H11a5 5 0 01-5-5v-8h-.59a2 2 0 01-1.84-1.23A2 2 0 014 13.59L14.59 3a2 2 0 012.82 0L28 13.59a2 2 0 01.43 2.18A2 2 0 0126.59 17H26v8a5 5 0 01-5 5zM7 15a1 1 0 011 1v9a3 3 0 003 3h10a3 3 0 003-3v-9a1 1 0 011-1h1.59L16 4.41 5.41 15z" />
    </Svg>
  )
}

export default Home

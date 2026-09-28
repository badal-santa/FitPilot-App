import * as React from "react"
import Svg, { Path, Text } from "react-native-svg"

type props = {
  stroke: string;
  strokeWidth: number;
  size: number;
  color?: string;
}

function Profile({stroke, strokeWidth, size, color}: props) {
  return (
    <Svg
      viewBox="-1.24 0.66 100.95 100.95"
      width={size}
      height={size}
    >
      <Path stroke={stroke} strokeWidth={strokeWidth} fill={color} d="M49.242 59.938c-12.853 0-24.127-13.062-24.127-27.951 0-13.885 10.373-24.355 24.127-24.355s24.125 10.471 24.125 24.355c0 14.889-11.273 27.951-24.125 27.951zm0-48.536c-11.795 0-20.355 8.657-20.355 20.584 0 12.881 9.512 24.18 20.355 24.18s20.354-11.299 20.354-24.18c0-11.927-8.56-20.584-20.354-20.584z" />
      <Path stroke={stroke} strokeWidth={strokeWidth} fill={color} d="M91.013 94.644H7.468v-2c0-15.323 7.917-29.666 20.663-37.431l1.476-.898 1.104 1.329c5.199 6.259 11.921 9.706 18.929 9.706 6.878 0 13.509-3.34 18.671-9.403l1.124-1.319 1.466.925c12.594 7.942 20.113 21.809 20.113 37.092v1.999zm-79.496-4h75.449c-.593-12.53-6.748-23.818-16.794-30.779-5.758 6.131-12.989 9.485-20.532 9.485-7.694 0-15.036-3.472-20.842-9.814-10.194 6.857-16.659 18.506-17.281 31.108z" />
    </Svg>
  )
}

export default Profile

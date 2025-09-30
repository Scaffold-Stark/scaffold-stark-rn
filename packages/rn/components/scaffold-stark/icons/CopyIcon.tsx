import * as React from "react";
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
  SvgProps,
} from "react-native-svg";

export type CopyIconProps = SvgProps & {
  variant?: "light" | "dark";
  copied?: boolean;
};

const CopyIcon = ({
  variant = "light",
  copied = false,
  ...svgProps
}: CopyIconProps) => {
  const isDark = variant === "dark";
  const strokeColor = isDark ? "white" : "black";

  return (
    <Svg width={25} height={25} viewBox="0 0 25 25" fill="none" {...svgProps}>
      <Rect
        x={0.75}
        y={0.3125}
        width={24}
        height={24}
        rx={7.05882}
        fill="url(#copy_grad)"
      />
      {copied ? (
        <>
          <Path
            d="M8.5 12.5L11 15L16.5 9.5"
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <Path
            d="M9.67555 11.1359C9.67555 10.7615 9.82429 10.4024 10.089 10.1376C10.3538 9.87289 10.7129 9.72415 11.0873 9.72415H16.7344C17.1088 9.72415 17.4679 9.87289 17.7326 10.1376C17.9974 10.4024 18.1461 10.7615 18.1461 11.1359V16.783C18.1461 17.1574 17.9974 17.5165 17.7326 17.7812C17.4679 18.046 17.1088 18.1947 16.7344 18.1947H11.0873C10.7129 18.1947 10.3538 18.046 10.089 17.7812C9.82429 17.5165 9.67555 17.1574 9.67555 16.783V11.1359Z"
            stroke={strokeColor}
            strokeWidth={1.05882}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M15.3226 9.72416V8.3124C15.3226 7.93798 15.1739 7.57889 14.9091 7.31413C14.6444 7.04937 14.2853 6.90063 13.9108 6.90063H8.26379C7.88936 6.90063 7.53027 7.04937 7.26552 7.31413C7.00076 7.57889 6.85202 7.93798 6.85202 8.3124V13.9595C6.85202 14.3339 7.00076 14.693 7.26552 14.9577C7.53027 15.2225 7.88936 15.3712 8.26379 15.3712H9.67555"
            stroke={strokeColor}
            strokeWidth={1.05882}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      <Defs>
        {isDark ? (
          <LinearGradient
            id="copy_grad"
            x1={12.6445}
            y1={0.333191}
            x2={12.6445}
            y2={24.3332}
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#3457D1" />
            <Stop offset={1} stopColor="#8A45FC" />
          </LinearGradient>
        ) : (
          <LinearGradient
            id="copy_grad"
            x1={28.931}
            y1={12.3126}
            x2={-1.42195}
            y2={12.3126}
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#A7ECFF" />
            <Stop offset={1} stopColor="#E8B6FF" />
          </LinearGradient>
        )}
      </Defs>
    </Svg>
  );
};

export { CopyIcon };

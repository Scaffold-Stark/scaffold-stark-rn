import * as React from "react";
import Svg, {
  Defs,
  Image,
  Path,
  Pattern,
  SvgProps,
  Use,
} from "react-native-svg";

const SvgComponent = (props: SvgProps) => (
  <Svg fill="none" viewBox="0 0 600 1300" {...props}>
    <Path fill="url(#a)" d="M0 0h1000v2000H0z" opacity={0.1} />
    <Defs>
      <Pattern
        id="a"
        width={0.013}
        height={0.006}
        patternContentUnits="objectBoundingBox"
      >
        <Use xlinkHref="#b" transform="scale(.00267 .00123)" />
      </Pattern>
      <Image
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAGklEQVR4Aa3IIQEAAADCsPcvDddoJgcjuocKFosT7bLfmPAAAAAASUVORK5CYII="
        id="b"
        width={4.5}
        height={4.5}
        preserveAspectRatio="none"
      />
    </Defs>
  </Svg>
);
export { SvgComponent as ScaffoldBgStripes };

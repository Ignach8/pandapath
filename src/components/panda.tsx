import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";

export type Mood = "happy" | "cheer" | "sad" | "think" | "sleep";

type Props = { size?: number; mood?: Mood };

const INK = "#1F2A2E";

/** Bambú, la mascota original de PandaPath. */
export function Panda({ size = 120, mood = "happy" }: Props) {
  const eyeOpen = mood !== "sleep";
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {/* cuerpo */}
      <Ellipse cx={100} cy={160} rx={50} ry={34} fill="#fff" stroke={INK} strokeWidth={0} />
      <Ellipse cx={58} cy={168} rx={18} ry={14} fill={INK} />
      <Ellipse cx={142} cy={168} rx={18} ry={14} fill={INK} />
      {mood === "cheer" && (
        <G>
          <Ellipse cx={46} cy={118} rx={13} ry={24} fill={INK} rotation={-25} origin="46,118" />
          <Ellipse cx={154} cy={118} rx={13} ry={24} fill={INK} rotation={25} origin="154,118" />
        </G>
      )}
      {/* orejas */}
      <Circle cx={52} cy={48} r={22} fill={INK} />
      <Circle cx={148} cy={48} r={22} fill={INK} />
      {/* cabeza */}
      <Ellipse cx={100} cy={92} rx={68} ry={58} fill="#fff" />
      {/* manchas */}
      <Ellipse cx={70} cy={88} rx={19} ry={25} fill={INK} rotation={18} origin="70,88" />
      <Ellipse cx={130} cy={88} rx={19} ry={25} fill={INK} rotation={-18} origin="130,88" />
      {/* ojos */}
      {eyeOpen ? (
        <G>
          <Circle cx={72} cy={86} r={7} fill="#fff" />
          <Circle cx={128} cy={86} r={7} fill="#fff" />
          <Circle cx={mood === "think" ? 75 : 73} cy={mood === "think" ? 83 : 87} r={3.2} fill={INK} />
          <Circle cx={mood === "think" ? 131 : 127} cy={mood === "think" ? 83 : 87} r={3.2} fill={INK} />
        </G>
      ) : (
        <G>
          <Path d="M62 88 q10 8 20 0" stroke="#fff" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <Path d="M118 88 q10 8 20 0" stroke="#fff" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </G>
      )}
      {/* nariz y boca */}
      <Ellipse cx={100} cy={106} rx={9} ry={6.5} fill={INK} />
      {mood === "sad" ? (
        <Path d="M88 124 q12 -10 24 0" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      ) : mood === "cheer" ? (
        <Path d="M86 114 q14 22 28 0 z" fill="#FF8A8A" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      ) : (
        <Path d="M88 116 q12 10 24 0" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      )}
      {mood === "sad" && <Path d="M58 104 q-3 10 0 16 q4 -6 0 -16" fill="#7CC6F2" />}
      {/* bambú */}
      <Rect x={92} y={140} width={16} height={46} rx={5} fill="#2FA37A" />
      <Rect x={92} y={156} width={16} height={4} fill="#1F7A5A" />
      <Path d="M108 146 q22 -8 30 -26 q-24 2 -30 26z" fill="#4CC594" />
    </Svg>
  );
}

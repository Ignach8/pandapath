import type { Ex } from "@/content/types";
import { Bank } from "./bank";
import { Choice } from "./choice";
import { Dialogue } from "./dialogue";
import { Essay } from "./essay";
import { Intro } from "./intro";
import { Match } from "./match";
import { Speak } from "./speak";
import { Trace } from "./trace";
import { Typing } from "./typing";
import type { ExProps } from "./types";

export type { ExProps, Result } from "./types";

type Common = Omit<ExProps<Ex>, "ex">;

export function Exercise({ ex, ...p }: { ex: Ex } & Common) {
  switch (ex.t) {
    case "intro":
      return <Intro ex={ex} {...p} />;
    case "mc":
      return <Choice ex={ex} {...p} />;
    case "match":
      return <Match ex={ex} {...p} />;
    case "bank":
      return <Bank ex={ex} {...p} />;
    case "type":
      return <Typing ex={ex} {...p} />;
    case "trace":
      return <Trace ex={ex} {...p} />;
    case "speak":
      return <Speak ex={ex} {...p} />;
    case "essay":
      return <Essay ex={ex} {...p} />;
    case "dialogue":
      return <Dialogue ex={ex} {...p} />;
  }
}

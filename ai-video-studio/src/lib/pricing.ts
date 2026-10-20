import "server-only";
import { env } from "./env";
import { type Quote, quoteWith } from "./pricing-core";

export type { Quote };

/** Price is always computed on the server, never trusted from the browser. */
export function quote(durationS: number): Quote {
  return quoteWith(durationS, env());
}

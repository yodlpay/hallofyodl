import { extractChain } from "viem";
import * as chains from "viem/chains";

export function getChainById(chainId: number) {
  const chain = extractChain({
    chains: Object.values(chains),
    id: chainId as any,
  });
  return chain;
}

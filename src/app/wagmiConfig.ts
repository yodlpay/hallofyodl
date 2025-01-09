import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export function getConfig() {
  return createConfig({
    chains: [mainnet, sepolia],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [mainnet.id]: http(mainnet.rpcUrls.default.http[0], { batch: true }),
      [sepolia.id]: http(sepolia.rpcUrls.default.http[0], { batch: true }),
    },
  });
}

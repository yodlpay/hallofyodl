"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { getConfig } from "./wagmiConfig";

const queryClient = new QueryClient();

export function Providers({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState: any;
}) {
  const config = getConfig();
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

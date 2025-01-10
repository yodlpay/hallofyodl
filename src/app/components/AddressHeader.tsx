"use client";

import { Avatar, Text, Box, Flex, Link, Grid, Button } from "@radix-ui/themes";
import { normalize } from "path";
import { useEnsText } from "wagmi";

export default function AddressHeader({ ensName }: { ensName: string }) {
  const ensNormalized = normalize(ensName);
  const avatarUrl = `https://metadata.ens.domains/mainnet/avatar/${ensNormalized}`;

  return (
    <Flex align="center" justify="between">
      <Link href={`/address/${ensNormalized}`}>
        <Flex gap="2" align="center" px="2" pt="2" justify="start">
          <Avatar src={avatarUrl} fallback=".." radius="full" size="3" />
          <Box>
            <Text as="div" size="4" weight="regular">
              {ensNormalized}
            </Text>
          </Box>
        </Flex>
      </Link>
      <Flex align="center" justify="end">
        <DonateButton ensName={ensNormalized} />
      </Flex>
    </Flex>
  );
}

function DonateButton({ ensName }: { ensName: string }) {
  const { data: yodlJsonRaw, isLoading } = useEnsText({
    name: ensName,
    key: "me.yodl",
    chainId: 1,
    query: { enabled: !!ensName },
  });

  let yodlConfig = {};
  try {
    yodlConfig = yodlJsonRaw ? JSON.parse(yodlJsonRaw) : {};
  } catch { }

  let yodlUrl = `https://yodl.me/${ensName}`;
  // @ts-ignore
  if (!isLoading && !yodlConfig.redirectUrl) {
    const proto = window.location.protocol;
    const hostname = window.location.host;
    yodlUrl += `?redirectUrl=${proto}//${hostname}/address/${ensName}/finalize`;
  }

  return (
    <Button size="3" asChild>
      <Link href={yodlUrl}>Donate</Link>
    </Button>
  );
}

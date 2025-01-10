"use client";

import { Avatar, Text, Box, Flex, Code, Spinner } from "@radix-ui/themes";
import { normalize } from "path";
import truncateEthAddress from "truncate-eth-address";
import { Address, isAddress } from "viem";
import {
  useEnsAddress,
  useEnsAvatar,
  useEnsName,
  useEnsResolver,
  useEnsText,
} from "wagmi";
import { AddressDisplay } from "./Identity";

export default function AddressOverview({
  address,
  ensName,
}: {
  address: Address;
  ensName?: string;
}) {
  const { data: name } = useEnsName({
    address: address,
    chainId: 1,
    query: { enabled: !ensName },
  });

  return (
    <Text weight="regular">
      {ensName || name || <Code>{truncateEthAddress(address)}</Code>}
    </Text>
  );
}

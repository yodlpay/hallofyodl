import { Avatar, Text, Box, Flex, Link } from "@radix-ui/themes";
import { normalize } from "path";

export default async function AddressHeader({ ensName }: { ensName: string }) {
  const ensNormalized = normalize(ensName);
  const avatarUrl = `https://metadata.ens.domains/mainnet/avatar/${ensNormalized}`;

  return (
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
  );
}

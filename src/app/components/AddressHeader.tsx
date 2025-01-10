import { Avatar, Text, Box, Flex, Link, Grid, Button } from "@radix-ui/themes";
import { normalize } from "path";
import { headers } from 'next/headers';


export default async function AddressHeader({ ensName }: { ensName: string }) {
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

async function DonateButton({ ensName }: { ensName: string }) {
  const headersList = await headers();
  const proto = headersList.get('x-forwarded-proto');
  const hostname = headersList.get('x-forwarded-host');

  const redirectUrl = `${proto}://${hostname}/address/${ensName}/finalize`
  const yodlParams = `redirectUrl=${redirectUrl}`
  const yodlUrl = `https://yodl.me/${ensName}${yodlParams}`


  return <Button size="3" asChild>
    <Link href={yodlUrl}>Donate</Link>
  </Button>;
}

import CardHeader from "@/app/components/CardHeader";
import { truncateTxHash } from "@/app/components/helpers";
import { PaymentSimple } from "@/lib/clients/indexerApiClient";
import { getChainById } from "@/lib/clients/web3/helpers";
import {
  Card,
  Code,
  DataList,
  Flex,
  Grid,
  HoverCard,
  Link,
  Text,
} from "@radix-ui/themes";

export default async function PaymentCard({
  payment,
}: {
  payment: PaymentSimple;
}) {
  const chain = getChainById(payment.chainId);

  const sourceBlockExplorerUrl = chain.blockExplorers?.default.url;

  return (
    <Card>
      <CardHeader title={truncateTxHash(payment.txHash)} />
      <Flex direction="column" px="2">
        <DataList.Root>
          <DataItem label="Source Chain">{chain?.name}</DataItem>
          <DataItem label="Tx Hash">
            {sourceBlockExplorerUrl && (
              <Link
                target="_blank"
                href={`${sourceBlockExplorerUrl}/tx/${payment.txHash}`}
              >
                {truncateTxHash(payment.txHash)}
              </Link>
            )}
            {!sourceBlockExplorerUrl && payment.txHash}
          </DataItem>
          <DataItem label="From">
            {payment.senderEnsPrimaryName || payment.senderAddress}
          </DataItem>
          <DataItem label="To">
            {payment.receiverEnsPrimaryName || payment.receiverAddress}
          </DataItem>
          <DataItem label="Amount">
            {payment.tokenOutAmountGross}
            <HoverCard.Root>
              <HoverCard.Trigger>
                <Text ml="1">{payment.tokenOutSymbol}</Text>
              </HoverCard.Trigger>
              <HoverCard.Content maxWidth="320px">
                <Grid columns="1" gap="3">
                  <Text>{payment.tokenOutSymbol}</Text>
                  <Code size="1" color="gray">
                    {payment.tokenOutAddress}
                  </Code>
                </Grid>
              </HoverCard.Content>
            </HoverCard.Root>
          </DataItem>
          <DataItem label="Date">
            {new Date(payment.blockTimestamp).toLocaleString()}
          </DataItem>
        </DataList.Root>
      </Flex>
    </Card>
  );
}

function DataItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <DataList.Item align="center">
      <DataList.Label minWidth="88px">{label}</DataList.Label>
      <DataList.Value>{children}</DataList.Value>
    </DataList.Item>
  );
}

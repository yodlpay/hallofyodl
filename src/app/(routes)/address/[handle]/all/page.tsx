import {
  Card,
  Table,
  Container,
  Flex,
  Avatar,
  Text,
  Box,
  Link,
  Button,
  Heading,
} from "@radix-ui/themes";
import _ from "lodash";
import { normalize } from "viem/ens";
import { format as dateFormat } from "date-fns";
import { fetchPayments } from "@/lib/clients/indexerApiClient";
import { Identity } from "@/app/components/Identity";
import { dnFormatFiat, truncateTxHash } from "@/app/components/helpers";
import { z } from "zod";
import * as dn from "dnum";
import AddressHeader from "@/app/components/AddressHeader";

const querySchema = z.object({
  page: z.coerce.number().default(1),
});

export default async function LeaderBoardReceiverPage({
  params,
  searchParams,
}: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const { handle } = await params;

  const result = querySchema.safeParse(await searchParams);
  if (!result.success) {
    return <div>Invalid query parameters</div>;
  }
  const { page } = result.data;

  const ensNormalized = normalize(handle);
  const { perPage, total, payments } = await fetchPayments(ensNormalized, page);

  const hasMore = total > (page - 1) * perPage + payments.length;

  const avatarUrl = `https://effigy.im/a/${ensNormalized}.svg`;

  let dateTracker = "";

  return (
    <Container pt="0" px="2">
      <AddressHeader ensName={handle} />
      <Card mt="3" variant="classic">
        <Flex px="2" py="2" mb="3" justify="between" align="end">
          <Heading size="4" weight="medium">
            All Payments
          </Heading>
        </Flex>

        <Table.Root style={{ captionSide: "bottom" }} size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell width="50px">Tx</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="150px">
                Date <Text weight="light">(UTC)</Text>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>From</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell align="right">
                Amount
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell align="right">
                Tokens
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {payments.map((row, i) => {
              const txDate = dateFormat(
                new Date(row.blockTimestamp),
                "yyyy-MM-dd",
              );
              const txTime = dateFormat(new Date(row.blockTimestamp), "HH:mm");
              const isSameDate = dateTracker === txDate;
              if (!isSameDate) {
                dateTracker = txDate;
              }
              return (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Link
                      title="Yodl Receipt"
                      target="_blank"
                      href={`https://yodl.me/tx/${row.txHash}`}
                    >
                      {truncateTxHash(row.txHash)}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Text style={{ opacity: isSameDate ? 0.2 : 1 }}>
                      {txDate}
                    </Text>
                    <Text ml="2">{txTime}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Identity
                      ensName={row.senderEnsPrimaryName}
                      address={row.senderAddress}
                    />
                  </Table.Cell>
                  <Table.Cell align="right">
                    ${dnFormatFiat(dn.from(row.tokenOutAmountGross, 2))}
                  </Table.Cell>
                  <Table.Cell align="right">{row.tokenOutSymbol}</Table.Cell>
                </Table.Row>
              );
            })}
            {_.isEmpty(payments) && (
              <Table.Row key="empty">
                <Table.Cell colSpan={4}>
                  <Text style={{ fontStyle: "italic" }}>No payments.</Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
        <Flex pt="3" justify="between">
          <Flex>
            <Button disabled={page === 1} variant="outline" asChild>
              <Link
                href={`/address/${handle}/all?page=${Math.max(1, page - 1)}`}
              >
                Previous
              </Link>
            </Button>
          </Flex>
          <Button disabled={!hasMore} variant="outline" asChild>
            <Link href={`/address/${handle}/all?page=${page + 1}`}>Next</Link>
          </Button>
        </Flex>
      </Card>
    </Container>
  );
}

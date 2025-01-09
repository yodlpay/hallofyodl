import {
  Card,
  Heading,
  Table,
  Container,
  Inset,
  Flex,
  Avatar,
  Text,
  Box,
  Grid,
  Code,
  Link,
  Button,
  Separator,
} from '@radix-ui/themes';
import _ from 'lodash';
import { normalize } from 'viem/ens';
import { format as dateFormat } from "date-fns";
import { fetchLeaderboardReceiving, fetchPayments } from '@/lib/clients/indexerApiClient';
import truncateEthAddress from 'truncate-eth-address';
import { Identity } from '@/app/components/Identity';
import { dnFormatFiat, rankify, truncateTxHash } from '@/app/components/helpers';
import * as dn from 'dnum';

function TableHeader({ title, symbol }: { title: string, symbol: string }) {
  return (
    <Table.Header>
      <Table.Row>
        <Table.ColumnHeaderCell width="20px" align="left">
          🏆
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>{title}</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell align="right">Tx</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell align="right">Total</Table.ColumnHeaderCell>
      </Table.Row>
    </Table.Header>
  );
}


function ScoreCard({ title, value }: { title: string, value: string }) {
  return (
    <Card>
      <Flex justify="center">
        <Heading size="2" weight="medium">{title}</Heading>
      </Flex>
      <Separator mt="2" size="4" />
      <Flex justify="center" pt="3">
        <Heading weight="light">{value}</Heading>
      </Flex>
    </Card>
  );
}

export default async function LeaderBoardReceiverPage({ params }: { params: Promise<any> }) {
  const { handle } = await params;

  const ensNormalized = normalize(handle);
  const { perPage, total, payments } = await fetchPayments(ensNormalized);

  const count = payments.length;
  const totalPaid = _(payments).map(p => p.tokenOutAmountGrossNumber).sum();

  const bySender = _(payments)
    .groupBy('senderAddress')
    .map((group, senderAddress) => ({
      address: senderAddress,
      ensName: _.uniq(group.map(p => p.senderEnsPrimaryName)),
      txCount: group.length,
      totalAmountInUSD: _(group)
        .map(p => p.tokenOutAmountGrossNumber)
        .sum()
    }))
    .orderBy(['totalAmountInUSD'], ['desc'])
    .map((sender, i) => ({
      ...sender,
      rank: i + 1
    }))
    .value();

  const biggestSpender = bySender[0].totalAmountInUSD;
  const mostRecent = _.take(payments, 5);

  const avatarUrl = `https://effigy.im/a/${ensNormalized}.svg`;

  let dateTracker = "";

  return (
    <Container pt="0" px="2" pb="9">
      <Grid columns="1" gap="4">
        <Flex gap="2" align="center" px="2" pt="2" justify="start">
          <Avatar src={avatarUrl} fallback=".." radius="full" size="3" />
          <Box>
            <Text as="div" size="3" weight="regular">
              {ensNormalized}
            </Text>
          </Box>
        </Flex>
        <Grid columns="3" gap="4">
          <ScoreCard title="Payments" value={count.toString()} />
          <ScoreCard title="Total" value={`${dnFormatFiat(dn.from(totalPaid))}`} />
          <ScoreCard title="Biggest Spender" value={dnFormatFiat(dn.from(biggestSpender))} />
        </Grid>
        <Card variant="classic">
          <Flex px="2" py="2" mb="3" justify="between" align="end">
            <Heading size="4" weight="medium">Top Spenders</Heading>
          </Flex>
          <Table.Root style={{ captionSide: 'bottom' }} size="1">
            <TableHeader title="Sender" symbol="💸" />
            <Table.Body>
              {bySender.map((row, i) => {
                const sameRank = bySender[i - 1]?.rank != row.rank;
                return (
                  <Table.Row key={i}>
                    <Table.Cell>{sameRank && rankify(row.rank)}</Table.Cell>
                    <Table.Cell>
                      <Identity
                        ensName={undefined}
                        address={row.address}
                      />
                    </Table.Cell>
                    <Table.Cell align="right">
                      {row.txCount.toString()}
                    </Table.Cell>
                    <Table.Cell align="right">
                      ${dnFormatFiat(dn.from(row.totalAmountInUSD))}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
              {_.isEmpty(bySender) && (
                <Table.Row key="empty">
                  <Table.Cell colSpan={4}>
                    <Text style={{ fontStyle: 'italic' }}>No senders found.</Text>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Card>
        <Card variant="classic">
          <Flex px="2" py="2" mb="3" justify="between" align="end">
            <Heading size="4" weight="medium">Payments</Heading>
          </Flex>
          <Table.Root style={{ captionSide: 'bottom' }} size="1">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell width="50px">Tx</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width="150px">Date <Text weight="light">(UTC)</Text></Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>From</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell align="right">Amount</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell align="right">Tokens</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {
                mostRecent.map((row, i) => {
                  const txDate = dateFormat(new Date(row.blockTimestamp), 'yyyy-MM-dd')
                  const txTime = dateFormat(new Date(row.blockTimestamp), 'HH:mm')
                  const isSameDate = dateTracker === txDate;
                  if (!isSameDate) {
                    dateTracker = txDate;
                  }
                  return (
                    <Table.Row key={i}>
                      <Table.Cell>
                        <Link title="Yodl Receipt" target="_blank" href={`https://yodl.me/tx/${row.txHash}`}>{truncateTxHash(row.txHash)}</Link>
                      </Table.Cell>
                      <Table.Cell>
                        <Text style={{ opacity: isSameDate ? 0.2 : 1 }}>{txDate}</Text>
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
                      <Table.Cell align="right">
                        {row.tokenOutSymbol}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              {_.isEmpty(payments) && (
                <Table.Row key="empty">
                  <Table.Cell colSpan={4}>
                    <Text style={{ fontStyle: 'italic' }}>
                      No payments.
                    </Text>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
          <Flex mt="3" justify="end">
            <Button variant="outline" asChild>
              <Link size="2" href={`/address/${handle}/all`}>View all</Link>
            </Button>
          </Flex>
        </Card>
      </Grid>
    </Container>
  );
}

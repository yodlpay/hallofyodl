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
import { dnFormatFiat, rankify } from '@/app/components/helpers';
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

function TableHeaderPayments({ title, symbol }: { title: string, symbol: string }) {
  return (
    <Table.Header>
      <Table.Row>
        <Table.ColumnHeaderCell>{title}</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell align="right">Date</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell align="right">Amount</Table.ColumnHeaderCell>
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

export default async function LeaderBoardReceiverPage({
  params,
}: {
  params: { handle: string };
}) {
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

  const largest = _(payments)
    .orderBy(['tokenOutAmountGrossNumber'], ['desc'])
    .take(5)
    .value();

  const mostRecent = _.take(payments, 5);

  const avatarUrl = `https://effigy.im/a/${ensNormalized}.svg`;

  return (
    <Container pt="0" px="2">
      <Flex gap="3" align="center" px="2" pt="2" justify="start">
        <Avatar src={avatarUrl} fallback=".." radius="full" size="3" />
        <Box>
          <Text as="div" size="3" weight="regular">
            {ensNormalized}
          </Text>
        </Box>
      </Flex>
      <Grid mt="3" columns="3" gap="3">
        <ScoreCard title="Payments" value={count.toString()} />
        <ScoreCard title="Total" value={`${dnFormatFiat(dn.from(totalPaid))}`} />
        <ScoreCard title="Biggest Spender" value={dnFormatFiat(dn.from(biggestSpender))} />
      </Grid>
      <Card mt="3" variant="classic">
        <Flex px="2" py="2" mb="3" justify="between" align="end">
          <Heading size="4" weight="medium">Top Spenders</Heading>
        </Flex>
        <Table.Root style={{ captionSide: 'bottom' }} size="1">
          <TableHeader title="Top spenders" symbol="💸" />
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
      <Card mt="6" variant="classic">
        <Flex px="2" py="2" mb="3" justify="between" align="end">
          <Heading size="4" weight="medium">Payments</Heading>
        </Flex>
        <Table.Root style={{ captionSide: 'bottom' }} size="1">
          <TableHeaderPayments title="Largest" symbol="💸" />
          <Table.Body>
            {mostRecent.map((row, i) => {
              return (
                <Table.Row key={i}>
                  <Table.Cell>
                    {
                      dateFormat(new Date(row.blockTimestamp), 'yyyy-MM-dd HH:mm')
                    }
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
                </Table.Row>
              );
            })}
            {_.isEmpty(mostRecent) && (
              <Table.Row key="empty">
                <Table.Cell colSpan={4}>
                  <Text style={{ fontStyle: 'italic' }}>
                    No payments yet.
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
    </Container>
  );
}

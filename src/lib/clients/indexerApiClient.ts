import { Address, Hex } from "viem";
import * as dn from "dnum";
const INDEXER_API_URL = process.env.INDEXER_API_URL || "/api";

export type PaymentStats = {
  volumeInUSD: number;
  uniqueWallets: number;
  total: number;
};

export type PaymentSummary = {
  sender: Address;
  senderEnsPrimaryName: Address;
  fundingSource: string;
  invoiceCurrency: string;
  tokenInAddress: Address | undefined;
  tokenOutAddress: Address;
  chainId: number;
  blockTimestamp: string;
  txHash: Hex;
  invoiceAmount: number;
  tokenOutAmountGross: number;
};

export type PaymentPaginate = {
  page: number;
  perPage: number;
  total: number;
  payments: PaymentSimple[];
};

type LeaderboardResponse = {
  bySender: LeaderResultX[];
  largest: PaymentSimple[];
  mostRecent: PaymentSimple[];
};

export type LeaderResultX = {
  address: Address;
  txCount: number;
  totalAmountInUSD: number;
  rank: number;
  latestTimestamp: Date;
};

export type PaymentSimple = {
  chainId: number;
  txHash: string;
  paymentIndex: number;
  blockTimestamp: string;

  tokenOutSymbol: string;
  tokenOutAddress: string;
  tokenOutAmountGross: string;
  tokenOutAmountGrossNumber: number;
  tokenOutAmountGrossDn: dn.Dnum;
  receiverAddress: string;
  receiverEnsPrimaryName: string;
  senderAddress: string;
  senderEnsPrimaryName: string;
};

export async function fetchLeaderboardReceiving(
  ensName: string,
): Promise<LeaderboardResponse> {
  const mostRecentResp = await fetch(
    `${INDEXER_API_URL}/v1/payments?receiverEnsPrimaryName=${ensName}&perPage=10`,
    { next: { revalidate: 10 } },
  );

  const bySenderResp = await fetch(
    `${INDEXER_API_URL}/v1/stats?receiverEnsPrimaryName=${ensName}`,
    { next: { revalidate: 10 } },
  );
  console.log(`${INDEXER_API_URL}/v1/stats?receiverEnsPrimaryName=${ensName}`);

  const largestResp = await fetch(
    `${INDEXER_API_URL}/v1/payments?receiverEnsPrimaryName=${ensName}&sortBy=amountUSD&perPage=10`,
    { next: { revalidate: 10 } },
  );

  const { payments: mostRecent } = await mostRecentResp.json();
  const { payments: largest } = await largestResp.json();
  const { stats: bySender } = await bySenderResp.json();
  console.log(bySenderResp);

  return {
    mostRecent,
    bySender,
    largest,
  };
}

export async function fetchPayments(
  ensName: string,
  page: number = 1,
  orderBy: string = "blockTimestamp",
  perPage: number = 50,
): Promise<PaymentPaginate> {
  const tokenSymbols = "USDC,USDT,USDGLO,DAI,USDM,FRAX,USDC.E,USDT.E,DAI.E";

  const paymentsResp = await fetch(
    `${INDEXER_API_URL}/v1/payments?page=${page}&receiverEnsPrimaryName=${ensName}&sortBy=${orderBy}&tokenOutSymbols=${tokenSymbols}`,
    { next: { revalidate: 10 } },
  );

  const response = (await paymentsResp.json()) as PaymentPaginate;

  response.payments.forEach((p) => {
    p.tokenOutAmountGrossDn = dn.from(p.tokenOutAmountGross, 2);
    p.tokenOutAmountGrossNumber = dn.toNumber(p.tokenOutAmountGrossDn);
  });
  return response;
}

import { Address, Hex, isHex } from "viem";
import * as dn from "dnum";
const INDEXER_API_URL = process.env.INDEXER_API_URL || "/api";

export type PaymentStats = {
  volumeInUSD: number;
  uniqueWallets: number;
  total: number;
};

export type PaymentsPaginationResponse = {
  page: number;
  perPage: number;
  total: number;
  payments: PaymentSimple[];
};

export type PaymentResponse = {
  payment: PaymentSimple;
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

export async function fetchPayments(
  ensName: string,
  page: number = 1,
  orderBy: string = "blockTimestamp",
  perPage: number = 1000,
): Promise<PaymentsPaginationResponse> {
  const tokenSymbols = "USDC,USDT,USDGLO,DAI,USDM,FRAX,USDC.E,USDT.E,DAI.E";

  const url = `${INDEXER_API_URL}/v1/payments?page=${page}&perPage=${perPage}&receiverEnsPrimaryName=${ensName}&sortBy=${orderBy}&tokenOutSymbols=${tokenSymbols}`;
  const options = { next: { revalidate: 10 } };

  const paymentsResp = await fetch(url, options);

  const response = (await paymentsResp.json()) as PaymentsPaginationResponse;

  response.payments.forEach((p) => {
    p.tokenOutAmountGrossDn = dn.from(p.tokenOutAmountGross, 2);
    p.tokenOutAmountGrossNumber = dn.toNumber(p.tokenOutAmountGrossDn);
  });

  return response;
}

export class PaymentNotFoundError extends Error {}

export async function fetchPaymentByTxHash(
  txHash: string,
): Promise<PaymentResponse> {
  if (!isHex(txHash)) {
    throw new Error("Invalid txHash");
  }

  const url = `${INDEXER_API_URL}/v1/payments/${txHash}`;
  const options = { next: { revalidate: 7 * 24 * 3600 } };

  console.log("fetching", url);

  const resp = await fetch(url, options);

  console.log(resp);

  if (!resp.ok) {
    console.log("resp", resp);
    if (resp.status == 404) {
      console.log("Payment not found");
      throw new PaymentNotFoundError();
    }
    throw new Error("Failure");
  }

  const response = await resp.json();

  return response as PaymentResponse;
}

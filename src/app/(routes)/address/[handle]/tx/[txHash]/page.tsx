import CardHeader from "@/app/components/CardHeader";
import { truncateTxHash } from "@/app/components/helpers";
import PaymentCard from "@/app/components/PaymentCard";
import {
  fetchPaymentByTxHash,
  PaymentNotFoundError,
} from "@/lib/clients/indexerApiClient";
import { Card } from "@radix-ui/themes";
import { notFound } from "next/navigation";
import { isHex } from "viem";

type PageParams = {
  handle: string;
  txHash: string;
};

export default async function TxPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { handle, txHash } = await params;

  if (!isHex(txHash)) {
    throw new Error("Invalid txHash");
  }

  let payment;
  try {
    const paymentResp = await fetchPaymentByTxHash(txHash);
    payment = paymentResp.payment;
  } catch (e) {
    if (e instanceof PaymentNotFoundError) {
      console.log("Payment not found");
    }
  }

  if (!payment) {
    notFound();
  }

  return <PaymentCard payment={payment} />;
}

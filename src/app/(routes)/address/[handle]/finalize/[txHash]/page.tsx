import CardHeader from "@/app/components/CardHeader";
import { truncateTxHash } from "@/app/components/helpers";
import PaymentCard from "@/app/components/PaymentCard";
import {
  fetchPaymentByTxHash,
  PaymentNotFoundError,
} from "@/lib/clients/indexerApiClient";
import { getChainById } from "@/lib/clients/web3/helpers";
import {
  Badge,
  Card,
  Code,
  DataList,
  Flex,
  Grid,
  Heading,
  HoverCard,
  Text,
} from "@radix-ui/themes";
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

  return (
    <Grid gap="3">
      <Heading weight="light" style={{ textAlign: "center" }}>
        Thank you
      </Heading>
      <PaymentCard payment={payment} />
    </Grid>
  );
}

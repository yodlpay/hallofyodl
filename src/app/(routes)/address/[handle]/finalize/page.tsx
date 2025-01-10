import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { z } from "zod";

type PageParams = {
  handle: string;
};

const querySchema = z.object({
  txHash: z.string(),
});

/**
 * Simple redirect to the tx page
 *
 * This route uses the default txHash parameters that are added by Yodl redirectUrl handler.
 */
export default async function TxPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<any>;
}) {
  const { handle } = await params;

  const result = querySchema.safeParse(await searchParams);
  if (!result.success) {
    return <div>Invalid txHash</div>;
  }

  const { txHash } = result.data;

  redirect(`/address/${handle}/finalize/${txHash}`);
}

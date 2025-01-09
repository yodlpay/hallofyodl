import { dnFormatFiat } from "@/app/components/helpers";
import { fetchPayments } from "@/lib/clients/indexerApiClient";
import _ from "lodash";
import { ImageResponse } from "next/og";
import truncateEthAddress from "truncate-eth-address";

import * as dn from "dnum";

export const runtime = "edge";

// Image metadata
export const alt = "";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { handle: string };
}) {
  const { handle } = await params;
  const avatarUrl = `https://metadata.ens.domains/mainnet/avatar/${handle}`;

  const { perPage, total, payments } = await fetchPayments(handle);

  const count = payments.length;
  const totalPaid = _(payments)
    .map((p) => p.tokenOutAmountGrossNumber)
    .sum();

  const bySender = _(payments)
    .groupBy("senderAddress")
    .map((group, senderAddress) => ({
      address: senderAddress,
      ensName: _.uniq(group.map((p) => p.senderEnsPrimaryName)),
      txCount: group.length,
      totalAmountInUSD: _(group)
        .map((p) => p.tokenOutAmountGrossNumber)
        .sum(),
    }))
    .orderBy(["totalAmountInUSD"], ["desc"])
    .map((sender, i) => ({
      ...sender,
      rank: i + 1,
    }))
    .take(5)
    .value();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          padding: "20px 40px",
          background: "white",
          flexDirection: "column",
          width: "100%",
          height: 630,
        }}
      >
        <div
          style={{
            height: 80,
            marginTop: 10,
            display: "flex",
            flexDirection: "row",
          }}
        >
          <div style={{ display: "flex", width: 100 }}>
            <img src={avatarUrl} alt={handle} width={80} height={80} />
          </div>
          <div
            style={{
              fontSize: 48,
              background: "white",
              width: "100%",
              display: "flex",
            }}
          >
            {handle}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "row" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 40,
              width: 700,
              height: 400,
              border: "1px solid #eee",
              borderRadius: 10,
              boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <h1
              style={{
                padding: "0px 20px 15px",
                borderBottom: "1px solid #ddd",
              }}
            >
              Hall of Yodl
            </h1>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontFamily: "monospace",
              }}
            >
              {bySender.map((sender) => {
                return (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      borderBottom: "1px solid #eee",
                      padding: 10,
                      fontSize: 24,
                    }}
                  >
                    <div style={{ display: "flex", width: 60, marginLeft: 20 }}>
                      {sender.rank}.
                    </div>
                    <div style={{ display: "flex", width: 400 }}>
                      {truncateEthAddress(sender.address)}
                    </div>
                    <div
                      style={{ display: "flex", width: 200, paddingRight: 10 }}
                    >
                      <div style={{ display: "flex", marginLeft: "auto" }}>
                        ${dnFormatFiat(dn.from(sender.totalAmountInUSD))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 40,
              width: 450,
              height: 400,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 40,
                width: 360,
                height: 150,
                border: "1px solid #eee",
                borderRadius: 10,
                boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
              }}
            >
              <h1
                style={{
                  padding: "0px",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                Payments
              </h1>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  fontSize: 36,
                  fontWeight: "bold",
                }}
              >
                {count}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 40,
                width: 360,
                height: 150,
                border: "1px solid #eee",
                borderRadius: 10,
                boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
              }}
            >
              <h1
                style={{
                  padding: "0px",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                Total
              </h1>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  fontSize: 36,
                  fontWeight: "bold",
                }}
              >
                ${dnFormatFiat(dn.from(totalPaid))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
    },
  );
}

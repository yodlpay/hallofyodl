import * as dn from "dnum";

const rankEmoji = [0, "🥇", "🥈", "🥉"];
export function rankify(rank: number) {
  return rank < 4 ? rankEmoji[rank] : `${rank}.`;
}

export const truncateTxHash = (
  hash: string,
  start: number = 8,
  end: number = 0,
): string => {
  if (hash.length <= 2 * start) {
    return hash;
  }

  if (end == 0) {
    return `${hash.slice(0, start)}...`;
  } else {
    return `${hash.slice(0, start)}...${hash.slice(-end)}`;
  }
};

export const dnFormatFiat = (amount: dn.Dnum) => {
  return dn.format(amount, { trailingZeros: true, digits: 2 });
};

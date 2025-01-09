import { fetchLeaderboardReceiving } from '@/lib/clients/indexerApiClient';

export async function loader({ params }: { params: { handle: string } }) {
  const { handle } = params;
  const { bySender, largest, mostRecent } = await fetchLeaderboardReceiving(handle);
  return { bySender, largest, mostRecent };
}
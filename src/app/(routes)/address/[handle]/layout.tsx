import AddressHeader from "@/app/components/AddressHeader";
import { Container, Grid } from "@radix-ui/themes";

type HandleParams = {
  handle: string;
};

export default async function AddressHandleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<HandleParams>;
}) {
  const { handle } = await params;

  return (
    <Container pt="0" px="2" pb="9">
      <Grid columns="1" gap="4">
        <AddressHeader ensName={handle} />
        {children}
      </Grid>
    </Container>
  );
}

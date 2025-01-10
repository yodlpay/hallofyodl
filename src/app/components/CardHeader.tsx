import { Flex, Heading } from "@radix-ui/themes";

export default function CardHeader({ title }: { title: string }) {
  return (
    <Flex px="2" py="2" mb="3" justify="between" align="end">
      <Heading size="4" weight="medium">
        {title}
      </Heading>
    </Flex>
  );
}

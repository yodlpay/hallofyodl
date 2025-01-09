import { Tooltip, Text, Flex, Code } from '@radix-ui/themes';
import truncateEthAddress from 'truncate-eth-address';
import { Address, isAddress } from 'viem';
import { FC } from 'react';
import _ from 'lodash';

/**
 * HiFi component that displays ensName/address with tooltips etc.
 *
 * @param param0
 * @returns
 */
export const Identity: FC<{
  ensName: string | undefined | null;
  address: Address | string | undefined;
}> = ({ ensName, address }) => {
  if (ensName) {
    const [first, ...rest] = ensName.split('.');

    return (
      <Tooltip content={address}>
        <Text>
          {first}
          {!_.isEmpty(rest) && (
            <Text className="opacity-70">.{rest.join('.')}</Text>
          )}
        </Text>
      </Tooltip>
    );
  }

  if (address && isAddress(address)) {
    return <AddressDisplay address={address as Address} />;
  }

  return null;
};

export const AddressDisplay: FC<{
  address: Address | string | undefined | null;
  fallback?: string;
}> = ({ address, fallback }) => {
  if (!address || !isAddress(address)) {
    return <Text>{fallback}</Text>;
  }

  return (
    <Tooltip content={address}>
      <Code>{truncateEthAddress(address)}</Code>
    </Tooltip>
  );
};

import { UseDisclosureProps } from '@chakra-ui/react';

export function convertDisclosureProps(disclosureProps: UseDisclosureProps) {
  return {
    ...disclosureProps,
    isOpen: disclosureProps.isOpen || false,
    onClose: () => disclosureProps.onClose && disclosureProps.onClose(),
  };
}

import { UseDisclosureProps } from '@chakra-ui/react';

/**
 * Converts isOpen/onClose in object from Chakra's useDisclosure() to non-nulls so the
 * entire object can be passed to a component as props with the spread operator.
 * 
 * @example
 * const disclosure = useDisclosure();
 * ...
 * <Modal {...convertDisclosureProps(disclosure)}> ... </Modal>
 * 
 */
export function convertDisclosureProps(disclosureProps: UseDisclosureProps) {
  return {
    ...disclosureProps,
    isOpen: disclosureProps.isOpen || false,
    onClose: () => disclosureProps.onClose && disclosureProps.onClose(),
  };
}

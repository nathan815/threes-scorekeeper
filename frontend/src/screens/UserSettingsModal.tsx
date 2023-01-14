import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  UseDisclosureProps,
  useToast,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useAuthContext } from 'src/auth/authContext';
import { convertDisclosureProps } from 'src/utils/disclosure';

export function UserSettingsModal({
  modalState,
}: {
  modalState: UseDisclosureProps;
}) {
  const toast = useToast();
  const modal = convertDisclosureProps(modalState);
  const authCtx = useAuthContext();
  const [name, setName] = useState(authCtx?.user?.displayName || '');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!authCtx) return;
    setLoading(true);
    try {
      authCtx.updateUser({ displayName: name });
      modal.onClose();
    } catch (err) {
      console.error('error saving settings', err);
      toast({
        status: 'error',
        description: 'Error saving settings',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal {...modal}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={onSubmit}>
          <ModalHeader>
            <ModalCloseButton />
            Settings
          </ModalHeader>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Display Name</FormLabel>
              <Input
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" colorScheme="blue" isLoading={loading}>
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

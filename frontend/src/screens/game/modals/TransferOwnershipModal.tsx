import {
  Button,
  ButtonGroup,
  Checkbox,
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  UseDisclosureProps,
  useToast,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { GameAugmented, updateGame } from '../../../services/game';
import { convertDisclosureProps } from '../../../utils/disclosure';

export function TransferOwnershipModal(props: {
  game: GameAugmented;
  modalState: UseDisclosureProps;
  onGameUpdate: (game: GameAugmented) => void;
}) {
  const { game, modalState, onGameUpdate } = props;
  const toast = useToast();
  const modal = convertDisclosureProps(modalState);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (modal.isOpen) {
      setSelectedOwner('');
      setConfirmed(false);
    }
  }, [modal.isOpen]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      onGameUpdate(await updateGame(game.shortId, { ownerId: selectedOwner }));
      toast({
        description: 'Game ownership transferred',
        status: 'success',
        position: 'top',
      });
    } catch (err) {
      toast({
        description: 'Error transferring ownership',
        status: 'error',
        position: 'top',
      });
      modal.onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal {...modal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Transfer Ownership
          <ModalCloseButton />
        </ModalHeader>
        <form onSubmit={onSubmit}>
          <ModalBody>
            <FormControl>
              <Select
                placeholder="Select new host..."
                aria-label="Select new host to transfer ownership to"
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
              >
                {game?.players
                  .filter((p) => p.id !== game.owner.id)
                  .map((player) => (
                    <option value={player.id} key={player.id}>
                      {player.displayName}
                    </option>
                  ))}
              </Select>
            </FormControl>
            <FormControl mt={5}>
              <Checkbox
                isChecked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              >
                <Text>
                  I understand I will lose all host capabilities after clicking
                  on "Transfer" below.
                </Text>
              </Checkbox>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button type="button" onClick={modal.onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="red"
                disabled={!confirmed || !selectedOwner || saving}
                isLoading={saving}
              >
                Transfer
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

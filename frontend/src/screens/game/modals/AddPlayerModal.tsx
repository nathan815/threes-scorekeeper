import {
  Alert,
  AlertIcon,
  Button,
  ButtonGroup,
  FormControl,
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
import { IoPersonAdd } from 'react-icons/io5';
import {
  addPlayerManually,
  GameAugmented,
  updateGame,
} from 'src/services/game';
import { convertDisclosureProps } from 'src/utils/disclosure';

export function AddPlayerModal(props: {
  game: GameAugmented;
  modalState: UseDisclosureProps;
  onGameUpdate: (game: GameAugmented) => void;
}) {
  const { game, modalState, onGameUpdate } = props;
  const toast = useToast();
  const modal = convertDisclosureProps(modalState);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await addPlayerManually(game.shortId, name);
      if (updated) {
        onGameUpdate(updated);
      }
      toast({
        description: 'Added player',
        status: 'success',
        position: 'top',
        duration: 2000,
      });
      modal.onClose();
    } catch (error) {
      toast({
        description: `${error.message ? error.message : error}`,
        status: 'error',
        position: 'top',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal {...modal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Add Player Manually
          <ModalCloseButton />
        </ModalHeader>
        <form onSubmit={onSubmit}>
          <ModalBody>
            <Alert status="info" borderRadius={5}>
              <AlertIcon />
              Players added manually cannot join from their device or save this
              game to their account.
            </Alert>
            <FormControl mt={5}>
              <Input
                placeholder="New Player Name"
                size="lg"
                aria-label="Enter play name"
                required
                minLength={3}
                maxLength={15}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus={true}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button type="button" onClick={modal.onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                leftIcon={<IoPersonAdd />}
                colorScheme="blue"
                isLoading={saving}
              >
                Add Player
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

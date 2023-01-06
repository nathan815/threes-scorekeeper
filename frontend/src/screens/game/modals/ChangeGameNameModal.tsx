import {
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
  Input,
  Link,
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
import React, { useEffect, useState } from 'react';
import { generateGameName } from 'src/utils/general';
import { GameAugmented, updateGame } from '../../../services/game';
import { convertDisclosureProps } from '../../../utils/disclosure';

export function ChangeGameNameModal(props: {
  game: GameAugmented;
  modalState: UseDisclosureProps;
  onGameUpdate: (game: GameAugmented) => void;
}) {
  const { game, modalState, onGameUpdate } = props;
  const toast = useToast();
  const modal = convertDisclosureProps(modalState);
  const [name, setName] = useState(game.name);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (modal.isOpen) {
      setName(game.name);
    }
  }, [modal.isOpen, game.name]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await updateGame(game.shortId, { name: name });
      if (updated) {
        onGameUpdate(updated);
      }
      toast({
        description: 'Saved changes',
        status: 'success',
        position: 'top',
        duration: 2000,
      });
      modal.onClose();
    } catch (error) {
      toast({ description: `${error}`, position: 'top' });
    } finally {
      setSaving(false);
    }
  };

  const handleClickGenerateName = (e) => {
    e.preventDefault();
    setName(generateGameName);
  };

  return (
    <Modal {...modal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Name
          <ModalCloseButton />
        </ModalHeader>
        <form onSubmit={onSubmit}>
          <ModalBody>
            <FormControl>
              <Input
                placeholder="Game Name"
                required
                size="lg"
                aria-label="Select new host to transfer ownership to"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus={true}
              />
              <FormHelperText>
                <Link href="#" onClick={handleClickGenerateName}>
                  Generate a random name
                </Link>
              </FormHelperText>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button type="button" onClick={modal.onClose}>
                Cancel
              </Button>
              <Button type="submit" colorScheme="blue" isLoading={saving}>
                Save
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

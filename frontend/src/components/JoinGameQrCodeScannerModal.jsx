import { useToast, Modal, ModalOverlay, ModalCloseButton, ModalContent, Button } from "@chakra-ui/react";
import { QrCodeScanner } from "./QrCodeScanner";

export function JoinGameQrCodeScannerModal({ isOpen, onClose, onScanJoinCode }) {
  const toast = useToast();
  const toastId = 'qr-code-scanner-toast';

  function showError({ title, msg }) {
    if (!toast.isActive(toastId)) {
      toast({
        id: toastId,
        title,
        description: msg,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  }

  const handleScan = (data) => {
    // console.log(data);
    let foundCode = false;
    try {
      const url = new URL(data);
      // Join game URL will be like: example.com/join/123456
      if (url.hostname === window.location.host) {
        const parts = url.pathname.split('/').filter((p) => p !== '');
        if (parts.length >= 2 && parts[0] === 'join') {
          onScanJoinCode(parts[1]);
          onClose();
          foundCode = true;
        }
      }
    } catch {}

    if (!foundCode) {
      showError({
        title: 'Unknown QR code',
        msg: 'The QR code scanned does not appear to be for this app.',
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalCloseButton />
      <ModalContent>
        <QrCodeScanner
          onScanSuccess={handleScan}
          onStartError={(err) =>
            showError({ title: 'Unknown error', msg: `${err}` })
          }
          onPermissionsError={() => {
            showError({
              title: 'Unable to open QR scanner',
              msg: 'Camera permission was denied.',
            });
            onClose();
          }}
        />
        <Button position="fixed" bottom={15} right={15} onClick={onClose}>
          Cancel
        </Button>
      </ModalContent>
    </Modal>
  );
}

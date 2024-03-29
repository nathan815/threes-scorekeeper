import {
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  Button,
  Toast,
  LightMode,
  useBreakpointValue,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { QrCodeScanner } from './QrCodeScanner';

export function JoinGameQrCodeScannerModal({
  isOpen,
  onClose,
  onScanJoinCode,
}) {
  const toast = useToast({
    render: (props) => (
      <LightMode>
        {' '}
        <Toast {...props} />
      </LightMode>
    ),
  });
  const toastId = 'qr-code-scanner-toast';
  const size = useBreakpointValue({ lg: 'lg', base: 'full' });

  useEffect(() => {
    function onResize() {
      onClose();
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [onClose]);

  function showError({ title, msg }) {
    if (!toast.isActive(toastId)) {
      toast({
        id: toastId,
        title,
        description: msg,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  }

  function handleScan(data) {
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
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size}>
      <ModalOverlay />
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

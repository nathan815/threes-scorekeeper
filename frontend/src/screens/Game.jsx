import { Stack, Heading, Box } from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import { useParams } from 'react-router-dom';
import { LogoHeader } from '../components/LogoHeader';

export function GameScreen() {
  const { gameId } = useParams();
  const qrCodeUrl = `${window.location.origin}/join/${gameId}`;
  return (
    <Stack align="flex-start" alignItems="center">
      <LogoHeader width={200} />
      <Heading>{gameId}</Heading>
      <Box padding={5} bg="white">
        <QRCode value={qrCodeUrl} />
      </Box>
    </Stack>
  );
}

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Stack,
  Text,
} from '@chakra-ui/react';
import { LogoHeader } from '../components/LogoHeader';
import { HomeButtons } from './Home';

export function PageNotFound() {
  return (
    <Stack
      spacing={10}
      justifyContent="start"
      alignItems="center"
      paddingBottom={10}
    >
      <LogoHeader />
      <Box>
        <Alert status="error" borderRadius={5}>
          <Stack spacing={1} alignItems="center">
            <AlertIcon />
            <AlertTitle>Page Not Found</AlertTitle>
            <AlertDescription>
              <Text>
                This page was not found. Try joining or creating a game?
              </Text>{' '}
            </AlertDescription>
          </Stack>
        </Alert>
      </Box>
      <HomeButtons />
    </Stack>
  );
}

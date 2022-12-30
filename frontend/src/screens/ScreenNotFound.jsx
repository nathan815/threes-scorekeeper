import { Heading, Stack, Text } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { LogoHeader } from '../components/LogoHeader';

export function ScreenNotFound() {
  const location = useLocation();
  return (
    <Stack
      spacing={10}
      justifyContent="start"
      alignContent="center"
      alignItems="center"
      minHeight="100%"
      paddingBottom={10}
    >
      <LogoHeader />
      <Heading mt={50}>Page Not Found</Heading>
      <Text>
        Oops, I couldn't find <code>{location.pathname}</code>
      </Text>
    </Stack>
  );
}

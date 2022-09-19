import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  GridItem,
  Heading,
  Input,
  Link,
  SimpleGrid,
  Stack,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { IoArrowForward } from 'react-icons/io5';
import InternalLink from '../components/InternalLink';
import config from '../config';

export default function JoinTable() {
  const bg = useColorModeValue('whiteAlpha.900', 'blackAlpha.100');
  return (
    <Flex
      justifyContent="center"
      direction="column"
      alignItems="center"
      marginTop={20}
    >
      <Heading>{config.appName}</Heading>
      <Box bg={bg} padding={10} borderRadius={10} maxWidth={600} marginTop={20}>
        <Heading size="lg">Join a table</Heading>
        <br />
        <Stack spacing={5}>
          <FormControl isRequired>
            <FormLabel htmlFor="display-name">
              Hi there! What's your name?
            </FormLabel>
            <Input id="display-name" placeholder="Your Name" size="lg" />
            <FormHelperText>
              To save your game history,{' '}
              <InternalLink to="/login">sign in or create account</InternalLink>
            </FormHelperText>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Which table are you joining?</FormLabel>
            <Input id="first-name" placeholder="Table ID" size="lg" />
            <FormHelperText>
              Tip: You can scan the host's QR code to join the table!
            </FormHelperText>
          </FormControl>
        </Stack>
        <Button
          mt={4}
          colorScheme="green"
          isLoading={false}
          type="submit"
          size="lg"
          rightIcon={<IoArrowForward />}
        >
          Join
        </Button>
      </Box>
    </Flex>
  );
}

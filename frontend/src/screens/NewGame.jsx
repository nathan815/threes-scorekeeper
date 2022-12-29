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
import { LogoHeader } from '../components/LogoHeader';
import config from '../config';

export function NewGame() {
  const bg = useColorModeValue('whiteAlpha.900', 'blackAlpha.100');
  return (
    <Stack
      justifyContent="start"
      alignContent="center"
      alignItems="center"
      minHeight="100%"
      paddingBottom={10}
    >
      <LogoHeader width={200} />

      <Box bg={bg} padding={10} borderRadius={10} maxWidth={600}>
        <Heading size="lg">New game</Heading>
        <br />
        <Stack spacing={5}>
          <FormControl isRequired>
            <FormLabel htmlFor="display-name">Hello! What is your name?</FormLabel>
            <Input id="display-name" placeholder="Your Name" size="lg" />
            <FormHelperText>
              To save your game history,{' '}
              <InternalLink to="/login">sign in or create account</InternalLink>
            </FormHelperText>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Name for this game</FormLabel>
            <Input placeholder="Game Name" size="lg" autoComplete="off" autoCorrect="off"/>
            <FormHelperText>
              Can't think of anything? <Link href="">Generate a name</Link>
            </FormHelperText>
          </FormControl>
        </Stack>
        <Button
          mt={4}
          variant="black"
          isLoading={false}
          type="submit"
          size="lg"
          rightIcon={<IoArrowForward />}
        >
          Create
        </Button>
      </Box>
    </Stack>
  );
}

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
} from '@chakra-ui/react';
import { IoArrowForward } from 'react-icons/io5';
import InternalLink from '../components/InternalLink';

export default function JoinTable() {
  return (
    <SimpleGrid columns={3} spacing={1}>
      <GridItem colSpan={{ sm: 3, md: 2 }}>
        <Heading>Join a table</Heading>
        <br />
        <Stack spacing={5}>
          <FormControl isRequired>
            <FormLabel htmlFor="display-name">
              Hi there! What's your name?
            </FormLabel>
            <Input id="display-name" placeholder="Your Name" size="lg" />
            <FormHelperText>
              To save your game history, <InternalLink to="/login">sign in or create account</InternalLink>
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
          colorScheme="teal"
          isLoading={false}
          type="submit"
          size="lg"
          rightIcon={<IoArrowForward />}
        >
          Join
        </Button>
      </GridItem>
      <GridItem colSpan={1}></GridItem>
    </SimpleGrid>
  );
}

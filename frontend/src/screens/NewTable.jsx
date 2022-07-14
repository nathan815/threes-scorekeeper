import {
  Box,
  Button,
  FormControl,
  FormLabel,
  GridItem,
  Heading,
  Input,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import { IoArrowForward } from "react-icons/io5";

export default function NewTable() {
  return (
    <SimpleGrid columns={3} spacing={1}>
      <GridItem colSpan={2}>
        <Heading>Create a new table</Heading>
        <br />
        <Stack spacing={5}>
          <FormControl isRequired>
            <FormLabel htmlFor="display-name">Hi there! What's your name?</FormLabel>
            <Input id="display-name" placeholder="Your Name" size="lg" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Give this table a name</FormLabel>
            <Input id="first-name" placeholder="Table Name" size="lg" />
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
          Create
        </Button>
      </GridItem>
      <GridItem colSpan={1}></GridItem>
    </SimpleGrid>
  );
}

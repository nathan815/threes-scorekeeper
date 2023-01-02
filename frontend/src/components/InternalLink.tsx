import React from 'react';
import {
  Link as ChakraLink,
  LinkProps as ChakraLinkProps,
} from '@chakra-ui/react';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from 'react-router-dom';

export default function InternalLink(props: ChakraLinkProps & RouterLinkProps) {
  return <ChakraLink as={RouterLink} {...props} />;
}

InternalLink.propTypes = ChakraLink.propTypes;

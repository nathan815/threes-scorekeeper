import React from "react";
import { Link as ChakraLink, LinkProps as ChakraLinkProps } from "@chakra-ui/react";
import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router-dom";

/**
 * @param {ChakraLinkProps & RouterLinkProps} props
 */
export default function InternalLink(props) {
  return <ChakraLink as={RouterLink} {...props} />;
}

InternalLink.propTypes = ChakraLink.propTypes;

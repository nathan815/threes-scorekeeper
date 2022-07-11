import React from "react";
import { Link as ChakraLink, LinkProps } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

/**
 * @arg {LinkProps} props
 */
export default function Link(props) {
  return <ChakraLink as={RouterLink} {...props} />;
}

Link.propTypes = ChakraLink.propTypes;

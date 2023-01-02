import { Box, Image, useColorMode } from '@chakra-ui/react';
import React, { Link } from 'react-router-dom';
import logo from '../assets/images/logo_transparent.png';
import logoDark from '../assets/images/logo_transparent_dark.png';

export function LogoHeader(props) {
  const width = props.width || 250;
  const { colorMode } = useColorMode();
  const ratio = 100 / 94.73;
  return (
    <Box mt={10} width={width} height={width * ratio} {...props}>
      <Link to="/">
        <Image
          display={colorMode === 'light' ? 'visible' : 'none'}
          src={logo}
          width="100%"
        />
        <Image
          display={colorMode === 'dark' ? 'visible' : 'none'}
          src={logoDark}
          width="100%"
        />
      </Link>
    </Box>
  );
}

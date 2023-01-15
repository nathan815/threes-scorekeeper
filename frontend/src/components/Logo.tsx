import { Box, Image, ImageProps, useColorMode } from '@chakra-ui/react';
import React, { Link } from 'react-router-dom';
import logo from '../assets/images/logo_transparent.png';
import logoDark from '../assets/images/logo_transparent_dark.png';

export function Logo(props: { forceColorMode?: string } & ImageProps) {
  const { forceColorMode, ...restProps } = props;
  const { colorMode } = useColorMode();
  const effectiveColorMode = forceColorMode || colorMode;
  const showLight = effectiveColorMode === 'light';
  const showDark = effectiveColorMode === 'dark';
  return (
    <>
      <Image
        display={showLight ? 'block' : 'none'}
        src={logo}
        width="100%"
        {...restProps}
      />
      <Image
        display={showDark ? 'block' : 'none'}
        src={logoDark}
        width="100%"
        {...restProps}
      />
    </>
  );
}

export function LogoHeader(props) {
  const width = props.width || 250;
  const ratio = 100 / 94.73;
  return (
    <Box mt={10} width={width} height={width * ratio} {...props}>
      <Link to="/">
        <Logo />
      </Link>
    </Box>
  );
}

import { Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

export function GameScreen() {
  const { gameId } = useParams();
  return <Text>{gameId}</Text>;
}

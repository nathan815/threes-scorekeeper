import generateName from 'project-name-generator';

export function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export function generateGameName() {
  return generateName({ words: 2 })
    .raw.map((w) => w.toString())
    .map((w) => w.charAt(0).toUpperCase() + w.substring(1))
    .join(' ');
}

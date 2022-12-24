import ShortUniqueId from "short-unique-id";

const generator = new ShortUniqueId({
  dictionary: 'alphanum_upper',
  length: 6,
});

export function generateJoinCode() {
  return generator.randomUUID();
}

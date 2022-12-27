import ShortUniqueId from "short-unique-id";

const generator = new ShortUniqueId({
  dictionary: 'alphanum_upper',
  length: 6,
});

export function generateShortId() {
  return generator.randomUUID();
}

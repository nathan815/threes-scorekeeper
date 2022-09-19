import ShortUniqueId from 'short-unique-id';
import { GameTableEntity } from './data/gameTable';

const tableShortIdGenerator = new ShortUniqueId({
  dictionary: 'alphanum_upper',
  length: 6,
});

export async function createTable({ name, createdBy }) {
  const shortId = tableShortIdGenerator.randomUUID();
  const table = GameTableEntity.newInstance({
    name,
    shortId,
    createdBy,
    host: createdBy,
  });
  await table.save();
  return table;
}

export async function getTables() {
  return (await GameTableEntity.Model.find().exec()).map((r) => r.toDomain());
}

export async function getTable(id) {
  return GameTableEntity.Model.findById(id);
}

export async function getTableByShortId(id) {
  return GameTableEntity.Model.findOne({ shortId: id });
}

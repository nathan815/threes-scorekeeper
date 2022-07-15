import { User, Room, Game } from './models.js';

async function createRoom({ name, createdBy }) {
  const room = new Room({ name, createdBy });
  await room.save();
  return room;
}

async function getRooms() {
  return Room.find();
}

async function getRoom(id) {
  return Room.findById(id);
}

export default { createRoom, getRoom, getRooms };

import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  displayName: { type: String, required: true },
  isAnonymous: { type: Boolean, required: true },
  email: String,
});
export const User = mongoose.model('User', userSchema);

const roomSchema = new Schema({
  name: String,
  shortId: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  games: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
});
export const Room = mongoose.model('Room', roomSchema);

const gameSchema = new Schema({
  room: { type: Schema.Types.ObjectId, ref: 'Room' },
});
export const Game = mongoose.model('Game', gameSchema);

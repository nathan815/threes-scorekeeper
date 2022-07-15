import { User } from './models.js';

function getUser(id) {
  return User.findById(id).exec();
}

function createAnonymousUser({ displayName }) {
  const user = new User({
    displayName: displayName,
    isAnonymous: true,
  });
  return user.save();
}

export default { getUser };

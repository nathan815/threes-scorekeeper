import { UserEntity } from './data/user';
import { User } from './domain/User';
import { generateSecret } from './utils/generateSecret';

export async function getUser(id: string) {
  const user = await UserEntity.Model.findById(id).exec();
  return user?.toDomain();
}

export async function checkGuestUserSecret(
  id: string,
  secret: string
): Promise<User> {
  const user = await UserEntity.Model.findOne({
    id: id,
    guestSecret: secret,
  }).exec();
  return user?.toDomain();
}

export async function createGuestUser({ displayName }): Promise<User> {
  const secret = await generateSecret();
  let user = UserEntity.newInstance({
    displayName: displayName,
    guestSecret: secret,
  });
  user.save();
  return user.toDomain();
}

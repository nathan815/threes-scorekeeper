import { User } from './user.model';

export interface UserPublicDto {
  id?: string;
  displayName?: string;
  isGuest: boolean;
}

export interface UserPrivateDto extends UserPublicDto {
  email?: string;
}

export function userToDto(user: User): UserPublicDto {
  const { id, displayName, isAnon } = user;
  return { id, displayName, isGuest: isAnon };
}

export function userToPrivateDto(user: User): UserPrivateDto {
  const { email } = user;
  return { ...userToDto(user), email };
}

import { User } from "./user.model";

export interface UserPublicDto {
  id?: string;
  displayName?: string;
}

export interface UserPrivateDto extends UserPublicDto {
  email?: string;
}

export function userToDto(user: User): UserPublicDto {
  const { id, displayName } = user;
  return { id, displayName };
}

export function userToPrivateDto(user: User): UserPrivateDto {
  const { email } = user;
  return { ...userToDto(user), email };
}

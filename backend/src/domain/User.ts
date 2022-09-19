export class User {
  public constructor(obj: Partial<User>) {
    Object.assign(this, obj);
  }

  id: string;
  displayName: string;
  guestSecret: string;
  email: string;

  get isAnon(): boolean {
    return Boolean(this.guestSecret);
  }
}

interface UserPublicDto {
  id: string;
  displayName: string;
}

interface UserPrivateDto extends UserPublicDto {
  email: string;
}

export function userToDto(user: User): UserPublicDto {
  const { id, displayName } = user;
  return { id, displayName };
}

export function userToPrivateDto(user: User): UserPrivateDto {
  const { email } = user;
  return { ...userToDto(user), email };
}

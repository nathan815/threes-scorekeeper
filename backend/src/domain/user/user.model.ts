import crypto from 'crypto';

export class User {
  public constructor(obj: Partial<User>) {
    this.id = obj.id!;
    Object.assign(this, obj);
  }

  id: string;
  displayName?: string;
  guestSecret?: string;
  email?: string;

  get isAnon(): boolean {
    return Boolean(this.guestSecret);
  }

  get gravatarHash(): string {
    return crypto.createHash('md5').update(this.email || this.id).digest('hex');
  }
}

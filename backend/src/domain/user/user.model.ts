import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

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
    return crypto
      .createHash('md5')
      .update(this.email || this.id)
      .digest('hex');
  }
}

export class PseudoUser {
  constructor(public id: string, public displayName: string) {}

  get gravatarHash(): string {
    return crypto
      .createHash('md5')
      .update(this.displayName || '')
      .digest('hex');
  }

  /**
   * Creates a PseudoUser instance with auto-generated UUID
   */
  static make(displayName: string): PseudoUser {
    return new PseudoUser(uuidv4(), displayName);
  }
}

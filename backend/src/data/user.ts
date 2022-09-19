import { getModelForClass, prop } from '@typegoose/typegoose';
import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import mongoose from 'mongoose';
import { User } from '../domain/User';

export class UserEntity implements Base {
  public static Model = getModelForClass(UserEntity, {
    options: {
      customName: 'User',
    },
  });

  _id: mongoose.Types.ObjectId;
  id: string;

  public static newInstance(data: Partial<UserEntity>) {
    return new this.Model(data);
  }

  @prop()
  public displayName: string;

  @prop()
  public guestSecret: string;

  @prop()
  public email: string;

  public toDomain(): User {
    return new User({
      id: this._id.toString(),
      displayName: this.displayName,
      guestSecret: this.guestSecret,
      email: this.email,
    });
  }
}

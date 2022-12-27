import mongoose from 'mongoose';
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { User } from '../domain/user/user.model';
import { UserRepository } from '../domain/user/user.repository';

@modelOptions({ options: { customName: 'users' } })
export class UserEntity extends TimeStamps {
  @prop()
  _id?: mongoose.Types.ObjectId;

  @prop()
  displayName?: string;

  @prop()
  guestSecret?: string;

  @prop()
  email?: string;

  toDomain(): User {
    const user = new User({ id: this._id?.toString() });
    user.guestSecret = this.guestSecret;
    user.displayName = this.displayName;
    user.email = this.email;
    return user;
  }

  static fromDomain(user: User): UserEntity {
    const ent = new UserEntity();
    ent._id = user.id
      ? new mongoose.Types.ObjectId(user.id)
      : new mongoose.Types.ObjectId();
    ent.displayName = user.displayName;
    ent.guestSecret = user.guestSecret;
    ent.email = user.email;
    return ent;
  }
}

export const UserDbModel = getModelForClass(UserEntity);

export class UserRepositoryMongo implements UserRepository {
  async getById(id: string): Promise<User | undefined> {
    const ent = await UserDbModel.findById(new mongoose.Types.ObjectId(id));
    return ent?.toDomain();
  }

  async save(user: User): Promise<User> {
    const ent = await UserDbModel.create(UserEntity.fromDomain(user));
    const savedEnt = await ent.save();
    // console.log('ent', ent, 'saved', savedEnt);
    return savedEnt.toDomain();
  }
}

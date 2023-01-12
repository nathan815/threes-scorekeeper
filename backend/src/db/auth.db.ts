import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import mongoose from "mongoose";
import { Profile } from "passport-google-oauth20";
import { UserSchema } from "./user.db";

@modelOptions({ options: { customName: 'federated_credentials' } })
class FederatedCredentialsSchema extends TimeStamps {
  @prop()
  _id!: mongoose.Types.ObjectId;

  @prop({ ref: UserSchema, autopopulate: true })
  user: Ref<UserSchema>;

  @prop()
  subject!: string;

  @prop()
  provider!: 'google';

  @prop()
  profile!: Profile

}

export const FederatedCredentialsDbModel = getModelForClass(FederatedCredentialsSchema);

import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import mongoose, { RefType } from 'mongoose';

export class BaseEntity<IDType extends RefType = mongoose.Types.ObjectId>
  implements Base<IDType>
{
  _id: IDType;
  id: string;
}

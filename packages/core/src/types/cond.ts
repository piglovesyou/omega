export type TPrimitive = string | number | boolean | null | undefined;

export type ComparatorCond = Partial<{
  $in: TPrimitive[];
  $nin: TPrimitive[];
  $eq: TPrimitive;
  $ne: TPrimitive;
}>;
export type MixedCond = Partial<{
  $required: TPrimitive;
}> &
  ComparatorCond;

export type CondForString = Partial<{
  $gte: number;
  $lte: number;
  $length: number;
}> &
  MixedCond;

export type CondForNumber = Partial<{
  $gt: number;
  $gte: number;
  $lt: number;
  $lte: number;
  $integer: boolean;
}> &
  MixedCond;

export type CondForDate = Partial<{
  $gte: string;
  $lte: string;
}> &
  MixedCond;

export type CondForTypes = CondForString & CondForNumber & CondForDate;

export type NestCond = Partial<{
  $and: Cond;
  $or: Cond;
  $not: Cond;
}>;

export type Cond = NestCond | CondForString | CondForNumber | CondForDate;

export type CondRoot = {
  [field_id: string]: Cond;
};

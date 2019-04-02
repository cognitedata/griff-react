import { ItemId, Domain } from './external';

export interface Item {
  id: ItemId;
  color?: string;
  timeDomain?: Domain;
  timeSubDomain?: Domain;
  xDomain?: Domain;
  xSubDomain?: Domain;
  yDomain?: Domain;
  ySubDomain?: Domain;
}

export interface SizeProps {
  width: number;
  height: number;
}

export interface ItemIdMap<T> {
  [itemId: string]: T;
}

import { ItemId, Domain } from './external';

export interface Item {
  id: ItemId;
  timeDomain: Domain;
  timeSubDomain: Domain;
  xDomain: Domain;
  xSubDomain: Domain;
  yDomain: Domain;
  ySubDomain: Domain;
}

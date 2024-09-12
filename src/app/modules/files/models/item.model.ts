import { ACCESS_TYPES } from '@app/shared/constants/constants';

export interface ItemList {
  name: string;
  type: string;
  id: string;
  icon: string;
  code: string;
  accessType: ACCESS_TYPES;
}

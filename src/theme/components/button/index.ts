import { mergeDeepLeft, reduce, unapply } from 'ramda';
import { ButtonComponent } from './Button';

export const button = unapply(reduce(mergeDeepLeft, {}))(ButtonComponent);

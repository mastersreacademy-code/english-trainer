export function recoveryMessage(status){
 switch(status){
  case 'pending':return 'A review was recovered on this device but is not yet saved online. Retry when connected.';
  case 'conflict':return 'The online progress changed since this review was saved locally. The local draft has been kept; nothing was overwritten.';
  case 'invalid':return 'The saved review draft could not be read. Online progress has not been changed.';
  default:return '';
 }
}

import { cookies, headers } from 'next/headers';
import * as ipaddrjs from 'ipaddr.js';

export const isInstanceInsecure = () => {
  const cookieStore = cookies();
  const isInsecureBannerHidden = cookieStore.get('hide-insecure-instance')?.value;

  if (isInsecureBannerHidden) {
    return false;
  }

  const myHeaders = headers();
  const ip = myHeaders.get('x-forwarded-host')?.split(':')[0] || '';

  if (ipaddrjs.isValid(ip)) {
    const range = ipaddrjs.parse(ip!).range();
    if (range !== 'private' && range !== 'carrierGradeNat' && range !== 'loopback') {
      return true;
    }
  } else if (ip !== 'localhost' && myHeaders.get('x-forwarded-proto') === 'http') {
    return true;
  }

  return false;
};

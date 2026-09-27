import { v4 as uuidv4 } from 'uuid';

/** Generate unique booking reference code */
export const generateBookingCode = () => {
  const short = uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `FLYXO-${short}`;
};

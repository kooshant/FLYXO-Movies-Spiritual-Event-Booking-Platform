import { useState } from 'react';
import { getEventBanner } from '../../utils/eventImages';

export default function EventBannerImage({ event, className = '', height = 'h-48' }) {
  const [imgSrc, setImgSrc] = useState(() => getEventBanner(event));

  return (
    <img
      src={imgSrc}
      alt={event?.title || 'Event'}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setImgSrc(getEventBanner(event, true))}
      className={`w-full object-cover ${height} ${className}`}
    />
  );
}

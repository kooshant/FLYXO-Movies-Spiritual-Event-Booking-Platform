import prisma from '../config/db.js';

/** Generate seat grid for an event (cinema-style layout) */
export const generateSeatsForEvent = async (eventId, totalSeats, rows = 8) => {
  const seatsPerRow = Math.ceil(totalSeats / rows);
  const rowLabels = 'ABCDEFGHIJKLMNOP'.split('');
  const seats = [];

  let count = 0;
  for (let r = 0; r < rows && count < totalSeats; r++) {
    for (let n = 1; n <= seatsPerRow && count < totalSeats; n++) {
      const row = rowLabels[r];
      seats.push({
        eventId,
        row,
        number: n,
        label: `${row}${n}`,
        isBooked: false,
      });
      count++;
    }
  }

  await prisma.seat.createMany({ data: seats });
  return seats.length;
};

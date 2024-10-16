export const parseDateString = (dateString) => {
  const monthMapping = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };

  if (dateString.includes("-")) {
    const [start] = dateString.split("-").map((part) => part.trim());
    const [month, day, year] = start.split(" ");
    return new Date(year, monthMapping[month], day);
  } else if (dateString.includes(",")) {
    const [firstPart] = dateString.split(",").map((part) => part.trim());
    const [month, day, year] = firstPart.split(" ");
    return new Date(year, monthMapping[month], day);
  } else {
    const [month, year] = dateString.split(" ");
    return new Date(year, monthMapping[month], 1);
  }
};

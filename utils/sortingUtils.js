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
    const formatLength = dateString.split(" ").length;

    if (formatLength === 3) {
      const [month, day, year] = dateString.split(" ");
      return new Date(year, monthMapping[month], day);
    } else if (formatLength === 2) {
      const [month, year] = dateString.split(" ");
      return new Date(year, monthMapping[month], 31);
    } else {
      const [month, year] = dateString.split(" ");
      return new Date(year, monthMapping[month], 1);
    }
  }
};

export const recalculateBalances = (data) => {
  const roundUpToTwoDecimalPlaces = (num) => {
    return Math.ceil(num * 100) / 100;
  };

  let previousBalance = {
    vacation: roundUpToTwoDecimalPlaces(parseFloat(data[0].vacation_balance)), // Start with the first row's balance
    sick: roundUpToTwoDecimalPlaces(parseFloat(data[0].sick_balance)),
    CTO: roundUpToTwoDecimalPlaces(parseFloat(data[0].CTO_balance)),
  };

  return data.map((row, index) => {
    if (index === 0) {
      return row;
    }

    const newRow = { ...row };

    previousBalance.vacation = roundUpToTwoDecimalPlaces(
      previousBalance.vacation +
        row.vacation_earned -
        row.vacation_AUpay -
        row.vacation_AUwopay
    );
    newRow.vacation_balance = previousBalance.vacation;

    previousBalance.sick = roundUpToTwoDecimalPlaces(
      previousBalance.sick + row.sick_earned - row.sick_AUpay - row.sick_AUwopay
    );
    newRow.sick_balance = previousBalance.sick;

    previousBalance.CTO = roundUpToTwoDecimalPlaces(
      previousBalance.CTO + row.CTO_earned - row.CTO_consumed
    );
    newRow.CTO_balance = previousBalance.CTO;

    return newRow;
  });
};

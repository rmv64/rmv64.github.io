function isWeekDay(date) {
  return date.getDay() >= 1 && date.getDay() <= 5;
}

function isWeekend(date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

function isSaturday(date) {
  return date.getDay() === 6;
}

function isSunday(date) {
  return date.getDay() === 0;
}

function isHoliday(date, schedule) {
  const holidayDates = Object.values(schedule.special_dates).map((dateRange) => {
    const [start, end] = dateRange.split(" - ");
    return { start: new Date(start), end: new Date(end) };
  });

  return holidayDates.some((holiday) => {
    return date >= holiday.start && date <= holiday.end;
  });
}

function getNextBusTime(now, times) {
  //   create list of times
  const extendedTimes = Object.entries(times).flatMap(([hour, minutes]) =>
    minutes.map((minute) => `${hour}:${minute}`)
  );

  for (const time of extendedTimes) {
    const [hours, minutes] = time.split(":").map(Number);
    const nextTime = new Date(now);
    nextTime.setHours(hours, minutes, 0, 0);
    if (nextTime > now) {
      return nextTime;
    }
  }
}

// Function to calculate the countdown and update the UI
function updateCountdown(schedule) {
  var times = schedule.stops[0].times;
  //   console.log(times);
  const now = new Date();
  if (isWeekDay(now) && isHoliday(now, schedule)) {
    update(now, times["Mon-Fri (Holidays)"]);
  } else if (isWeekDay(now)) {
    update(now, times["Mon-Fri (School)"]);
  } else if (isWeekend(now) && isSaturday(now)) {
    update(now, times["Saturday"]);
  } else if (isWeekend(now) && isSunday(now)) {
    update(now, times["Sunday"]);
  }
}

function update(now, schedule) {
  const nextBusTime = getNextBusTime(now, schedule);

  const timeDiff = nextBusTime - now;
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  const countdownElement = document.getElementById("countdown");

  // if time difference is greater than 3.5 minutes add far class to countdown
  if (timeDiff > 210000) {
    countdownElement.classList.add("far");
  } else {
    countdownElement.classList.remove("far");
  }

  // if time difference is between 2 minutes and 3.5 minutes add reachable class to countdown
  if (timeDiff >= 120000 && timeDiff <= 210000) {
    countdownElement.classList.add("reachable");
  } else {
    countdownElement.classList.remove("reachable");
  }

  // if time difference is less than 2 minutes add close class to countdown
  if (timeDiff < 120000) {
    countdownElement.classList.add("close");
  } else {
    countdownElement.classList.remove("close");
  }

  document.getElementById("countdown").innerText = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

// Fetch bus schedule data from the JSON file
fetch("bus_schedule.json")
  .then((response) => response.json())
  .then((data) => {
    // Start countdown and update every second
    setInterval(() => updateCountdown(data), 1000);
    updateCountdown(data); // Initial call
  })
  .catch((error) => console.error("Failed to load bus schedule:", error));

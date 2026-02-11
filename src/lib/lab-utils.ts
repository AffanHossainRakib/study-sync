import { DAY_MAP, type Day, type Time } from "./lab-constants";
import type { LabScheduleEntry, LabAvailabilityResult } from "./lab-types";

export function parseLabSchedule(data: LabScheduleEntry[]) {
  const uniqueLabs = new Set<string>();
  const busyLabsMap = new Map<string, Set<string>>();

  data.forEach((entry) => {
    uniqueLabs.add(entry["Lab Room"]);
    const key = `${entry["Lab Day"]}-${entry["Lab Time (3hr)"]}`;

    if (!busyLabsMap.has(key)) {
      busyLabsMap.set(key, new Set());
    }
    busyLabsMap.get(key)!.add(entry["Lab Room"]);
  });

  return { uniqueLabs, busyLabsMap };
}

export function findFreeLabs(
  day: Day,
  time: Time,
  uniqueLabs: Set<string>,
  busyLabsMap: Map<string, Set<string>>
): string[] {
  const key = `${day}-${time}`;
  const busyLabs = busyLabsMap.get(key) || new Set();
  return Array.from(uniqueLabs).filter((lab) => !busyLabs.has(lab)).sort();
}

export function getCurrentTimeSlot(): {
  day: Day | "FRI";
  time: Time | null;
} {
  const now = new Date();
  const day = DAY_MAP[now.getDay()];
  const hour = now.getHours() + now.getMinutes() / 60;

  let time: Time | null = null;

  if (hour >= 8 && hour < 11) {
    time = "8:00 AM";
  } else if (hour >= 11 && hour < 14) {
    time = "11:00 AM";
  } else if (hour >= 14 && hour < 17) {
    time = "2:00 PM";
  }

  return { day, time };
}

export function checkCurrentAvailability(
  uniqueLabs: Set<string>,
  busyLabsMap: Map<string, Set<string>>
): LabAvailabilityResult {
  const { day, time } = getCurrentTimeSlot();

  if (day === "FRI") {
    return {
      availableLabs: [],
      isLabsClosed: true,
      message: "Labs are closed on Friday",
    };
  }

  if (!time) {
    return {
      availableLabs: [],
      isLabsClosed: true,
      message: "Labs are currently closed",
    };
  }

  const availableLabs = findFreeLabs(day, time, uniqueLabs, busyLabsMap);

  return {
    availableLabs,
    isLabsClosed: false,
  };
}

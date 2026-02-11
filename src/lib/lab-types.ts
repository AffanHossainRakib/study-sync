export interface LabScheduleEntry {
  Course: string;
  "Lab Day": string;
  "Lab Time (3hr)": string;
  "Lab Room": string;
}

export interface LabAvailabilityResult {
  availableLabs: string[];
  isLabsClosed: boolean;
  message?: string;
}

import "server-only";

import collegeData from "@/data/college-events.json";
import { sigProfiles } from "@/data/sig-profiles";

export function getCollegeGroupOptions() {
  const options = new Set<string>([
    "ArLAR College",
    ...sigProfiles.map((profile) => profile.name),
    ...collegeData.events.flatMap((event) => event.groups),
  ]);
  return ["ArLAR College", ...[...options].filter((option) => option !== "ArLAR College").sort((a, b) => a.localeCompare(b))];
}

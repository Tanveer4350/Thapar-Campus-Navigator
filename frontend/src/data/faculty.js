import facultyText from "./facultynames?raw";

const facultySection = facultyText.split(
  "Coordinators assigned for various departmental/institutional roles"
)[0];
const facultyValues = facultySection
  .split(/\r?\n/)
  .slice(6)
  .map((value) => value.trim())
  .filter(Boolean);

if (facultyValues.length % 6 !== 0) {
  throw new Error("The faculty directory data contains an incomplete record.");
}

export const facultyMembers = Array.from(
  { length: facultyValues.length / 6 },
  (_, index) => {
    const [number, name, designation, email, office, floor] = facultyValues.slice(
      index * 6,
      index * 6 + 6
    );

    return {
      id: Number(number),
      name,
      designation,
      email,
      office,
      floor,
    };
  }
);

export default facultyMembers;

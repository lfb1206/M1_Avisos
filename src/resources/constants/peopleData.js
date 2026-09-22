// People Data
// CAU contacts and participants used for autocompletion across the form and admin panel.
// Intentionally empty: previously contained real personal data (names, RUTs, phones, emails)
// that was removed. Populate via the admin panel at runtime instead of hardcoding here.

export const peopleData = {};

export const getContacts = () => Object.keys(peopleData);

export const getParticipants = () => Object.keys(peopleData);

export default peopleData;

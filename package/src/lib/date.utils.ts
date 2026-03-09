/**
 * Generates a date array from `startDate` to `stopDate` (inclusive).
 *
 * @param startDate Range start date.
 * @param stopDate Range end date.
 * @returns Array of Date objects for each day in the range.
 *
 * @example
 * const days = getDates(new Date("2026-03-01"), new Date("2026-03-03"));
 * // [Mar 1, Mar 2, Mar 3]
 */
export function getDates(startDate: Date, stopDate: Date) {
	let dateArray = new Array();
	let currentDate = startDate;
	while (currentDate <= stopDate) {
		let date = new Date(currentDate);
		dateArray.push(date);
		currentDate = addNoOfDays(currentDate, 1);
	}
	return dateArray;
}

/**
 * Adds a number of days to the provided date.
 *
 * @example
 * const due = addNoOfDays(new Date("2026-03-09"), 7);
 */
export function addNoOfDays(date: Date, days: number) {
	let _date = new Date(date)
	_date.setDate(_date.getDate() + days);
	return _date;
}

/**
 * Subtracts a number of days from the provided date.
 *
 * @example
 * const previous = subtractNoOfDays(new Date("2026-03-09"), 3);
 */
export function subtractNoOfDays(date: Date, days: number) {
	let _date = new Date(date)
	_date.setDate(_date.getDate() - days);
	return _date;
}

/**
 * Formats a date into `MM/DD/YYYY`.
 *
 * @example
 * const formatted = getMMDDYYYYFormat(new Date("2026-03-09"));
 * // "03/09/2026"
 */
export function getMMDDYYYYFormat(date: Date) {
	const yyyy = date.getFullYear().toString();
	const mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based         
	const dd = (date.getDate()).toString();
	return (mm[1] ? mm : "0" + mm[0]) + '/' + (dd[1] ? dd : "0" + dd[0]) + '/' + yyyy;
}

/**
 * Formats a date into `MM-DD-YYYY`.
 *
 * @example
 * const formatted = getMMDDYYYYFormatWithHiphen(new Date("2026-03-09"));
 * // "03-09-2026"
 */
export function getMMDDYYYYFormatWithHiphen(date: Date) {
	const yyyy = date.getFullYear().toString();
	const mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based         
	const dd = (date.getDate()).toString();
	return (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]) + '-' + yyyy;
}

/**
 * Returns current system date-time in `MM/DD/YYYY HH:MM AM/PM` format.
 *
 * @example
 * const now = getSystemDateTimeMMDDYYYY_HHMMFormat();
 */
export function getSystemDateTimeMMDDYYYY_HHMMFormat(): string {
	const systemDateTime = new Date();
	const month = (systemDateTime.getMonth() + 1).toString().padStart(2, '0');
	const day = systemDateTime.getDate().toString().padStart(2, '0');
	const year = systemDateTime.getFullYear().toString();
	let hours = systemDateTime.getHours();
	const ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12;
	hours = hours ? hours : 12;
	const formattedHours = hours.toString().padStart(2, '0');
	const minutes = systemDateTime.getMinutes().toString().padStart(2, '0');
	return `${month}/${day}/${year} ${formattedHours}:${minutes} ${ampm}`;
}

/**
 * Returns date-time in `YYYY-MM-DDTHH:MM` format.
 *
 * Details:
 * - Uses provided `date` input; falls back to current date when input is an empty string.
 *
 * @example
 * const stamp = getSystemDateTimeYYYYMMDD_HHMMFormat("2026-03-09T10:45:00");
 */
export function getSystemDateTimeYYYYMMDD_HHMMFormat(date: string | number | Date): string {
	const systemDateTime = date === "" ? new Date() : new Date(date);
	const month = (systemDateTime.getMonth() + 1).toString().padStart(2, '0');
	const day = systemDateTime.getDate().toString().padStart(2, '0');
	const year = systemDateTime.getFullYear().toString();
	let hours = systemDateTime.getHours();
	const formattedHours = hours.toString().padStart(2, '0');
	const minutes = systemDateTime.getMinutes().toString().padStart(2, '0');
	return `${year}-${month}-${day}T${formattedHours}:${minutes}`;
}


/**
 * Calculates age in years from the provided date of birth string.
 *
 * @param dob Date of birth string parseable by JavaScript Date.
 * @returns Age in completed years.
 *
 * @example
 * const age = calculateAge("1990-11-20");
 */
export function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}
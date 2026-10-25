/** Round only for display. Raw calculations retain full floating-point precision.
 * Small values which round to zero are displayed as 0, never -0.
 */
export function formatMeasurement(value: number, locale?: string): string {
  if (!Number.isFinite(value)) throw new Error('Only finite results can be displayed.');
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 6 })
    .format(Math.abs(value) < 0.0000005 ? 0 : value);
}

// @ts-check
// Solar phases: where the sun is for the reader, worked out from their time zone (or a place they chose), and
// which named phase of the day that puts them in. Our own calculation: no dependency, and `solarState` is
// self-contained so the pre-paint script can embed it verbatim.

/**
 * @typedef {'astronomical-night' | 'astronomical-twilight-morning' | 'nautical-twilight-morning' | 'blue-hour-morning'
 *   | 'civil-twilight-morning' | 'golden-hour-morning' | 'morning' | 'afternoon' | 'golden-hour-evening'
 *   | 'civil-twilight-evening' | 'blue-hour-evening' | 'nautical-twilight-evening' | 'astronomical-twilight-evening'} SolarPeriod
 * @typedef {'sunrise' | 'solar-noon' | 'sunset' | 'solar-midnight'} SolarMoment
 * @typedef {SolarPeriod | SolarMoment} SolarPhase
 * @typedef {{latitude: number, longitude: number, name?: string}} SolarPlace
 * @typedef {{sky?: 'simulated' | 'accurate', held?: string | null, place?: SolarPlace | null}} SolarOptions
 * @typedef {object} SolarState
 * @property {SolarPhase} phase  The current period, or the held period or moment.
 * @property {SolarPhase | null} held  The phase the reader holds, or null when following the sun.
 * @property {number} elevation  The sun's elevation in degrees, as used for the phase (simulated or accurate).
 * @property {boolean} rising  True between solar midnight and solar noon.
 * @property {boolean} daylight  True from sunrise to sunset: the mode is light.
 * @property {number} fraction  0 to 1 through the current daylight (sunrise to sunset) or darkness (sunset to sunrise).
 * @property {{sunrise: number | null, sunset: number | null, solarNoon: number, solarMidnight: number}} times
 *   Local minutes after midnight; sunrise and sunset are null when the sun does not rise or set that day.
 * @property {{name: string, latitude: number, longitude: number, source: 'device' | 'timezone' | 'offset'}} place
 * @property {'simulated' | 'accurate'} sky
 */

/** Every phase in order through the day, with the label people see, its kind and the sun's elevation band. */
export const SOLAR_PHASES = /** @type {const} */ ([
  { code: 'solar-midnight', label: 'Solar midnight', kind: 'moment', band: 'the sun at its lowest' },
  { code: 'astronomical-night', label: 'Night', kind: 'period', band: 'below −18°' },
  { code: 'astronomical-twilight-morning', label: 'Early twilight', kind: 'period', band: '−18° to −12°, rising' },
  { code: 'nautical-twilight-morning', label: 'First light', kind: 'period', band: '−12° to −6°, rising' },
  { code: 'blue-hour-morning', label: 'Blue hour', kind: 'period', band: '−6° to −4°, rising' },
  { code: 'civil-twilight-morning', label: 'Dawn', kind: 'period', band: '−4° to sunrise' },
  { code: 'sunrise', label: 'Sunrise', kind: 'moment', band: 'the sun’s upper edge on the horizon (−0.833°)' },
  { code: 'golden-hour-morning', label: 'Golden hour', kind: 'period', band: 'sunrise to +6°' },
  { code: 'morning', label: 'Morning', kind: 'period', band: '+6° to solar noon' },
  { code: 'solar-noon', label: 'Solar noon', kind: 'moment', band: 'the sun at its highest' },
  { code: 'afternoon', label: 'Afternoon', kind: 'period', band: 'solar noon to +6°' },
  { code: 'golden-hour-evening', label: 'Golden hour', kind: 'period', band: '+6° to sunset' },
  { code: 'sunset', label: 'Sunset', kind: 'moment', band: 'the sun’s upper edge on the horizon (−0.833°)' },
  { code: 'civil-twilight-evening', label: 'Dusk', kind: 'period', band: 'sunset to −4°' },
  { code: 'blue-hour-evening', label: 'Blue hour', kind: 'period', band: '−4° to −6°, setting' },
  { code: 'nautical-twilight-evening', label: 'Last light', kind: 'period', band: '−6° to −12°, setting' },
  { code: 'astronomical-twilight-evening', label: 'Late twilight', kind: 'period', band: '−12° to −18°, setting' }
])

/**
 * Where the sun is and which phase that makes it, for a date. Self-contained: it also runs verbatim in the
 * pre-paint script. With `sky: 'simulated'` (the default) every phase happens every day, in order: real times
 * where the sun gives them, and a filled-in curve where it does not (no full night in a northern summer, no
 * sunrise in a polar winter). With `sky: 'accurate'` the phases are exactly the real sun's.
 * @param {Date} date
 * @param {SolarOptions} [options]
 * @returns {SolarState}
 */
export function solarState(date, options = {}) {
  /** @type {Record<string, [number, number]>} */
  const zones = {
    'Europe/London': [51.5, -0.13],
    'Europe/Dublin': [53.35, -6.26],
    'Europe/Lisbon': [38.72, -9.14],
    'Europe/Brussels': [50.85, 4.35],
    'Europe/Amsterdam': [52.37, 4.9],
    'Europe/Paris': [48.86, 2.35],
    'Europe/Berlin': [52.52, 13.4],
    'Europe/Madrid': [40.42, -3.7],
    'Europe/Rome': [41.9, 12.5],
    'Europe/Zurich': [47.37, 8.54],
    'Europe/Vienna': [48.21, 16.37],
    'Europe/Copenhagen': [55.68, 12.57],
    'Europe/Oslo': [59.91, 10.75],
    'Europe/Stockholm': [59.33, 18.07],
    'Europe/Helsinki': [60.17, 24.94],
    'Europe/Warsaw': [52.23, 21.01],
    'Europe/Athens': [37.98, 23.73],
    'Europe/Istanbul': [41.01, 28.98],
    'Atlantic/Reykjavik': [64.15, -21.94],
    'America/New_York': [40.71, -74],
    'America/Chicago': [41.88, -87.63],
    'America/Denver': [39.74, -104.99],
    'America/Los_Angeles': [34.05, -118.24],
    'America/Toronto': [43.65, -79.38],
    'America/Vancouver': [49.28, -123.12],
    'America/Mexico_City': [19.43, -99.13],
    'America/Sao_Paulo': [-23.55, -46.63],
    'Africa/Johannesburg': [-26.2, 28.05],
    'Africa/Lagos': [6.52, 3.38],
    'Africa/Cairo': [30.04, 31.24],
    'Asia/Dubai': [25.2, 55.27],
    'Asia/Kolkata': [28.61, 77.21],
    'Asia/Singapore': [1.35, 103.82],
    'Asia/Hong_Kong': [22.32, 114.17],
    'Asia/Shanghai': [31.23, 121.47],
    'Asia/Tokyo': [35.68, 139.69],
    'Asia/Seoul': [37.57, 126.98],
    'Australia/Sydney': [-33.87, 151.21],
    'Australia/Perth': [-31.95, 115.86],
    'Pacific/Auckland': [-36.85, 174.76]
  }
  const sky = options.sky === 'accurate' ? 'accurate' : 'simulated'
  const offset = -date.getTimezoneOffset()
  let zone = ''
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch {}
  const chosen = options.place
  /** @type {SolarState['place']} */
  const place =
    chosen && Number.isFinite(chosen.latitude) && Number.isFinite(chosen.longitude)
      ? {
          name: chosen.name || 'your location',
          latitude: chosen.latitude,
          longitude: chosen.longitude,
          source: 'device'
        }
      : zones[zone]
        ? {
            name: (zone.split('/').pop() || zone).replace(/_/g, ' '),
            latitude: zones[zone][0],
            longitude: zones[zone][1],
            source: 'timezone'
          }
        : { name: 'your time zone', latitude: 45, longitude: (offset / 60) * 15, source: 'offset' }
  const r = Math.PI / 180
  const lat = Math.max(-89.9, Math.min(89.9, place.latitude)) * r
  const day = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 864e5)
  const decl = -23.44 * Math.cos(((2 * Math.PI) / 365) * (day + 10)) * r
  const b = (2 * Math.PI * (day - 81)) / 364
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
  const noon = (((720 - 4 * place.longitude - eot + offset) % 1440) + 1440) % 1440
  const minutes = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60
  // Minutes from solar noon, in (−720, 720].
  let t = (((minutes - noon) % 1440) + 1440) % 1440
  if (t > 720) t -= 1440
  const elevationAt = (/** @type {number} */ fromNoon) =>
    Math.asin(Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos((fromNoon / 4) * r)) / r
  const c = (Math.sin(-0.833 * r) - Math.sin(lat) * Math.sin(decl)) / (Math.cos(lat) * Math.cos(decl))
  const rises = c > -1 && c < 1
  const half = rises ? (Math.acos(c) / r) * 4 : 360
  const real = elevationAt(t)
  const isDaylight = t >= -half && t <= half
  const night = 1440 - 2 * half
  const fraction = isDaylight ? (t + half) / (2 * half) : ((((t - half) % 1440) + 1440) % 1440) / night
  // The simulated sky keeps the real sun where it is extreme enough, and otherwise follows a curve that reaches
  // +30° at solar noon and −30° at solar midnight, so golden hour, every twilight and night all happen. Where the
  // sun neither rises nor sets that day, it follows the curve alone, over an equinox-shaped day.
  const curve = isDaylight
    ? -0.833 + 30.833 * Math.sin(Math.PI * fraction)
    : -0.833 - 29.167 * Math.sin(Math.PI * fraction)
  const elevation =
    sky === 'accurate' ? real : !rises ? curve : isDaylight ? Math.max(real, curve) : Math.min(real, curve)
  const rising = t < 0
  const side = rising ? 'morning' : 'evening'
  /** @type {SolarPhase} */
  let phase =
    elevation < -18
      ? 'astronomical-night'
      : elevation < -12
        ? `astronomical-twilight-${side}`
        : elevation < -6
          ? `nautical-twilight-${side}`
          : elevation < -4
            ? `blue-hour-${side}`
            : elevation < -0.833
              ? `civil-twilight-${side}`
              : elevation < 6
                ? `golden-hour-${side}`
                : rising
                  ? 'morning'
                  : 'afternoon'
  /** A held phase: its elevation, side and place through daylight or darkness. */
  /** @type {Record<string, [number, boolean, number]>} */
  const holds = {
    'solar-midnight': [-40, false, 0.5],
    'astronomical-night': [-28, true, 0.7],
    'astronomical-twilight-morning': [-15, true, 0.9],
    'nautical-twilight-morning': [-9, true, 0.94],
    'blue-hour-morning': [-5, true, 0.97],
    'civil-twilight-morning': [-2.4, true, 0.99],
    sunrise: [-0.5, true, 0],
    'golden-hour-morning': [3, true, 0.05],
    morning: [25, true, 0.25],
    'solar-noon': [45, false, 0.5],
    afternoon: [25, false, 0.75],
    'golden-hour-evening': [3, false, 0.95],
    sunset: [-0.5, false, 1],
    'civil-twilight-evening': [-2.4, false, 0.01],
    'blue-hour-evening': [-5, false, 0.03],
    'nautical-twilight-evening': [-9, false, 0.06],
    'astronomical-twilight-evening': [-15, false, 0.1]
  }
  const held = options.held && holds[options.held] ? /** @type {SolarPhase} */ (options.held) : null
  const hold = held ? holds[held] : null
  if (held) phase = held
  const at = (/** @type {number} */ m) => ((Math.round(m) % 1440) + 1440) % 1440
  return {
    phase,
    held,
    elevation: hold ? hold[0] : elevation,
    rising: hold ? hold[1] : rising,
    daylight: hold ? hold[0] > -0.833 || held === 'sunrise' || held === 'sunset' : elevation > -0.833,
    fraction: hold ? hold[2] : fraction,
    times: {
      sunrise: rises ? at(noon - half) : null,
      sunset: rises ? at(noon + half) : null,
      solarNoon: at(noon),
      solarMidnight: at(noon + 720)
    },
    place,
    sky
  }
}

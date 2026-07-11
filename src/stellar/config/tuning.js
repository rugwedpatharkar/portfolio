/*
 * Scroll-driver tuning knobs. Extracted from Navigator.jsx so the "feel" of the
 * tour can be adjusted in one place, and the rationale for each number lives
 * with the number instead of in commit archaeology.
 *
 * Related runway constants live in config/destinations.js:
 *   SCROLL_LENGTH_PER_DESTINATION  (100 vh per stop)
 *   FINALE_SCROLL_VH               (200 vh for the pull-back)
 *   TOUR_END_FRACTION              (derived — where the tour ends and the finale begins)
 */

/*
 * Lenis smoothing lerp. 0.085 felt laggy / floaty; 0.13 makes the camera start
 * moving the instant you scroll while the magnetic snap still lands you exactly
 * on each planet. Higher = snappier + less floaty; lower = smoother + more
 * inertial. Test both extremes on a trackpad if changing.
 */
export const LENIS_LERP = 0.13;

/*
 * Lenis wheel/touch multipliers. Kept at the library defaults; touch bumped a
 * hair (1.5) so a full swipe still crosses roughly one stop's worth of runway.
 */
export const WHEEL_MULT = 1.0;
export const TOUCH_MULT = 1.5;

/*
 * Deadband for committing a destination on a scroll tick. "Nearest stop" fires
 * when |raw - round(raw)| < 0.35 destinations. Loose enough that the direction
 * guard is what actually gates the commit (see Navigator's `withDir` logic);
 * tight enough that a fast flick past a stop doesn't miscommit it.
 */
export const COMMIT_DEADBAND = 0.35;

/*
 * Direction-tracking hysteresis. Ignore sub-pixel jitter — only flip the
 * remembered gesture direction when the delta exceeds this (in "destinations
 * per scroll event").
 */
export const DIR_HYSTERESIS = 0.001;

/*
 * Magnetic snap. Debounced so the snap's own scroll keeps resetting the timer,
 * converging in one move.
 *   SNAP_DEBOUNCE_MS      = wait after last user scroll before firing snap
 *   SNAP_MIN_DELTA        = don't snap if we're already within this fraction of runway
 *   SNAP_DURATION_S       = duration of the snap glide
 *   SNAP_FINALE_MARGIN    = don't snap once we've crossed TOUR_END + this much
 */
export const SNAP_DEBOUNCE_MS = 200;
export const SNAP_MIN_DELTA = 0.004;
export const SNAP_DURATION_S = 0.85;
export const SNAP_FINALE_MARGIN = 0.006;

/*
 * Gesture direction reset. After the scroll has been idle this long, forget
 * the direction so the next flick picks a fresh one. The __stellarJumping
 * bypass flag used to piggy-back on this timer (cleared 260 ms after last
 * scroll); it's now cleared on commit instead — see Navigator's onScroll.
 */
export const GESTURE_IDLE_MS = 260;

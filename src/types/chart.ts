/**
 * @fileoverview Type definitions for chart-related data structures.
 * @package
 */

/**
 * Represents a single bar in a rhythm chart.
 * @interface
 */
export interface Bar {
  /** Unique identifier for the bar */
  id: number;
  /** Foreign key to the chart */
  chart_id: number;
  /** Time of the bar in seconds (for display and sorting) */
  time: number;
  /** Label for the bar (e.g., 'Verse', 'Chorus') */
  label: string;
  /** Starting time of the bar in seconds (legacy) */
  startTime?: number;
  /** Duration of the bar in seconds (legacy) */
  duration?: number;
  /** Array of tap timing points within the bar (legacy) */
  taps?: number[];
}

/**
 * Represents a complete rhythm chart.
 * @interface
 */
export interface Chart {
  /** Unique identifier for the chart */
  id: number;
  /** Title of the chart */
  title: string;
  /** YouTube video ID associated with the chart */
  video_id: string;
  /** Array of bars containing rhythm patterns */
  bars: Bar[];
  /** Creation timestamp */
  created_at: string;
  /** Last modification timestamp */
  updated_at: string;
}

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
  id: string;
  /** Starting time of the bar in seconds */
  startTime: number;
  /** Duration of the bar in seconds */
  duration: number;
  /** Array of tap timing points within the bar */
  taps: number[];
}

/**
 * Represents a complete rhythm chart.
 * @interface
 */
export interface Chart {
  /** Unique identifier for the chart */
  id: number;
  /** Title of the chart */
  song_title: string;
  /** YouTube video ID associated with the chart */
  video_id: string;
  /** Array of bars containing rhythm patterns */
  bars: Bar[];
  /** Creation timestamp */
  created_at: string;
  /** Last modification timestamp */
  updated_at: string;
}

/**
 * @fileoverview Type definitions for Supabase database tables and responses.
 * @package
 */

/**
 * Database chart record type from Supabase.
 * @interface
 */
export interface DbChart {
  /** Unique identifier for the chart */
  id: string;
  /** Title of the chart */
  title: string;
  /** YouTube video ID */
  video_id: string;
  /** User ID who owns the chart */
  user_id: string;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Database bar record type from Supabase.
 * @interface
 */
export interface DbBar {
  /** Unique identifier for the bar */
  id: string;
  /** Reference to the parent chart */
  chart_id: string;
  /** Starting time of the bar in seconds */
  start_time: number;
  /** Duration of the bar in seconds */
  duration: number;
  /** Array of tap timing points */
  taps: number[];
  /** Creation timestamp */
  created_at: string;
}

/**
 * Type for chart creation payload.
 * @interface
 */
export interface CreateChartPayload {
  title: string;
  video_id: string;
  user_id: string;
}

/**
 * Type for bar creation payload.
 * @interface
 */
export interface CreateBarPayload {
  chart_id: string;
  start_time: number;
  duration: number;
  taps?: number[];
}

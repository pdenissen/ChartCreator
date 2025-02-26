/**
 * @fileoverview Type definitions for YouTube IFrame API integration.
 * @package
 */

/**
 * YouTube Player instance from IFrame API.
 */
export interface YouTubePlayer extends YT.Player {}

/**
 * YouTube player event object.
 */
export interface YouTubeEvent extends YT.PlayerEvent {
  data: number;
}

/**
 * YouTube player states.
 */
export enum YouTubePlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

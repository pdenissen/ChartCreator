export interface Bar {
  time: number;
  label: string;
}

export interface DrumChart {
  id: number;
  song_title: string;
  video_id: string;
  bars: Bar[];
}

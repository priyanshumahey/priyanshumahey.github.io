"use client";

import {
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaMuteButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react";
import type { ComponentProps, CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type VideoPlayerProps = ComponentProps<typeof MediaController>;

const variables = {
  "--media-primary-color": "hsl(var(--foreground))",
  "--media-secondary-color": "hsl(var(--background))",
  "--media-text-color": "hsl(var(--foreground))",
  "--media-background-color": "hsl(var(--background))",
  "--media-control-hover-background": "hsl(var(--accent))",
  "--media-live-button-icon-color": "hsl(var(--muted-foreground))",
  "--media-live-button-indicator-color": "hsl(var(--destructive))",
  "--media-range-track-background": "hsl(var(--border))",
} as CSSProperties;

export const VideoPlayer = ({
  style,
  className,
  ...props
}: VideoPlayerProps) => (
  <div style={variables} className="contents">
    <MediaController
      className={cn("w-full", className)}
      style={style}
      {...props}
    />
  </div>
);

export type VideoPlayerControlBarProps = ComponentProps<typeof MediaControlBar>;

export const VideoPlayerControlBar = ({
  className,
  ...props
}: VideoPlayerControlBarProps) => (
  <MediaControlBar className={className} {...props} />
);

export type VideoPlayerTimeRangeProps = ComponentProps<typeof MediaTimeRange>;

export const VideoPlayerTimeRange = ({
  className,
  ...props
}: VideoPlayerTimeRangeProps) => (
  <MediaTimeRange className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerTimeDisplayProps = ComponentProps<
  typeof MediaTimeDisplay
>;

export const VideoPlayerTimeDisplay = ({
  className,
  ...props
}: VideoPlayerTimeDisplayProps) => (
  <MediaTimeDisplay className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerVolumeRangeProps = ComponentProps<
  typeof MediaVolumeRange
>;

export const VideoPlayerVolumeRange = ({
  className,
  ...props
}: VideoPlayerVolumeRangeProps) => (
  <MediaVolumeRange className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerPlayButtonProps = ComponentProps<typeof MediaPlayButton>;

export const VideoPlayerPlayButton = ({
  className,
  ...props
}: VideoPlayerPlayButtonProps) => (
  <MediaPlayButton className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerSeekBackwardButtonProps = ComponentProps<
  typeof MediaSeekBackwardButton
>;

export const VideoPlayerSeekBackwardButton = ({
  className,
  ...props
}: VideoPlayerSeekBackwardButtonProps) => (
  <MediaSeekBackwardButton className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerSeekForwardButtonProps = ComponentProps<
  typeof MediaSeekForwardButton
>;

export const VideoPlayerSeekForwardButton = ({
  className,
  ...props
}: VideoPlayerSeekForwardButtonProps) => (
  <MediaSeekForwardButton className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerMuteButtonProps = ComponentProps<typeof MediaMuteButton>;

export const VideoPlayerMuteButton = ({
  className,
  ...props
}: VideoPlayerMuteButtonProps) => (
  <MediaMuteButton className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerFullscreenButtonProps = ComponentProps<
  typeof MediaFullscreenButton
>;

export const VideoPlayerFullscreenButton = ({
  className,
  ...props
}: VideoPlayerFullscreenButtonProps) => (
  <MediaFullscreenButton
    className={cn("p-2.5 ml-auto", className)}
    {...props}
  />
);

export type VideoPlayerContentProps = ComponentProps<"video">;

export const VideoPlayerContent = ({
  className,
  ...props
}: VideoPlayerContentProps) => (
  <video
    suppressHydrationWarning
    className={cn("mt-0 mb-0", className)}
    {...props}
  />
);

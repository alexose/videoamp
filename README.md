Videoamp
========

Low latency video.  No frills.

(This is pre-alpha software and is not intended for production use.)

## Introduction

Videoamp accepts a video stream, repackages it into a websocket, and then broadcasts it to an iframe.  The iframe renders the video using JavaScript, which allows inline video for mobile platforms.

At this time, Videoamp will only accept h264 baseline video.  In the future, I would like it to be able to transcode any video format.

## Setting up a stream

Videoamp uses the magic of UDP to accept video streams without any kind of annoying keepalive scheme.  Just start broadcasting over any port between 5000-9999:

Usage:

From gstreamer:
(instructions coming soon)

From ffmpeg:
(instructions coming soon)


## Tuning into a stream

Videoamp serves all of the markup and scripts you'll need to render this video on the client side.  Simply point a browser to:

http://(server)/(your-ip)/port


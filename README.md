# shinobi-webrtc-mod

DISCLAMER

I am not a proffesional software developer and I do not have an experiance in JS
so my code really looks ugly )))
anyway, here is a -

Brief manual for WebRTC modification of the original build

Hello everyone! Greate news - no more delays for streams! I have manage to modify the original sources and added the WebRTC streaming possibility from this project: https://github.com/mpromonet/webrtc-streamer.

See sample on my Youtube: https://youtu.be/TAHFRzbaYe4

Left video is WebRTC vs HLS on the right.

I am posting here all the instructions and hope that Mr. Moeiscool would implement it into the original sources, so everyone could enjoy REALTIME WebRTC streaming in Shinobi!

webrtc-streamer (in /webrtc-streamer/webrtc-streamer.zip) is compiled for Centos 7 (for diffferent OS you need to compile it by yourself, see here: https://github.com/mpromonet/webrtc-streamer)
webrtc-streamer.service is for Centos 7 as well (just an example how to proceed... I recomend to arrange a dedicated domain name for your Shinobi host, so you can enjoy https://letsencrypt.org/ certificates while accesing the webrtc-streamer and the Shinobi web interface)

small note:
/Shinobi/libs/ffmpeg/builders.js - includes some small changes for the latest build of the FFMPEG, however, for those, who are using earlier version (goes along with Shinobi installation), will be necessary to use the file builders.js.git instead! Jus rename in to builders.js.



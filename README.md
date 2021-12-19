# shinobi-webrtc-mod
Brief manual for WebRTC modification of original build

Hello everyone! Greate news - no more delays for streams! I have manage to modify the original sources and added the WebRTC streaming possibility from this project: https://github.com/mpromonet/webrtc-streamer.

See sample on my Youtube: https://youtu.be/TAHFRzbaYe4

Left video is WebRTC vs HLS on the right.

Unfortunately, I am not very good in JS programming, so my code looks terrible (((

I am posting here all the instructions and hope that Mr. Moeiscool would implement it into the original sources, so everyone could enjoy REALTIME WebRTC streaming in Shinobi!

webrtc-streamer is compiled for Centos 7 (for diffferent OS you need to compile it by yourself, see here: https://github.com/mpromonet/webrtc-streamer)
webrtc-streamer.service is for Centos 7 as well (just an example how to proceed... I recomend to arrange a dedicated domain name for your Shinobi host, so you can enjoy https://letsencrypt.org/ certificates while accesing the webrtc-streamer and the Shinobi web interface)


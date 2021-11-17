# clouds
This project contains an algorithm for generating what appear to be pixelated clouds moving across the screen!

## FFmpeg commands
FFmpeg is used to stitch a directory of frames into an animated GIF.
### Create palette
ffmpeg -i 2021-11-17-1148-100x100/frame_100.png -vf palettegen=16 palette.png  

### Create an animated GIF using the color palette
ffmpeg -framerate 5 -i 2021-11-17-1211-100x100/frame_%03d.png -i palette.png -filter_complex "scale=-1:-1,paletteuse" 2021-11-17-1211-100x100-5fps-100.gif

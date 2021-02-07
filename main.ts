import { segmentPerson } from './src/index'

const startVideoButton = document.getElementById('start_video_button') as HTMLButtonElement
const localVideo = document.getElementById('local_video') as HTMLVideoElement
const canvas = document.getElementById('canvas') as HTMLCanvasElement
export async function startVideo() {
  //const mediaConstraints = {video: true, audio: true}; 
  //const mediaConstraints = {video: true, audio: false}; 
  const mediaConstraints = { video: { width: 640, height: 480 }, audio: false };

  const localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints).catch(err => {
    console.error('media ERROR:', err);
    return;
  }) as MediaStream;

  localVideo.srcObject = localStream;
  await localVideo.play().catch(err => console.error('local play ERROR:', err));
  localVideo.volume = 0;

  startCanvasVideo();
  // updateUI();
  segmentPerson(localVideo)
}
function startCanvasVideo() {
  // writeCanvasString('initalizing BodyPix');
  // contineuAnimation = true;
  // animationId = window.requestAnimationFrame(updateCanvas);
  // canvasStream = canvas.captureStream();

  // updateSegment();
}
startVideoButton.onclick = function() {
  startVideo()
}

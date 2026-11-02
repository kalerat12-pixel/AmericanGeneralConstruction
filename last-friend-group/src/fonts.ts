import {continueRender, delayRender, staticFile} from 'remotion';

export const TITLE_FONT = '"Luckiest Guy", "Impact", sans-serif';
export const UI_FONT = '"Nunito", "Helvetica Neue", Arial, sans-serif';

// Load the bundled fonts before any frame is captured.
if (typeof document !== 'undefined') {
  const handle = delayRender('Loading fonts');
  const faces = [
    new FontFace('Luckiest Guy', `url(${staticFile('fonts/luckiest-guy.woff2')}) format("woff2")`),
    new FontFace('Nunito', `url(${staticFile('fonts/nunito-800.woff2')}) format("woff2")`, {weight: '800'}),
    new FontFace('Nunito', `url(${staticFile('fonts/nunito-600.woff2')}) format("woff2")`, {weight: '600'}),
  ];
  Promise.all(faces.map((f) => f.load()))
    .then((loaded) => {
      loaded.forEach((f) => (document.fonts as unknown as {add: (x: FontFace) => void}).add(f));
      continueRender(handle);
    })
    .catch((err) => {
      console.error('Font loading failed', err);
      continueRender(handle);
    });
}

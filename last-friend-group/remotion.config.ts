import fs from 'fs';
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(20);
Config.setOverwriteOutput(true);

// Use a locally installed headless Chrome if one exists (e.g. in sandboxed
// environments); otherwise Remotion downloads its own automatically.
const localChrome = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (fs.existsSync(localChrome)) {
  Config.setBrowserExecutable(localChrome);
}

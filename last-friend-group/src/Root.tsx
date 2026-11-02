import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './lib/timing';
import {Episode} from './Episode';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="LastFriendGroup"
    component={Episode}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);

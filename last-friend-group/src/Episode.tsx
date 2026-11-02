import React from 'react';
import {AbsoluteFill, Series} from 'remotion';
import {Music} from './components/Music';
import {SCENES, toFrames} from './lib/timing';
import {S1ColdOpen} from './scenes/S1ColdOpen';
import {S2Rules} from './scenes/S2Rules';
import {S3Mall} from './scenes/S3Mall';
import {S4Wifi} from './scenes/S4Wifi';
import {S5GroupChat} from './scenes/S5GroupChat';
import {S6Fight} from './scenes/S6Fight';
import {S7Alone} from './scenes/S7Alone';
import {S8Sunset} from './scenes/S8Sunset';
import {S9Tag} from './scenes/S9Tag';

const COMPONENTS: Record<string, React.FC> = {
  s1: S1ColdOpen,
  s2: S2Rules,
  s3: S3Mall,
  s4: S4Wifi,
  s5: S5GroupChat,
  s6: S6Fight,
  s7: S7Alone,
  s8: S8Sunset,
  s9: S9Tag,
};

const Placeholder: React.FC = () => <AbsoluteFill style={{background: '#222'}} />;

export const Episode: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Series>
      {SCENES.map((s) => {
        const C = COMPONENTS[s.id] ?? Placeholder;
        return (
          <Series.Sequence key={s.id} durationInFrames={toFrames(s.duration)}>
            <C />
          </Series.Sequence>
        );
      })}
    </Series>
    <Music />
  </AbsoluteFill>
);

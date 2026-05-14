'use client';

import React from 'react';
import { LocalUserChoices } from '@livekit/components-react';
import { RoomClient } from '@/lib/RoomClient';
import { parseJoinToken } from '@/lib/join-token';
import { ConnectionDetails } from '@/lib/types';

type JoinConfig = {
  roomName: string;
  choices: LocalUserChoices;
  connectionDetails: ConnectionDetails;
};

export default function Page() {
  const [error, setError] = React.useState<string>();
  const [joinConfig, setJoinConfig] = React.useState<JoinConfig>();
  const hasAutoJoinedRef = React.useRef(false);

  React.useEffect(() => {
    const tokenParam = new URLSearchParams(window.location.search).get('t');
    if (!tokenParam || hasAutoJoinedRef.current) {
      if (!tokenParam) {
        setError(
          'Missing join token. Launch this page with a valid token in the "t" query string.',
        );
      }
      return;
    }

    const parsedToken = parseJoinToken(tokenParam);
    if (!parsedToken.ok) {
      setError(parsedToken.error);
      return;
    }
    if (!parsedToken.serverUrl) {
      setError('Token is missing the "serverUrl" claim');
      return;
    }

    hasAutoJoinedRef.current = true;
    setJoinConfig({
      roomName: parsedToken.roomName,
      choices: {
        username: parsedToken.participantName,
        videoEnabled: false,
        audioEnabled: true,
        videoDeviceId: '',
        audioDeviceId: '',
      },
      connectionDetails: {
        serverUrl: parsedToken.serverUrl,
        roomName: parsedToken.roomName,
        participantName: parsedToken.participantName,
        participantToken: tokenParam,
      },
    });
  }, []);

  if (joinConfig) {
    return (
      <RoomClient
        roomName={joinConfig.roomName}
        hq={false}
        codec="vp9"
        singlePeerConnection={true}
        initialPreJoinChoices={joinConfig.choices}
        initialConnectionDetails={joinConfig.connectionDetails}
      />
    );
  }

  return (
    <main data-lk-theme="default" style={{ height: '100%' }}>
      <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            width: 'min(28rem, 92vw)',
            textAlign: 'center',
          }}
        >
          {error ? (
            <div role="alert" style={{ display: 'grid', gap: '0.5rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Unable to join</h1>
              <p style={{ margin: 0, opacity: 0.75 }}>{error}</p>
            </div>
          ) : (
            <div style={{ opacity: 0.7 }}>Joining...</div>
          )}
        </div>
      </div>
    </main>
  );
}

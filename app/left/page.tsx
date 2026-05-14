'use client';

import React from 'react';

const CLOSE_DELAY_SECONDS = 3;

export default function LeftPage() {
  const [secondsRemaining, setSecondsRemaining] = React.useState(CLOSE_DELAY_SECONDS);
  const [closeAttempted, setCloseAttempted] = React.useState(false);

  React.useEffect(() => {
    const tick = window.setInterval(() => {
      setSecondsRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    const closeTimer = window.setTimeout(() => {
      setCloseAttempted(true);
      window.close();
    }, CLOSE_DELAY_SECONDS * 1000);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(closeTimer);
    };
  }, []);

  return (
    <main data-lk-theme="default" style={{ height: '100%' }}>
      <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            width: 'min(28rem, 92vw)',
            textAlign: 'center',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Meeting ended</h1>
          {closeAttempted ? (
            <p style={{ margin: 0, opacity: 0.75 }}>
              If this window did not close automatically, you can close it manually.
            </p>
          ) : (
            <p style={{ margin: 0, opacity: 0.75 }}>
              This window will close in {secondsRemaining} seconds.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

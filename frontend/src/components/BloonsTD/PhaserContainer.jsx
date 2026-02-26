import { useRef, useEffect } from 'react';

export default function PhaserContainer({ initGame }) {
  const containerRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (containerRef.current && !initialized.current) {
      initialized.current = true;
      initGame(containerRef.current);
    }
  }, [initGame]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    />
  );
}

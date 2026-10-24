import { ImageResponse } from 'next/og';

export const alt = 'Aegisora - governance for AI agents';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#001e2b',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#2f80ff', display: 'flex' }} />
          <div style={{ marginLeft: 20, fontSize: 44, fontWeight: 700 }}>Aegisora</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>Every AI agent decision, governed.</div>
          <div style={{ marginTop: 28, fontSize: 34, color: '#9fb6c3' }}>
            Policies, approvals and audit evidence for enterprise AI agents.
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#6ea8ff' }}>aegisora.org</div>
      </div>
    ),
    { ...size }
  );
}
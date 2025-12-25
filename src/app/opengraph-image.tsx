import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'DocBuilder - AI壁打ちで仕様書を作成';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b4e 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 背景のグリッドパターン */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* 光のオーブ効果 */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)',
          }}
        />

        {/* メインコンテンツ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            padding: '40px',
          }}
        >
          {/* アイコン */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100px',
              height: '100px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              marginBottom: '32px',
              boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.5)',
            }}
          >
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="m10 13-2 2 2 2" />
              <path d="m14 17 2-2-2-2" />
            </svg>
          </div>

          {/* タイトル */}
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              margin: 0,
              marginBottom: '20px',
              letterSpacing: '-2px',
            }}
          >
            DocBuilder
          </h1>

          {/* サブタイトル */}
          <p
            style={{
              fontSize: '32px',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0,
              marginBottom: '16px',
              fontWeight: 600,
            }}
          >
            AI壁打ちで仕様書を作成
          </p>

          {/* 説明 */}
          <p
            style={{
              fontSize: '22px',
              color: 'rgba(255, 255, 255, 0.6)',
              margin: 0,
              maxWidth: '700px',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            Claude Opus 4と対話しながらプロダクトの仕様書を段階的に作成
          </p>

          {/* フェーズバッジ */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '40px',
            }}
          >
            {['概要', '機能', '画面', '詳細', '技術'].map((phase, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#a78bfa',
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 500,
                  }}
                >
                  {phase}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 下部のグラデーション */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #8b5cf6, #6366f1, #3b82f6, #06b6d4, #8b5cf6)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}


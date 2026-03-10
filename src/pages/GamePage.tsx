import { useState } from 'react';

const GAME_URL = 'https://kidsmindpiano.github.io/music-training/duo.html';

export default function GamePage() {
  const [useIframe, setUseIframe] = useState(false);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text">뮤직마스터 🎮</h1>

      {!useIframe ? (
        <>
          {/* Game Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-border/50 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">🎵</span>
            </div>
            <h2 className="text-lg font-bold text-text mb-2">뮤직 트레이닝</h2>
            <p className="text-sm text-text-light mb-6 leading-relaxed">
              음악 게임으로 재미있게 연습해요!
              <br />
              리듬감과 음감을 키울 수 있어요.
            </p>

            <div className="space-y-3">
              <a
                href={GAME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition shadow-sm text-center"
              >
                🚀 새 창에서 열기
              </a>
              <button
                onClick={() => setUseIframe(true)}
                className="w-full py-3 bg-bg text-text font-medium rounded-xl hover:bg-border/50 transition text-sm"
              >
                📱 이 화면에서 열기
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-secondary/10 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-text mb-2">💡 게임 팁</h3>
            <ul className="text-xs text-text-light space-y-1.5 leading-relaxed">
              <li>• 헤드폰을 쓰면 더 잘 들려요</li>
              <li>• 처음에는 느린 속도로 시작해요</li>
              <li>• 틀려도 괜찮아요, 반복하면 실력이 늘어요!</li>
            </ul>
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => setUseIframe(false)}
            className="text-sm text-text-light hover:text-primary transition flex items-center gap-1"
          >
            ← 돌아가기
          </button>
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
            <iframe
              src={GAME_URL}
              title="뮤직마스터"
              className="w-full h-full border-0"
              allow="autoplay; microphone"
            />
          </div>
        </>
      )}
    </div>
  );
}

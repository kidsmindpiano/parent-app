import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchLessonLogs, getDemoLessonLogs, getLessonLogGid, setLessonLogGid } from '../services/googleSheets';
import type { LessonLog } from '../types';

const EMOTION_MAP: Record<string, string> = {
  '즐거움': '😊', '집중': '🎯', '뿌듯': '🌟', '피곤': '😴',
  '긴장': '😰', '신남': '🤩', '차분': '😌', '졸림': '😪',
  '좋음': '😄', '설렘': '💖', '적극': '🔥', '어색': '😶',
};

function getEmotionEmoji(emotion: string): string {
  if (!emotion) return '🎵';
  for (const [key, emoji] of Object.entries(EMOTION_MAP)) {
    if (emotion.includes(key)) return emoji;
  }
  return '🎵';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default function LessonsPage() {
  const { student } = useAuth();
  const [logs, setLogs] = useState<LessonLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LessonLog | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [gidInput, setGidInput] = useState(getLessonLogGid());
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => { loadLogs(); }, [student]);

  async function loadLogs() {
    if (!student) return;
    setIsLoading(true);
    try {
      const gid = getLessonLogGid();
      if (!gid) {
        setLogs(getDemoLessonLogs(student.학생명));
        setIsDemo(true);
      } else {
        const allLogs = await fetchLessonLogs();
        const filtered = allLogs
          .filter((log) => log.학생명?.trim() === student.학생명.trim() && log.상태 === '완료')
          .sort((a, b) => {
            const da = new Date(a.날짜 || '').getTime();
            const db = new Date(b.날짜 || '').getTime();
            return db - da;
          });
        setLogs(filtered);
        setIsDemo(false);
      }
    } catch {
      setLogs(getDemoLessonLogs(student.학생명));
      setIsDemo(true);
    }
    setIsLoading(false);
  }

  function handleSaveGid() {
    setLessonLogGid(gidInput);
    setShowSettings(false);
    loadLogs();
  }

  if (!student) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text">수업일지 📖</h1>
        <button onClick={() => setShowSettings(!showSettings)}
          className="text-xs text-text-light hover:text-primary transition px-2 py-1 rounded-lg hover:bg-white">
          ⚙️ 설정
        </button>
      </div>

      {showSettings && (
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-border/50">
          <p className="text-sm font-medium text-text mb-2">수업일지 시트 GID</p>
          <div className="flex gap-2">
            <input type="text" value={gidInput} onChange={(e) => setGidInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={handleSaveGid}
              className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition">저장</button>
          </div>
        </div>
      )}

      {isDemo && (
        <div className="bg-secondary/10 rounded-xl p-3 text-center">
          <p className="text-xs text-text-light">📌 데모 데이터입니다.</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}

      {!isLoading && logs.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">📝</span>
          <p className="text-text-light">아직 수업일지가 없습니다</p>
        </div>
      )}

      {!isLoading && logs.map((log) => (
        <button key={log.수업고유번호}
          onClick={() => setSelectedLog(selectedLog?.수업고유번호 === log.수업고유번호 ? null : log)}
          className="w-full text-left bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden transition hover:shadow-md">
          <div className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-bg rounded-xl flex items-center justify-center text-2xl shrink-0">
              {getEmotionEmoji(log.감정상태)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-text text-sm truncate">
                  {log.교재진도 || '수업'}
                </p>
                <span className="text-xs text-text-light whitespace-nowrap ml-2">
                  {formatDate(log.날짜)} ({log.요일})
                </span>
              </div>
              <p className="text-xs text-text-light mt-0.5 truncate">
                {log.강사명} · {log.감정상태 || '기록 없음'}
              </p>
            </div>
          </div>

          {selectedLog?.수업고유번호 === log.수업고유번호 && (
            <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
              {log['상상/마음'] && (
                <div>
                  <p className="text-sm font-bold text-text mb-1.5">💭 상상/마음</p>
                  <p className="text-sm text-text">{log['상상/마음']}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-text mb-1.5">📝 수업 내용</p>
                <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">
                  {log['내 용'] || '내용 없음'}
                </p>
              </div>
              {log.영상링크 && log.영상링크 !== 'https://' && (
                <div>
                  <a href={log.영상링크} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium transition">
                    🎬 수업 영상 보기
                  </a>
                  {log.영상암호 && log.영상암호 !== 'X' && (
                    <p className="text-xs text-text-light mt-1">🔑 암호: {log.영상암호}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

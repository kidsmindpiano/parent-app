import { toLocalTime, getTimeDiff } from '../utils/time';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DAY_MAP: Record<string, number> = {
  '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6,
};

function getNextLessonDate(dayStr: string, timeStr: string): Date | null {
  if (!dayStr || !timeStr) return null;
  const dayNum = DAY_MAP[dayStr.trim()];
  if (dayNum === undefined) return null;

  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const today = now.getDay();
  let daysUntil = dayNum - today;
  if (daysUntil < 0) daysUntil += 7;
  if (daysUntil === 0) {
    const lessonTime = new Date(now);
    lessonTime.setHours(hours, minutes, 0, 0);
    if (lessonTime <= now) daysUntil = 7;
  }

  const next = new Date(now);
  next.setDate(now.getDate() + daysUntil);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

function formatCountdown(target: Date): string {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return '곧 시작!';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}일 ${hours}시간 후`;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}시간 ${minutes}분 후`;
  return `${minutes}분 후`;
}

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

export default function DashboardPage() {
  const { student, logout } = useAuth();
  if (!student) return null;

  const firstName = student.학생명.trim().slice(-2);
  const timeDiff = getTimeDiff(student);

  const nextLesson = useMemo(() => {
    const dates: Date[] = [];
    const d1 = getNextLessonDate(student.레슨요일1, student.레슨시간1);
    const d2 = getNextLessonDate(student.레슨요일2, student.레슨시간2);
    if (d1) dates.push(d1);
    if (d2) dates.push(d2);
    dates.sort((a, b) => a.getTime() - b.getTime());
    return dates[0] || null;
  }, [student]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">
            {firstName}아, 오늘도 화이팅! 🎵
          </h1>
          <p className="text-sm text-text-light mt-0.5">키즈마인드피아노</p>
        </div>
        <button
          onClick={logout}
          className="text-xs text-text-light hover:text-primary transition px-3 py-1.5 rounded-lg hover:bg-white"
        >
          로그아웃
        </button>
      </div>

      {/* Next Lesson Card */}
      {nextLesson && (
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📅</span>
            <h2 className="font-semibold text-text">다음 수업</h2>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">
                {formatCountdown(nextLesson)}
              </p>
              <p className="text-sm text-text-light mt-1">
                {nextLesson.getMonth() + 1}월 {nextLesson.getDate()}일 ({dayNames[nextLesson.getDay()]})
                {' '}{student.레슨시간1 ? `${toLocalTime(student.레슨시간1, timeDiff)} (현지)` : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-light">담당</p>
              <p className="text-sm font-medium text-text">{student['담당 강사'] || '-'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Student Info Card */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎹</span>
          <h2 className="font-semibold text-text">내 정보</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm">
          <div>
            <p className="text-text-light">이름</p>
            <p className="font-medium">{student.학생명}</p>
          </div>
          <div>
            <p className="text-text-light">담당 선생님</p>
            <p className="font-medium">{student['담당 강사'] || '-'}</p>
          </div>
          <div>
            <p className="text-text-light">수업 횟수</p>
            <p className="font-medium">주 {student['주 수업 횟수'] || '-'}회</p>
          </div>
          <div>
            <p className="text-text-light">거주지</p>
            <p className="font-medium">{student.도시 || student['사는 곳'] || '-'}</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Link
          to="/lessons"
          className="bg-white rounded-2xl shadow-sm p-4 border border-border/50 flex flex-col items-center gap-2 hover:shadow-md transition"
        >
          <span className="text-3xl">📖</span>
          <span className="text-sm font-medium text-text">수업일지 보기</span>
        </Link>
        <Link
          to="/game"
          className="bg-white rounded-2xl shadow-sm p-4 border border-border/50 flex flex-col items-center gap-2 hover:shadow-md transition"
        >
          <span className="text-3xl">🎮</span>
          <span className="text-sm font-medium text-text">뮤직마스터</span>
        </Link>
      </div>

      {/* Timezone Info */}
      {student.시차 && (
        <div className="bg-accent/10 rounded-2xl p-4 text-center">
          <p className="text-sm text-text-light">
            현지 시간 기준: 한국과 <span className="font-semibold text-text">{student.시차}시간</span> 차이
          </p>
        </div>
      )}
    </div>
  );
}

import { toLocalTime, getTimeDiff } from '../utils/time';
import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DAY_MAP: Record<string, number> = {
  '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6,
};
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
const DAYS_ORDER = ['월', '화', '수', '목', '금', '토', '일'];

interface ScheduleItem {
  day: string;
  dayNum: number;
  time: string;
}

interface TeacherSlot {
  time: string;
  studentName: string;
  duration: string;
}

function getNextDate(dayNum: number, timeStr: string): Date {
  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const today = now.getDay();
  let daysUntil = dayNum - today;
  if (daysUntil < 0) daysUntil += 7;
  if (daysUntil === 0) {
    const check = new Date(now);
    check.setHours(hours, minutes, 0, 0);
    if (check <= now) daysUntil = 7;
  }
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntil);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

const TEACHER_COLORS: Record<string, string> = {
  '최지혜': 'bg-rose-100 text-rose-700 border-rose-200',
  '안서희': 'bg-violet-100 text-violet-700 border-violet-200',
  '김경서': 'bg-sky-100 text-sky-700 border-sky-200',
};

const SLOT_COLORS = [
  'bg-pink-50 text-pink-700 border-pink-200',
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-green-50 text-green-700 border-green-200',
  'bg-purple-50 text-purple-700 border-purple-200',
  'bg-yellow-50 text-yellow-700 border-yellow-200',
  'bg-orange-50 text-orange-700 border-orange-200',
  'bg-teal-50 text-teal-700 border-teal-200',
  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'bg-rose-50 text-rose-700 border-rose-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-cyan-50 text-cyan-700 border-cyan-200',
];

export default function SchedulePage() {
  const { student, allStudents } = useAuth();
  const [now, setNow] = useState(new Date());
  const timeDiff = getTimeDiff(student || {});
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const schedules = useMemo<ScheduleItem[]>(() => {
    if (!student) return [];
    const items: ScheduleItem[] = [];
    if (student.레슨요일1 && student.레슨시간1) {
      const dayNum = DAY_MAP[student.레슨요일1.trim()];
      if (dayNum !== undefined) {
        items.push({ day: student.레슨요일1.trim(), dayNum, time: student.레슨시간1.trim() });
      }
    }
    if (student.레슨요일2 && student.레슨시간2) {
      const dayNum = DAY_MAP[student.레슨요일2.trim()];
      if (dayNum !== undefined) {
        items.push({ day: student.레슨요일2.trim(), dayNum, time: student.레슨시간2.trim() });
      }
    }
    return items;
  }, [student]);

  const nextLesson = useMemo(() => {
    if (schedules.length === 0) return null;
    const dates = schedules.map((s) => ({
      ...s,
      nextDate: getNextDate(s.dayNum, s.time),
    }));
    dates.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
    return dates[0];
  }, [schedules, now]);

  const countdown = useMemo(() => {
    if (!nextLesson) return null;
    const diff = nextLesson.nextDate.getTime() - now.getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    };
  }, [nextLesson, now]);

  // Teacher names from data
  const teachers = useMemo(() => {
    const set = new Set<string>();
    allStudents.forEach((s) => {
      if (s['담당 강사']?.trim() && s.상태 === '수업중') {
        set.add(s['담당 강사'].trim());
      }
    });
    return [...set].sort();
  }, [allStudents]);

  // Teacher timetable
  const teacherTimetable = useMemo(() => {
    if (!selectedTeacher) return {};
    const active = allStudents.filter(
      (s) => s['담당 강사']?.trim() === selectedTeacher && s.상태 === '수업중'
    );
    const table: Record<string, TeacherSlot[]> = {};
    DAYS_ORDER.forEach((d) => { table[d] = []; });

    active.forEach((s) => {
      if (s.레슨요일1 && s.레슨시간1) {
        const day = s.레슨요일1.trim();
        if (table[day]) {
          table[day].push({ time: s.레슨시간1.trim(), studentName: s.학생명.trim(), duration: s['수업시간(분)'] || '40' });
        }
      }
      if (s.레슨요일2 && s.레슨시간2) {
        const day = s.레슨요일2.trim();
        if (table[day]) {
          table[day].push({ time: s.레슨시간2.trim(), studentName: s.학생명.trim(), duration: s['수업시간(분)'] || '40' });
        }
      }
    });
    Object.keys(table).forEach((day) => {
      table[day].sort((a, b) => a.time.localeCompare(b.time));
    });
    return table;
  }, [selectedTeacher, allStudents]);

  // Color mapping for students in timetable
  const slotColorMap = useMemo(() => {
    const names = [...new Set(Object.values(teacherTimetable).flatMap((s) => s.map((x) => x.studentName)))];
    const map: Record<string, string> = {};
    names.forEach((n, i) => { map[n] = SLOT_COLORS[i % SLOT_COLORS.length]; });
    return map;
  }, [teacherTimetable]);

  if (!student) return null;

  // Set default teacher on first render
  if (teachers.length > 0 && selectedTeacher === null) {
    // Don't set in render, use effect below
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text">수업 일정 📅</h1>

      {/* Countdown */}
      {nextLesson && countdown && (
        <div className="bg-primary/5 rounded-2xl p-6 text-center border border-primary/10">
          <p className="text-sm text-text-light mb-3">다음 수업까지</p>
          <div className="flex items-center justify-center gap-3">
            {countdown.days > 0 && (
              <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
                <p className="text-2xl font-bold text-primary">{countdown.days}</p>
                <p className="text-xs text-text-light">일</p>
              </div>
            )}
            <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
              <p className="text-2xl font-bold text-primary">{countdown.hours}</p>
              <p className="text-xs text-text-light">시간</p>
            </div>
            <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
              <p className="text-2xl font-bold text-primary">{countdown.minutes}</p>
              <p className="text-xs text-text-light">분</p>
            </div>
          </div>
          <p className="text-sm text-text mt-3">
            {nextLesson.nextDate.getMonth() + 1}월 {nextLesson.nextDate.getDate()}일 ({DAY_NAMES[nextLesson.nextDate.getDay()]}) {toLocalTime(nextLesson.time, timeDiff)}
          </p>
        </div>
      )}

      {/* My Schedule */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-border/50">
        <h2 className="font-semibold text-text mb-4 flex items-center gap-2">
          <span>🗓</span> 내 수업 일정
        </h2>
        {schedules.length === 0 ? (
          <p className="text-text-light text-sm text-center py-4">등록된 수업 일정이 없습니다</p>
        ) : (
          <div className="space-y-3">
            {schedules.map((s, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-bg">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{s.day}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text">매주 {s.day}요일</p>
                  <p className="text-sm text-text-light">{toLocalTime(s.time, timeDiff)} (현지시간) · {student['수업시간(분)'] || '40'}분</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-light">담당</p>
                  <p className="text-sm font-medium text-text">{student['담당 강사'] || '-'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teacher Timetable */}
      {teachers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-border/50">
          <h2 className="font-semibold text-text mb-4 flex items-center gap-2">
            <span>👩‍🏫</span> 선생님 타임테이블
          </h2>
          <p className="text-xs text-text-light mb-3">수업 변경 시 빈 시간을 확인해보세요</p>

          {/* Teacher tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {teachers.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTeacher(selectedTeacher === t ? null : t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                  selectedTeacher === t
                    ? (TEACHER_COLORS[t] || 'bg-primary/10 text-primary border-primary/20')
                    : 'bg-bg text-text-light border-border/50 hover:bg-gray-100'
                }`}
              >
                {t} 선생님
              </button>
            ))}
          </div>

          {/* Timetable */}
          {selectedTeacher && (
            <div className="space-y-3">
              {DAYS_ORDER.map((day) => {
                const slots = teacherTimetable[day] || [];
                if (slots.length === 0) return null;
                return (
                  <div key={day} className="border border-border/30 rounded-xl overflow-hidden">
                    <div className="bg-bg px-4 py-2 flex items-center justify-between">
                      <span className="font-bold text-text text-sm">{day}요일</span>
                      <span className="text-xs text-text-light">{slots.length}개 수업</span>
                    </div>
                    <div className="divide-y divide-border/20">
                      {slots.map((slot, i) => (
                        <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                          <span className="text-sm font-mono font-semibold text-text w-12 shrink-0">{toLocalTime(slot.time, timeDiff)}</span>
                          <span className={`flex-1 px-3 py-1 rounded-lg border text-sm font-medium ${slotColorMap[slot.studentName]}`}>
                            {slot.studentName}
                          </span>
                          <span className="text-xs text-text-light">{slot.duration}분</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!selectedTeacher && (
            <p className="text-center text-sm text-text-light py-4">선생님을 선택하면 타임테이블이 표시됩니다</p>
          )}
        </div>
      )}

      {/* Timezone Note */}
      {student.시차 && (
        <div className="bg-accent/10 rounded-2xl p-4">
          <p className="text-sm text-text-light text-center">
            💡 표시된 시간은 학생의 <span className="font-semibold text-text">현지시간</span> 기준입니다.
          </p>
        </div>
      )}
    </div>
  );
}

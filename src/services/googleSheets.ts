import Papa from 'papaparse';
import type { Student, LessonLog } from '../types';

const SPREADSHEET_ID = '1m86nWnanHVgW4iRu1N3rCymQBIvahTPdm478ODMYbAc';
const STUDENT_GID = '0';
const LESSON_LOG_GID_KEY = 'kidsmind_lesson_log_gid';

export function getLessonLogGid(): string {
  return localStorage.getItem(LESSON_LOG_GID_KEY) || '936170665';
}

export function setLessonLogGid(gid: string) {
  localStorage.setItem(LESSON_LOG_GID_KEY, gid);
}

function buildCsvUrl(gid: string): string {
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${gid}`;
}

function findHeaderRow(lines: string[], marker: string): number {
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    if (lines[i].includes(marker)) return i;
  }
  return 0;
}

async function fetchCsvWithHeader<T>(gid: string, headerMarker: string): Promise<T[]> {
  const url = buildCsvUrl(gid);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
  const text = await response.text();
  const lines = text.split('\n');
  const headerIdx = findHeaderRow(lines, headerMarker);
  const trimmedText = lines.slice(headerIdx).join('\n');
  const result = Papa.parse<T>(trimmedText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });
  return result.data;
}

export async function fetchStudents(): Promise<Student[]> {
  const data = await fetchCsvWithHeader<Student>(STUDENT_GID, '학생명');
  return data.filter((s) => s.학생명 && s.학생명.trim() !== '');
}

export async function fetchLessonLogs(): Promise<LessonLog[]> {
  const gid = getLessonLogGid();
  if (!gid) return [];
  const data = await fetchCsvWithHeader<LessonLog>(gid, '수업고유번호');
  return data.filter((l) => l.학생명 && l.학생명.trim() !== '');
}

export function getDemoLessonLogs(studentName: string): LessonLog[] {
  return [
    {
      수업고유번호: 'DEMO-001',
      강사명: '김선생님',
      날짜: '2026-03-07',
      요일: '금',
      시간: '16:00',
      학생명: studentName,
      상태: '완료',
      수업회차: '1',
      교재진도: '바이엘 42번',
      감정상태: '즐거움',
      '상상/마음': '',
      '내 용': '오른손 멜로디 연습, 왼손 반주 패턴 학습. 리듬감이 많이 좋아졌어요!',
      영상링크: '',
      영상암호: '',
    },
  ];
}

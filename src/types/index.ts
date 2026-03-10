export interface Student {
  학생고유번호: string;
  상태: string;
  학생명: string;
  '학생 생년월일': string;
  나이: string;
  '보호자 성명': string;
  '사는 곳': string;
  도시: string;
  시차: string;
  시차기본: string;
  '현지 시간': string;
  '담당 강사': string;
  '주 수업 횟수': string;
  레슨요일1: string;
  레슨시간1: string;
  레슨요일2: string;
  레슨시간2: string;
  '수업시간(분)': string;
  [key: string]: string;
}

export interface LessonLog {
  수업고유번호: string;
  강사명: string;
  날짜: string;
  '수업 날짜'?: string;
  요일: string;
  시간: string;
  학생명: string;
  상태: string;
  수업회차: string;
  교재진도: string;
  감정상태: string;
  '상상/마음': string;
  '내 용': string;
  영상링크: string;
  영상암호: string;
  [key: string]: string | undefined;
}

export interface Payment {
  구분: string;
  결제일: string;
  학생명: string;
  '수업 횟수': string;
  결제금액: string;
  결제수단: string;
}

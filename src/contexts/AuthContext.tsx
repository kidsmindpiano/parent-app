import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Student } from '../types';
import { fetchStudents } from '../services/googleSheets';

interface AuthContextType {
  student: Student | null;
  allStudents: Student[];
  isLoading: boolean;
  error: string | null;
  login: (name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const AUTH_KEY = 'kidsmind_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchStudents()
      .then((data) => {
        setStudents(data);
        const saved = localStorage.getItem(AUTH_KEY);
        if (saved) {
          const { name } = JSON.parse(saved);
          const found = data.find((s) => s.학생명.trim() === name);
          if (found) setStudent(found);
        }
      })
      .catch(() => {
        setError('데이터를 불러올 수 없습니다. 인터넷 연결을 확인해주세요.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (name: string): Promise<boolean> => {
      setError(null);
      let list = students;
      if (list.length === 0) {
        try { list = await fetchStudents(); setStudents(list); }
        catch { setError('데이터를 불러올 수 없습니다.'); return false; }
      }
      const found = list.find((s) => s.학생명.trim() === name.trim());
      if (found) {
        setStudent(found);
        localStorage.setItem(AUTH_KEY, JSON.stringify({ name: name.trim() }));
        return true;
      }
      setError('등록된 학생 이름이 아닙니다. 다시 확인해주세요.');
      return false;
    },
    [students]
  );

  const logout = useCallback(() => {
    setStudent(null);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ student, allStudents: students, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

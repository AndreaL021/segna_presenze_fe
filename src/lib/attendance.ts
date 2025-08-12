// src/lib/attendance.ts
import { API } from './api';

export type DayEntry = { id?: number; status?: 'present' | 'absent' | 'remote' | 'leave'; note?: string };

export function getCalendar(params: { from: string; to: string; userId?: number }) {
    return API.get('/attendance/calendar', { params }).then(r => r.data);
}

export function updateByDate(body: { date: string; status: 'present' | 'absent' | 'remote' | 'leave'; note?: string }) {
    return API.patch('/attendance/by-date', body).then(r => r.data);
}

export type Attendance = { id: number; date: string; status: string; note?: string; userId: number, userName: string };

export const listAttendance = (params?: { from?: string; to?: string }) =>
    API.get<Attendance[]>('/attendance', { params }).then(r => r.data);

export const listAttendanceFor = (userId: number, params?: { from?: string; to?: string }) =>
    API.get<Attendance[]>(`/attendance/user/${userId}`, { params }).then(r => r.data);

export const upsertAttendance = (payload: { date: string; status: 'present' | 'absent' | 'remote' | 'leave'; note?: string; }) =>
    API.post('/attendance', payload).then(r => r.data);

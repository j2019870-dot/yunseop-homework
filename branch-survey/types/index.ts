// 사용자 역할 타입
export type UserRole = 'admin' | 'user';

// 사용자 인터페이스
export interface User {
    uid: string;
    email: string;
    displayName?: string;
    role: UserRole;
    branchName: string;
}

// 질문 인터페이스
export interface Question {
    id: string;
    text: string;
    required: boolean;
}

// 답변 타입
export type Answers = Record<string, string>;

// 제출 인터페이스
export interface Submission {
    id: string;
    uid: string;
    branchName: string;
    createdAt: Date;
    answers: Answers;
    submissionNo: number;
}

// 지사 카운터
export interface BranchCounter {
    count: number;
}

// API 응답 타입
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// 사용자 프로필 응답
export interface UserProfileResponse {
    uid: string;
    email: string;
    role: UserRole;
    branchName: string;
    displayName?: string;
}

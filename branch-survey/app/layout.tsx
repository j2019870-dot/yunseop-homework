import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: '지사 설문조사 시스템',
    description: 'GCP 기반 설문조사 관리 시스템',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <body className="antialiased">{children}</body>
        </html>
    );
}

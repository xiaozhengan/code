import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SecurePass - 安全密码生成器',
  description: '生成高强度安全密码，支持自定义长度、字符类型，实时评估密码强度',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}

import { cookies } from 'next/headers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { verifyAccessToken } from '@/lib/jwt';

async function getUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) return null;
    const payload = await verifyAccessToken(token);
    return {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar user={user} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}

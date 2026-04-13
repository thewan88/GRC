import { redirect } from 'next/navigation';

// Root redirects to the internal GRC dashboard
export default function Home() {
  redirect('/dashboard');
}

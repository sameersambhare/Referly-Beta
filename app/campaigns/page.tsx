import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { redirect } from 'next/navigation';
import { CampaignManager } from '@/app/components/dashboard/CampaignManager';

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="container py-10">
      <CampaignManager />
    </div>
  );
} 
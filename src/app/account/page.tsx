import Link from 'next/link';
import { AccountWorkspaceControls } from '@/components/account-workspace';
export default function AccountPage() { return <main><div style={{ padding: '1rem' }}><Link href="/plan">Back to planner</Link></div><AccountWorkspaceControls /></main>; }

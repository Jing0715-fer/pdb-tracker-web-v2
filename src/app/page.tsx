import PdbTracker from '@/components/pdb-tracker';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-claude-bg">
      <main className="flex-1 flex overflow-hidden">
        <PdbTracker />
      </main>
    </div>
  );
}

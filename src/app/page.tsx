import ScrapingInterface from '@/components/ScrapingInterface';

const HomePage: React.FC = () => {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="space-y-12">
        <ScrapingInterface />
      </div>
    </main>
  );
};

export default HomePage;

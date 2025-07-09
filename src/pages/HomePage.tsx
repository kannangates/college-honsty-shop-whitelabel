import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-foreground">Welcome to Shasun College Portal</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your gateway to academic resources and services
        </p>
      </main>
    </div>
  );
};

export default HomePage;

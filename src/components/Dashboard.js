import React from 'react';

const Dashboard = () => {
  const simulations = [
    { id: 1, status: 'completed' },
    { id: 2, status: 'running' },
    { id: 3, status: 'pending' },
    { id: 4, status: 'failed' },
    { id: 5, status: 'completed' },
    { id: 6, status: 'running' },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stat-cards">
        {/* Stat cards implementation */}
        <div className="card">Total Simulations: {simulations.length}</div>
        <div className="card">Completed: {simulations.filter(s => s.status === 'completed').length}</div>
        <div className="card">Running: {simulations.filter(s => s.status === 'running').length}</div>
        <div className="card">Pending: {simulations.filter(s => s.status === 'pending').length}</div>
        <div className="card">Failed: {simulations.filter(s => s.status === 'failed').length}</div>
      </div>
      <div className="simulation-grid">
        {/* Simulation grid implementation */}
        {simulations.map(sim => (
          <div key={sim.id} className={`simulation-item status-${sim.status}`}> 
            Simulation {sim.id} - {sim.status}
          </div>
        ))}
      </div>
      <div className="progress-tracker">
        {/* Progress tracker for recent simulations */}
        <h2>Recent Simulations</h2>
        {simulations.map(sim => (
          <div key={sim.id}>
            Simulation {sim.id}: {sim.status}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
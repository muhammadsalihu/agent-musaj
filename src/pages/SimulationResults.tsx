import React, { useState } from 'react';
import { Download, Share2, TrendingUp, Thermometer, Wind, Zap } from 'lucide-react';
import Chart from '../components/Chart';

export default function SimulationResults() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'temperature', label: 'Temperature Field' },
    { id: 'velocity', label: 'Velocity Field' },
    { id: 'pressure', label: 'Pressure Field' },
    { id: 'mesh', label: 'Mesh Analysis' },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="gradient-text text-4xl font-bold mb-2">Simulation Results</h1>
          <p className="text-gray-400">Heat Transfer Simulation - Completed</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition">
            <Share2 size={18} /> Share
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg transition">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-effect rounded-lg p-6 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-3">
            <Thermometer size={20} className="text-red-400" />
            <span className="text-sm text-gray-400">Max Temperature</span>
          </div>
          <p className="text-3xl font-bold text-red-400">487.3</p>
          <p className="text-xs text-gray-500 mt-1">°C</p>
        </div>

        <div className="glass-effect rounded-lg p-6 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-3">
            <Wind size={20} className="text-blue-400" />
            <span className="text-sm text-gray-400">Max Velocity</span>
          </div>
          <p className="text-3xl font-bold text-blue-400">12.45</p>
          <p className="text-xs text-gray-500 mt-1">m/s</p>
        </div>

        <div className="glass-effect rounded-lg p-6 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-3">
            <Zap size={20} className="text-yellow-400" />
            <span className="text-sm text-gray-400">Pressure Drop</span>
          </div>
          <p className="text-3xl font-bold text-yellow-400">2.34</p>
          <p className="text-xs text-gray-500 mt-1">Pa</p>
        </div>

        <div className="glass-effect rounded-lg p-6 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp size={20} className="text-green-400" />
            <span className="text-sm text-gray-400">Convergence</span>
          </div>
          <p className="text-3xl font-bold text-green-400">99.8%</p>
          <p className="text-xs text-gray-500 mt-1">Success</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-effect rounded-xl border border-purple-500/20 overflow-hidden">
        <div className="flex border-b border-purple-500/20">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-400 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-purple-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Chart title="Temperature Distribution" type="line" />
                <Chart title="Velocity Profile" type="bar" />
              </div>
              <Chart title="Residuals Convergence" type="line" />
            </div>
          )}

          {activeTab === 'temperature' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-500 to-red-500 h-64 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white font-semibold mb-2">Temperature Contour Plot</p>
                  <p className="text-white/70 text-sm">Min: 300K | Max: 487K</p>
                </div>
              </div>
              <Chart title="Temperature Statistics" type="bar" />
            </div>
          )}

          {activeTab === 'velocity' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-400 to-purple-600 h-64 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white font-semibold mb-2">Velocity Vector Field</p>
                  <p className="text-white/70 text-sm">Max: 12.45 m/s</p>
                </div>
              </div>
              <Chart title="Velocity Distribution" type="line" />
            </div>
          )}

          {activeTab === 'pressure' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-400 to-cyan-600 h-64 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white font-semibold mb-2">Pressure Contour Plot</p>
                  <p className="text-white/70 text-sm">Pressure Drop: 2.34 Pa</p>
                </div>
              </div>
              <Chart title="Pressure Analysis" type="bar" />
            </div>
          )}

          {activeTab === 'mesh' && (
            <div className="space-y-6">
              <div className="bg-slate-700/50 h-64 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-500/30">
                <div className="text-center">
                  <p className="text-gray-300 font-semibold mb-2">Mesh Quality Visualization</p>
                  <p className="text-gray-500 text-sm">Elements: 2,847 | Quality: 94.2%</p>
                </div>
              </div>
              <Chart title="Mesh Statistics" type="bar" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
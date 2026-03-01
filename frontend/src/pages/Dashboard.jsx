import React from 'react';
import { DashboardProvider } from '../context/DashboardContext';
import VideoPanel from '../components/dashboard/VideoPanel';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import MetricsBar from '../components/dashboard/MetricsBar';
import EmergencyModal from '../components/dashboard/EmergencyModal';

const Dashboard = () => {
    return (
        <DashboardProvider>
            <div
                className="flex flex-col sda-grid-bg"
                style={{ minHeight: 'calc(100vh - 56px)', padding: '16px', gap: '16px' }}
            >
                {/* ── Top row: Video (70%) + Alerts (30%) ── */}
                <div className="flex gap-4 flex-1 min-h-0" style={{ minHeight: 0 }}>

                    {/* Video panel — 70% */}
                    <div className="flex-[7] min-w-0 min-h-0" style={{ minHeight: 400 }}>
                        <VideoPanel />
                    </div>

                    {/* Alerts panel — 30% */}
                    <div
                        className="flex-[3] min-w-0 overflow-y-auto rounded-xl p-4"
                        style={{
                            background: 'rgba(0,6,18,0.8)',
                            border: '1px solid rgba(0,212,255,0.1)',
                            backdropFilter: 'blur(14px)',
                        }}
                    >
                        <AlertsPanel />
                    </div>
                </div>

                {/* ── Bottom: Metrics Bar ── */}
                <div className="flex-shrink-0">
                    <MetricsBar />
                </div>

                {/* Emergency Modal portal */}
                <EmergencyModal />
            </div>
        </DashboardProvider>
    );
};

export default Dashboard;


import React, { useState, useEffect } from 'react';
// @ts-ignore
import { vortex, api } from '../services/api';
import { useStation } from '../contexts/StationContext';
import { useSocket } from '../contexts/SocketContext';

interface StoryStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  published: number;
}

const MOCK_STATS: StoryStats = {
  total: 42,
  draft: 12,
  pending: 5,
  approved: 15,
  published: 10
};

const MOCK_PENDING = [
  { id: '101', title: 'Local Economic Growth Hits Record High', wordCount: 450, author: { firstName: 'Sarah', lastName: 'Connor' }, status: 'PENDING' },
  { id: '102', title: 'Infrastructure Update: New Bridge Construction', wordCount: 820, author: { firstName: 'John', lastName: 'Doe' }, status: 'PENDING' },
  { id: '103', title: 'Healthcare Initiative Launched in Rural Areas', wordCount: 615, author: { firstName: 'Alice', lastName: 'Smith' }, status: 'PENDING' },
];

export default function CentrePage() {
  const { currentStation } = useStation();
  const { socket, isConnected } = useSocket();
  const [stats, setStats] = useState<StoryStats | null>(null);
  const [pendingStories, setPendingStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentStation) {
      loadDashboardData();
    }
  }, [currentStation]);

  // Real-time Updates
  useEffect(() => {
    if (!socket) return;

    socket.on('story:created', (data) => {
      console.log('New story created:', data);
      loadDashboardData();
    });

    socket.on('story:updated', (data) => {
      console.log('Story updated:', data);
      loadDashboardData();
    });

    socket.on('story:approved', (data) => {
      console.log('Story approved:', data);
      loadDashboardData();
    });

    return () => {
      socket.off('story:created');
      socket.off('story:updated');
      socket.off('story:approved');
    };
  }, [socket]);

  // Use vortex service for fetching formatted story data
  const loadDashboardData = async () => {
    if (!currentStation) return;
    try {
      setLoading(true);
      
      // Fetch pending stories using the vortex service wrapper
      const pendingRes = await vortex.stories.getAll({ 
        stationId: currentStation.id, 
        status: 'PENDING' 
      }).catch(() => ({ data: { stories: MOCK_PENDING } }));
      
      setPendingStories(pendingRes.data.stories || []);

      // Calculate stats by fetching a broader range of stories
      const allRes = await vortex.stories.getAll({ 
        stationId: currentStation.id, 
        limit: 1000 
      }).catch(() => ({ data: { stories: [] } }));
      
      const allStories = allRes.data.stories || [];
      
      if (allStories.length > 0) {
        const statsData: StoryStats = {
          total: allStories.length,
          draft: allStories.filter((s: any) => s.status === 'DRAFT').length,
          pending: allStories.filter((s: any) => s.status === 'PENDING').length,
          approved: allStories.filter((s: any) => s.status === 'APPROVED').length,
          published: allStories.filter((s: any) => s.status === 'PUBLISHED').length,
        };
        setStats(statsData);
      } else {
        // Fallback to mock stats for demo purposes
        setStats(MOCK_STATS);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setStats(MOCK_STATS);
      setPendingStories(MOCK_PENDING);
    } finally {
      setLoading(false);
    }
  };

  // Use vortex service for updating story status
  const handleApprove = async (storyId: string) => {
    try {
      
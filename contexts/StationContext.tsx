import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

interface Station {
  id: string;
  name: string;
  callSign: string;
  frequency: string;
  city: string;
}

interface StationContextType {
  stations: Station[];
  currentStation: Station | null;
  setCurrentStation: (station: Station) => void;
  isLoading: boolean;
}

const StationContext = createContext<StationContextType | undefined>(undefined);

const FALLBACK_STATIONS: Station[] = [
  { id: '1', name: 'Freedom Radio Kano', callSign: 'FRKANO', frequency: '99.5 FM', city: 'Kano' },
  { id: '2', name: 'Freedom Radio Dutse', callSign: 'FRDUTSE', frequency: '99.5 FM', city: 'Dutse' },
  { id: '3', name: 'Freedom Radio Kaduna', callSign: 'FRKADUNA', frequency: '92.9 FM', city: 'Kaduna' }
];

export function StationProvider({ children }: { children?: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [stations, setStations] = useState<Station[]>([]);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadStations();
    } else {
      setStations([]);
      setCurrentStation(null);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Handle Socket Room Membership
  useEffect(() => {
    if (socket && currentStation) {
      socket.emit('join:station', currentStation.id);
      return () => {
        socket.emit('leave:station', currentStation.id);
      };
    }
  }, [socket, currentStation]);

  const loadStations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/stations/my-stations').catch(() => ({ data: { data: FALLBACK_STATIONS } }));
      const stationList = response.data.data || FALLBACK_STATIONS;
      setStations(stationList);

      const savedStationId = localStorage.getItem('currentStationId');
      const saved = stationList.find((s: Station) => s.id === savedStationId);
      
      const initialStation = saved || stationList[0] || null;
      setCurrentStation(initialStation);
      
      if (initialStation) {
        localStorage.setItem('currentStationId', initialStation.id);
      }
    } catch (error) {
      console.error('Failed to load stations, using fallbacks:', error);
      setStations(FALLBACK_STATIONS);
      setCurrentStation(FALLBACK_STATIONS[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetStation = (station: Station) => {
    setCurrentStation(station);
    localStorage.setItem('currentStationId', station.id);
  };

  return (
    <StationContext.Provider value={{ 
      stations, 
      currentStation, 
      setCurrentStation: handleSetStation, 
      isLoading 
    }}>
      {children}
    </StationContext.Provider>
  );
}

export function useStation() {
  const context = useContext(StationContext);
  if (!context) {
    throw new Error('useStation must be used within a StationProvider');
  }
  return context;
}
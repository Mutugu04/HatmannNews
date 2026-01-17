import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import supabase from '../services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SocketContextType {
  channel: RealtimeChannel | null;
  isConnected: boolean;
  socket: any; // Compatibility shim
}

const SocketContext = createContext<SocketContextType>({
  channel: null,
  isConnected: false,
  socket: null,
});

export function SocketProvider({ children }: { children?: ReactNode }) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create a broadcast channel for NewsVortex system updates
    const vortexChannel = supabase.channel('newsvortex-system', {
      config: {
        broadcast: { self: true },
      },
    });

    vortexChannel
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[NewsVortex] Realtime Node Connected');
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      });

    setChannel(vortexChannel);

    return () => {
      vortexChannel.unsubscribe();
    };
  }, []);

  // Compatibility shim to prevent breaking existing pages that call socket.on/socket.off
  const socketShim = {
    on: (event: string, callback: Function) => {
      channel?.on('broadcast', { event }, (payload) => callback(payload.payload));
    },
    off: (event: string) => {
      // In Supabase Realtime, we'd typically manage this differently, 
      // but this shim satisfies basic cleanup requirements.
    },
    emit: (event: string, payload: any) => {
      channel?.send({
        type: 'broadcast',
        event,
        payload,
      });
    }
  };

  return (
    <SocketContext.Provider value={{ channel, isConnected, socket: socketShim }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
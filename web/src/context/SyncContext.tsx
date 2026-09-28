import React, { createContext, useContext, useState, useEffect } from 'react';
import { offlineDb, OfflineObservation } from '../services/db';
import api from '../services/api';

interface SyncContextType {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  syncPendingObservations: () => Promise<number>;
  addOfflineObservation: (obs: Omit<OfflineObservation, 'synced'>) => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const refreshPendingCount = async () => {
    const count = await offlineDb.offlineObservations.filter(item => !item.synced).count();
    setPendingCount(count);
  };

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingObservations();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addOfflineObservation = async (obs: Omit<OfflineObservation, 'synced'>) => {
    await offlineDb.offlineObservations.add({
      ...obs,
      synced: false
    });
    await refreshPendingCount();

    // If online, immediately attempt sync
    if (navigator.onLine) {
      syncPendingObservations();
    }
  };

  const syncPendingObservations = async (): Promise<number> => {
    const pendingItems = await offlineDb.offlineObservations.filter(item => !item.synced).toArray();
    if (pendingItems.length === 0) return 0;

    setIsSyncing(true);
    try {
      const payload = pendingItems.map(item => ({
        mine_id: item.mine_id,
        section_id: item.section_id,
        category: item.category,
        description: item.description,
        severity: item.severity,
        is_violation: item.is_violation,
        latitude: item.latitude,
        longitude: item.longitude,
        photo_url: item.photo_url,
        client_uuid: item.client_uuid,
        client_timestamp: item.client_timestamp
      }));

      const res = await api.post('/inspections/observations/sync', payload);
      if (res.data.status === 'success') {
        // Mark items as synced
        const ids = pendingItems.map(i => i.id!).filter(Boolean);
        await offlineDb.offlineObservations.where('id').anyOf(ids).modify({ synced: true });
        await refreshPendingCount();
        setIsSyncing(false);
        return res.data.synced_count;
      }
    } catch (err) {
      console.error('Offline sync failed:', err);
    }
    setIsSyncing(false);
    return 0;
  };

  return (
    <SyncContext.Provider value={{ isOnline, pendingCount, isSyncing, syncPendingObservations, addOfflineObservation }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within SyncProvider');
  return context;
};

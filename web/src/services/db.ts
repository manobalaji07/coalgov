import Dexie, { type Table } from 'dexie';

export interface OfflineObservation {
  id?: number;
  client_uuid: string;
  mine_id: string;
  section_id?: string;
  category: string;
  description: string;
  severity: string;
  is_violation: boolean;
  latitude?: number;
  longitude?: number;
  photo_url?: string;
  client_timestamp: string;
  synced: boolean;
}

export class CoalGovOfflineDB extends Dexie {
  offlineObservations!: Table<OfflineObservation>;

  constructor() {
    super('CoalGovOfflineDB');
    this.version(1).stores({
      offlineObservations: '++id, client_uuid, mine_id, category, severity, synced, client_timestamp'
    });
  }
}

export const offlineDb = new CoalGovOfflineDB();

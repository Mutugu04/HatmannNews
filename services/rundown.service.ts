import { api } from './api';

export async function createShow(data: { stationId: string; name: string; description?: string; defaultDuration?: number; }) {
  return api.post('/rundown/shows', data);
}

export async function getShows(stationId: string) {
  return api.get(`/rundown/shows?stationId=${stationId}`);
}

export async function createShowInstance(showId: string, data: { airDate: Date; startTime: Date; endTime: Date; }) {
  return api.post(`/rundown/shows/${showId}/instances`, data);
}

export async function getRundown(rundownId: string) {
  return api.get(`/rundown/rundowns/${rundownId}`);
}

export async function addRundownItem(rundownId: string, data: any) {
  return api.post(`/rundown/rundowns/${rundownId}/items`, data);
}

export async function updateRundownItem(itemId: string, data: any) {
  return api.patch(`/rundown/rundowns/items/${itemId}`, data);
}

export async function reorderRundownItems(rundownId: string, itemIds: string[]) {
  return api.post(`/rundown/rundowns/${rundownId}/reorder`, { itemIds });
}

export async function deleteRundownItem(itemId: string) {
  return api.delete(`/rundown/rundowns/items/${itemId}`);
}
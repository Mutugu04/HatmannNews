import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock Storage Helper
const getMockData = (key: string) => JSON.parse(sessionStorage.getItem(`mock_${key}`) || 'null');
const setMockData = (key: string, data: any) => sessionStorage.setItem(`mock_${key}`, JSON.stringify(data));

// Initial Mock Data Seeds
const SEED_STATIONS = [
  { id: '1', name: 'Freedom Radio Kano', callSign: 'FRKANO', frequency: '99.5 FM', city: 'Kano' },
  { id: '2', name: 'Freedom Radio Dutse', callSign: 'FRDUTSE', frequency: '99.5 FM', city: 'Dutse' },
  { id: '3', name: 'Freedom Radio Kaduna', callSign: 'FRKADUNA', frequency: '92.9 FM', city: 'Kaduna' },
  { id: '4', name: 'Dala FM 88.5 Kano', callSign: 'DALAFM', frequency: '88.5 FM', city: 'Kano' }
];

const SEED_SHOWS = [
  { id: 's1', name: 'Morning Intelligence Report', description: 'Daily morning briefing', defaultDuration: 60 },
  { id: 's2', name: 'The NewsVortex Noon', description: 'Mid-day news summary', defaultDuration: 30 },
  { id: 's3', name: 'Global Narrative Review', description: 'International affairs analysis', defaultDuration: 45 }
];

const SEED_STORIES = [
  { id: 'st1', title: 'Global Tech Summit: AI Regulations Proposed', status: 'PUBLISHED', wordCount: 840, createdAt: new Date().toISOString(), author: { firstName: 'Sarah', lastName: 'Connor' }, priority: 'HIGH' },
  { id: 'st2', title: 'Regional Infrastructure Update: Phase 2 Begins', status: 'APPROVED', wordCount: 520, createdAt: new Date().toISOString(), author: { firstName: 'John', lastName: 'Doe' }, priority: 'NORMAL' },
  { id: 'st3', title: 'Economic Shift: Central Bank Interest Rate Strategy', status: 'PENDING', wordCount: 1200, createdAt: new Date().toISOString(), author: { firstName: 'Alice', lastName: 'Smith' }, priority: 'URGENT' },
  { id: 'st4', title: 'Environmental Accord Signed in Zurich', status: 'DRAFT', wordCount: 310, createdAt: new Date().toISOString(), author: { firstName: 'Robert', lastName: 'Neville' }, priority: 'LOW' }
];

const SEED_WIRE_SERVICES = [
  { id: 'w1', name: 'Reuters Global', slug: 'reuters', lastFetched: new Date().toISOString(), _count: { items: 124 }, status: 'Connected', description: 'Standard API for international narrative flow.' },
  { id: 'w2', name: 'Associated Press', slug: 'ap', lastFetched: new Date().toISOString(), _count: { items: 89 }, status: 'Sync Error', description: 'High-velocity data item transmission.' },
  { id: 'w3', name: 'NewsVortex Intelligence', slug: 'newsvortex', lastFetched: new Date().toISOString(), _count: { items: 12 }, status: 'Initialized', description: 'Automated diagnostic and vision detection layer.' }
];

// Initialize mocks if empty
if (!getMockData('stations')) setMockData('stations', SEED_STATIONS);
if (!getMockData('shows')) setMockData('shows', SEED_SHOWS);
if (!getMockData('stories')) setMockData('stories', SEED_STORIES);
if (!getMockData('wire_services')) setMockData('wire_services', SEED_WIRE_SERVICES);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock Logic Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If it's a network error (server down), return mock data
    if (!error.response || error.code === 'ERR_NETWORK') {
      const config = error.config;
      const url = config.url || '';
      const method = config.method || 'get';

      console.warn(`[NewsVortex API] Server offline. Simulating response for: ${method.toUpperCase()} ${url}`);

      // Route Handlers
      if (url.includes('/stories')) {
        const stories = getMockData('stories');
        if (method === 'get') {
          return { data: { success: true, data: { stories, total: stories.length, page: 1, totalPages: 1 } } };
        }
        if (method === 'post') {
          const newStory = { ...JSON.parse(config.data), id: `st${Date.now()}`, createdAt: new Date().toISOString(), author: { firstName: 'Test', lastName: 'User' }, status: 'DRAFT' };
          const updated = [newStory, ...stories];
          setMockData('stories', updated);
          return { data: { success: true, data: newStory } };
        }
      }

      if (url.includes('/rundown/shows')) {
        const shows = getMockData('shows');
        if (url.endsWith('/instances') && method === 'get') {
          return { data: { success: true, data: [
            { id: 'inst1', airDate: new Date().toISOString(), startTime: new Date().toISOString(), status: 'SCHEDULED', rundown: { id: 'rd1', status: 'DRAFT' } }
          ]}};
        }
        if (url.includes('/instances') && method === 'post') {
          return { data: { success: true, data: { id: 'inst_new', rundown: { id: 'rd1' } } } };
        }
        if (method === 'get') {
          return { data: { success: true, data: shows } };
        }
        if (method === 'post') {
          const newShow = { ...JSON.parse(config.data), id: `s${Date.now()}` };
          const updated = [...shows, newShow];
          setMockData('shows', updated);
          return { data: { success: true, data: newShow } };
        }
      }

      if (url.includes('/rundown/rundowns/')) {
        const id = url.split('/').pop();
        return { data: { success: true, data: {
          id: id,
          status: 'DRAFT',
          totalDuration: 900,
          showInstance: {
            show: { name: 'Morning Intelligence Report' },
            airDate: new Date().toISOString(),
            startTime: new Date().toISOString()
          },
          items: [
            { id: 'i1', position: 0, type: 'STORY', title: 'AI Ethics in Journalism', plannedDuration: 180, status: 'READY', story: { id: 'st1', title: 'AI Ethics', wordCount: 840 } },
            { id: 'i2', position: 1, type: 'BREAK', title: 'Station ID / Commercials', plannedDuration: 120, status: 'PENDING' },
            { id: 'i3', position: 2, type: 'INTERVIEW', title: 'Discussion with Dr. Aris', plannedDuration: 300, status: 'PENDING' },
            { id: 'i4', position: 3, type: 'PROMO', title: 'Upcoming Evening Brief', plannedDuration: 60, status: 'PENDING' }
          ]
        }}};
      }

      if (url.includes('/wire/services')) {
        const services = getMockData('wire_services');
        if (method === 'get') {
          return { data: { success: true, data: services } };
        }
        if (method === 'post') {
          const data = JSON.parse(config.data);
          const newService = { 
            ...data, 
            id: `w${Date.now()}`, 
            lastFetched: new Date().toISOString(), 
            _count: { items: 0 },
            status: 'Connected',
            description: `Active intelligence stream from ${data.name}.`
          };
          const updated = [...services, newService];
          setMockData('wire_services', updated);
          return { data: { success: true, data: newService } };
        }
      }

      if (url.includes('/wire/items')) {
        return { data: { success: true, data: { items: [
          { id: 'wi1', title: 'Markets Rally on Positive Jobs Data', summary: 'Global stocks surged today as employment numbers exceeded analyst expectations in key sectors.', service: { name: 'Reuters' }, publishedAt: new Date().toISOString(), importedToId: null },
          { id: 'wi2', title: 'Cybersecurity Breach in Financial Hub', summary: 'Major banks are on high alert following a sophisticated digital incursion targeting transaction logs.', service: { name: 'AP' }, publishedAt: new Date().toISOString(), importedToId: 'st1' },
          { id: 'wi3', title: 'Space Agency Successfully Deploys Satellite', summary: 'The deep-space array is now operational, providing high-resolution imaging of the outer belt.', service: { name: 'NewsVortex' }, publishedAt: new Date().toISOString(), importedToId: null }
        ]}}};
      }

      if (url.includes('/stations')) {
        const stations = getMockData('stations');
        if (method === 'get') {
          return { data: { success: true, data: stations } };
        }
        if (method === 'post') {
          const newStation = { ...JSON.parse(config.data), id: `st${Date.now()}` };
          const updated = [...stations, newStation];
          setMockData('stations', updated);
          return { data: { success: true, data: newStation } };
        }
      }
    }
    return Promise.reject(error);
  }
);
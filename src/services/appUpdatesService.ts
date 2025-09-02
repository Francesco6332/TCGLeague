export interface AppUpdate {
  id: string;
  version: string;
  title: string;
  description: string;
  type: 'feature' | 'enhancement' | 'fix' | 'security';
  date: string;
  priority: 'high' | 'medium' | 'low';
  author: string;
  details: string[];
}

export interface AppUpdatesData {
  updates: AppUpdate[];
}

// Cache for app updates
let updatesCache: { data: AppUpdate[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (shorter cache for app updates)

// Fallback updates if file is not available
const fallbackUpdates: AppUpdate[] = [
  {
    id: 'fallback-001',
    version: '1.0.0',
    title: 'App Launch',
    description: 'TCG League app is now live with core tournament management features.',
    type: 'feature',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    priority: 'high',
    author: 'Dev Team',
    details: [
      'User registration and authentication',
      'Event creation and management',
      'Tournament standings and results',
      'Deck builder functionality'
    ]
  }
];

// Function to fetch app updates from local file
async function fetchAppUpdates(): Promise<AppUpdate[]> {
  try {
    // In development, try to fetch from the local file
    if (import.meta.env.DEV) {
      const response = await fetch('/app-updates.json');
      if (response.ok) {
        const data: AppUpdatesData = await response.json();
        return data.updates.map(update => ({
          ...update,
          date: new Date(update.date).toISOString()
        }));
      }
    }
    
    // If file is not available or in production, return fallback
    return fallbackUpdates;
  } catch (error) {
    console.warn('Could not load app updates, using fallback data:', error);
    return fallbackUpdates;
  }
}

// Function to get app updates with caching
export async function getAppUpdates(limit: number = 5): Promise<AppUpdate[]> {
  const now = Date.now();
  
  // Check cache validity
  if (updatesCache && (now - updatesCache.timestamp) < CACHE_DURATION) {
    return updatesCache.data.slice(0, limit);
  }
  
  try {
    const updates = await fetchAppUpdates();
    
    // Sort by date (newest first)
    const sortedUpdates = updates.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Update cache
    updatesCache = {
      data: sortedUpdates,
      timestamp: now,
    };
    
    return sortedUpdates.slice(0, limit);
  } catch (error) {
    console.error('Error getting app updates:', error);
    
    // Return cached data if available, otherwise fallback
    return updatesCache?.data.slice(0, limit) || fallbackUpdates.slice(0, limit);
  }
}

// Function to get updates by type
export async function getUpdatesByType(type: AppUpdate['type'], limit: number = 3): Promise<AppUpdate[]> {
  const allUpdates = await getAppUpdates(20); // Get more updates to filter
  return allUpdates
    .filter(update => update.type === type)
    .slice(0, limit);
}

// Function to get recent updates (last 30 days)
export async function getRecentUpdates(limit: number = 5): Promise<AppUpdate[]> {
  const allUpdates = await getAppUpdates(20);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  return allUpdates
    .filter(update => new Date(update.date) > thirtyDaysAgo)
    .slice(0, limit);
}

// Function to clear cache (useful for manual refresh)
export function clearAppUpdatesCache(): void {
  updatesCache = null;
}

// Function to get update type color
export function getUpdateTypeColor(type: AppUpdate['type']): string {
  switch (type) {
    case 'feature': return '#10b981'; // green
    case 'enhancement': return '#3b82f6'; // blue
    case 'fix': return '#f59e0b'; // yellow
    case 'security': return '#ef4444'; // red
    default: return '#6b7280'; // gray
  }
}

// Function to get update type icon
export function getUpdateTypeIcon(type: AppUpdate['type']): string {
  switch (type) {
    case 'feature': return '✨';
    case 'enhancement': return '🔧';
    case 'fix': return '🐛';
    case 'security': return '🔒';
    default: return '📝';
  }
}

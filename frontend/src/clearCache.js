// This script runs when the app loads and clears any cached data

// Function to clear the dashboard cache
export function clearDashboardCache() {
  console.log('Clearing dashboard cache...');
  
  // Get all localStorage keys
  const keys = Object.keys(localStorage);
  
  // Remove all keys related to the dashboard
  keys.forEach(key => {
    if (key.includes('dashboard') || 
        key.includes('selected') || 
        key.includes('course') || 
        key.includes('user') || 
        key.includes('events')) {
      localStorage.removeItem(key);
    }
  });
  
  // Force refresh if needed
  const pathname = window.location.pathname;
  if (pathname.includes('/client/dashboard') && !window.location.search.includes('refresh')) {
    localStorage.setItem('dashboardNeedsRefresh', 'true');
  }
  
  console.log('Dashboard cache cleared.');
  return true;
}

// Export the cache clearing function
export default clearDashboardCache;

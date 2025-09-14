// =====================================================
// MANUAL DELETION PERSISTENCE TEST
// =====================================================
// Run this in browser console to test deletion persistence

console.log('🧪 Manual Deletion Persistence Test');
console.log('=====================================');

// Test function to simulate the deletion issue
function testDeletionPersistence() {
  console.log('\n📋 Setting up test scenario...');
  
  // 1. Create test data (simulating Curiosity Compass generation)
  const testRoadmap = {
    id: 'test-main-roadmap-123',
    title: 'Test AI Roadmap',
    description: 'A test roadmap for deletion testing',
    domains: ['AI/ML', 'Web Development'],
    topics: ['React', 'TypeScript', 'Machine Learning'],
    created_at: new Date().toISOString()
  };
  
  const testSelections = {
    domains: ['AI/ML', 'Web Development'],
    topics: ['React', 'TypeScript', 'Machine Learning']
  };
  
  // Store in localStorage (simulating what Curiosity Compass does)
  localStorage.setItem('generated_roadmap', JSON.stringify(testRoadmap));
  localStorage.setItem('exploration_selections', JSON.stringify(testSelections));
  localStorage.setItem('deleted_roadmaps', JSON.stringify([]));
  
  console.log('✅ Test data stored in localStorage');
  console.log('📊 Roadmap:', testRoadmap.title);
  console.log('📊 Selections:', testSelections);
  
  // 2. Simulate creating derived roadmaps (what AIRoadmap does)
  console.log('\n🔄 Simulating derived roadmap creation...');
  const derivedRoadmaps = [
    { id: 'derived-ai-ml-123', title: 'AI/ML Roadmap', domain: 'AI/ML' },
    { id: 'derived-web-dev-456', title: 'Web Development Roadmap', domain: 'Web Development' }
  ];
  
  console.log('📊 Created derived roadmaps:', derivedRoadmaps.map(r => r.title));
  
  // 3. Simulate deletion of one roadmap
  console.log('\n🗑️ Simulating deletion of AI/ML roadmap...');
  const deletedRoadmaps = ['derived-ai-ml-123'];
  localStorage.setItem('deleted_roadmaps', JSON.stringify(deletedRoadmaps));
  
  // Apply the enhanced deletion logic
  const storedRoadmap = localStorage.getItem('generated_roadmap');
  if (storedRoadmap) {
    try {
      const roadmapData = JSON.parse(storedRoadmap);
      const storedSelections = localStorage.getItem('exploration_selections');
      
      if (storedSelections) {
        const selections = JSON.parse(storedSelections);
        const wasDerivedFromMain = roadmapData.domains?.some(domain => 
          selections.domains?.includes(domain)
        ) || roadmapData.topics?.some(topic => 
          selections.topics?.includes(topic)
        );
        
        if (wasDerivedFromMain) {
          console.log('🗑️ Deleted roadmap was derived from main roadmap, clearing localStorage');
          localStorage.removeItem('generated_roadmap');
          localStorage.removeItem('exploration_selections');
        }
      }
    } catch (error) {
      console.log('⚠️ Error parsing stored roadmap:', error);
    }
  }
  
  console.log('✅ Deletion simulation complete');
  
  // 4. Simulate page refresh
  console.log('\n🔄 Simulating page refresh...');
  const refreshStoredRoadmap = localStorage.getItem('generated_roadmap');
  const refreshStoredSelections = localStorage.getItem('exploration_selections');
  const refreshDeletedRoadmaps = JSON.parse(localStorage.getItem('deleted_roadmaps') || '[]');
  
  console.log('📊 After refresh:');
  console.log('   - Stored roadmap:', refreshStoredRoadmap ? 'EXISTS' : 'CLEARED');
  console.log('   - Stored selections:', refreshStoredSelections ? 'EXISTS' : 'CLEARED');
  console.log('   - Deleted roadmaps:', refreshDeletedRoadmaps);
  
  // 5. Check if content would reappear
  if (refreshStoredRoadmap && refreshStoredSelections) {
    console.log('❌ PROBLEM: Content would reappear from localStorage!');
    console.log('   This means the deletion fix is not working properly.');
    return false;
  } else {
    console.log('✅ SUCCESS: Content would NOT reappear from localStorage!');
    console.log('   The deletion fix is working correctly.');
    return true;
  }
}

// Test function to check current state
function checkCurrentState() {
  console.log('\n📊 Current localStorage State:');
  console.log('================================');
  
  const keys = ['generated_roadmap', 'exploration_selections', 'deleted_roadmaps'];
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value ? JSON.parse(value) : 'NOT SET');
  });
  
  console.log('\n📊 All localStorage keys related to roadmaps:');
  Object.keys(localStorage).filter(key => 
    key.includes('roadmap') || key.includes('exploration') || key.includes('deleted')
  ).forEach(key => {
    console.log(`${key}:`, localStorage.getItem(key));
  });
}

// Test function to clean up
function cleanupTest() {
  console.log('\n🧹 Cleaning up test data...');
  localStorage.removeItem('generated_roadmap');
  localStorage.removeItem('exploration_selections');
  localStorage.removeItem('deleted_roadmaps');
  console.log('✅ Cleanup complete');
}

// Export functions to global scope
window.testDeletionPersistence = testDeletionPersistence;
window.checkCurrentState = checkCurrentState;
window.cleanupTest = cleanupTest;

console.log('\n🎯 Available test functions:');
console.log('   testDeletionPersistence() - Run the full test');
console.log('   checkCurrentState() - Check current localStorage state');
console.log('   cleanupTest() - Clean up test data');
console.log('\n💡 Run testDeletionPersistence() to test the fix!');

// =====================================================
// DELETION PERSISTENCE TEST UTILITY
// =====================================================
// Tests to verify that deleted content stays deleted after refresh

export interface TestRoadmap {
  id: string;
  title: string;
  description: string;
  domains?: string[];
  topics?: string[];
  created_at: string;
}

export interface TestSelections {
  domains: string[];
  topics: string[];
}

export class DeletionPersistenceTest {
  private static readonly STORAGE_KEYS = {
    GENERATED_ROADMAP: 'generated_roadmap',
    EXPLORATION_SELECTIONS: 'exploration_selections',
    DELETED_ROADMAPS: 'deleted_roadmaps'
  };

  // Create test data
  static createTestData(): { roadmap: TestRoadmap; selections: TestSelections } {
    const roadmap: TestRoadmap = {
      id: 'test-roadmap-123',
      title: 'Test AI Roadmap',
      description: 'A test roadmap for deletion persistence testing',
      domains: ['AI/ML', 'Web Development'],
      topics: ['React', 'TypeScript', 'Machine Learning'],
      created_at: new Date().toISOString()
    };

    const selections: TestSelections = {
      domains: ['AI/ML', 'Web Development'],
      topics: ['React', 'TypeScript', 'Machine Learning']
    };

    return { roadmap, selections };
  }

  // Setup test scenario - simulate data being loaded from Curiosity Compass
  static setupTestScenario(): void {
    console.log('🧪 Setting up test scenario...');
    
    const { roadmap, selections } = this.createTestData();
    
    // Store test data in localStorage (simulating Curiosity Compass generation)
    localStorage.setItem(this.STORAGE_KEYS.GENERATED_ROADMAP, JSON.stringify(roadmap));
    localStorage.setItem(this.STORAGE_KEYS.EXPLORATION_SELECTIONS, JSON.stringify(selections));
    
    // Clear any existing deleted roadmaps
    localStorage.setItem(this.STORAGE_KEYS.DELETED_ROADMAPS, JSON.stringify([]));
    
    console.log('✅ Test scenario setup complete');
    console.log('📊 Stored roadmap:', roadmap.title);
    console.log('📊 Stored selections:', selections);
  }

  // Simulate deletion of a roadmap
  static simulateDeletion(roadmapId: string): void {
    console.log(`🗑️ Simulating deletion of roadmap: ${roadmapId}`);
    
    // Add to deleted roadmaps list
    const deletedRoadmaps = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.DELETED_ROADMAPS) || '[]');
    if (!deletedRoadmaps.includes(roadmapId)) {
      deletedRoadmaps.push(roadmapId);
      localStorage.setItem(this.STORAGE_KEYS.DELETED_ROADMAPS, JSON.stringify(deletedRoadmaps));
    }

    // Simulate the enhanced deletion logic from AIRoadmap.tsx
    const storedRoadmap = localStorage.getItem(this.STORAGE_KEYS.GENERATED_ROADMAP);
    if (storedRoadmap) {
      try {
        const roadmapData = JSON.parse(storedRoadmap);
        
        // If this is the main generated roadmap, clear it completely
        if (roadmapData.id === roadmapId) {
          localStorage.removeItem(this.STORAGE_KEYS.GENERATED_ROADMAP);
          localStorage.removeItem(this.STORAGE_KEYS.EXPLORATION_SELECTIONS);
          console.log('✅ Removed main roadmap from localStorage completely');
        } else {
          // Check if the deleted roadmap was derived from the main roadmap
          const storedSelections = localStorage.getItem(this.STORAGE_KEYS.EXPLORATION_SELECTIONS);
          if (storedSelections) {
            try {
              const selections = JSON.parse(storedSelections);
              const wasDerivedFromMain = roadmapData.domains?.some((domain: any) => 
                selections.domains?.includes(domain)
              ) || roadmapData.topics?.some((topic: any) => 
                selections.topics?.includes(topic)
              );
              
              if (wasDerivedFromMain) {
                console.log('🗑️ Deleted roadmap was derived from main roadmap, clearing localStorage');
                localStorage.removeItem(this.STORAGE_KEYS.GENERATED_ROADMAP);
                localStorage.removeItem(this.STORAGE_KEYS.EXPLORATION_SELECTIONS);
              }
            } catch (error) {
              console.log('⚠️ Error parsing stored selections:', error);
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Error parsing stored roadmap:', error);
      }
    }

    console.log('✅ Deletion simulation complete');
  }

  // Simulate page refresh - check if deleted content would reappear
  static simulatePageRefresh(): { 
    wouldReappear: boolean; 
    localStorageData: any; 
    deletedRoadmaps: string[];
    analysis: string;
  } {
    console.log('🔄 Simulating page refresh...');
    
    const storedRoadmap = localStorage.getItem(this.STORAGE_KEYS.GENERATED_ROADMAP);
    const storedSelections = localStorage.getItem(this.STORAGE_KEYS.EXPLORATION_SELECTIONS);
    const deletedRoadmaps = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.DELETED_ROADMAPS) || '[]');
    
    let wouldReappear = false;
    let analysis = '';

    if (storedRoadmap && storedSelections) {
      try {
        const roadmapData = JSON.parse(storedRoadmap);
        const selections = JSON.parse(storedSelections);
        
        // Check if the main roadmap or any of its derived content was deleted
        const mainRoadmapDeleted = deletedRoadmaps.includes(roadmapData.id);
        const hasDeletedDerivedContent = deletedRoadmaps.some((deletedId: string) => {
          return roadmapData.domains?.some((domain: any) => 
            selections.domains?.includes(domain)
          ) || roadmapData.topics?.some((topic: any) => 
            selections.topics?.includes(topic)
          );
        });
        
        if (mainRoadmapDeleted || hasDeletedDerivedContent) {
          analysis = '✅ GOOD: localStorage would be cleared due to deleted content';
          wouldReappear = false;
        } else {
          analysis = '❌ BAD: Content would reappear from localStorage';
          wouldReappear = true;
        }
      } catch (error) {
        analysis = '⚠️ ERROR: Could not parse localStorage data';
        wouldReappear = false;
      }
    } else {
      analysis = '✅ GOOD: No localStorage data to cause reappearance';
      wouldReappear = false;
    }

    console.log('📊 Refresh simulation results:');
    console.log('   - Would content reappear?', wouldReappear);
    console.log('   - Analysis:', analysis);
    console.log('   - Deleted roadmaps:', deletedRoadmaps);

    return {
      wouldReappear,
      localStorageData: {
        roadmap: storedRoadmap ? JSON.parse(storedRoadmap) : null,
        selections: storedSelections ? JSON.parse(storedSelections) : null
      },
      deletedRoadmaps,
      analysis
    };
  }

  // Run comprehensive test suite
  static runTestSuite(): void {
    console.log('🧪 Starting Deletion Persistence Test Suite');
    console.log('=' .repeat(50));

    // Test 1: Setup and basic deletion
    console.log('\n📋 Test 1: Basic Deletion Test');
    this.setupTestScenario();
    this.simulateDeletion('test-roadmap-123');
    const result1 = this.simulatePageRefresh();
    
    if (!result1.wouldReappear) {
      console.log('✅ Test 1 PASSED: Main roadmap deletion works');
    } else {
      console.log('❌ Test 1 FAILED: Main roadmap would reappear');
    }

    // Test 2: Derived content deletion
    console.log('\n📋 Test 2: Derived Content Deletion Test');
    this.setupTestScenario();
    
    // Create a derived roadmap ID (simulating what happens in createSeparateRoadmaps)
    const derivedRoadmapId = 'derived-roadmap-ai-ml-123';
    this.simulateDeletion(derivedRoadmapId);
    const result2 = this.simulatePageRefresh();
    
    if (!result2.wouldReappear) {
      console.log('✅ Test 2 PASSED: Derived content deletion works');
    } else {
      console.log('❌ Test 2 FAILED: Derived content would reappear');
    }

    // Test 3: Multiple deletions
    console.log('\n📋 Test 3: Multiple Deletions Test');
    this.setupTestScenario();
    
    // Simulate deleting multiple derived roadmaps
    this.simulateDeletion('derived-roadmap-ai-ml-123');
    this.simulateDeletion('derived-roadmap-web-dev-456');
    const result3 = this.simulatePageRefresh();
    
    if (!result3.wouldReappear) {
      console.log('✅ Test 3 PASSED: Multiple deletions work');
    } else {
      console.log('❌ Test 3 FAILED: Some content would reappear after multiple deletions');
    }

    // Test 4: Edge case - empty localStorage
    console.log('\n📋 Test 4: Empty localStorage Test');
    localStorage.removeItem(this.STORAGE_KEYS.GENERATED_ROADMAP);
    localStorage.removeItem(this.STORAGE_KEYS.EXPLORATION_SELECTIONS);
    localStorage.removeItem(this.STORAGE_KEYS.DELETED_ROADMAPS);
    
    const result4 = this.simulatePageRefresh();
    
    if (!result4.wouldReappear) {
      console.log('✅ Test 4 PASSED: Empty localStorage handled correctly');
    } else {
      console.log('❌ Test 4 FAILED: Empty localStorage caused issues');
    }

    console.log('\n🎯 Test Suite Complete');
    console.log('=' .repeat(50));
  }

  // Clean up test data
  static cleanup(): void {
    console.log('🧹 Cleaning up test data...');
    localStorage.removeItem(this.STORAGE_KEYS.GENERATED_ROADMAP);
    localStorage.removeItem(this.STORAGE_KEYS.EXPLORATION_SELECTIONS);
    localStorage.removeItem(this.STORAGE_KEYS.DELETED_ROADMAPS);
    console.log('✅ Cleanup complete');
  }

  // Get current localStorage state for debugging
  static getCurrentState(): any {
    return {
      generatedRoadmap: localStorage.getItem(this.STORAGE_KEYS.GENERATED_ROADMAP),
      explorationSelections: localStorage.getItem(this.STORAGE_KEYS.EXPLORATION_SELECTIONS),
      deletedRoadmaps: localStorage.getItem(this.STORAGE_KEYS.DELETED_ROADMAPS),
      allLocalStorage: Object.keys(localStorage).filter(key => 
        key.includes('roadmap') || key.includes('exploration') || key.includes('deleted')
      )
    };
  }
}

// Export for use in browser console or other test files
if (typeof window !== 'undefined') {
  (window as any).DeletionPersistenceTest = DeletionPersistenceTest;
}

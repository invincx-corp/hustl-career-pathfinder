import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, Loader2, MapPin, TrendingUp, Users, DollarSign } from 'lucide-react';
import { careerAPIService, CareerAPIResponse, CareerSearchFilters } from '@/lib/career-api-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface CareerSearchProps {
  onCareerSelect?: (career: CareerAPIResponse) => void;
  placeholder?: string;
  showFilters?: boolean;
  maxResults?: number;
  className?: string;
}

export const CareerSearch: React.FC<CareerSearchProps> = ({
  onCareerSelect,
  placeholder = "Search careers, skills, or job titles...",
  showFilters = true,
  maxResults = 10,
  className
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CareerAPIResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<CareerSearchFilters>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [cats, inds, sks] = await Promise.all([
          careerAPIService.getCategories(),
          careerAPIService.getIndustries(),
          careerAPIService.getSkills()
        ]);
        setCategories(cats);
        setIndustries(inds);
        setSkills(sks);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };

    loadFilterOptions();
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, searchFilters: CareerSearchFilters) => {
      if (!searchQuery.trim() && !Object.keys(searchFilters).length) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await careerAPIService.searchCareers({
          ...searchFilters,
          query: searchQuery,
          limit: maxResults
        });
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [maxResults]
  );

  // Handle search input
  useEffect(() => {
    debouncedSearch(query, filters);
  }, [query, filters, debouncedSearch]);

  // Handle career selection
  const handleCareerSelect = (career: CareerAPIResponse) => {
    onCareerSelect?.(career);
    setShowResults(false);
    setQuery(career.title);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setFilters({});
  };

  // Update filters
  const updateFilter = (key: keyof CareerSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Remove filter
  const removeFilter = (key: keyof CareerSearchFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  // Get active filters count
  const activeFiltersCount = Object.keys(filters).filter(key => 
    filters[key as keyof CareerSearchFilters] !== undefined && 
    filters[key as keyof CareerSearchFilters] !== ''
  ).length;

  return (
    <div className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="pl-10 pr-20 h-12 text-base"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {showFilters && (
            <Popover open={showFilterPanel} onOpenChange={setShowFilterPanel}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                >
                  <Filter className="h-4 w-4" />
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Search Filters</h4>
                  
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select
                      value={filters.category || ''}
                      onValueChange={(value) => updateFilter('category', value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Industry Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Industry</label>
                    <Select
                      value={filters.industry || ''}
                      onValueChange={(value) => updateFilter('industry', value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Industries</SelectItem>
                        {industries.map(industry => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Experience Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Experience Level</label>
                    <Select
                      value={filters.experience || ''}
                      onValueChange={(value) => updateFilter('experience', value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Levels</SelectItem>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior Level</SelectItem>
                        <SelectItem value="executive">Executive Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Salary Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Salary Range: ${filters.salaryMin || 0}K - ${filters.salaryMax || 200}K
                    </label>
                    <div className="space-y-2">
                      <Slider
                        value={[filters.salaryMin || 0, filters.salaryMax || 200]}
                        onValueChange={([min, max]) => {
                          updateFilter('salaryMin', min);
                          updateFilter('salaryMax', max);
                        }}
                        max={200}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Additional Filters */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trending"
                        checked={filters.trending || false}
                        onCheckedChange={(checked) => updateFilter('trending', checked || undefined)}
                      />
                      <label htmlFor="trending" className="text-sm">Trending Careers</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remote"
                        checked={filters.remote || false}
                        onCheckedChange={(checked) => updateFilter('remote', checked || undefined)}
                      />
                      <label htmlFor="remote" className="text-sm">Remote Work</label>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({})}
                      className="w-full"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-8 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {filters.category}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter('category')}
              />
            </Badge>
          )}
          {filters.industry && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Industry: {filters.industry}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter('industry')}
              />
            </Badge>
          )}
          {filters.trending && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Trending
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter('trending')}
              />
            </Badge>
          )}
          {filters.remote && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Remote
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter('remote')}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Searching careers...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((career) => (
                <Card
                  key={career.id}
                  className="mb-2 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleCareerSelect(career)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{career.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {career.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${career.salary.min}K-${career.salary.max}K
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {career.growthRate}% growth
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {career.demand} demand
                          </span>
                          {career.remote && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Remote
                            </span>
                          )}
                        </div>
                      </div>
                      {career.trending && (
                        <Badge variant="default" className="text-xs">
                          Trending
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : query && (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No careers found matching your search.</p>
              <p className="text-sm">Try different keywords or adjust your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default CareerSearch;

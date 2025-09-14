import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Clock, 
  BookOpen,
  Target,
  MessageCircle,
  UserPlus,
  Settings,
  Star
} from 'lucide-react';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  level: string;
  max_members: number;
  current_members: number;
  meeting_schedule: string;
  meeting_location: string;
  meeting_type: 'online' | 'in_person' | 'hybrid';
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  members: Array<{
    id: string;
    user_id: string;
    role: 'admin' | 'moderator' | 'member';
    joined_at: string;
    profiles: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
  }>;
  creator: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface StudyGroupsProps {
  userId: string;
  onJoinGroup?: (groupId: string) => void;
  onCreateGroup?: () => void;
}

export function StudyGroups({ userId, onJoinGroup, onCreateGroup }: StudyGroupsProps) {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<StudyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    level: '',
    meetingType: '',
    isPublic: true
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    subject: '',
    level: 'beginner',
    max_members: 10,
    meeting_schedule: '',
    meeting_location: '',
    meeting_type: 'online' as const,
    is_public: true,
    tags: [] as string[]
  });

  useEffect(() => {
    fetchStudyGroups();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [groups, searchTerm, filters]);

  const fetchStudyGroups = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/study-groups');
      const data = await response.json();
      
      if (data.success) {
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Error fetching study groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...groups];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Subject filter
    if (filters.subject) {
      filtered = filtered.filter(group => group.subject === filters.subject);
    }

    // Level filter
    if (filters.level) {
      filtered = filtered.filter(group => group.level === filters.level);
    }

    // Meeting type filter
    if (filters.meetingType) {
      filtered = filtered.filter(group => group.meeting_type === filters.meetingType);
    }

    // Public filter
    if (filters.isPublic) {
      filtered = filtered.filter(group => group.is_public);
    }

    setFilteredGroups(filtered);
  };

  const createStudyGroup = async () => {
    try {
      const response = await fetch('/api/study-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newGroup,
          created_by: userId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowCreateDialog(false);
        setNewGroup({
          name: '',
          description: '',
          subject: '',
          level: 'beginner',
          max_members: 10,
          meeting_schedule: '',
          meeting_location: '',
          meeting_type: 'online',
          is_public: true,
          tags: []
        });
        fetchStudyGroups();
        if (onCreateGroup) onCreateGroup();
      }
    } catch (error) {
      console.error('Error creating study group:', error);
    }
  };

  const joinStudyGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/study-groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        fetchStudyGroups();
        if (onJoinGroup) onJoinGroup(groupId);
      }
    } catch (error) {
      console.error('Error joining study group:', error);
    }
  };

  const leaveStudyGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/study-groups/${groupId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        fetchStudyGroups();
      }
    } catch (error) {
      console.error('Error leaving study group:', error);
    }
  };

  const isUserInGroup = (group: StudyGroup) => {
    return group.members.some(member => member.user_id === userId);
  };

  const isUserAdmin = (group: StudyGroup) => {
    return group.members.some(member => 
      member.user_id === userId && member.role === 'admin'
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      subject: '',
      level: '',
      meetingType: '',
      isPublic: true
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Study Groups</h2>
          <p className="text-muted-foreground">
            Join or create study groups to learn together with peers
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., React Study Group"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this group will study and how it will work..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newGroup.subject}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Web Development"
                  />
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={newGroup.level}
                    onValueChange={(value) => setNewGroup(prev => ({ ...prev, level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_members">Max Members</Label>
                  <Input
                    id="max_members"
                    type="number"
                    value={newGroup.max_members}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, max_members: parseInt(e.target.value) }))}
                    min="2"
                    max="50"
                  />
                </div>
                <div>
                  <Label htmlFor="meeting_type">Meeting Type</Label>
                  <Select
                    value={newGroup.meeting_type}
                    onValueChange={(value: 'online' | 'in_person' | 'hybrid') => 
                      setNewGroup(prev => ({ ...prev, meeting_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="meeting_schedule">Meeting Schedule</Label>
                <Input
                  id="meeting_schedule"
                  value={newGroup.meeting_schedule}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, meeting_schedule: e.target.value }))}
                  placeholder="e.g., Every Tuesday 7-9 PM"
                />
              </div>

              <div>
                <Label htmlFor="meeting_location">Meeting Location</Label>
                <Input
                  id="meeting_location"
                  value={newGroup.meeting_location}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, meeting_location: e.target.value }))}
                  placeholder="e.g., Zoom link or physical address"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createStudyGroup}>
                  Create Group
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search study groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="subject-filter">Subject</Label>
                <Input
                  id="subject-filter"
                  placeholder="e.g., Web Development"
                  value={filters.subject}
                  onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="level-filter">Level</Label>
                <Select
                  value={filters.level}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any level</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="meeting-type-filter">Meeting Type</Label>
                <Select
                  value={filters.meetingType}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, meetingType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any type</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Groups */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {filteredGroups.length} Group{filteredGroups.length !== 1 ? 's' : ''} Found
          </h3>
        </div>

        {filteredGroups.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No study groups found</h3>
              <p className="text-muted-foreground mb-4">
                No groups match your search criteria. Try adjusting your filters or create a new group.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {group.name}
                        {!group.is_public && (
                          <Badge variant="outline" className="text-xs">
                            Private
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {group.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{group.subject}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span>{group.level}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{group.current_members}/{group.max_members} members</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isUserInGroup(group) ? (
                        <div className="flex items-center gap-2">
                          {isUserAdmin(group) && (
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-2" />
                              Manage
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => leaveStudyGroup(group.id)}
                          >
                            Leave
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => joinStudyGroup(group.id)}
                          disabled={group.current_members >= group.max_members}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Meeting Details</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{group.meeting_schedule}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{group.meeting_location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{group.meeting_type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Members</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {group.members.slice(0, 5).map((member) => (
                            <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
                              <AvatarImage src={member.profiles.avatar_url} />
                              <AvatarFallback>
                                {member.profiles.full_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {group.members.length > 5 && (
                            <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium">
                              +{group.members.length - 5}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {group.tags.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {group.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

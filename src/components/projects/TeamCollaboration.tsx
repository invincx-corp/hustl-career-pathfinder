import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Users, UserPlus, Search, Crown, Shield, User, MoreVertical, Calendar, AlertCircle, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ApiService from '@/lib/api-services';

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  assigned_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface TeamCollaborationProps {
  projectId: string;
  projectTitle: string;
}

const TeamCollaboration: React.FC<TeamCollaborationProps> = ({ projectId, projectTitle }) => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isSubmitProjectOpen, setIsSubmitProjectOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo' as const,
    priority: 'medium' as const,
    assigned_to: '',
    due_date: ''
  });
  const [submissionData, setSubmissionData] = useState({
    submission_notes: '',
    demo_url: '',
    github_url: '',
    documentation_url: ''
  });

  useEffect(() => {
    loadTeamData();
  }, [projectId]);

  const loadTeamData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [teamResult, tasksResult] = await Promise.all([
        ApiService.getProjectTeamMembers(projectId),
        ApiService.getProjectTasks(projectId)
      ]);

      if (teamResult.success) {
        setTeamMembers(teamResult.data || []);
      }

      if (tasksResult.success) {
        setTasks(tasksResult.data || []);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const excludeIds = teamMembers.map(member => member.user_id);
      const result = await ApiService.searchUsersForTeam(query, excludeIds);
      
      if (result.success) {
        setSearchResults(result.data || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleAddTeamMember = async (userId: string, role: string = 'member') => {
    try {
      const result = await ApiService.addTeamMember(projectId, userId, role);
      
      if (result.success) {
        await loadTeamData();
        setIsAddMemberOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        alert('Team member added successfully!');
      } else {
        alert('Failed to add team member. Please try again.');
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Failed to add team member. Please try again.');
    }
  };

  const handleRemoveTeamMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const result = await ApiService.removeTeamMember(projectId, userId);
      
      if (result.success) {
        await loadTeamData();
        alert('Team member removed successfully!');
      } else {
        alert('Failed to remove team member. Please try again.');
      }
    } catch (error) {
      console.error('Error removing team member:', error);
      alert('Failed to remove team member. Please try again.');
    }
  };

  const handleUpdateMemberRole = async (userId: string, newRole: string) => {
    try {
      const result = await ApiService.updateTeamMemberRole(projectId, userId, newRole);
      
      if (result.success) {
        await loadTeamData();
        alert('Member role updated successfully!');
      } else {
        alert('Failed to update member role. Please try again.');
      }
    } catch (error) {
      console.error('Error updating member role:', error);
      alert('Failed to update member role. Please try again.');
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const result = await ApiService.createProjectTask(projectId, newTask);
      
      if (result.success) {
        await loadTeamData();
        setNewTask({
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          assigned_to: '',
          due_date: ''
        });
        setIsAddTaskOpen(false);
        alert('Task created successfully!');
      } else {
        alert('Failed to create task. Please try again.');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const result = await ApiService.updateProjectTask(taskId, { status: newStatus });
      
      if (result.success) {
        await loadTeamData();
      } else {
        alert('Failed to update task status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  const handleSubmitProject = async () => {
    if (!submissionData.submission_notes) {
      alert('Please provide submission notes');
      return;
    }

    try {
      const result = await ApiService.submitProjectForReview(projectId, {
        reviewer_notes: submissionData.submission_notes,
        technical_score: 0, // Will be filled by reviewers
        creativity_score: 0,
        presentation_score: 0,
        overall_score: 0,
        recommendations: []
      });

      if (result.success) {
        // Update project status to submitted
        await ApiService.updateProject(projectId, { 
          status: 'submitted',
          demo_url: submissionData.demo_url,
          github_url: submissionData.github_url,
          documentation_url: submissionData.documentation_url
        });

        setSubmissionData({
          submission_notes: '',
          demo_url: '',
          github_url: '',
          documentation_url: ''
        });
        setIsSubmitProjectOpen(false);
        await loadTeamData();
        alert('Project submitted for review successfully!');
      } else {
        alert('Failed to submit project. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('Failed to submit project. Please try again.');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-600" />;
      default: return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupTasksByStatus = () => {
    const grouped: { [key: string]: ProjectTask[] } = {
      todo: [],
      in_progress: [],
      review: [],
      done: []
    };

    tasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const groupedTasks = groupTasksByStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Team Collaboration</h2>
        <div className="flex space-x-2">
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Search Users</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearchUsers(e.target.value);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {searchResults.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>{user.full_name?.[0] || user.email[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddTeamMember(user.id, 'member')}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Task description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Assign To</label>
                    <Select
                      value={newTask.assigned_to}
                      onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.user_id} value={member.user_id}>
                            {member.user.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateTask} className="w-full">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isSubmitProjectOpen} onOpenChange={setIsSubmitProjectOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Project for Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Submission Notes *</label>
                  <Textarea
                    value={submissionData.submission_notes}
                    onChange={(e) => setSubmissionData({ ...submissionData, submission_notes: e.target.value })}
                    placeholder="Describe your project, key features, and what you'd like reviewers to focus on..."
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Demo URL</label>
                  <Input
                    value={submissionData.demo_url}
                    onChange={(e) => setSubmissionData({ ...submissionData, demo_url: e.target.value })}
                    placeholder="https://your-demo-url.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">GitHub Repository</label>
                  <Input
                    value={submissionData.github_url}
                    onChange={(e) => setSubmissionData({ ...submissionData, github_url: e.target.value })}
                    placeholder="https://github.com/username/repository"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Documentation URL</label>
                  <Input
                    value={submissionData.documentation_url}
                    onChange={(e) => setSubmissionData({ ...submissionData, documentation_url: e.target.value })}
                    placeholder="https://your-docs-url.com"
                  />
                </div>
                <Button onClick={handleSubmitProject} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Review
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Team Members ({teamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={member.user.avatar_url} />
                    <AvatarFallback>{member.user.full_name?.[0] || member.user.email[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.user.full_name || 'Unknown User'}</p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {getRoleIcon(member.role)}
                    <span className="text-sm capitalize">{member.role}</span>
                  </div>
                  {user?.id === member.user_id && (
                    <Badge variant="secondary">You</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <Card>
        <CardHeader>
          <CardTitle>Project Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['todo', 'in_progress', 'review', 'done'].map((status) => (
              <div key={status} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium capitalize">{status.replace('_', ' ')}</h3>
                  <Badge className={getStatusColor(status)}>
                    {groupedTasks[status]?.length || 0}
                  </Badge>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {groupedTasks[status]?.map((task) => (
                    <div key={task.id} className="p-3 border rounded-lg bg-white shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <Badge className={getPriorityColor(task.priority)} size="sm">
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                        {task.assigned_user && (
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={task.assigned_user.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {task.assigned_user.full_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-600">
                              {task.assigned_user.full_name}
                            </span>
                          </div>
                        )}
                        {task.due_date && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex space-x-1">
                          {status !== 'done' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => {
                                const nextStatus = status === 'todo' ? 'in_progress' : 
                                                 status === 'in_progress' ? 'review' : 'done';
                                handleUpdateTaskStatus(task.id, nextStatus);
                              }}
                            >
                              {status === 'todo' ? 'Start' : 
                               status === 'in_progress' ? 'Review' : 'Complete'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamCollaboration;

// Session Management Interface Component
// Interface for conducting and managing mentor sessions

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  Square,
  Clock,
  Users,
  MessageCircle,
  FileText,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Video,
  Phone,
  MapPin,
  Link,
  Star,
  BarChart3,
  Target,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { sessionManager, SessionState, SessionTemplate } from '@/lib/session-manager';
import { useAuth } from '@/hooks/useAuth';

interface SessionManagementInterfaceProps {
  sessionId: string;
  onSessionEnd?: (session: SessionState) => void;
  onSessionCancel?: (session: SessionState) => void;
}

export const SessionManagementInterface: React.FC<SessionManagementInterfaceProps> = ({
  sessionId,
  onSessionEnd,
  onSessionCancel
}) => {
  const { user } = useAuth();
  const [session, setSession] = useState<SessionState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('agenda');
  const [newNote, setNewNote] = useState('');
  const [newActionItem, setNewActionItem] = useState('');
  const [newResource, setNewResource] = useState({ title: '', url: '' });
  const [chatMessage, setChatMessage] = useState('');
  const [whiteboardContent, setWhiteboardContent] = useState('');
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Load session data
  useEffect(() => {
    loadSession();
  }, [sessionId]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const loadSession = () => {
    const sessionData = sessionManager.getSession(sessionId);
    if (sessionData) {
      setSession(sessionData);
      if (sessionData.startTime && !sessionData.endTime) {
        const start = new Date(sessionData.startTime);
        const now = new Date();
        setSessionTimer(Math.floor((now.getTime() - start.getTime()) / 1000));
        setIsTimerRunning(true);
      }
    }
  };

  const startSession = () => {
    if (!session || !user) return;

    const success = sessionManager.startSession(sessionId, user.id);
    if (success) {
      loadSession();
      setIsTimerRunning(true);
    }
  };

  const endSession = () => {
    if (!session || !user) return;

    const success = sessionManager.endSession(sessionId, user.id);
    if (success) {
      loadSession();
      setIsTimerRunning(false);
      if (onSessionEnd) {
        onSessionEnd(session);
      }
    }
  };

  const cancelSession = () => {
    if (!session || !user) return;

    const success = sessionManager.cancelSession(sessionId, user.id, 'Cancelled by user');
    if (success) {
      loadSession();
      if (onSessionCancel) {
        onSessionCancel(session);
      }
    }
  };

  const addNote = () => {
    if (!newNote.trim() || !user) return;

    const success = sessionManager.addSessionNote(sessionId, newNote, user.email || 'User');
    if (success) {
      setNewNote('');
      loadSession();
    }
  };

  const addActionItem = () => {
    if (!newActionItem.trim()) return;

    const success = sessionManager.addActionItem(sessionId, newActionItem, 'both');
    if (success) {
      setNewActionItem('');
      loadSession();
    }
  };

  const completeActionItem = (actionItemId: string) => {
    const success = sessionManager.completeActionItem(sessionId, actionItemId);
    if (success) {
      loadSession();
    }
  };

  const addResource = () => {
    if (!newResource.title.trim() || !newResource.url.trim()) return;

    const success = sessionManager.addResource(sessionId, newResource.title, newResource.url, 'link');
    if (success) {
      setNewResource({ title: '', url: '' });
      loadSession();
    }
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim() || !user) return;

    const success = sessionManager.addChatMessage(sessionId, user.email || 'User', chatMessage);
    if (success) {
      setChatMessage('');
      loadSession();
    }
  };

  const updateWhiteboard = () => {
    const success = sessionManager.updateWhiteboard(sessionId, whiteboardContent);
    if (success) {
      loadSession();
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionIcon = (sessionType: string) => {
    switch (sessionType) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'in-person':
        return <MapPin className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Session not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <CardTitle className="text-xl">{session.id}</CardTitle>
                <p className="text-gray-600">Session Management</p>
              </div>
              <Badge className={getStatusColor(session.status)}>
                {session.status.replace('-', ' ')}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Session Timer */}
              <div className="text-center">
                <div className="text-2xl font-mono font-bold">
                  {formatTime(sessionTimer)}
                </div>
                <div className="text-sm text-gray-500">Duration</div>
              </div>
              
              {/* Session Controls */}
              <div className="flex space-x-2">
                {session.status === 'scheduled' || session.status === 'confirmed' ? (
                  <Button onClick={startSession} className="bg-green-600 hover:bg-green-700">
                    <Play className="h-4 w-4 mr-2" />
                    Start Session
                  </Button>
                ) : session.status === 'in-progress' ? (
                  <Button onClick={endSession} className="bg-red-600 hover:bg-red-700">
                    <Square className="h-4 w-4 mr-2" />
                    End Session
                  </Button>
                ) : null}
                
                {session.status !== 'completed' && session.status !== 'cancelled' && (
                  <Button variant="outline" onClick={cancelSession}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Session Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
            </TabsList>

            {/* Agenda Tab */}
            <TabsContent value="agenda" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Session Agenda</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {session.sessionData.agenda.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="flex-1">{item}</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add agenda item..."
                        value={newActionItem}
                        onChange={(e) => setNewActionItem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addActionItem()}
                      />
                      <Button onClick={addActionItem} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Session Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {session.sessionData.notes.map((note, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">{note}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="newNote">Add Note</Label>
                      <Textarea
                        id="newNote"
                        placeholder="Add a note about the session..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={addNote} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Session Chat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {session.technicalDetails.chatLog?.map((message, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {message.sender.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{message.sender}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type a message..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      />
                      <Button onClick={sendChatMessage} size="sm">
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Whiteboard Tab */}
            <TabsContent value="whiteboard" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Edit className="h-5 w-5" />
                    <span>Whiteboard</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Use this space for notes, diagrams, or collaborative content..."
                      value={whiteboardContent}
                      onChange={(e) => setWhiteboardContent(e.target.value)}
                      rows={10}
                      className="font-mono"
                    />
                    <Button onClick={updateWhiteboard} size="sm">
                      Save Whiteboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                {getSessionIcon('video')}
                <span className="text-sm">Video Call</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{session.duration} minutes</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">2 participants</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {session.sessionData.actionItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => completeActionItem(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        Assigned to: {item.assignedTo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add action item..."
                    value={newActionItem}
                    onChange={(e) => setNewActionItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addActionItem()}
                  />
                  <Button onClick={addActionItem} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {session.sessionData.resources.map((resource) => (
                  <div key={resource.id} className="flex items-center space-x-2">
                    <Link className="h-4 w-4 text-blue-500" />
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {resource.title}
                    </a>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 space-y-2">
                <Input
                  placeholder="Resource title..."
                  value={newResource.title}
                  onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                />
                <Input
                  placeholder="Resource URL..."
                  value={newResource.url}
                  onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                />
                <Button onClick={addResource} size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

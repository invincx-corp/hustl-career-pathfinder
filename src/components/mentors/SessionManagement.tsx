import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  MapPin, 
  MessageCircle,
  Play,
  Pause,
  Square,
  Download,
  Share,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Session {
  id: string;
  mentorId: string;
  menteeId: string;
  title: string;
  description: string;
  sessionType: 'video_call' | 'phone_call' | 'in_person' | 'chat';
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  meetingLink?: string;
  location?: string;
  notes?: string;
  recordingUrl?: string;
  feedback?: {
    rating: number;
    comment: string;
    categories: {
      communication: number;
      expertise: number;
      helpfulness: number;
      punctuality: number;
    };
  };
  mentor: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  mentee: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface SessionManagementProps {
  userId: string;
  userRole: 'mentor' | 'mentee';
  onSessionUpdate?: (session: Session) => void;
}

export function SessionManagement({ userId, userRole, onSessionUpdate }: SessionManagementProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    fetchSessions();
  }, [userId, userRole]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/mentors/sessions?userId=${userId}&role=${userRole}`);
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId: string, status: Session['status']) => {
    try {
      const response = await fetch(`/api/mentors/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSessions(prev => prev.map(session => 
          session.id === sessionId ? { ...session, status } : session
        ));
        if (onSessionUpdate) {
          const updatedSession = sessions.find(s => s.id === sessionId);
          if (updatedSession) onSessionUpdate({ ...updatedSession, status });
        }
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    // In a real implementation, this would start actual recording
    console.log('Recording started');
  };

  const stopRecording = () => {
    setIsRecording(false);
    // In a real implementation, this would stop recording and save the file
    console.log('Recording stopped');
  };

  const joinSession = (session: Session) => {
    if (session.sessionType === 'video_call' && session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    } else if (session.sessionType === 'phone_call') {
      // In a real implementation, this would initiate a phone call
      console.log('Initiating phone call...');
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video_call':
        return <Video className="h-4 w-4" />;
      case 'phone_call':
        return <Phone className="h-4 w-4" />;
      case 'in_person':
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
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-3 w-3" />;
      case 'confirmed':
        return <CheckCircle className="h-3 w-3" />;
      case 'in_progress':
        return <Play className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const upcomingSessions = sessions.filter(s => 
    new Date(s.scheduledAt) > new Date() && 
    ['scheduled', 'confirmed'].includes(s.status)
  ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const pastSessions = sessions.filter(s => 
    new Date(s.scheduledAt) <= new Date() || 
    ['completed', 'cancelled'].includes(s.status)
  ).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Session Management</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {sessions.length} Total Sessions
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
                <p className="text-muted-foreground">
                  You don't have any upcoming sessions scheduled.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{session.title}</h3>
                          <Badge className={getStatusColor(session.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(session.status)}
                              {session.status.replace('_', ' ')}
                            </div>
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {session.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDateTime(session.scheduledAt).date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDateTime(session.scheduledAt).time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getSessionTypeIcon(session.sessionType)}
                            <span>{session.sessionType.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{session.duration} min</span>
                          </div>
                        </div>

                        {session.location && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{session.location}</span>
                          </div>
                        )}

                        {session.meetingLink && (
                          <div className="mt-3">
                            <Button
                              size="sm"
                              onClick={() => joinSession(session)}
                              className="w-full"
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Join Session
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {userRole === 'mentor' && session.status === 'scheduled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSessionStatus(session.id, 'confirmed')}
                          >
                            Confirm
                          </Button>
                        )}
                        
                        {session.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => updateSessionStatus(session.id, 'in_progress')}
                          >
                            Start Session
                          </Button>
                        )}

                        {session.status === 'in_progress' && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={isRecording ? stopRecording : startRecording}
                            >
                              {isRecording ? (
                                <>
                                  <Square className="h-4 w-4 mr-2" />
                                  Stop Recording
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Start Recording
                                </>
                              )}
                            </Button>
                            
                            <Button
                              size="sm"
                              onClick={() => updateSessionStatus(session.id, 'completed')}
                            >
                              End Session
                            </Button>
                          </div>
                        )}

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Session Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold">Session Information</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {session.description}
                                </p>
                              </div>
                              
                              {session.notes && (
                                <div>
                                  <h4 className="font-semibold">Notes</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {session.notes}
                                  </p>
                                </div>
                              )}

                              {session.recordingUrl && (
                                <div>
                                  <h4 className="font-semibold">Recording</h4>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Button size="sm" variant="outline">
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      <Share className="h-4 w-4 mr-2" />
                                      Share
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastSessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Past Sessions</h3>
                <p className="text-muted-foreground">
                  You don't have any past sessions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{session.title}</h3>
                          <Badge className={getStatusColor(session.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(session.status)}
                              {session.status.replace('_', ' ')}
                            </div>
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {session.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDateTime(session.scheduledAt).date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDateTime(session.scheduledAt).time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getSessionTypeIcon(session.sessionType)}
                            <span>{session.sessionType.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{session.duration} min</span>
                          </div>
                        </div>

                        {session.feedback && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-sm mb-2">Feedback</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm">Overall Rating:</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={`text-sm ${
                                      star <= session.feedback.rating
                                        ? 'text-yellow-500'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {session.feedback.comment}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {session.recordingUrl && (
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Recording
                          </Button>
                        )}
                        
                        {session.status === 'completed' && !session.feedback && (
                          <Button size="sm">
                            Leave Feedback
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

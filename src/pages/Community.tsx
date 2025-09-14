import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageCircle, 
  BookOpen, 
  User, 
  TrendingUp,
  Star,
  Target,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { MentorMatching } from '@/components/mentors/MentorMatching';
import { AICoachChat } from '@/components/ai-coaching/AICoachChat';
import { ChatInterface } from '@/components/messaging/ChatInterface';
import { ForumTopic } from '@/components/forums/ForumTopic';
import { UserProfile } from '@/components/community/UserProfile';
import { StudyGroups } from '@/components/community/StudyGroups';

interface CommunityProps {
  userId: string;
}

export function Community({ userId }: CommunityProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleBookSession = (mentorId: string) => {
    console.log('Booking session with mentor:', mentorId);
    // Implement booking logic
  };

  const handleSendMessage = (mentorId: string) => {
    console.log('Sending message to mentor:', mentorId);
    // Implement messaging logic
  };

  const handleEscalation = (escalation: any) => {
    console.log('AI coaching escalation:', escalation);
    // Implement escalation logic
  };

  const handleJoinGroup = (groupId: string) => {
    console.log('Joining study group:', groupId);
    // Implement join group logic
  };

  const handleCreateGroup = () => {
    console.log('Creating new study group');
    // Implement create group logic
  };

  const handleConnect = (userId: string) => {
    console.log('Connecting with user:', userId);
    // Implement connection logic
  };

  const handleMessage = (userId: string) => {
    console.log('Messaging user:', userId);
    // Implement messaging logic
  };

  if (selectedConversation) {
    return (
      <ChatInterface
        conversationId={selectedConversation}
        userId={userId}
        onBack={() => setSelectedConversation(null)}
      />
    );
  }

  if (selectedTopic) {
    return (
      <ForumTopic
        topicId={selectedTopic}
        userId={userId}
        onBack={() => setSelectedTopic(null)}
      />
    );
  }

  if (selectedUser) {
    return (
      <UserProfile
        userId={selectedUser}
        currentUserId={userId}
        isOwnProfile={selectedUser === userId}
        onBack={() => setSelectedUser(null)}
        onMessage={handleMessage}
        onConnect={handleConnect}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Hub</h1>
          <p className="text-muted-foreground">
            Connect, learn, and grow with your professional community
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Active Community
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-xs text-muted-foreground">Active Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">89</p>
                <p className="text-xs text-muted-foreground">Study Groups</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">342</p>
                <p className="text-xs text-muted-foreground">Forum Topics</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-muted-foreground">Mentors Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mentors">Mentors</TabsTrigger>
          <TabsTrigger value="coaching">AI Coach</TabsTrigger>
          <TabsTrigger value="messaging">Messages</TabsTrigger>
          <TabsTrigger value="forums">Forums</TabsTrigger>
          <TabsTrigger value="groups">Study Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      type: 'mentor',
                      title: 'New mentor available',
                      description: 'Sarah Johnson joined as a React expert',
                      time: '2 hours ago',
                      icon: <Users className="h-4 w-4 text-blue-600" />
                    },
                    {
                      type: 'group',
                      title: 'Study group created',
                      description: 'Advanced Data Science group is now open',
                      time: '4 hours ago',
                      icon: <BookOpen className="h-4 w-4 text-green-600" />
                    },
                    {
                      type: 'forum',
                      title: 'New forum topic',
                      description: 'Best practices for React performance',
                      time: '6 hours ago',
                      icon: <MessageCircle className="h-4 w-4 text-purple-600" />
                    }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {activity.icon}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{activity.title}</h4>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setActiveTab('mentors')}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Find Mentors</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setActiveTab('coaching')}
                  >
                    <Star className="h-6 w-6" />
                    <span className="text-sm">AI Coach</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setActiveTab('groups')}
                  >
                    <BookOpen className="h-6 w-6" />
                    <span className="text-sm">Study Groups</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setActiveTab('forums')}
                  >
                    <MessageCircle className="h-6 w-6" />
                    <span className="text-sm">Forums</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Content */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Featured Mentor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Alex Chen</h4>
                    <p className="text-sm text-muted-foreground">Senior Full Stack Developer</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs">4.9 (127 reviews)</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="w-full mt-3">
                  View Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Study Group</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold">React Fundamentals</h4>
                  <p className="text-sm text-muted-foreground">Learn React from scratch</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>8/12 members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Tue 7PM</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="w-full mt-3">
                  Join Group
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hot Forum Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold">Career Transition Tips</h4>
                  <p className="text-sm text-muted-foreground">Share your experience</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>23 replies</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>2 hours ago</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="w-full mt-3">
                  View Topic
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mentors">
          <MentorMatching
            userId={userId}
            onBookSession={handleBookSession}
            onSendMessage={handleSendMessage}
          />
        </TabsContent>

        <TabsContent value="coaching">
          <AICoachChat
            userId={userId}
            onEscalation={handleEscalation}
          />
        </TabsContent>

        <TabsContent value="messaging">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with mentors, peers, and study group members
                </p>
                <Button onClick={() => setActiveTab('mentors')}>
                  Find People to Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forums">
          <Card>
            <CardHeader>
              <CardTitle>Discussion Forums</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Join the Discussion</h3>
                <p className="text-muted-foreground mb-4">
                  Participate in community discussions and get help from peers
                </p>
                <Button>
                  Browse Forums
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <StudyGroups
            userId={userId}
            onJoinGroup={handleJoinGroup}
            onCreateGroup={handleCreateGroup}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

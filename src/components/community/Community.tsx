import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { communityService, UserPublicProfile, ForumPost, StudyGroup, DirectMessage } from '@/lib/community-service';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share, 
  Search, 
  Plus, 
  Filter,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Star,
  Eye,
  ThumbsUp,
  Reply,
  BookOpen,
  UserPlus,
  TrendingUp,
  Award,
  Code,
  Palette,
  Database
} from 'lucide-react';

const Community = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<UserPublicProfile[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserPublicProfile | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCommunityData();
  }, []);

  useEffect(() => {
    if (selectedUser && user) {
      loadMessages(selectedUser.user_id);
    }
  }, [selectedUser, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async (userId: string) => {
    if (!user) return;
    
    try {
      const messagesData = await communityService.getDirectMessages(user.id, userId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !user) return;
    
    const messageText = newMessage.trim();
    setNewMessage('');
    setIsTyping(true);
    
    try {
      const message = await communityService.sendDirectMessage(
        user.id,
        selectedUser.user_id,
        messageText
      );
      
      if (message) {
        setMessages(prev => [...prev, message]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      
      // Load profiles, forum posts, and study groups in parallel
      const [profilesData, postsData, groupsData] = await Promise.all([
        communityService.searchPublicProfiles('', {}),
        communityService.getForumPosts(),
        communityService.getStudyGroups()
      ]);
      
      setProfiles(profilesData);
      setForumPosts(postsData);
      setStudyGroups(groupsData);
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUser = async (userId: string) => {
    if (!user) return;
    
    try {
      await communityService.followUser(user.id, userId);
      // Refresh profiles to update follower counts
      loadCommunityData();
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleJoinStudyGroup = async (groupId: string) => {
    if (!user) return;
    
    try {
      await communityService.joinStudyGroup(groupId, user.id);
      // Refresh study groups
      loadCommunityData();
    } catch (error) {
      console.error('Error joining study group:', error);
    }
  };

  const getSkillIcon = (skill: string) => {
    const skillLower = skill.toLowerCase();
    if (skillLower.includes('react') || skillLower.includes('javascript') || skillLower.includes('frontend')) {
      return <Code className="h-4 w-4" />;
    }
    if (skillLower.includes('design') || skillLower.includes('ui') || skillLower.includes('ux')) {
      return <Palette className="h-4 w-4" />;
    }
    if (skillLower.includes('data') || skillLower.includes('database') || skillLower.includes('sql')) {
      return <Database className="h-4 w-4" />;
    }
    return <Code className="h-4 w-4" />;
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-600 mt-2">Connect, learn, and grow with fellow learners</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowCreateGroup(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCreatePost(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search people, posts, or groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="forum" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Forum
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Study Groups
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profiles
              .filter(profile => 
                !searchQuery || 
                profile.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                profile.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                profile.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((profile) => (
                <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {profile.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{profile.display_name}</CardTitle>
                          <p className="text-sm text-gray-600">{profile.current_role}</p>
                          {profile.location && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              {profile.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {profile.is_mentor && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Award className="h-3 w-3 mr-1" />
                            Mentor
                          </Badge>
                        )}
                        {profile.is_student && (
                          <Badge className="bg-green-100 text-green-800">
                            <BookOpen className="h-3 w-3 mr-1" />
                            Student
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-sm text-gray-600 line-clamp-3">{profile.bio}</p>
                    )}

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs flex items-center gap-1">
                          {getSkillIcon(skill)}
                          {skill}
                        </Badge>
                      ))}
                      {profile.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.skills.length - 4} more
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{profile.followers_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{profile.posts_count}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(profile);
                            setShowMessages(true);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFollowUser(profile.user_id)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Follow
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Forum Tab */}
        <TabsContent value="forum" className="space-y-6">
          <div className="space-y-4">
            {forumPosts
              .filter(post => 
                !searchQuery || 
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                        <p className="text-gray-600 line-clamp-2">{post.content}</p>
                      </div>
                      {post.is_pinned && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Pinned
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.views_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{post.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Reply className="h-4 w-4" />
                          <span>{post.replies_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Study Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {studyGroups
              .filter(group => 
                !searchQuery || 
                group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                group.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                group.description?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((group) => (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <p className="text-sm text-gray-600">{group.topic}</p>
                      </div>
                      <Badge className={getSkillLevelColor(group.skill_level)}>
                        {group.skill_level}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {group.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">{group.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{group.current_members}/{group.max_members}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleJoinStudyGroup(group.id)}
                        disabled={group.current_members >= group.max_members}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        {group.current_members >= group.max_members ? 'Full' : 'Join'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Trending Tab */}
        <TabsContent value="trending" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Trending Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending Posts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {forumPosts
                  .sort((a, b) => b.likes_count - a.likes_count)
                  .slice(0, 5)
                  .map((post, index) => (
                    <div key={post.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-1">{post.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{post.likes_count} likes</span>
                          <Reply className="h-3 w-3" />
                          <span>{post.replies_count} replies</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Popular Study Groups */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Popular Study Groups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {studyGroups
                  .sort((a, b) => b.current_members - a.current_members)
                  .slice(0, 5)
                  .map((group, index) => (
                    <div key={group.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-1">{group.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Users className="h-3 w-3" />
                          <span>{group.current_members} members</span>
                          <Badge variant="outline" className="text-xs">
                            {group.skill_level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Post Dialog */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Forum Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Post title..." />
            <textarea
              className="w-full p-3 border rounded-lg resize-none"
              rows={4}
              placeholder="What's on your mind?"
            />
            <div className="flex gap-2">
              <Input placeholder="Add tags (comma separated)" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreatePost(false)}>
                Create Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Study Group Dialog */}
      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Study Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Group name..." />
            <Input placeholder="Topic..." />
            <textarea
              className="w-full p-3 border rounded-lg resize-none"
              rows={3}
              placeholder="Group description..."
            />
            <div className="grid grid-cols-2 gap-4">
              <select className="p-3 border rounded-lg">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="mixed">Mixed</option>
              </select>
              <Input type="number" placeholder="Max members" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateGroup(false)}>
                Create Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Direct Messages Dialog */}
      <Dialog open={showMessages} onOpenChange={setShowMessages}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {selectedUser?.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
              {selectedUser?.display_name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-gray-600">
                    Send a message to {selectedUser?.display_name} to start chatting
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender_id !== user?.id && (
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {selectedUser?.display_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender_id === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    {message.sender_id === user?.id && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {selectedUser?.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isTyping}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isTyping}
                size="sm"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;

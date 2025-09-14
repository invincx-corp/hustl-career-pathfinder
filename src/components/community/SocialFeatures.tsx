import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Share2, 
  MessageCircle, 
  Users, 
  UserPlus, 
  UserMinus,
  ThumbsUp,
  Bookmark,
  Eye,
  TrendingUp,
  Calendar,
  MapPin,
  Globe
} from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  industry?: string;
  location?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following: boolean;
  is_followed_by: boolean;
}

interface Post {
  id: string;
  authorId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'link';
  mediaUrl?: string;
  linkPreview?: {
    title: string;
    description: string;
    image: string;
    url: string;
  };
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  created_at: string;
  author: User;
  comments: Comment[];
}

interface Comment {
  id: string;
  authorId: string;
  content: string;
  created_at: string;
  author: User;
}

interface SocialFeaturesProps {
  userId: string;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onLike?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
}

export function SocialFeatures({ 
  userId, 
  onFollow, 
  onUnfollow, 
  onLike, 
  onShare, 
  onBookmark 
}: SocialFeaturesProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    fetchSocialData();
  }, [userId]);

  const fetchSocialData = async () => {
    try {
      setIsLoading(true);
      const [postsRes, followersRes, followingRes, suggestionsRes] = await Promise.all([
        fetch(`/api/community/social/posts?userId=${userId}`),
        fetch(`/api/community/social/followers?userId=${userId}`),
        fetch(`/api/community/social/following?userId=${userId}`),
        fetch(`/api/community/social/suggestions?userId=${userId}`)
      ]);

      const [postsData, followersData, followingData, suggestionsData] = await Promise.all([
        postsRes.json(),
        followersRes.json(),
        followingRes.json(),
        suggestionsRes.json()
      ]);

      if (postsData.success) setPosts(postsData.posts);
      if (followersData.success) setFollowers(followersData.users);
      if (followingData.success) setFollowing(followingData.users);
      if (suggestionsData.success) setSuggestions(suggestionsData.users);
    } catch (error) {
      console.error('Error fetching social data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    try {
      const response = await fetch(`/api/community/social/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId: userId,
          followingId: targetUserId
        }),
      });

      if (response.ok) {
        setSuggestions(prev => prev.filter(user => user.id !== targetUserId));
        setFollowing(prev => [...prev, suggestions.find(user => user.id === targetUserId)!]);
        if (onFollow) onFollow(targetUserId);
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    try {
      const response = await fetch(`/api/community/social/unfollow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId: userId,
          followingId: targetUserId
        }),
      });

      if (response.ok) {
        setFollowing(prev => prev.filter(user => user.id !== targetUserId));
        if (onUnfollow) onUnfollow(targetUserId);
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/community/social/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          postId
        }),
      });

      if (response.ok) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                is_liked: !post.is_liked,
                likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
              }
            : post
        ));
        if (onLike) onLike(postId);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleShare = async (postId: string) => {
    try {
      const response = await fetch(`/api/community/social/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          postId
        }),
      });

      if (response.ok) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, shares_count: post.shares_count + 1 }
            : post
        ));
        if (onShare) onShare(postId);
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      const response = await fetch(`/api/community/social/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          postId
        }),
      });

      if (response.ok) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, is_bookmarked: !post.is_bookmarked }
            : post
        ));
        if (onBookmark) onBookmark(postId);
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Social Feed</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {followers.length} Followers
          </Badge>
          <Badge variant="outline">
            {following.length} Following
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="suggestions">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground">
                  Follow some people to see their posts in your feed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author.avatar_url} />
                        <AvatarFallback>
                          {post.author.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm">{post.author.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(post.created_at)}
                          </span>
                          {post.author.industry && (
                            <Badge variant="outline" className="text-xs">
                              {post.author.industry}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {post.content}
                        </p>

                        {post.linkPreview && (
                          <div className="border rounded-lg p-3 mb-3">
                            <div className="flex gap-3">
                              {post.linkPreview.image && (
                                <img 
                                  src={post.linkPreview.image} 
                                  alt={post.linkPreview.title}
                                  className="w-20 h-20 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">{post.linkPreview.title}</h4>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {post.linkPreview.description}
                                </p>
                                <a 
                                  href={post.linkPreview.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  {post.linkPreview.url}
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 ${
                              post.is_liked ? 'text-red-600' : 'text-muted-foreground'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                            <span className="text-xs">{post.likes_count}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-muted-foreground"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-xs">{post.comments_count}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(post.id)}
                            className="flex items-center gap-2 text-muted-foreground"
                          >
                            <Share2 className="h-4 w-4" />
                            <span className="text-xs">{post.shares_count}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBookmark(post.id)}
                            className={`flex items-center gap-2 ${
                              post.is_bookmarked ? 'text-blue-600' : 'text-muted-foreground'
                            }`}
                          >
                            <Bookmark className={`h-4 w-4 ${post.is_bookmarked ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="followers" className="space-y-4">
          {followers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Followers Yet</h3>
                <p className="text-muted-foreground">
                  Start sharing content to gain followers.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {followers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{user.full_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {user.bio || `${user.industry} • ${user.location}`}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>{user.followers_count} followers</span>
                            <span>{user.posts_count} posts</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.is_following ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnfollow(user.id)}
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Unfollow
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleFollow(user.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Follow Back
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

        <TabsContent value="following" className="space-y-4">
          {following.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Not Following Anyone</h3>
                <p className="text-muted-foreground">
                  Start following people to see their posts in your feed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {following.map((user) => (
                <Card key={user.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{user.full_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {user.bio || `${user.industry} • ${user.location}`}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>{user.followers_count} followers</span>
                            <span>{user.posts_count} posts</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnfollow(user.id)}
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Unfollow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          {suggestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Suggestions</h3>
                <p className="text-muted-foreground">
                  We couldn't find any new people to follow right now.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {suggestions.map((user) => (
                <Card key={user.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{user.full_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {user.bio || `${user.industry} • ${user.location}`}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>{user.followers_count} followers</span>
                            <span>{user.posts_count} posts</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleFollow(user.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </Button>
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

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Eye, 
  Pin, 
  Lock, 
  Star,
  Reply,
  Flag,
  MoreVertical,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Reply {
  id: string;
  topic_id: string;
  author_id: string;
  content: string;
  reply_to_id?: string;
  is_solution: boolean;
  is_helpful: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface Topic {
  id: string;
  forum_id: string;
  author_id: string;
  title: string;
  content: string;
  topic_type: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_featured: boolean;
  view_count: number;
  reply_count: number;
  last_reply_at: string;
  last_reply_by: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  forums: {
    id: string;
    name: string;
    category: string;
  };
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface ForumTopicProps {
  topicId: string;
  userId: string;
  onBack?: () => void;
}

export function ForumTopic({ topicId, userId, onBack }: ForumTopicProps) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newReply, setNewReply] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [showReplyDialog, setShowReplyDialog] = useState(false);

  useEffect(() => {
    fetchTopic();
    fetchReplies();
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      const response = await fetch(`/api/forums/topics/${topicId}`);
      const data = await response.json();
      
      if (data.success) {
        setTopic(data.topic);
      }
    } catch (error) {
      console.error('Error fetching topic:', error);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/forums/topics/${topicId}/replies?sortBy=${sortBy}`);
      const data = await response.json();
      
      if (data.success) {
        setReplies(data.replies);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitReply = async () => {
    if (!newReply.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/forums/topics/${topicId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorId: userId,
          content: newReply,
          replyToId: replyToId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setNewReply('');
        setReplyToId(null);
        setShowReplyDialog(false);
        fetchReplies();
        fetchTopic(); // Update reply count
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const voteOnReply = async (replyId: string, voteType: 'up' | 'down') => {
    try {
      const response = await fetch('/api/forums/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          replyId,
          voteType
        }),
      });

      if (response.ok) {
        fetchReplies();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const markAsHelpful = async (replyId: string) => {
    try {
      const response = await fetch(`/api/forums/replies/${replyId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        fetchReplies();
      }
    } catch (error) {
      console.error('Error marking as helpful:', error);
    }
  };

  const reportContent = async (type: 'topic' | 'reply', id: string, reason: string) => {
    try {
      const response = await fetch('/api/forums/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reporterId: userId,
          [type === 'topic' ? 'topicId' : 'replyId']: id,
          reportType: 'inappropriate',
          reportReason: reason
        }),
      });

      if (response.ok) {
        alert('Report submitted successfully');
      }
    } catch (error) {
      console.error('Error reporting content:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">Topic not found</h3>
        <p className="text-muted-foreground mb-4">This topic may have been deleted or you don't have access to it.</p>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              ←
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{topic.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>in {topic.forums.name}</span>
              <span>•</span>
              <span>{topic.reply_count} replies</span>
              <span>•</span>
              <span>{topic.view_count} views</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Flag className="h-4 w-4 mr-2" />
            Report
          </Button>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Topic Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={topic.profiles.avatar_url} />
                <AvatarFallback>
                  {topic.profiles.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{topic.profiles.full_name}</h3>
                  {topic.is_pinned && <Pin className="h-4 w-4 text-blue-500" />}
                  {topic.is_locked && <Lock className="h-4 w-4 text-red-500" />}
                  {topic.is_featured && <Star className="h-4 w-4 text-yellow-500" />}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatRelativeTime(topic.created_at)}</span>
                  <span>•</span>
                  <span>{topic.topic_type}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{topic.content}</p>
          </div>
          
          {/* Tags */}
          {topic.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {topic.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Replies Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {replies.length} Repl{replies.length === 1 ? 'y' : 'ies'}
        </h2>
        
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Newest First</SelectItem>
              <SelectItem value="helpful_count">Most Helpful</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
            <DialogTrigger asChild>
              <Button>
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post a Reply</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reply-content">Your Reply</Label>
                  <Textarea
                    id="reply-content"
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={submitReply} disabled={!newReply.trim() || isSubmitting}>
                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-4">
        {replies.map((reply) => (
          <Card key={reply.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply.profiles.avatar_url} />
                  <AvatarFallback>
                    {reply.profiles.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-sm">{reply.profiles.full_name}</h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(reply.created_at)}</span>
                    </div>
                    {reply.is_solution && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Solution
                      </Badge>
                    )}
                    {reply.is_helpful && (
                      <Badge variant="outline" className="text-green-600">
                        Helpful ({reply.helpful_count})
                      </Badge>
                    )}
                  </div>
                  
                  <div className="prose max-w-none text-sm">
                    <p className="whitespace-pre-wrap">{reply.content}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => voteOnReply(reply.id, 'up')}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => voteOnReply(reply.id, 'down')}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsHelpful(reply.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Helpful
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyToId(reply.id)}
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => reportContent('reply', reply.id, 'Inappropriate content')}
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {replies.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No replies yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to share your thoughts on this topic.</p>
              <Button onClick={() => setShowReplyDialog(true)}>
                <Reply className="h-4 w-4 mr-2" />
                Post First Reply
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

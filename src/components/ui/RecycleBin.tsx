import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RecycleBinService, RecycleBinItem } from '@/lib/recycle-bin-service';
import { NotificationService } from '@/lib/notification-service';
import { 
  Trash2, 
  RotateCcw, 
  Clock, 
  AlertTriangle,
  FileText,
  Target,
  User,
  BookOpen,
  Link
} from 'lucide-react';

interface RecycleBinProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecycleBin: React.FC<RecycleBinProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<RecycleBinItem | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadItems();
    }
  }, [isOpen]);

  const loadItems = () => {
    const allItems = RecycleBinService.getAllItems();
    setItems(allItems);
  };

  const getItemIcon = (type: RecycleBinItem['type']) => {
    switch (type) {
      case 'roadmap': return Target;
      case 'project': return FileText;
      case 'profile': return User;
      case 'assessment': return BookOpen;
      case 'resource': return Link;
      default: return FileText;
    }
  };

  const getItemColor = (type: RecycleBinItem['type']) => {
    switch (type) {
      case 'roadmap': return 'bg-purple-100 text-purple-800';
      case 'project': return 'bg-blue-100 text-blue-800';
      case 'profile': return 'bg-green-100 text-green-800';
      case 'assessment': return 'bg-orange-100 text-orange-800';
      case 'resource': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const deletedAt = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const getExpiryStatus = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffInDays = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return { status: 'expired', color: 'bg-red-100 text-red-800' };
    if (diffInDays < 7) return { status: 'expiring', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'safe', color: 'bg-green-100 text-green-800' };
  };

  const handleRestore = (id: string) => {
    const item = RecycleBinService.restoreItem(id);
    if (item) {
      NotificationService.createSystemNotification(
        'Item Restored',
        `${item.type} has been restored successfully.`,
        'success'
      );
      loadItems();
      setShowRestoreConfirm(null);
    }
  };

  const handlePermanentDelete = (id: string) => {
    const success = RecycleBinService.permanentDelete(id);
    if (success) {
      NotificationService.createSystemNotification(
        'Item Deleted',
        'Item has been permanently deleted.',
        'success'
      );
      loadItems();
      setShowDeleteConfirm(null);
    }
  };

  const stats = RecycleBinService.getStats();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Recycle Bin
          </DialogTitle>
          <DialogDescription>
            Manage deleted items. Items are automatically deleted after 90 days.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
                <div className="text-sm text-gray-600">Expiring Soon</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.byType.roadmap || 0}</div>
                <div className="text-sm text-gray-600">Roadmaps</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.byType.project || 0}</div>
                <div className="text-sm text-gray-600">Projects</div>
              </CardContent>
            </Card>
          </div>

          {/* Items List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent>
                  <Trash2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Recycle Bin is Empty</h3>
                  <p className="text-gray-600">No deleted items found.</p>
                </CardContent>
              </Card>
            ) : (
              items.map((item) => {
                const Icon = getItemIcon(item.type);
                const expiryStatus = getExpiryStatus(item.expiresAt);
                
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getItemColor(item.type)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {item.originalData?.title || `${item.type} #${item.id.slice(-6)}`}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Badge variant="outline" className={getItemColor(item.type)}>
                                {item.type}
                              </Badge>
                              <span>•</span>
                              <span>{formatTimeAgo(item.deletedAt)}</span>
                              <span>•</span>
                              <Badge variant="outline" className={expiryStatus.color}>
                                {expiryStatus.status === 'expired' ? 'Expired' : 
                                 expiryStatus.status === 'expiring' ? 'Expiring Soon' : 'Safe'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowRestoreConfirm(item.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Restore
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>

        {/* Restore Confirmation */}
        {showRestoreConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="text-green-600">Restore Item</CardTitle>
                <CardDescription>
                  Are you sure you want to restore this item? It will be moved back to its original location.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-3">
                  <Button
                    onClick={() => handleRestore(showRestoreConfirm)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRestoreConfirm(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="text-red-600">Permanently Delete</CardTitle>
                <CardDescription>
                  Are you sure you want to permanently delete this item? This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-3">
                  <Button
                    variant="destructive"
                    onClick={() => handlePermanentDelete(showDeleteConfirm)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Forever
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecycleBin;

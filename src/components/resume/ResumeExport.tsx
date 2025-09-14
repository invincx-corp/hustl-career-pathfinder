import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Share2, 
  Eye, 
  FileText, 
  BarChart3, 
  Settings, 
  Link, 
  Copy,
  Check,
  ExternalLink,
  Globe,
  Lock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ApiService from '@/lib/api-services';

interface ResumeExportProps {
  resumeId: string;
  resumeTitle: string;
}

const ResumeExport: React.FC<ResumeExportProps> = ({ resumeId, resumeTitle }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exports, setExports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [publicLink, setPublicLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    showContactInfo: true,
    showProjects: true,
    showSkills: true,
    showExperience: true,
    showEducation: true
  });

  useEffect(() => {
    loadData();
  }, [resumeId]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [exportsResult, analyticsResult, templatesResult] = await Promise.all([
        ApiService.getResumeExports(resumeId),
        ApiService.getResumeAnalytics(resumeId),
        ApiService.getResumeTemplates()
      ]);

      if (exportsResult.success) {
        setExports(exportsResult.data || []);
      }

      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data);
      }

      if (templatesResult.success) {
        setTemplates(templatesResult.data || []);
      }
    } catch (error) {
      console.error('Error loading resume data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const result = await ApiService.exportResumeToPDF(resumeId);
      
      if (result.success) {
        // In a real implementation, you would trigger the PDF generation
        // For now, we'll simulate the download
        const blob = new Blob(['PDF content would be here'], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resumeTitle}_resume.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        await loadData(); // Reload exports
        alert('Resume exported to PDF successfully!');
      } else {
        alert('Failed to export resume to PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export resume to PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setLoading(true);
      const result = await ApiService.exportResumeToJSON(resumeId);
      
      if (result.success) {
        const blob = new Blob([JSON.stringify(result.data.resume, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resumeTitle}_resume.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        await loadData(); // Reload exports
        alert('Resume exported to JSON successfully!');
      } else {
        alert('Failed to export resume to JSON');
      }
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Failed to export resume to JSON');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePublicLink = async () => {
    try {
      setLoading(true);
      const result = await ApiService.generatePublicResumeLink(resumeId);
      
      if (result.success) {
        setPublicLink(result.data.publicLink);
        setIsPublic(true);
        alert('Public link generated successfully!');
      } else {
        alert('Failed to generate public link');
      }
    } catch (error) {
      console.error('Error generating public link:', error);
      alert('Failed to generate public link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleApplyTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      const result = await ApiService.applyResumeTemplate(resumeId, templateId);
      
      if (result.success) {
        alert('Template applied successfully!');
      } else {
        alert('Failed to apply template');
      }
    } catch (error) {
      console.error('Error applying template:', error);
      alert('Failed to apply template');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Resume Export & Sharing</h2>
        <Badge variant="outline" className="flex items-center space-x-1">
          {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          <span>{isPublic ? 'Public' : 'Private'}</span>
        </Badge>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Export Formats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    onClick={handleExportPDF} 
                    className="w-full" 
                    disabled={loading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as PDF
                  </Button>
                  
                  <Button 
                    onClick={handleExportJSON} 
                    variant="outline" 
                    className="w-full"
                    disabled={loading}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as JSON
                  </Button>
                </div>

                {exports.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Recent Exports</h4>
                    <div className="space-y-2">
                      {exports.slice(0, 3).map((exportItem) => (
                        <div key={exportItem.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{exportItem.export_type.toUpperCase()}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(exportItem.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(privacySettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="text-sm">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => 
                          setPrivacySettings(prev => ({ ...prev, [key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="h-5 w-5 mr-2" />
                Public Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isPublic ? (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Make Resume Public</h3>
                  <p className="text-gray-500 mb-4">
                    Generate a public link to share your resume with employers and recruiters.
                  </p>
                  <Button onClick={handleGeneratePublicLink} disabled={loading}>
                    <Link className="h-4 w-4 mr-2" />
                    Generate Public Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Resume is Public</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Your resume is now accessible via the public link below.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Public Link</Label>
                    <div className="flex space-x-2">
                      <Input 
                        value={publicLink} 
                        readOnly 
                        className="flex-1"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleCopyLink}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        asChild
                      >
                        <a href={publicLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resume Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleApplyTemplate(template.id)}
                        disabled={loading}
                      >
                        Apply Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Resume Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{analytics.total_views}</div>
                    <div className="text-sm text-gray-600">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{analytics.unique_views}</div>
                    <div className="text-sm text-gray-600">Unique Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{analytics.export_count}</div>
                    <div className="text-sm text-gray-600">Exports</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No analytics data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResumeExport;



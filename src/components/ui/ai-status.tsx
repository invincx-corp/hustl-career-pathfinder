import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { aiProvider } from "@/lib/ai-provider";

export const AIStatus = () => {
  const status = aiProvider.getStatus();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Bot className="h-4 w-4" />
          AI Provider Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Provider:</span>
          <Badge variant={status.configured ? "default" : "secondary"}>
            {status.provider}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <div className="flex items-center gap-2">
            {status.configured ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm">
              {status.configured ? "Connected" : "Simulated"}
            </span>
          </div>
        </div>

        {!status.configured && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Settings className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">AI Not Configured</p>
                <p className="text-yellow-700 mt-1">
                  Add your Hugging Face API key to enable real AI features. 
                  Currently using simulated responses. Get 30,000 free requests/month!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

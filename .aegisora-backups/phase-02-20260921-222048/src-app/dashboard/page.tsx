import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldAlert, CheckCircle, ShieldBan } from "lucide-react";

export default function DashboardPage() {
  const executions = [
    { id: "req_8f72a", agent: "Sales-Bot-Alpha", intent: "Send bulk email campaign", status: "Blocked", time: "2 mins ago" },
    { id: "req_9x11b", agent: "Data-Crawler", intent: "Export customer records", status: "Escalated", time: "15 mins ago" },
    { id: "req_3c44x", agent: "Support-Agent-1", intent: "Refund order #4421", status: "Allowed", time: "1 hour ago" },
    { id: "req_7y99z", agent: "DevOps-Assistant", intent: "Restart production DB", status: "Blocked", time: "3 hours ago" },
    { id: "req_1a22b", agent: "Support-Agent-2", intent: "Update ticket status", status: "Allowed", time: "5 hours ago" },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Runtime Overview</h2>
        <p className="text-muted-foreground mt-1">Monitor your AI agents' execution boundaries and recent activities.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Actions Evaluated</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,345</div>
            <p className="text-xs text-green-600 font-medium mt-1">+15% from last week</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blocked Actions</CardTitle>
            <ShieldBan className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">142</div>
            <p className="text-xs text-muted-foreground mt-1">High risk intents stopped</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Human Escalations</CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">28</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting your approval</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Policies</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground mt-1">Enforcing execution rules</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Executions Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent AI Executions</CardTitle>
          <CardDescription>Real-time log of actions requested by your autonomous agents across all workspaces.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Intent / Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions.map((exec) => (
                <TableRow key={exec.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{exec.id}</TableCell>
                  <TableCell className="font-medium">{exec.agent}</TableCell>
                  <TableCell>{exec.intent}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={exec.status === "Allowed" ? "default" : exec.status === "Blocked" ? "destructive" : "secondary"}
                      className={
                        exec.status === "Allowed" ? "bg-green-500/10 text-green-700 hover:bg-green-500/20 shadow-none border-0" : 
                        exec.status === "Escalated" ? "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 shadow-none border-0" : 
                        "shadow-none border-0"
                      }
                    >
                      {exec.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">{exec.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

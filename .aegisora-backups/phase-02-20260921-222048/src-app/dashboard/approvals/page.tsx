"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Clock, Cpu, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

export default function ApprovalsPage() {
  const approvals = [
    {
      id: "app_99x12",
      agent: "DevOps-Assistant",
      intent: "Drop Table 'legacy_users' in Production DB",
      policy: "pol_sys_12 (Production Mutation)",
      risk: "CRITICAL",
      requestedAt: "10 mins ago",
      expiresIn: "50 mins",
      status: "PENDING"
    },
    {
      id: "app_88y34",
      agent: "Sales-Bot-Alpha",
      intent: "Issue 100% Refund ($850.00)",
      policy: "pol_fin_04 (High-Value Transaction)",
      risk: "HIGH",
      requestedAt: "45 mins ago",
      expiresIn: "15 mins",
      status: "PENDING"
    },
    {
      id: "app_77z56",
      agent: "Data-Crawler",
      intent: "Export 5,000 lead emails to external API",
      policy: "pol_data_02 (Mass Data Transfer)",
      risk: "MEDIUM",
      requestedAt: "2 hours ago",
      expiresIn: "Expired",
      status: "EXPIRED"
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 font-sans text-foreground">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Human Approvals</h2>
          <p className="text-muted-foreground mt-1">Review operations escalated by the policy engine that require human authorization.</p>
        </div>
      </div>

      <div className="space-y-4">
        {approvals.map((approval) => (
          <Card key={approval.id} className={`bg-card border-border shadow-md transition-all ${approval.status === 'EXPIRED' ? 'opacity-50' : 'hover:border-primary/50'}`}>
            <CardContent className="p-0 flex flex-col md:flex-row md:items-center">
              
              <div className="p-6 flex-1 flex items-start gap-4">
                <div className={`p-3 rounded-md mt-1 ${
                  approval.status === 'EXPIRED' ? 'bg-secondary text-muted-foreground' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}>
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{approval.intent}</h3>
                    <Badge variant="outline" className={`font-mono text-xs ${
                      approval.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {approval.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4" /> {approval.agent}</span>
                    <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> {approval.policy}</span>
                  </div>

                  <div className="flex items-center gap-4 pt-2 text-xs font-mono text-muted-foreground">
                    <span>REQ: {approval.id}</span>
                    <span className="flex items-center gap-1 text-amber-500/80"><Clock className="w-3.5 h-3.5" /> Expires in {approval.expiresIn}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-secondary/30 md:border-l border-border md:w-64 flex flex-col justify-center items-start md:items-end gap-3 h-full">
                <div className="text-right w-full">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Risk Assessment</p>
                  <span className={`text-sm font-bold ${
                    approval.risk === 'CRITICAL' ? 'text-destructive' : approval.risk === 'HIGH' ? 'text-amber-500' : 'text-blue-500'
                  }`}>
                    {approval.risk}
                  </span>
                </div>
                <Link href={`/dashboard/approvals/${approval.id}`} className="w-full">
                  <Button className="w-full font-medium" disabled={approval.status === 'EXPIRED'}>
                    Review Request <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
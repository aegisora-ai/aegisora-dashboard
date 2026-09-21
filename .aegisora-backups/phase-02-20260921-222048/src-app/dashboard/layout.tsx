import Link from "next/link";
import { Shield, FileText, Settings, Activity, Bell, Search, User, Cpu, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[#070B12] text-[#F5F7FA] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1A2738] bg-[#0A0F19] flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-[#1A2738]">
          <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1677FF] rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">AG</span>
            </div>
            Aegisora
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-xs font-semibold text-[#8993A5] uppercase tracking-wider">Control Plane</div>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-[#8993A5] hover:bg-[#1A2738] hover:text-white rounded-lg font-medium text-sm transition-colors">
            <Activity className="w-4 h-4" /> Runtime Overview
          </Link>
          <Link href="/dashboard/agents" className="flex items-center gap-3 px-3 py-2.5 text-[#8993A5] hover:bg-[#1A2738] hover:text-white rounded-lg font-medium text-sm transition-colors">
            <Cpu className="w-4 h-4" /> Agent Registry
          </Link>
          <Link href="/dashboard/policies" className="flex items-center gap-3 px-3 py-2.5 text-[#8993A5] hover:bg-[#1A2738] hover:text-white rounded-lg font-medium text-sm transition-colors">
            <Shield className="w-4 h-4" /> Policy Engine
          </Link>
          
          <div className="px-3 pt-6 pb-2 text-xs font-semibold text-[#8993A5] uppercase tracking-wider">Governance</div>
          <Link href="/dashboard/approvals" className="flex items-center justify-between px-3 py-2.5 bg-[#1A2738] text-white rounded-lg font-medium text-sm transition-colors shadow-sm">
            <div className="flex items-center gap-3"><CheckSquare className="w-4 h-4 text-[#1677FF]" /> Pending Approvals</div>
            <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
          </Link>
          <Link href="/dashboard/audit" className="flex items-center gap-3 px-3 py-2.5 text-[#8993A5] hover:bg-[#1A2738] hover:text-white rounded-lg font-medium text-sm transition-colors">
            <FileText className="w-4 h-4" /> Audit Ledger
          </Link>
          
          <div className="px-3 pt-6 pb-2 text-xs font-semibold text-[#8993A5] uppercase tracking-wider">System</div>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-[#8993A5] hover:bg-[#1A2738] hover:text-white rounded-lg font-medium text-sm transition-colors">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#070B12]">
        <header className="h-16 border-b border-[#1A2738] bg-[#0A0F19] flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8993A5]" />
            <Input type="search" placeholder="Search executions, agents, or policies..." className="w-full bg-[#0D1420] border-transparent focus-visible:ring-1 focus-visible:ring-[#1677FF] pl-9 rounded-md text-sm" />
          </div>
          <div className="flex items-center gap-5">
            <button className="relative text-[#8993A5] hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full border-2 border-[#0A0F19]"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#1677FF]/20 flex items-center justify-center border border-[#1677FF]/50 cursor-pointer">
              <User className="w-4 h-4 text-[#1677FF]" />
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
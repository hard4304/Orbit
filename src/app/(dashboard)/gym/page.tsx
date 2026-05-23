"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GymMode } from "@/components/gym/gym-mode";
import { WorkoutHistory } from "@/components/gym/workout-history";
import { IGymSession } from "@/types";

export default function GymPage() {
  const [activeSession, setActiveSession] = useState<IGymSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState("history");

  useEffect(() => {
    async function checkActiveSession() {
      try {
        const res = await fetch("/api/gym-sessions");
        const data = await res.json();
        if (data.success && data.data) {
          setActiveSession(data.data);
          setActiveTab("gym-mode");
        }
      } catch {
        // No active session
      } finally {
        setCheckingSession(false);
      }
    }
    checkActiveSession();
  }, []);

  if (checkingSession) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gym</h1>
        <p className="text-muted-foreground text-sm">Track workouts and use Gym Mode during sessions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="history">Workout History</TabsTrigger>
          <TabsTrigger value="gym-mode">
            Gym Mode {activeSession && <span className="ml-1.5 w-2 h-2 rounded-full bg-green-500 inline-block" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <WorkoutHistory />
        </TabsContent>

        <TabsContent value="gym-mode" className="mt-4">
          <GymMode
            initialSession={activeSession}
            onSessionChange={setActiveSession}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { VitalsData } from "@/components/health-check/VitalsDisplay";

interface AnalysisContextType {
  analysisData: VitalsData | null;
  setAnalysisData: (data: VitalsData | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined
);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysisData, setAnalysisData] = useState<VitalsData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AnalysisContext.Provider
      value={{
        analysisData,
        setAnalysisData,
        isAuthenticated,
        setIsAuthenticated,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}

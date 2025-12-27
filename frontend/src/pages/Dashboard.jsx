import { useState, useEffect } from "react";

// Components
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import TaskTypeSelector from "../components/Dashboard/TaskTypeSelector";
import CloudProviderSelector from "../components/Dashboard/CloudProviderSelector";
import AvailabilityZoneSelector from "../components/Dashboard/AvailabilityZoneSelector";
import ApplicationUrlInput from "../components/Dashboard/ApplicationUrlInput";
import RegionCard from "../components/Dashboard/RegionCard";
import GreenScoreChart from "../components/Dashboard/GreenScoreChart";
import RoutingDecisionCard from "../components/Dashboard/RoutingDecisionCard";
import InfoPanel from "../components/Dashboard/InfoPanel";
import PhaseDisclaimer from "../components/Dashboard/PhaseDisclaimer";

// Services & Data Logic
import { fetchCarbonIntensity } from "../services/api"; // The fixed Promise.all version
import {
  generateCloudRegions,    // The new factory function
  selectOptimalRegion,
  calculateCarbonSavings,
} from "../data/regionData";

function Dashboard() {
  // --- STATE MANAGEMENT ---
  const [taskType, setTaskType] = useState("green");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedZone, setSelectedZone] = useState([]); // Array of strings e.g. ["us-east-1"]
  const [applicationUrl, setApplicationUrl] = useState("");
  const [manualSelection, setManualSelection] = useState(null);

  // This state holds the full Region Objects (Metadata + Live Carbon Data)
  const [regionData, setRegionData] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- EFFECT: Fetch & Generate Data ---
  useEffect(() => {
    const loadData = async () => {
      // 1. If no zones are selected, clear the dashboard
      if (selectedZone.length === 0) {
        setRegionData([]);
        setManualSelection(null);
        return;
      }

      setLoading(true);
      try {
        // 2. Fetch RAW data from backend: [{ regionCode: "us-east-1", carbonIntensity: 454 }]
        const rawBackendData = await fetchCarbonIntensity(selectedZone);
        
        // 3. Convert raw data into Rich UI Objects using your Factory
        const formattedRegions = generateCloudRegions(rawBackendData);
        
        setRegionData(formattedRegions);
      } catch (error) {
        console.error("Failed to load region data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedZone]); // Re-run whenever user adds/removes a zone

  // --- DERIVED STATE (Filtering) ---
  
  // Even though we fetched specific zones, the user might still want to filter 
  // the results by Provider (e.g., Show me only AWS results from my selection)
  const filteredRegions = regionData.filter((region) => {
    return selectedProvider ? region.provider === selectedProvider : true;
  });

  // Calculate Optimal Region & Savings based on the LIVE data
  const optimalRegion = selectOptimalRegion(filteredRegions, taskType);
  
  // Final selection is either what the user clicked manually, or the auto-recommendation
  const activeSelection = manualSelection || optimalRegion;
  
  const carbonSavings = calculateCarbonSavings(activeSelection, filteredRegions);

  // --- UI RENDER ---
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        
        {/* Header */}
        <DashboardHeader />

        {/* Input Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TaskTypeSelector
            value={taskType}
            onChange={(val) => {
              setTaskType(val);
              setManualSelection(null); // Reset manual override if strategy changes
            }}
          />
          <CloudProviderSelector
            value={selectedProvider}
            onChange={(val) => {
              setSelectedProvider(val);
              setManualSelection(null);
            }}
          />
          
          {/* NOTE: This component is now "Dumb". 
             It just updates 'selectedZone' state. 
             The useEffect above handles the fetching.
          */}
          <AvailabilityZoneSelector
            value={selectedZone}
            onChange={(val) => {
              setSelectedZone(val);
              setManualSelection(null);
            }}
          />
          
          <ApplicationUrlInput
            value={applicationUrl}
            onChange={setApplicationUrl}
          />
        </div>

        {/* Content Area: Show loading or Data */}
        {loading ? (
           <div className="text-center py-20 text-gray-500">Fetching live carbon data...</div>
        ) : filteredRegions.length > 0 ? (
          <>
            {/* Main Decision + Chart */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <RoutingDecisionCard
                  selectedRegion={activeSelection}
                  taskType={taskType}
                  carbonSavings={carbonSavings}
                />
              </div>

              <div className="lg:col-span-2">
                <GreenScoreChart
                  regions={filteredRegions}
                  selectedRegionId={activeSelection?.id}
                />
              </div>
            </div>

            {/* Region Comparison Cards */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                <span className="w-1.5 h-6 rounded-full bg-primary" />
                Region Comparison
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRegions
                  .sort((a, b) => a.greenScore - b.greenScore)
                  .map((region, index) => (
                    <RegionCard
                      key={region.id}
                      region={region}
                      isSelected={region.id === activeSelection?.id}
                      onSelect={setManualSelection}
                      animationDelay={index * 100}
                    />
                  ))}
              </div>
            </section>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-600">No Regions Selected</h3>
            <p className="text-gray-500">Select an Availability Zone to see live carbon data.</p>
          </div>
        )}

        {/* Footer Info */}
        <InfoPanel />
        <PhaseDisclaimer />
      </div>
    </div>
  );
}

export default Dashboard;
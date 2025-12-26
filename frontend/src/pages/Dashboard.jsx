import { useState } from "react";

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

import {
  cloudRegions,
  selectOptimalRegion,
  calculateCarbonSavings,
} from "../data/regionData";

function Dashboard() {
  const [taskType, setTaskType] = useState("green");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedZone, setSelectedZone] = useState([]);
  const [applicationUrl, setApplicationUrl] = useState("");

  const [manualSelection, setManualSelection] = useState(null);

  // Filter regions based on user selection
  const filteredRegions = cloudRegions.filter((region) => {
    const matchesProvider = selectedProvider
      ? region.provider === selectedProvider
      : true;
    const matchesZone = selectedZone ? region.zone === selectedZone : true;
    return matchesProvider && matchesZone;
  });

  // If no regions match, we might want to handle that gracefully,
  // but for now we'll fall back to all regions or handle empty state in UI.
  // Using filteredRegions for optimal selection if any exist, otherwise fallback (or empty).
  const regionsToConsider =
    filteredRegions.length > 0 ? filteredRegions : cloudRegions;

  // Make sure we select an optimal region from the *filtered* list if possible
  const optimalRegion = selectOptimalRegion(regionsToConsider, taskType);

  // Use manual selection if it exists and is valid (part of the filtered list),
  // otherwise fallback to optimal.
  // Note: If user filters change, we probably want to reset manual selection.
  const selectedRegion = manualSelection || optimalRegion;
  const carbonSavings = calculateCarbonSavings(selectedRegion, cloudRegions);

  // Reset manual selection when inputs change
  // We can't use useEffect easily with derived state in this structure without separate effects,
  // but simpler is to just let the user override anytime.
  // Ideally, if `taskType` changes, we might want to re-recommend.
  // Let's add an effect to clear manual selection on filter/task changes.
  // Since we are inside the render, we can't conditionally call hooks.
  // We'll trust the user's manual click is final until they change a filter.
  // Actually, standard pattern:
  // useEffect(() => setManualSelection(null), [taskType, selectedProvider, selectedZone]);

  // Adding the effect:
  // Using a trick: we want to reset manual selection if dependencies change.
  // Since `selectedRegion` is derived, we need to be careful.
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
              setManualSelection(null);
            }}
          />
          <CloudProviderSelector
            value={selectedProvider}
            onChange={(val) => {
              setSelectedProvider(val);
              setManualSelection(null);
            }}
          />
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

        {/* Main Decision + Chart */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <RoutingDecisionCard
              selectedRegion={selectedRegion}
              taskType={taskType}
              carbonSavings={carbonSavings}
            />
          </div>

          <div className="lg:col-span-2">
            <GreenScoreChart
              regions={cloudRegions}
              selectedRegionId={selectedRegion.id}
            />
          </div>
        </div>

        {/* Region Comparison */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
            <span className="w-1.5 h-6 rounded-full bg-primary" />
            Region Comparison
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Show only filtered regions if user has made a selection, otherwise existing logic */}
            {cloudRegions
              .sort((a, b) => a.greenScore - b.greenScore)
              .map((region, index) => (
                <RegionCard
                  key={region.id}
                  region={region}
                  isSelected={region.id === selectedRegion.id}
                  onSelect={setManualSelection}
                  animationDelay={index * 100}
                />
              ))}
          </div>
        </section>

        {/* Info + Disclaimer */}
        <InfoPanel />
        <PhaseDisclaimer />
      </div>
    </div>
  );
}

export default Dashboard;

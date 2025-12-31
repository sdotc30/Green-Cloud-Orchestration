import { REGION_LOOKUP } from "/constants/regions";

// 1. THE GENERATOR: Converts Backend Data -> UI Objects
export function generateCloudRegions(apiData) {
  if (!apiData || !Array.isArray(apiData)) return [];

  return apiData.map((dataItem) => {
    // Look up static details from our new Constants file
    // If not found, use a safe fallback object
    const meta = REGION_LOOKUP[dataItem.regionCode] || {
      name: dataItem.regionCode, 
      zone: "Unknown",
      pue: 1.2,
    };

    const intensity = dataItem.carbonIntensity;
    const pue = meta.pue || 1.2;
    const greenScore = intensity * pue;
    const estimatedRenewable = dataItem.renewablepercent || 0; 

    return {
      id: dataItem.regionCode,
      
      // FIX 1: Hardcode AWS since we are currently AWS-focused
      // (The constant file doesn't store 'provider' to save space)
      provider: "AWS", 
      
      // FIX 2: Map 'meta.name' (from constants) to 'regionName' (for UI)
      regionName: meta.name || dataItem.regionCode,
      
      zone: meta.zone || "Unknown",
      carbonIntensity: intensity,
      pue: pue,
      greenScore: parseFloat(greenScore.toFixed(1)),
      renewablePercentage: Math.round(estimatedRenewable),
      
      // Latency Handling: If 0/null, pass 0. The sorter handles the logic.
      estimatedLatency: dataItem.estimatedLatency || 0, 
    };
  });
}

export const taskTypeOptions = [
  { value: "green", label: "Green Optimized", description: "Prioritize low carbon footprint", icon: "🌱" },
  { value: "balanced", label: "Balanced", description: "Balance sustainability and performance", icon: "⚖️" },
  { value: "performance", label: "Performance Optimized", description: "Prioritize low latency", icon: "🚀" },
];

// ------------------------------------------------------------------
// 2. THE LOGIC: Smart Sorting
// ------------------------------------------------------------------
export function selectOptimalRegion(regions, taskType) {
  if (!regions || regions.length === 0) return null;

  // Helper: Returns latency, or a Huge Number if latency is 0/missing
  const getSortableLatency = (latency) => {
    // If latency is 0, we treat it as 999,999ms so it sorts to the bottom
    return (!latency || latency <= 0) ? 999999 : latency;
  };

  const sortedRegions = [...regions].sort((a, b) => {
    switch (taskType) {
      // CASE 1: Green Mode (Lowest Score wins)
      case "green":
        return a.greenScore - b.greenScore;

      // CASE 2: Performance Mode (Lowest Latency wins)
      case "performance": {
        const latA = getSortableLatency(a.estimatedLatency);
        const latB = getSortableLatency(b.estimatedLatency);
        return latA - latB;
      }

      // CASE 3: Balanced Mode (Weighted Average)
      case "balanced": {
        // Filter out broken regions for the 'Max' calculation
        const validLatencies = regions
           .map(r => r.estimatedLatency)
           .filter(l => l > 0);
        
        const maxGreen = Math.max(...regions.map((r) => r.greenScore)) || 1;
        const maxLatency = Math.max(...validLatencies, 1); 

        // Score Function (Lower is Better)
        const getScore = (region) => {
            const lat = getSortableLatency(region.estimatedLatency);
            
            // If latency is "Infinity" (failed), return a huge penalty score
            if (lat >= 999999) return 1000; 

            // 50% Green Score + 50% Latency Score
            return ((region.greenScore / maxGreen) * 0.5) + 
                   ((lat / maxLatency) * 0.5);
        };

        return getScore(a) - getScore(b);
      }

      default:
        return a.greenScore - b.greenScore;
    }
  });

  return sortedRegions[0];
}

export function calculateCarbonSavings(selectedRegion, regions) {
  if (!selectedRegion || !regions || regions.length === 0) return 0;
  
  const maxGreenScore = Math.max(...regions.map((r) => r.greenScore));
  if (maxGreenScore === 0) return 0;

  const savings = ((maxGreenScore - selectedRegion.greenScore) / maxGreenScore) * 100;
  return Math.round(savings);
}
// 1. STATIC METADATA: The details that never change
// We use the "regionCode" (e.g., 'us-east-1') as the key to look things up.
const REGION_METADATA = {
  "us-east-1": {
    provider: "AWS",
    regionName: "US East (Virginia)",
    zone: "North America",
    pue: 1.15,
    estimatedLatency: 327, //From Noida Manually Calculated, later Dyanmically Calculated
  },
  "us-east-2": {
    provider: "AWS",
    regionName: "US East (Ohio)",
    zone: "North America",
    pue: 1.15,
    estimatedLatency: 319,
  },
  "us-west-1": {
    provider: "AWS",
    regionName: "US West (N. California)",
    zone: "North America",
    pue: 1.15,
    estimatedLatency: 270,
  },
  "us-west-2": {
    provider: "AWS",
    regionName: "Oregon",
    zone: "Western United States",
    pue: 1.15,
    estimatedLatency: 281, 
  },
  "ca-central-1": {
    provider: "AWS",
    regionName: "Canada Central",
    zone: "Canada",
    pue: 1.15,
    estimatedLatency: 350, // Higher latency if user is in US
  },
  "ca-west-1": {
    provider: "AWS",
    regionName: "Canada West",
    zone: "Canada",
    pue: 1.15,
    estimatedLatency: 363, // Higher latency if user is in US
  },
  "eu-west-1": {
    provider: "AWS",
    regionName: "Ireland",
    zone: "Europe",
    pue: 1.15,
    estimatedLatency: 182, // Higher latency if user is in US
  },
  "eu-west-2": {
    provider: "AWS",
    regionName: "London",
    zone: "Europe",
    pue: 1.15,
    estimatedLatency: 163, // Higher latency if user is in US
  },
  "eu-west-3": {
    provider: "AWS",
    regionName: "Paris",
    zone: "Europe",
    pue: 1.15,
    estimatedLatency: 173, // Higher latency if user is in US
  },
  "af-south-1": {
    provider: "AWS",
    regionName: "Cape Town",
    zone: "South Africa",
    pue: 1.15,
    estimatedLatency: 310, // Higher latency if user is in US
  },
  // Add defaults for others if needed
};

// 2. THE GENERATOR: Converts Backend Data -> UI Objects
export function generateCloudRegions(apiData) {
  if (!apiData || !Array.isArray(apiData)) return [];

  return apiData.map((dataItem) => {
    // dataItem is { regionCode: "us-east-1", carbonIntensity: 454 }
    
    // Look up static details (or use fallbacks if region is unknown)
    const meta = REGION_METADATA[dataItem.regionCode] || {
      provider: "Unknown",
      regionName: dataItem.regionCode,
      zone: "Unknown",
      pue: 1.15,
      estimatedLatency: 100,
    };

    const intensity = dataItem.carbonIntensity;
    
    // Calculate derived metrics
    const greenScore = intensity * meta.pue;
    
    // Simple heuristic: If intensity is low, renewable % is high
    // (You can also fetch this from backend if available later)
    const estimatedRenewable = dataItem.renewablepercent; 

    return {
      id: dataItem.regionCode,
      provider: meta.provider,
      regionName: meta.regionName,
      zone: meta.zone,
      carbonIntensity: intensity,
      pue: meta.pue,
      greenScore: parseFloat(greenScore.toFixed(1)),
      renewablePercentage: Math.round(estimatedRenewable),
      estimatedLatency: meta.estimatedLatency,
    };
  });
}

// ---------------------------------------------------------
// KEEPING YOUR EXISTING LOGIC BELOW
// ---------------------------------------------------------

export const taskTypeOptions = [
  {
    value: "green",
    label: "Green Optimized",
    description: "Prioritize low carbon footprint",
    icon: "🌱",
  },
  {
    value: "balanced",
    label: "Balanced",
    description: "Balance sustainability and performance",
    icon: "⚖️",
  },
  {
    value: "performance",
    label: "Performance Optimized",
    description: "Prioritize low latency",
    icon: "🚀",
  },
];

export function selectOptimalRegion(regions, taskType) {
  if (!regions || regions.length === 0) return null;

  const sortedRegions = [...regions].sort((a, b) => {
    switch (taskType) {
      case "green":
        return a.greenScore - b.greenScore;

      case "performance":
        return a.estimatedLatency - b.estimatedLatency;

      case "balanced": {
        // Prevent division by zero if list is empty or weird
        const maxGreen = Math.max(...regions.map((r) => r.greenScore)) || 1;
        const maxLatency = Math.max(...regions.map((r) => r.estimatedLatency)) || 1;

        const scoreA =
          (a.greenScore / maxGreen) * 0.5 +
          (a.estimatedLatency / maxLatency) * 0.5;

        const scoreB =
          (b.greenScore / maxGreen) * 0.5 +
          (b.estimatedLatency / maxLatency) * 0.5;

        return scoreA - scoreB;
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

  const savings =
    ((maxGreenScore - selectedRegion.greenScore) / maxGreenScore) * 100;

  return Math.round(savings);
}
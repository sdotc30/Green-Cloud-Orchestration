const API_BASE = "http://localhost:3000";
import axios from 'axios';

export async function fetchCarbonIntensity(value) {
  try{
    const regionValue = value;
    regionValue.forEach(async regionValue => {
      console.log({"Region Value": regionValue});
    const response  = await axios.post(`${API_BASE}/api/carbon-footprint`,{
      regionValue: regionValue
    });
    console.log(response.data);
    });
    
  }catch(error){
    console.error(error.message);
  }
}

export async function getRouteDecision(taskType) {
  const res = await fetch(`${API_BASE}/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskType }),
  });
  return res.json();
}

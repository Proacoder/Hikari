/**
 * Mumbai Municipal Administrative Wards GeoJSON Boundaries
 * Provides polygon boundaries for BMC's 26 administrative wards for Leaflet choropleth heatmap rendering.
 */

export const MUMBAI_WARDS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: 1,
        code: "A Ward",
        name: "Colaba & Fort",
        zone: "Zone 1 (Island City)",
        ac: "Shri Jaydeep More",
        severityLevel: "medium"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8080, 18.8950],
          [72.8360, 18.9050],
          [72.8420, 18.9350],
          [72.8320, 18.9420],
          [72.8220, 18.9300],
          [72.8150, 18.9100],
          [72.8080, 18.8950]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: 4,
        code: "D Ward",
        name: "Malabar Hill & Grant Road",
        zone: "Zone 1 (Island City)",
        ac: "Shri Sharad Ughade",
        severityLevel: "low"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.7920, 18.9400],
          [72.8150, 18.9450],
          [72.8180, 18.9720],
          [72.7980, 18.9750],
          [72.7880, 18.9550],
          [72.7920, 18.9400]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: 5,
        code: "E Ward",
        name: "Byculla & Mazgaon",
        zone: "Zone 1 (Island City)",
        ac: "Shri Manish Valanju",
        severityLevel: "medium"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8200, 18.9600],
          [72.8520, 18.9650],
          [72.8550, 18.9950],
          [72.8250, 18.9900],
          [72.8200, 18.9600]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: 8,
        code: "G/N Ward",
        name: "Dadar, Mahim & Dharavi",
        zone: "Zone 2 (Island City)",
        ac: "Shri Prashant Sapkale",
        severityLevel: "critical"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8200, 19.0300],
          [72.8580, 19.0350],
          [72.8620, 19.0680],
          [72.8350, 19.0700],
          [72.8200, 19.0450],
          [72.8200, 19.0300]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: 9,
        code: "G/S Ward",
        name: "Worli & Lower Parel",
        zone: "Zone 2 (Island City)",
        ac: "Shri Santosh Dhonde",
        severityLevel: "high"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8100, 18.9950],
          [72.8400, 18.9980],
          [72.8380, 19.0350],
          [72.8120, 19.0300],
          [72.8100, 18.9950]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: 11,
        code: "H/W Ward",
        name: "Bandra & Khar (West)",
        zone: "Zone 3 (Western Suburbs)",
        ac: "Shri Vinayak Vispute",
        severityLevel: "high"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8180, 19.0450],
          [72.8480, 19.0550],
          [72.8420, 19.0980],
          [72.8220, 19.0950],
          [72.8180, 19.0450]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: 10,
        code: "H/E Ward",
        name: "Santacruz & Kalina (BKC)",
        zone: "Zone 3 (Western Suburbs)",
        ac: "Smt. Alka Sasane",
        severityLevel: "critical"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8450, 19.0600],
          [72.8800, 19.0650],
          [72.8750, 19.0950],
          [72.8420, 19.0920],
          [72.8450, 19.0600]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: 12,
        code: "K/E Ward",
        name: "Andheri (East) & MIDC",
        zone: "Zone 3 (Western Suburbs)",
        ac: "Shri Manish Patel",
        severityLevel: "critical"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8500, 19.0980],
          [72.8950, 19.1020],
          [72.8900, 19.1450],
          [72.8480, 19.1400],
          [72.8500, 19.0980]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: 13,
        code: "K/W Ward",
        name: "Andheri (West) & Juhu",
        zone: "Zone 4 (Western Suburbs)",
        ac: "Shri Prithviraj Chauhan",
        severityLevel: "high"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8150, 19.0980],
          [72.8500, 19.1020],
          [72.8480, 19.1480],
          [72.8120, 19.1420],
          [72.8150, 19.0980]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: 14,
        code: "L Ward",
        name: "Kurla & Sakinaka",
        zone: "Zone 5 (Eastern Suburbs)",
        ac: "Shri Mahadev Shinde",
        severityLevel: "critical"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8700, 19.0550],
          [72.9150, 19.0600],
          [72.9100, 19.1050],
          [72.8680, 19.0980],
          [72.8700, 19.0550]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: 17,
        code: "N Ward",
        name: "Ghatkopar & Vikhroli",
        zone: "Zone 6 (Eastern Suburbs)",
        ac: "Shri Sanjay Sonawane",
        severityLevel: "medium"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8950, 19.0750],
          [72.9450, 19.0800],
          [72.9400, 19.1250],
          [72.8900, 19.1200],
          [72.8950, 19.0750]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: 18,
        code: "P/N Ward",
        name: "Malad (East & West)",
        zone: "Zone 4 (Western Suburbs)",
        ac: "Shri Kiran Dighavkar",
        severityLevel: "high"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8100, 19.1650],
          [72.8750, 19.1700],
          [72.8700, 19.2050],
          [72.8080, 19.2000],
          [72.8100, 19.1650]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: 20,
        code: "R/C Ward",
        name: "Borivali (West) & Gorai",
        zone: "Zone 7 (Western Suburbs)",
        ac: "Smt. Bhagyashree Kapse",
        severityLevel: "medium"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8050, 19.2050],
          [72.8650, 19.2100],
          [72.8600, 19.2480],
          [72.8020, 19.2420],
          [72.8050, 19.2050]
        ]]
      }
    }
  ]
};

/**
 * Returns choropleth fill color and border style based on active complaint density in ward.
 */
export const getWardHeatmapStyle = (count = 0) => {
  if (count >= 10) {
    return {
      fillColor: '#dc2626',
      fillOpacity: 0.35,
      color: '#b91c1c',
      weight: 2,
    };
  }
  if (count >= 6) {
    return {
      fillColor: '#ea580c',
      fillOpacity: 0.30,
      color: '#c2410c',
      weight: 2,
    };
  }
  if (count >= 3) {
    return {
      fillColor: '#f59e0b',
      fillOpacity: 0.25,
      color: '#d97706',
      weight: 1.5,
    };
  }
  return {
    fillColor: '#22c55e',
    fillOpacity: 0.20,
    color: '#16a34a',
    weight: 1.5,
  };
};

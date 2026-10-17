/**
 * Mumbai Municipal Administrative Wards GeoJSON Boundaries
 * Provides polygon boundaries for BMC's 26 administrative wards for Leaflet choropleth heatmap rendering.
 * NOTE: These are approximate boundaries based on ward center points. For production use,
 * replace with official BMC ward boundary data.
 */

export const MUMBAI_WARDS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    // Ward 1 - A Ward
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
    // Ward 2 - B Ward
    {
      type: "Feature",
      properties: {
        id: 2,
        code: "B Ward",
        name: "Dongri & Mandvi",
        zone: "Zone 1 (Island City)",
        ac: "Shri Udaykumar Shiroorkar",
        severityLevel: "medium"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8291, 18.9491],
          [72.8391, 18.9491],
          [72.8391, 18.9691],
          [72.8291, 18.9691],
          [72.8291, 18.9491]
        ]]
      }
    },
    // Ward 3 - C Ward
    {
      type: "Feature",
      properties: {
        id: 3,
        code: "C Ward",
        name: "Girgaon & Bhuleshwar",
        zone: "Zone 1 (Island City)",
        ac: "Shri Chakrapani Alle",
        severityLevel: "medium"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8128, 18.9428],
          [72.8228, 18.9428],
          [72.8228, 18.9628],
          [72.8128, 18.9628],
          [72.8128, 18.9428]
        ]]
      }
    },
    // Ward 4 - D Ward
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
    // Ward 5 - E Ward
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
    // Ward 6 - F/N Ward
    {
      type: "Feature",
      properties: {
        id: 6,
        code: "F/N Ward",
        name: "Matunga, Sion, Wadala (North)",
        zone: "Zone 2 (Island City)",
        ac: "Shri Gajanan Bellale",
        severityLevel: "medium"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8687, 19.0600],
          [72.8787, 19.0600],
          [72.8787, 19.0800],
          [72.8687, 19.0800],
          [72.8687, 19.0600]
        ]]
      }
    },
    // Ward 7 - F/S Ward
    {
      type: "Feature",
      properties: {
        id: 7,
        code: "F/S Ward",
        name: "Parel, Sewri, Naigaon, Lalbaug, Wadala (South)",
        zone: "Zone 2 (Island City)",
        ac: "Smt. Swapnaja Kshirsagar",
        severityLevel: "medium"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8451, 19.0319],
          [72.8551, 19.0319],
          [72.8551, 19.0519],
          [72.8451, 19.0519],
          [72.8451, 19.0319]
        ]]
      }
    },
    // Ward 8 - G/N Ward
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
    // Ward 9 - G/S Ward
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
    // Ward 10 - H/E Ward
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
    // Ward 11 - H/W Ward
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
    // Ward 12 - K/E Ward
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
    // Ward 13 - K/W Ward
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
    // Ward 14 - L Ward
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
    // Ward 15 - M/E Ward
    {
      type: "Feature",
      properties: {
        id: 15,
        code: "M/E Ward",
        name: "Govandi, Mankhurd, Shivaji Nagar, Trombay, Bainganwadi",
        zone: "Zone 5 (Eastern Suburbs)",
        ac: "Shri Mahendra Ubale",
        severityLevel: "medium"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.9059, 19.0326],
          [72.9259, 19.0326],
          [72.9259, 19.0526],
          [72.9059, 19.0526],
          [72.9059, 19.0326]
        ]]
      }
    },
    // Ward 16 - M/W Ward
    {
      type: "Feature",
      properties: {
        id: 16,
        code: "M/W Ward",
        name: "Chembur, Tilak Nagar, Mahul, Sindhi Society, Pestom Sagar",
        zone: "Zone 5 (Eastern Suburbs)",
        ac: "Shri Vishwas Mote",
        severityLevel: "medium"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8890, 19.0438],
          [72.9090, 19.0438],
          [72.9090, 19.0638],
          [72.8890, 19.0638],
          [72.8890, 19.0438]
        ]]
      }
    },
    // Ward 17 - N Ward
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
    // Ward 18 - P/N Ward
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
          [72.8000, 19.1517],
          [72.8200, 19.1517],
          [72.8200, 19.1717],
          [72.8000, 19.1717],
          [72.8000, 19.1517]
        ]]
      }
    },
    // Ward 19 - P/S Ward
    {
      type: "Feature",
      properties: {
        id: 19,
        code: "P/S Ward",
        name: "Goregaon (East & West), Jogeshwari (West), Aarey Colony",
        ac: "Shri Rajesh Akre",
        zone: "Zone 4 (Western Suburbs)",
        severityLevel: "high"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8399, 19.1292],
          [72.8499, 19.1292],
          [72.8499, 19.1492],
          [72.8399, 19.1492],
          [72.8399, 19.1292]
        ]]
      }
    },
    // Ward 20 - R/C Ward
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
    },
    // Ward 21 - R/N Ward
    {
      type: "Feature",
      properties: {
        id: 21,
        code: "R/N Ward",
        name: "Dahisar (East & West), Rawalpada, Ketkipada, Anand Nagar",
        ac: "Smt. Mrudula Kulkarni",
        zone: "Zone 7 (Western Suburbs)",
        severityLevel: "medium"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8422, 19.2272],
          [72.8622, 19.2272],
          [72.8622, 19.2472],
          [72.8422, 19.2472],
          [72.8422, 19.2272]
        ]]
      }
    },
    // Ward 22 - R/S Ward
    {
      type: "Feature",
      properties: {
        id: 22,
        code: "R/S Ward",
        name: "Kandivali (West), Charkop, Mahavir Nagar, Poisar",
        ac: "Smt. Sandhya Nandedkar",
        zone: "Zone 4 (Western Suburbs)",
        severityLevel: "medium"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8283, 19.2015],
          [72.8483, 19.2015],
          [72.8483, 19.2215],
          [72.8283, 19.2215],
          [72.8283, 19.2015]
        ]]
      }
    },
    // Ward 23 - S Ward
    {
      type: "Feature",
      properties: {
        id: 23,
        code: "S Ward",
        name: "Bhandup, Powai, Kanjurmarg, IIT Bombay, Hiranandani",
        ac: "Shri Ajitkumar Ambi",
        zone: "Zone 6 (Eastern Suburbs)",
        severityLevel: "medium"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.9464, 19.1628],
          [72.9664, 19.1628],
          [72.9664, 19.1828],
          [72.9464, 19.1828],
          [72.9464, 19.1628]
        ]]
      }
    },
    // Ward 24 - T Ward
    {
      type: "Feature",
      properties: {
        id: 24,
        code: "T Ward",
        name: "Mulund (East & West), Nahur, Sarvodaya Nagar",
        ac: "Shri Ajay Patne",
        zone: "Zone 6 (Eastern Suburbs)",
        severityLevel: "medium"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.9282, 19.1349],
          [72.9482, 19.1349],
          [72.9482, 19.1549],
          [72.9282, 19.1549],
          [72.9282, 19.1349]
        ]]
      }
    },
    // Ward 25 - RC Ward
    {
      type: "Feature",
      properties: {
        id: 25,
        code: "RC Ward",
        name: "Borivali (East), Magathane, National Park periphery",
        ac: "Shri Sandeep Malvi",
        zone: "Zone 7 (Western Suburbs)",
        severityLevel: "medium"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8592, 19.2192],
          [72.8792, 19.2192],
          [72.8792, 19.2392],
          [72.8592, 19.2392],
          [72.8592, 19.2192]
        ]]
      }
    },
    // Ward 26 - RS Ward
    {
      type: "Feature",
      properties: {
        id: 26,
        code: "RS Ward",
        name: "Kandivali (East), Thakur Village, Lokhandwala Township",
        ac: "Shri Devidas Kshirsagar",
        zone: "Zone 4 (Western Suburbs)",
        severityLevel: "medium"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [72.8375, 19.1775],
          [72.8575, 19.1775],
          [72.8575, 19.1975],
          [72.8375, 19.1975],
          [72.8375, 19.1775]
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
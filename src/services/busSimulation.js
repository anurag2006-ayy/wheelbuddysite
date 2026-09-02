// busSimulation.js
const ROUTES = {
  'route-a': {
    id: 'route-a',
    name: 'GLA University - Mathura Cantt',
    path: [
      { lat: 27.6062, lng: 77.5810 }, // GLA
      { lat: 27.5900, lng: 77.5950 },
      { lat: 27.5750, lng: 77.6100 },
      { lat: 27.5600, lng: 77.6250 },
      { lat: 27.5450, lng: 77.6400 },
      { lat: 27.5300, lng: 77.6500 },
      { lat: 27.5150, lng: 77.6600 },
      { lat: 27.4924, lng: 77.6737 }  // Mathura Cantt
    ]
  },
  'route-b': {
    id: 'route-b',
    name: 'GLA University - Mathura Junction',
    path: [
      { lat: 27.6062, lng: 77.5810 }, // GLA
      { lat: 27.5850, lng: 77.5900 },
      { lat: 27.5650, lng: 77.6100 },
      { lat: 27.5400, lng: 77.6300 },
      { lat: 27.5200, lng: 77.6500 },
      { lat: 27.5000, lng: 77.6700 },
      { lat: 27.4850, lng: 77.6830 }  // Mathura Junction
    ]
  },
  'route-c': {
    id: 'route-c',
    name: 'GLA University - Bharatpur Road',
    path: [
      { lat: 27.6062, lng: 77.5810 }, // GLA
      { lat: 27.5900, lng: 77.5700 },
      { lat: 27.5750, lng: 77.5600 },
      { lat: 27.5600, lng: 77.5500 },
      { lat: 27.5450, lng: 77.5400 },
      { lat: 27.5300, lng: 77.5300 },
      { lat: 27.5100, lng: 77.5200 }  // Bharatpur Road
    ]
  }
};

const INITIAL_BUSES = [
  { id: 'b1', busNumber: 'BUS-01', routeId: 'route-a', driverName: 'Rajesh Kumar', baseSpeed: 30, status: 'active' },
  { id: 'b2', busNumber: 'BUS-02', routeId: 'route-a', driverName: 'Amit Singh', baseSpeed: 35, status: 'active' },
  { id: 'b3', busNumber: 'BUS-03', routeId: 'route-b', driverName: 'Suresh Yadav', baseSpeed: 28, status: 'active' },
  { id: 'b4', busNumber: 'BUS-04', routeId: 'route-b', driverName: 'Vikram Sharma', baseSpeed: 32, status: 'active' },
  { id: 'b5', busNumber: 'BUS-05', routeId: 'route-c', driverName: 'Manoj Tiwari', baseSpeed: 40, status: 'active' },
  { id: 'b6', busNumber: 'BUS-06', routeId: 'route-c', driverName: 'Prakash Das', baseSpeed: 0, status: 'idle' }
];

function calculateDistance(p1, p2) {
  const R = 6371e3; // metres
  const \u03c61 = p1.lat * Math.PI/180; // \u03c6, \u03bb in radians
  const \u03c62 = p2.lat * Math.PI/180;
  const \u0394\u03c6 = (p2.lat-p1.lat) * Math.PI/180;
  const \u0394\u03bb = (p2.lng-p1.lng) * Math.PI/180;

  const a = Math.sin(\u0394\u03c6/2) * Math.sin(\u0394\u03c6/2) +
            Math.cos(\u03c61) * Math.cos(\u03c62) *
            Math.sin(\u0394\u03bb/2) * Math.sin(\u0394\u03bb/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
}

function calculateHeading(p1, p2) {
  const lat1 = p1.lat * Math.PI / 180;
  const lat2 = p2.lat * Math.PI / 180;
  const dLon = (p2.lng - p1.lng) * Math.PI / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let brng = Math.atan2(y, x);
  brng = brng * 180 / Math.PI;
  return (brng + 360) % 360;
}

export function createBusSimulation() {
  let buses = [];
  let intervalId = null;
  const subscribers = new Set();
  
  // Initialize state
  buses = INITIAL_BUSES.map(config => {
    const route = ROUTES[config.routeId];
    return {
      ...config,
      routeName: route.name,
      lat: route.path[0].lat,
      lng: route.path[0].lng,
      speed: config.baseSpeed,
      heading: 0,
      nextStop: 'Unknown',
      eta: 0,
      lastUpdated: Date.now(),
      _pathIndex: 0,
      _progress: 0,
      _direction: 1 // 1 for forward, -1 for backward
    };
  });

  const updateBuses = () => {
    const now = Date.now();
    
    buses = buses.map(bus => {
      if (bus.status === 'idle') {
        return { ...bus, speed: 0, lastUpdated: now };
      }

      const route = ROUTES[bus.routeId];
      const path = route.path;
      
      // Calculate jittery speed
      let currentSpeed = bus.baseSpeed + (Math.random() * 4 - 2); // \u00b12 km/h
      currentSpeed = Math.max(10, Math.min(60, currentSpeed));
      
      // Calculate movement (very simplified conversion of km/h to lat/lng degrees per 100ms)
      // 36 km/h = 10 m/s = 1 m / 100ms
      // 1 degree lat is ~111km
      const metersPer100ms = (currentSpeed * 1000 / 3600) / 10;
      
      let p1 = path[bus._pathIndex];
      let p2 = path[bus._pathIndex + bus._direction];
      
      if (!p2) {
        // Reverse direction
        bus._direction *= -1;
        bus._progress = 0;
        p2 = path[bus._pathIndex + bus._direction];
      }
      
      const distToNext = calculateDistance(p1, p2);
      
      // Move bus
      bus._progress += metersPer100ms;
      
      if (bus._progress >= distToNext) {
        bus._progress -= distToNext;
        bus._pathIndex += bus._direction;
        
        p1 = path[bus._pathIndex];
        p2 = path[bus._pathIndex + bus._direction];
        
        if (!p2) {
          bus._direction *= -1;
          bus._progress = 0;
          p2 = path[bus._pathIndex + bus._direction];
        }
      }
      
      const ratio = bus._progress / calculateDistance(p1, p2);
      
      const newLat = p1.lat + (p2.lat - p1.lat) * ratio;
      const newLng = p1.lng + (p2.lng - p1.lng) * ratio;
      
      const heading = calculateHeading({lat: bus.lat, lng: bus.lng}, {lat: newLat, lng: newLng});
      
      return {
        ...bus,
        lat: newLat,
        lng: newLng,
        speed: currentSpeed,
        heading: heading,
        eta: Math.max(0, Math.round(((calculateDistance({lat: newLat, lng: newLng}, p2)) / (currentSpeed * 1000 / 60)))),
        lastUpdated: now
      };
    });

    subscribers.forEach(cb => cb([...buses]));
  };

  return {
    getBuses: () => [...buses],
    subscribe: (callback) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    start: () => {
      if (!intervalId) {
        intervalId = setInterval(updateBuses, 100);
      }
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  };
}

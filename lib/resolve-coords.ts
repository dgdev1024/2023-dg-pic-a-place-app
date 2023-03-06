/**
 * @file lib / resolve-coords.ts
 */

const Endpoint = `https://nominatim.openstreetmap.org/reverse?format=json&zoom=10`;

export type ResolveCoordsReturn = {
  error?: string;
  status?: number;
  place?: {
    id: string;
    location: string;
    license: string;
  }
};

export const resolveCoords = async (latitude: number, longitude: number) => {
  const res = await fetch(`${Endpoint}&lat=${latitude}&lon=${longitude}`);
  if (res.ok === false) {
    return {
      status: res.status,
      error: `While resolving coordinates: ${res.status} - ${res.statusText}`
    };
  }

  const data = await res.json();
  
  return {
    place: {
      id: `${data.place_id}`,
      location: data.display_name,
      license: data.licence
    }
  };
};

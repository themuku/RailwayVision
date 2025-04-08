// types.ts
export type PointLabel = "A" | "B";

export interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
}

export interface RouteFormValues {
  pointA: string;
  pointB: string;
  includeBridges: boolean;
  includeTunnels: boolean;
  avoidObstacles: boolean;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface PathPoint {
  name: string;
  distance: number;
  coordinate: Coordinate;
}

export interface RouteData {
  route: Coordinate[];
  path: PathPoint[];
  approximateDuration: string;
  distance: number;
}

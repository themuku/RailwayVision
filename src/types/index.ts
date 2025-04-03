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

export type PointLabel = "A" | "B";

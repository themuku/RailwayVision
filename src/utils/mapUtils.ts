import { transform } from "ol/proj";
import { Style, Icon, Text, Fill, Stroke } from "ol/style";
import { FeatureLike } from "ol/Feature";
import { PointLabel, RoutePoint } from "../types";

export const DEFAULT_CENTER = [47.5769, 40.2922];
export const DEFAULT_ZOOM = 7;
export const OSM_TILE_URL =
  "https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";

export const convertCoordinates = (coordinate: number[]): [number, number] => {
  const [lng, lat] = transform(coordinate, "EPSG:3857", "EPSG:4326");
  return [lng, lat];
};

export const createPointFromMapClick = (
  coordinate: number[],
  pointLabel: PointLabel,
): RoutePoint => {
  const [lng, lat] = convertCoordinates(coordinate);

  return {
    lat,
    lng,
    label: pointLabel,
  };
};

export const createMarkerStyle = (feature: FeatureLike): Style => {
  const label = feature.get("label") as PointLabel;
  const isPointA = label === "A";

  const markerSvg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2 C10.477 2 6 6.477 6 12 C6 19 16 30 16 30 C16 30 26 19 26 12 C26 6.477 21.523 2 16 2 z" 
            fill="${isPointA ? "#228be6" : "#40c057"}" 
            stroke="white" 
            stroke-width="2"/>
      <circle cx="16" cy="12" r="5" fill="white"/>
    </svg>
  `;

  return new Style({
    image: new Icon({
      anchor: [0.5, 1],
      anchorXUnits: "fraction",
      anchorYUnits: "fraction",
      src: `data:image/svg+xml;utf8,${encodeURIComponent(markerSvg)}`,
      scale: 1,
    }),
    text: new Text({
      text: `Point ${label}`,
      offsetY: 20,
      fill: new Fill({ color: "#fff" }),
      stroke: new Stroke({ color: "#000", width: 2 }),
    }),
  });
};

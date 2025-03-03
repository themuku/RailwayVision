import { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat, transform } from "ol/proj";
import { Style, Icon, Text, Fill, Stroke } from "ol/style";
import { MapBrowserEvent } from "ol";

interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
}

interface MapViewProps {
  selectedPoint: "A" | "B" | null;
  onPointSet: (point: RoutePoint) => void;
}

export function MapView({ selectedPoint, onPointSet }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const vectorSource = useRef(new VectorSource());
  const vectorLayer = useRef(
    new VectorLayer({
      source: vectorSource.current,
      style: (feature) => {
        const label = feature.get("label");
        const isPointA = label === "A";

        return new Style({
          image: new Icon({
            anchor: [0.5, 1],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
            src: `data:image/svg+xml;utf8,${encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2 C10.477 2 6 6.477 6 12 C6 19 16 30 16 30 C16 30 26 19 26 12 C26 6.477 21.523 2 16 2 z" 
                      fill="${isPointA ? "#228be6" : "#40c057"}" 
                      stroke="white" 
                      stroke-width="2"/>
                <circle cx="16" cy="12" r="5" fill="white"/>
              </svg>
            `)}`,
            scale: 1,
          }),
          text: new Text({
            text: `Point ${label}`,
            offsetY: 20,
            fill: new Fill({ color: "#fff" }),
            stroke: new Stroke({ color: "#000", width: 2 }),
          }),
        });
      },
    })
  );

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map centered on Azerbaijan
    map.current = new Map({
      target: mapContainer.current,
      layers: [
        // Base map layer
        new TileLayer({
          source: new OSM({
            url: "https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
          }),
        }),
        vectorLayer.current, // Vector layer for markers
      ],
      view: new View({
        center: fromLonLat([47.5769, 40.2922]), // Azerbaijan coordinates
        zoom: 7,
      }),
    });

    // Handle map clicks
    const handleMapClick = (event: MapBrowserEvent<UIEvent>) => {
      if (!selectedPoint) return;

      const coordinate = transform(event.coordinate, "EPSG:3857", "EPSG:4326");
      const [lng, lat] = coordinate;

      // Remove existing marker if it exists
      const existingFeatures = vectorSource.current
        .getFeatures()
        .filter((f) => f.get("label") === selectedPoint);

      existingFeatures.forEach((f) => vectorSource.current.removeFeature(f));

      // Add new marker
      const feature = new Feature({
        geometry: new Point(fromLonLat([lng, lat])),
        label: selectedPoint,
      });

      vectorSource.current.addFeature(feature);

      onPointSet({
        lat,
        lng,
        label: selectedPoint,
      });
    };

    map.current.on("click", handleMapClick);

    return () => {
      if (map.current) {
        map.current.setTarget(undefined);
        map.current = null;
      }
    };
  }, [selectedPoint, onPointSet]);

  return (
    <div
      ref={mapContainer}
      style={{
        flex: 1,
        height: "100%",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    />
  );
}

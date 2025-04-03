import { useEffect, useRef, useCallback } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import { MapBrowserEvent } from "ol";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import {
  createMarkerStyle,
  createPointFromMapClick,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  OSM_TILE_URL,
} from "../utils/mapUtils";
import { PointLabel, RoutePoint } from "../types";
import { MapContainerStyles } from "../styles";

interface MapViewProps {
  selectedPoint: PointLabel | null;
  onPointSet: (point: RoutePoint) => void;
}

export function MapView({ selectedPoint, onPointSet }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const vectorSource = useRef(new VectorSource());

  const vectorLayer = useRef(
    new VectorLayer({
      source: vectorSource.current,
      style: function (feature) {
        return createMarkerStyle(feature);
      },
    }),
  );

  const handleMapClick = useCallback(
    (event: MapBrowserEvent<UIEvent>) => {
      if (!selectedPoint) return;

      const existingFeatures = vectorSource.current
        .getFeatures()
        .filter((f) => f.get("label") === selectedPoint);

      existingFeatures.forEach((f) => vectorSource.current.removeFeature(f));

      const point = createPointFromMapClick(event.coordinate, selectedPoint);

      const feature = new Feature({
        geometry: new Point(fromLonLat([point.lng, point.lat])),
        label: selectedPoint,
      });

      vectorSource.current.addFeature(feature);
      onPointSet(point);
    },
    [selectedPoint, onPointSet],
  );

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new Map({
      target: mapContainer.current,
      layers: [
        new TileLayer({
          source: new OSM({
            url: OSM_TILE_URL,
          }),
        }),
        vectorLayer.current,
      ],
      view: new View({
        center: fromLonLat(DEFAULT_CENTER),
        zoom: DEFAULT_ZOOM,
      }),
    });

    map.current.on("click", handleMapClick);

    return () => {
      if (map.current) {
        map.current.setTarget(undefined);
        map.current = null;
      }
    };
  }, [handleMapClick]);

  return <div ref={mapContainer} style={MapContainerStyles} />;
}

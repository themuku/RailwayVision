import { useEffect, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { Point, LineString } from "ol/geom";
import { Style, Fill, Stroke, Circle, Text } from "ol/style";
import {
  Coordinate,
  PathPoint,
  PointLabel,
  RouteData,
  RoutePoint,
} from "../types";
import { useComputedColorScheme } from "@mantine/core";

interface MapViewProps {
  selectedPoint: PointLabel | null;
  onPointSet: (point: RoutePoint) => void;
  points: Record<PointLabel, RoutePoint | undefined>;
  routeData: RouteData | null;
}

export function MapView({
  selectedPoint,
  onPointSet,
  points,
  routeData,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const pointsLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const routeLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const stationsLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const computedColorScheme = useComputedColorScheme("light");
  useEffect(() => {
    if (!mapRef.current) return;

    const tileSource = new OSM();

    const pointsSource = new VectorSource();
    const pointsLayer = new VectorLayer({
      source: pointsSource,
      style: (feature) => {
        const pointType = feature.get("pointType") as PointLabel;
        return new Style({
          image: new Circle({
            radius: 8,
            fill: new Fill({ color: pointType === "A" ? "green" : "red" }),
            stroke: new Stroke({ color: "white", width: 2 }),
          }),
          text: new Text({
            text: feature.get("label") || "",
            offsetY: -15,
            fill: new Fill({ color: "#333" }),
            stroke: new Stroke({ color: "white", width: 2 }),
          }),
        });
      },
    });
    pointsLayerRef.current = pointsLayer;

    const routeSource = new VectorSource();
    const routeLayer = new VectorLayer({
      source: routeSource,
      style: new Style({
        stroke: new Stroke({
          color: "#3388ff",
          width: 4,
        }),
      }),
    });
    routeLayerRef.current = routeLayer;

    const stationsSource = new VectorSource();
    const stationsLayer = new VectorLayer({
      source: stationsSource,
      style: (feature) => {
        return new Style({
          image: new Circle({
            radius: 6,
            fill: new Fill({ color: "#ff8800" }),
            stroke: new Stroke({ color: "white", width: 1 }),
          }),
          text: new Text({
            text: feature.get("name") || "",
            offsetY: -12,
            fill: new Fill({ color: "#333" }),
            stroke: new Stroke({ color: "white", width: 2 }),
            font: "12px sans-serif",
          }),
        });
      },
    });
    stationsLayerRef.current = stationsLayer;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: tileSource,
        }),
        routeLayer,
        stationsLayer,
        pointsLayer,
      ],
      view: new View({
        center: fromLonLat([49.8328009, 40.3755885]), // Center on Baku initially
        zoom: 7,
      }),
      controls: [],
    });

    map.on("click", (event) => {
      if (!selectedPoint) return;

      const coordinate = map.getCoordinateFromPixel(event.pixel);
      const lonLat = toLonLat(coordinate);

      onPointSet({
        lng: lonLat[0],
        lat: lonLat[1],
        label: selectedPoint === "A" ? "Start" : "Destination",
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.dispose();
    };
  }, [computedColorScheme, onPointSet, selectedPoint]);

  useEffect(() => {
    if (!pointsLayerRef.current) return;

    const source = pointsLayerRef.current.getSource();
    if (!source) return;

    source.clear();

    Object.entries(points).forEach(([key, point]) => {
      if (!point) return;

      const feature = new Feature({
        geometry: new Point(fromLonLat([point.lng, point.lat])),
        pointType: key,
        label: point.label,
      });

      source.addFeature(feature);
    });

    const pointsArray = Object.values(points).filter(Boolean);
    if (pointsArray.length === 2 && mapInstanceRef.current) {
      try {
        const bounds = {
          minLat: Math.min(...pointsArray.map((p) => p!.lat)),
          maxLat: Math.max(...pointsArray.map((p) => p!.lat)),
          minLng: Math.min(...pointsArray.map((p) => p!.lng)),
          maxLng: Math.max(...pointsArray.map((p) => p!.lng)),
        };

        const padding = 0.05; // ~5% padding
        bounds.minLat -= padding;
        bounds.maxLat += padding;
        bounds.minLng -= padding;
        bounds.maxLng += padding;

        const extent = [
          ...fromLonLat([bounds.minLng, bounds.minLat]),
          ...fromLonLat([bounds.maxLng, bounds.maxLat]),
        ];

        mapInstanceRef.current.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          maxZoom: 12,
        });
      } catch (error) {
        console.error("Error fitting view to points:", error);
      }
    }
  }, [points]);

  useEffect(() => {
    if (!routeLayerRef.current || !stationsLayerRef.current || !routeData)
      return;

    const routeSource = routeLayerRef.current.getSource();
    const stationsSource = stationsLayerRef.current.getSource();

    if (!routeSource || !stationsSource) return;

    routeSource.clear();
    stationsSource.clear();

    console.log("Route data:", routeData);

    if (routeData.route && routeData.route.length > 0) {
      const routeCoordinates = routeData.route.map((point: Coordinate) =>
        fromLonLat([point.longitude, point.latitude]),
      );

      const routeFeature = new Feature({
        geometry: new LineString(routeCoordinates),
      });

      routeSource.addFeature(routeFeature);
    }

    if (routeData.path && routeData.path.length > 0) {
      routeData.path.forEach((station: PathPoint) => {
        const stationFeature = new Feature({
          geometry: new Point(
            fromLonLat([
              station.coordinate.longitude,
              station.coordinate.latitude,
            ]),
          ),
          name: station.name.split("_")[0], // Extract only the station name
        });

        stationsSource.addFeature(stationFeature);
      });
    }

    if (
      mapInstanceRef.current &&
      routeData.route &&
      routeData.route.length > 0
    ) {
      try {
        const bounds = {
          minLat: Infinity,
          maxLat: -Infinity,
          minLng: Infinity,
          maxLng: -Infinity,
        };

        routeData.route.forEach((point: Coordinate) => {
          bounds.minLat = Math.min(bounds.minLat, point.latitude);
          bounds.maxLat = Math.max(bounds.maxLat, point.latitude);
          bounds.minLng = Math.min(bounds.minLng, point.longitude);
          bounds.maxLng = Math.max(bounds.maxLng, point.longitude);
        });

        const padding = 0.05; // ~5% padding
        bounds.minLat -= padding;
        bounds.maxLat += padding;
        bounds.minLng -= padding;
        bounds.maxLng += padding;

        console.log("Calculated bounds:", bounds);

        if (
          isFinite(bounds.minLat) &&
          isFinite(bounds.maxLat) &&
          isFinite(bounds.minLng) &&
          isFinite(bounds.maxLng)
        ) {
          const sw = fromLonLat([bounds.minLng, bounds.minLat]);
          const ne = fromLonLat([bounds.maxLng, bounds.maxLat]);
          const extent = [...sw, ...ne];

          console.log("Fitting to extent:", extent);

          mapInstanceRef.current.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            maxZoom: 10,
          });
        } else {
          const firstPoint = routeData.route[0];
          mapInstanceRef.current
            .getView()
            .setCenter(fromLonLat([firstPoint.longitude, firstPoint.latitude]));
          mapInstanceRef.current.getView().setZoom(7);
        }
      } catch (error) {
        console.error("Error calculating route bounds:", error);
        mapInstanceRef.current
          .getView()
          .setCenter(fromLonLat([49.8328009, 40.3755885]));
        mapInstanceRef.current.getView().setZoom(7);
      }
    }
  }, [routeData]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%" }} // Add explicit dimensions
    />
  );
}

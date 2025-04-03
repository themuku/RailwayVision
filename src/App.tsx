import { useState, useCallback } from "react";
import { Container, Flex } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ControlPanel } from "./components/ControlPanel";
import { MapView } from "./components/MapView";
import { StationService } from "./services/stationService";
import { PointLabel, RouteFormValues, RoutePoint } from "./types";
import { AppContainerStyles, FlexContentStyles } from "./styles";
import "ol/ol.css";
import "./map-styles.css";

function App() {
  const [selectedPoint, setSelectedPoint] = useState<PointLabel | null>(null);
  const [points, setPoints] = useState<
    Record<PointLabel, RoutePoint | undefined>
  >({
    A: undefined,
    B: undefined,
  });

  const form = useForm<RouteFormValues>({
    initialValues: {
      pointA: "",
      pointB: "",
      includeBridges: true,
      includeTunnels: true,
      avoidObstacles: true,
    },
  });

  const boundSearchStations = useCallback(
    (query: string) => StationService.searchStations(query),
    [],
  );

  const handlePointSelect = useCallback(
    (point: PointLabel) => {
      setSelectedPoint(selectedPoint === point ? null : point);
    },
    [selectedPoint],
  );

  const handlePointSet = useCallback(
    (point: RoutePoint) => {
      setPoints((prev) => ({ ...prev, [point.label]: point }));
      setSelectedPoint(null);

      const coordinateString = `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`;
      form.setFieldValue(`point${point.label}`, coordinateString);
    },
    [form],
  );

  const hasCompleteRoute = Boolean(points.A && points.B);

  return (
    <Container fluid p="md" h="100vh" style={AppContainerStyles}>
      <Flex gap="md" style={FlexContentStyles}>
        <ControlPanel
          searchStations={boundSearchStations}
          form={form}
          selectedPoint={selectedPoint}
          onPointSelect={handlePointSelect}
          hasRoute={hasCompleteRoute}
        />
        <MapView selectedPoint={selectedPoint} onPointSet={handlePointSet} />
      </Flex>
    </Container>
  );
}

export default App;

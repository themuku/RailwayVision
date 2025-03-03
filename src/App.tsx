import { useState } from "react";
import { Container, Flex } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ControlPanel } from "./components/ControlPanel";
import { MapView } from "./components/MapView";
import "ol/ol.css";
import "./map-styles.css";

interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
}

function App() {
  const [selectedPoint, setSelectedPoint] = useState<"A" | "B" | null>(null);
  const [points, setPoints] = useState<{ A?: RoutePoint; B?: RoutePoint }>({});

  const form = useForm({
    initialValues: {
      pointA: "",
      pointB: "",
      includeBridges: true,
      includeTunnels: true,
      avoidObstacles: true,
    },
  });

  const handlePointSelect = (point: "A" | "B") => {
    setSelectedPoint(selectedPoint === point ? null : point);
  };

  const handlePointSet = (point: RoutePoint) => {
    setPoints((prev) => ({ ...prev, [point.label]: point }));
    setSelectedPoint(null);
    form.setFieldValue(
      `point${point.label}`,
      `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`
    );
  };

  return (
    <Container
      fluid
      p="md"
      h="100vh"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Flex
        gap="md"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <ControlPanel
          form={form}
          selectedPoint={selectedPoint}
          onPointSelect={handlePointSelect}
          hasRoute={!!points.A && !!points.B}
        />
        <MapView selectedPoint={selectedPoint} onPointSet={handlePointSet} />
      </Flex>
    </Container>
  );
}

export default App;

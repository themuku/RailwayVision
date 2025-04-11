import { Paper, Stack, Button, Title, Text, Autocomplete } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useState, useEffect, CSSProperties, ReactNode } from "react";

interface RouteFormValues {
  pointA: string;
  pointB: string;
  includeBridges: boolean;
  includeTunnels: boolean;
  avoidObstacles: boolean;
}

interface ControlPanelProps {
  form: UseFormReturnType<RouteFormValues>;
  selectedPoint: "A" | "B" | null;
  onPointSelect: (point: "A" | "B") => void;
  hasRoute: boolean;
  searchStations: (query: string) => Promise<string[]>;
  onCitySelect: (cityName: string, pointLabel: "A" | "B") => void;
  onCalculate: () => void;
}

const CONTAINER_STYLE: CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const CONTENT_STYLE: CSSProperties = {
  flex: 1,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const FORM_STYLE: CSSProperties = {
  flex: 1,
  overflow: "auto",
  paddingRight: "8px",
  marginBottom: "16px",
};

const CALCULATE_BUTTON_STYLE: CSSProperties = {
  marginTop: "auto",
};

export function ControlPanel({
  form,
  selectedPoint,
  onPointSelect,
  hasRoute,
  searchStations,
  onCitySelect,
  onCalculate,
}: ControlPanelProps): ReactNode {
  // Using separate state variables to track input values
  const [pointAValue, setPointAValue] = useState(form.values.pointA || "");
  const [pointBValue, setPointBValue] = useState(form.values.pointB || "");

  // Station options state
  const [pointAOptions, setPointAOptions] = useState<string[]>([]);
  const [pointBOptions, setPointBOptions] = useState<string[]>([]);

  // Search for stations when input changes
  const searchForStations = async (query: string, point: "A" | "B") => {
    if (query.length >= 2) {
      try {
        const results = await searchStations(query);
        const uniqueResults = [...new Set(results)];
        if (point === "A") {
          setPointAOptions(uniqueResults);
        } else {
          setPointBOptions(uniqueResults);
        }
      } catch (error) {
        console.error(`Error searching stations for point ${point}:`, error);
        if (point === "A") {
          setPointAOptions([]);
        } else {
          setPointBOptions([]);
        }
      }
    } else {
      if (point === "A") {
        setPointAOptions([]);
      } else {
        setPointBOptions([]);
      }
    }
  };

  // Update form values when input changes
  useEffect(() => {
    if (form.values.pointA !== pointAValue && pointAValue) {
      form.setFieldValue("pointA", pointAValue);
    }
  }, [pointAValue, form]);

  useEffect(() => {
    if (form.values.pointB !== pointBValue && pointBValue) {
      form.setFieldValue("pointB", pointBValue);
    }
  }, [pointBValue, form]);

  // Update input values when form changes (for external updates)
  useEffect(() => {
    if (form.values.pointA && form.values.pointA !== pointAValue) {
      setPointAValue(form.values.pointA);
    }
  }, [form.values.pointA, pointAValue]);

  useEffect(() => {
    if (form.values.pointB && form.values.pointB !== pointBValue) {
      setPointBValue(form.values.pointB);
    }
  }, [form.values.pointB, pointBValue]);

  // Handle city selection
  const handleCitySelect = (value: string, point: "A" | "B") => {
    if (point === "A") {
      setPointAValue(value);
      form.setFieldValue("pointA", value);
    } else {
      setPointBValue(value);
      form.setFieldValue("pointB", value);
    }
    onCitySelect(value, point);
  };

  return (
    <Paper shadow="sm" p="md" withBorder style={CONTAINER_STYLE}>
      <Title order={4} mb="md">
        ADY Railways Route Planner
      </Title>
      <div style={CONTENT_STYLE}>
        <form style={FORM_STYLE}>
          <Stack>
            {/* Point A */}
            <div>
              <Autocomplete
                label="Point A"
                placeholder="Type to search or click 'Set Point A' then click on map"
                data={pointAOptions}
                value={pointAValue}
                onChange={(value) => {
                  setPointAValue(value);
                  searchForStations(value, "A");
                }}
                onOptionSubmit={(option) => {
                  // This gets called when an option is selected from the dropdown
                  handleCitySelect(option, "A");
                }}
              />
              <Button
                variant={selectedPoint === "A" ? "light" : "outline"}
                color={selectedPoint === "A" ? "red" : "blue"}
                onClick={() => onPointSelect("A")}
                fullWidth
                mt="xs"
              >
                {selectedPoint === "A"
                  ? "Cancel Point A Selection"
                  : "Set Point A on Map"}
              </Button>
            </div>

            {/* Point B */}
            <div>
              <Autocomplete
                label="Point B"
                placeholder="Type to search or click 'Set Point B' then click on map"
                data={pointBOptions}
                value={pointBValue}
                onChange={(value) => {
                  setPointBValue(value);
                  searchForStations(value, "B");
                }}
                onOptionSubmit={(option) => {
                  // This gets called when an option is selected from the dropdown
                  handleCitySelect(option, "B");
                }}
              />
              <Button
                variant={selectedPoint === "B" ? "light" : "outline"}
                color={selectedPoint === "B" ? "red" : "blue"}
                onClick={() => onPointSelect("B")}
                fullWidth
                mt="xs"
              >
                {selectedPoint === "B"
                  ? "Cancel Point B Selection"
                  : "Set Point B on Map"}
              </Button>
            </div>
          </Stack>
        </form>
        <Button
          color="blue"
          fullWidth
          onClick={onCalculate}
          disabled={!form.values.pointA || !form.values.pointB}
          style={CALCULATE_BUTTON_STYLE}
        >
          Calculate Route
        </Button>
        {hasRoute && (
          <Text size="sm" mt="sm" c="green">
            Route calculated successfully!
          </Text>
        )}
      </div>
    </Paper>
  );
}

import {
  Paper,
  Stack,
  Switch,
  Button,
  Title,
  Text,
  Autocomplete,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import {
  useState,
  useEffect,
  KeyboardEvent,
  CSSProperties,
  ReactNode,
} from "react";
import { useDebouncedValue } from "@mantine/hooks";

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
}

type RoutePoint = "A" | "B";

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

interface StationSearchResult {
  stationOptions: string[];
  searchValue: string;
  setSearchValue: (value: string) => void;
}

function useStationSearch(
  searchStations: (query: string) => Promise<string[]>,
): StationSearchResult {
  const [stationOptions, setStationOptions] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);

  useEffect(() => {
    const performSearch = async (): Promise<void> => {
      if (debouncedSearch.length >= 2) {
        try {
          const results = await searchStations(debouncedSearch);
          setStationOptions(results);
        } catch (error) {
          console.error("Error searching stations:", error);
          setStationOptions([]);
        }
      } else if (debouncedSearch.length === 0) {
        setStationOptions([]);
      }
    };
    performSearch();
  }, [debouncedSearch, searchStations]);

  return { stationOptions, searchValue, setSearchValue };
}

interface RoutePointSelectorProps {
  point: RoutePoint;
  form: UseFormReturnType<RouteFormValues>;
  selectedPoint: RoutePoint | null;
  onPointSelect: (point: RoutePoint) => void;
  stationOptions: string[];
  searchValue: string;
  setSearchValue: (value: string) => void;
}

function RoutePointSelector({
  point,
  form,
  selectedPoint,
  onPointSelect,
  stationOptions,
  searchValue,
  setSearchValue,
}: RoutePointSelectorProps): ReactNode {
  return (
    <>
      <Autocomplete
        label={`Point ${point}`}
        placeholder={`Type to search or click 'Set Point ${point}' then click on map`}
        data={stationOptions}
        value={searchValue}
        onChange={(value: string) => {
          setSearchValue(value);
          if (stationOptions.includes(value)) {
            form.setFieldValue(`point${point}`, value);
          }
        }}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        variant="filled"
        mt={point === "B" ? "sm" : undefined}
      />
      <Button
        variant={selectedPoint === point ? "light" : "outline"}
        color={selectedPoint === point ? "red" : "blue"}
        onClick={() => onPointSelect(point)}
        fullWidth
      >
        {selectedPoint === point
          ? `Cancel Point ${point}`
          : `Set Point ${point}`}
      </Button>
    </>
  );
}

export function ControlPanel({
  form,
  selectedPoint,
  onPointSelect,
  hasRoute,
  searchStations,
}: ControlPanelProps): ReactNode {
  const pointASearch = useStationSearch(searchStations);
  const pointBSearch = useStationSearch(searchStations);

  return (
    <Paper shadow="md" p="md" w={350} radius="md" style={CONTAINER_STYLE}>
      <div style={CONTENT_STYLE}>
        <form style={FORM_STYLE} onSubmit={(e) => e.preventDefault()}>
          <Stack gap="lg">
            <Title order={3} c="indigo.7">
              Route Settings
            </Title>

            <Stack gap="xs">
              <Title order={5} c="gray.7">
                Route Points
              </Title>

              <RoutePointSelector
                point="A"
                form={form}
                selectedPoint={selectedPoint}
                onPointSelect={onPointSelect}
                stationOptions={pointASearch.stationOptions}
                searchValue={pointASearch.searchValue}
                setSearchValue={pointASearch.setSearchValue}
              />

              <RoutePointSelector
                point="B"
                form={form}
                selectedPoint={selectedPoint}
                onPointSelect={onPointSelect}
                stationOptions={pointBSearch.stationOptions}
                searchValue={pointBSearch.searchValue}
                setSearchValue={pointBSearch.setSearchValue}
              />
            </Stack>

            <Stack gap="xs">
              <Title order={5} c="gray.7">
                Route Options
              </Title>
              <Text size="sm" c="dimmed">
                Select which infrastructure to include in the route calculation
              </Text>
              <Switch
                label="Include Bridges"
                description="Allow route to use railway bridges"
                {...form.getInputProps("includeBridges", { type: "checkbox" })}
                size="md"
              />
              <Switch
                label="Include Tunnels"
                description="Allow route to use railway tunnels"
                {...form.getInputProps("includeTunnels", { type: "checkbox" })}
                size="md"
              />
              <Switch
                label="Avoid Obstacles"
                description="Route around known obstacles"
                {...form.getInputProps("avoidObstacles", { type: "checkbox" })}
                size="md"
              />
            </Stack>
          </Stack>
        </form>

        <Button
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
          disabled={!hasRoute}
          size="lg"
          style={CALCULATE_BUTTON_STYLE}
        >
          Calculate Route
        </Button>
      </div>
    </Paper>
  );
}

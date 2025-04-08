import {
  Paper,
  Stack,
  // Switch,
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
  onCitySelect: (cityName: string, pointLabel: "A" | "B") => void;
  onCalculate: () => void;
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

// ... (keep existing styles) ...

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
          // Remove duplicates before setting state
          const uniqueResults = [...new Set(results)];
          setStationOptions(uniqueResults);
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
  onCitySelect: (cityName: string, pointLabel: RoutePoint) => void;
}

function RoutePointSelector({
  point,
  form,
  selectedPoint,
  onPointSelect,
  stationOptions,
  searchValue,
  setSearchValue,
  onCitySelect,
}: RoutePointSelectorProps): ReactNode {
  const [, setDropdownOpen] = useState(false);

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
            onCitySelect(value, point);
          }
        }}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        variant="filled"
        mt={point === "B" ? "sm" : undefined}
        onBlur={() => {
          setDropdownOpen(false);
        }}
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
  onCitySelect,
  onCalculate,
}: ControlPanelProps): ReactNode {
  const pointASearch = useStationSearch(searchStations);
  const pointBSearch = useStationSearch(searchStations);

  return (
    <Paper shadow="md" p="md" w={350} radius="md" style={CONTAINER_STYLE}>
      <div style={CONTENT_STYLE}>
        <form style={FORM_STYLE}>
          <Title order={4} mb="md">
            Route Calculator
          </Title>
          <Text size="sm" mb="md" c="dimmed">
            Set points by searching for cities or by clicking on the map
          </Text>

          <Stack>
            <RoutePointSelector
              point="A"
              form={form}
              selectedPoint={selectedPoint}
              onPointSelect={onPointSelect}
              stationOptions={pointASearch.stationOptions}
              searchValue={pointASearch.searchValue}
              setSearchValue={pointASearch.setSearchValue}
              onCitySelect={onCitySelect}
            />

            <RoutePointSelector
              point="B"
              form={form}
              selectedPoint={selectedPoint}
              onPointSelect={onPointSelect}
              stationOptions={pointBSearch.stationOptions}
              searchValue={pointBSearch.searchValue}
              setSearchValue={pointBSearch.setSearchValue}
              onCitySelect={onCitySelect}
            />

            {/*<Switch*/}
            {/*  label="Include bridges"*/}
            {/*  checked={form.values.includeBridges}*/}
            {/*  onChange={(event) =>*/}
            {/*    form.setFieldValue(*/}
            {/*      "includeBridges",*/}
            {/*      event.currentTarget.checked,*/}
            {/*    )*/}
            {/*  }*/}
            {/*  mt="md"*/}
            {/*/>*/}

            {/*<Switch*/}
            {/*  label="Include tunnels"*/}
            {/*  checked={form.values.includeTunnels}*/}
            {/*  onChange={(event) =>*/}
            {/*    form.setFieldValue(*/}
            {/*      "includeTunnels",*/}
            {/*      event.currentTarget.checked,*/}
            {/*    )*/}
            {/*  }*/}
            {/*/>*/}

            {/*<Switch*/}
            {/*  label="Avoid obstacles"*/}
            {/*  checked={form.values.avoidObstacles}*/}
            {/*  onChange={(event) =>*/}
            {/*    form.setFieldValue(*/}
            {/*      "avoidObstacles",*/}
            {/*      event.currentTarget.checked,*/}
            {/*    )*/}
            {/*  }*/}
            {/*/>*/}
          </Stack>
        </form>

        <Button
          fullWidth
          color="green"
          disabled={!hasRoute}
          onClick={onCalculate}
          style={CALCULATE_BUTTON_STYLE}
        >
          Calculate Route
        </Button>
      </div>
    </Paper>
  );
}

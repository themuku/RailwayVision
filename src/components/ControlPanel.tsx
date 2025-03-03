import {
  Paper,
  Stack,
  TextInput,
  Switch,
  Button,
  Title,
  Text,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";

interface ControlPanelProps {
  form: UseFormReturnType<{
    pointA: string;
    pointB: string;
    includeBridges: boolean;
    includeTunnels: boolean;
    avoidObstacles: boolean;
  }>;
  selectedPoint: "A" | "B" | null;
  onPointSelect: (point: "A" | "B") => void;
  hasRoute: boolean;
}

export function ControlPanel({
  form,
  selectedPoint,
  onPointSelect,
  hasRoute,
}: ControlPanelProps) {
  return (
    <Paper
      shadow="md"
      p="md"
      w={350}
      radius="md"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <form
          style={{
            flex: 1,
            overflow: "auto",
            paddingRight: "8px",
            marginBottom: "16px",
          }}
        >
          <Stack gap="lg">
            <Title order={3} c="indigo.7">
              Route Settings
            </Title>

            <Stack gap="xs">
              <Title order={5} c="gray.7">
                Route Points
              </Title>
              <TextInput
                label="Point A"
                placeholder="Click 'Set Point A' then click on map"
                {...form.getInputProps("pointA")}
                readOnly
                variant="filled"
              />
              <Button
                variant={selectedPoint === "A" ? "light" : "outline"}
                color={selectedPoint === "A" ? "red" : "blue"}
                onClick={() => onPointSelect("A")}
                fullWidth
              >
                {selectedPoint === "A" ? "Cancel Point A" : "Set Point A"}
              </Button>

              <TextInput
                label="Point B"
                placeholder="Click 'Set Point B' then click on map"
                {...form.getInputProps("pointB")}
                readOnly
                variant="filled"
                mt="sm"
              />
              <Button
                variant={selectedPoint === "B" ? "light" : "outline"}
                color={selectedPoint === "B" ? "red" : "blue"}
                onClick={() => onPointSelect("B")}
                fullWidth
              >
                {selectedPoint === "B" ? "Cancel Point B" : "Set Point B"}
              </Button>
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
          style={{
            marginTop: "auto",
          }}
        >
          Calculate Route
        </Button>
      </div>
    </Paper>
  );
}

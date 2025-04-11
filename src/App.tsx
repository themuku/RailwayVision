import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "@mantine/form";
import {
  Box,
  Button,
  Flex,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { MapView } from "./components/MapView";
import {
  PopulationCenter,
  PopulationCenterService,
} from "./services/stationService";
import { PointLabel, RouteData, RouteFormValues, RoutePoint } from "./types";
import { AppContainerStyles } from "./styles";
import { ThemeToggle } from "./components/ThemeToggle.tsx";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/LanguageSwitcher.tsx";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function App() {
  const { t } = useTranslation();
  const form = useForm<RouteFormValues>({
    initialValues: {
      pointA: "",
      pointB: "",
      includeBridges: true,
      includeTunnels: true,
      avoidObstacles: false,
    },
  });

  const [searchResults, setSearchResults] = useState<{
    A: PopulationCenter[];
    B: PopulationCenter[];
  }>({ A: [], B: [] });

  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState<{
    A: boolean;
    B: boolean;
  }>({ A: false, B: false });

  const [points, setPoints] = useState<
    Record<PointLabel, RoutePoint | undefined>
  >({
    A: undefined,
    B: undefined,
  });

  const [selectedPoint, setSelectedPoint] = useState<PointLabel | null>(null);

  const [routeData, setRouteData] = useState<RouteData | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedCenterIds, setSelectedCenterIds] = useState<{
    A?: string | number;
    B?: string | number;
  }>({});

  const [userClicked, setUserClicked] = useState<{
    A: boolean;
    B: boolean;
  }>({ A: false, B: false });

  const pointARef = useRef<HTMLInputElement>(null);
  const pointBRef = useRef<HTMLInputElement>(null);
  const dropdownARef = useRef<HTMLDivElement>(null);
  const dropdownBRef = useRef<HTMLDivElement>(null);

  const [cachedResults, setCachedResults] = useState<{
    A: PopulationCenter[];
    B: PopulationCenter[];
  }>({ A: [], B: [] });

  const debouncedPointA = useDebounce(form.values.pointA, 300);
  const debouncedPointB = useDebounce(form.values.pointB, 300);

  const handlePointSet = useCallback(
    (point: RoutePoint) => {
      if (!selectedPoint) return;

      setPoints((prev) => ({
        ...prev,
        [selectedPoint]: point,
      }));

      setSelectedPoint(null);
    },
    [selectedPoint],
  );

  const handleSearch = async (value: string, pointLabel: PointLabel) => {
    if (!value || value.length < 2) {
      setSearchResults((prev) => ({ ...prev, [pointLabel]: [] }));
      return;
    }

    setIsSearching((prev) => ({ ...prev, [pointLabel]: true }));
    try {
      const results = await PopulationCenterService.search(value);
      setSearchResults((prev) => ({ ...prev, [pointLabel]: results }));

      setCachedResults((prev) => ({ ...prev, [pointLabel]: results }));
    } catch (error) {
      console.error(`Error searching for ${pointLabel}:`, error);
    } finally {
      setIsSearching((prev) => ({ ...prev, [pointLabel]: false }));
    }
  };

  const handleCitySelect = (city: PopulationCenter, pointLabel: PointLabel) => {
    setUserClicked((prev) => ({
      ...prev,
      [pointLabel]: false,
    }));

    setSearchResults((prev) => ({
      ...prev,
      [pointLabel]: [],
    }));

    form.setFieldValue(`point${pointLabel}`, city.name);

    setSelectedCenterIds((prev) => ({
      ...prev,
      [pointLabel]: city.elementId,
    }));

    if (city.longitude && city.latitude) {
      setPoints((prev) => ({
        ...prev,
        [pointLabel]: {
          lng: city.longitude,
          lat: city.latitude,
          label: pointLabel === "A" ? "Start" : "Destination",
        },
      }));
    }

    if (pointLabel === "A" && pointARef.current) {
      pointARef.current.blur();
    }
    if (pointLabel === "B" && pointBRef.current) {
      pointBRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, pointLabel: PointLabel) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (searchResults[pointLabel].length === 1) {
        handleCitySelect(searchResults[pointLabel][0], pointLabel);
      }

      setSearchResults((prev) => ({
        ...prev,
        [pointLabel]: [],
      }));

      if (pointLabel === "A" && pointARef.current) {
        pointARef.current.blur();
      }
      if (pointLabel === "B" && pointBRef.current) {
        pointBRef.current.blur();
      }
    }
  };

  const findMatchingCity = (
    pointLabel: PointLabel,
  ): PopulationCenter | null => {
    const searchTerm = form.values[`point${pointLabel}`].trim().toLowerCase();
    const results = cachedResults[pointLabel];

    const exactMatch = results.find(
      (city) => city.name.toLowerCase() === searchTerm,
    );

    if (exactMatch) return exactMatch;

    const alternativeMatch = results.find((city) =>
      city.tags && "name:en" in city.tags
        ? (city.tags["name:en"] as string).toLowerCase() === searchTerm
        : false,
    );

    if (alternativeMatch) return alternativeMatch;

    const partialMatch = results.find(
      (city) =>
        city.name.toLowerCase().includes(searchTerm) ||
        searchTerm.includes(city.name.toLowerCase()),
    );

    return partialMatch || null;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const verifyAndSetCities = async (): Promise<boolean> => {
    if (!selectedCenterIds.A && form.values.pointA) {
      const matchingCityA = findMatchingCity("A");

      if (matchingCityA) {
        setSelectedCenterIds((prev) => ({
          ...prev,
          A: matchingCityA.elementId,
        }));

        if (matchingCityA.longitude && matchingCityA.latitude) {
          setPoints((prev) => ({
            ...prev,
            A: {
              lng: matchingCityA.longitude,
              lat: matchingCityA.latitude,
              label: "Start",
            },
          }));
        }
      } else {
        setIsSearching((prev) => ({ ...prev, A: true }));

        try {
          const results = await PopulationCenterService.search(
            form.values.pointA,
          );
          setCachedResults((prev) => ({ ...prev, A: results }));

          if (results.length > 0) {
            const bestMatch = results[0];
            setSelectedCenterIds((prev) => ({
              ...prev,
              A: bestMatch.elementId,
            }));

            if (bestMatch.longitude && bestMatch.latitude) {
              setPoints((prev) => ({
                ...prev,
                A: {
                  lng: bestMatch.longitude,
                  lat: bestMatch.latitude,
                  label: "Start",
                },
              }));
            }
          } else {
            return false;
          }
        } catch (error) {
          console.error("Error verifying point A:", error);
          return false;
        } finally {
          setIsSearching((prev) => ({ ...prev, A: false }));
        }
      }
    }

    if (!selectedCenterIds.B && form.values.pointB) {
      const matchingCityB = findMatchingCity("B");

      if (matchingCityB) {
        setSelectedCenterIds((prev) => ({
          ...prev,
          B: matchingCityB.elementId,
        }));

        if (matchingCityB.longitude && matchingCityB.latitude) {
          setPoints((prev) => ({
            ...prev,
            B: {
              lng: matchingCityB.longitude,
              lat: matchingCityB.latitude,
              label: "Destination",
            },
          }));
        }
      } else {
        setIsSearching((prev) => ({ ...prev, B: true }));

        try {
          const results = await PopulationCenterService.search(
            form.values.pointB,
          );
          setCachedResults((prev) => ({ ...prev, B: results }));

          if (results.length > 0) {
            const bestMatch = results[0];
            setSelectedCenterIds((prev) => ({
              ...prev,
              B: bestMatch.elementId,
            }));

            if (bestMatch.longitude && bestMatch.latitude) {
              setPoints((prev) => ({
                ...prev,
                B: {
                  lng: bestMatch.longitude,
                  lat: bestMatch.latitude,
                  label: "Destination",
                },
              }));
            }
          } else {
            return false;
          }
        } catch (error) {
          console.error("Error verifying point B:", error);
          return false;
        } finally {
          setIsSearching((prev) => ({ ...prev, B: false }));
        }
      }
    }

    return true;
  };

  const calculateRoute = useCallback(async () => {
    setErrorMessage(null);

    const verificationSuccess = await verifyAndSetCities();

    if (!verificationSuccess || !selectedCenterIds.A || !selectedCenterIds.B) {
      setErrorMessage(
        "Could not find one or both cities. Please select from the dropdown.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const routeData = await PopulationCenterService.calculateRoute(
        selectedCenterIds.A,
        selectedCenterIds.B,
        // {
        //   includeBridges: form.values.includeBridges,
        //   includeTunnels: form.values.includeTunnels,
        //   avoidObstacles: form.values.avoidObstacles,
        // },
      );

      setRouteData(routeData);
      console.log("Route calculated successfully", routeData);
    } catch (error) {
      console.error("Error calculating route:", error);
      setErrorMessage("Failed to calculate route. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [verifyAndSetCities, selectedCenterIds.A, selectedCenterIds.B]);

  useEffect(() => {
    if (debouncedPointA && userClicked.A) {
      handleSearch(debouncedPointA, "A");
    }
  }, [debouncedPointA, userClicked.A]);

  useEffect(() => {
    if (debouncedPointB && userClicked.B) {
      handleSearch(debouncedPointB, "B");
    }
  }, [debouncedPointB, userClicked.B]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutsideA =
        pointARef.current &&
        !pointARef.current.contains(event.target as Node) &&
        dropdownARef.current &&
        !dropdownARef.current.contains(event.target as Node);

      const clickedOutsideB =
        pointBRef.current &&
        !pointBRef.current.contains(event.target as Node) &&
        dropdownBRef.current &&
        !dropdownBRef.current.contains(event.target as Node);

      if (clickedOutsideA) {
        setUserClicked((prev) => ({ ...prev, A: false }));
        setSearchResults((prev) => ({ ...prev, A: [] }));
      }

      if (clickedOutsideB) {
        setUserClicked((prev) => ({ ...prev, B: false }));
        setSearchResults((prev) => ({ ...prev, B: [] }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Box style={AppContainerStyles}>
      <Flex
        gap="md"
        justify="space-between"
        style={{ paddingBlock: 20 }}
        align="center"
      >
        <Title order={3}>KAMRAN-ISI-RAILWAY-VISION</Title>
        <Flex gap="sm" align="center">
          <LanguageSwitcher />
          <ThemeToggle />
        </Flex>
      </Flex>

      <Flex
        gap="md"
        direction={{ base: "column", sm: "row" }}
        style={{ height: "calc(100vh - 94px)" }}
      >
        <Paper withBorder p="md" style={{ flex: 1, height: "100%" }}>
          <form
            onSubmit={form.onSubmit(() => {
              calculateRoute();
            })}
          >
            <Stack>
              <Title order={3}>{t("routeOptions")}</Title>

              <div style={{ position: "relative" }}>
                <TextInput
                  ref={pointARef}
                  label={t("startPoint")}
                  placeholder={t("enter") + t("startingCity")}
                  {...form.getInputProps(t("pointA"))}
                  onKeyDown={(e) => handleKeyDown(e, "A")}
                  onClick={() => {
                    setUserClicked((prev) => ({ ...prev, A: true }));
                    if (form.values.pointA.length >= 2) {
                      handleSearch(form.values.pointA, "A");
                    }
                  }}
                  onChange={(e) => {
                    form.setFieldValue("pointA", e.target.value);
                    if (selectedCenterIds.A) {
                      setSelectedCenterIds((prev) => ({
                        ...prev,
                        A: undefined,
                      }));
                    }
                    if (e.target.value.length >= 2 && userClicked.A) {
                      handleSearch(e.target.value, "A");
                    }
                  }}
                />
                {userClicked.A && searchResults.A.length > 0 && (
                  <Paper
                    ref={dropdownARef}
                    shadow="md"
                    withBorder
                    p="xs"
                    style={{
                      position: "absolute",
                      width: "100%",
                      zIndex: 10,
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {searchResults.A.map((center) => (
                      <Box
                        key={center.elementId}
                        p="xs"
                        style={{ cursor: "pointer" }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCitySelect(center, "A");
                        }}
                      >
                        {center.name}{" "}
                        {center.tags?.["name:en"]
                          ? `(${center.tags["name:en"]})`
                          : ""}
                      </Box>
                    ))}
                  </Paper>
                )}
                {isSearching.A && (
                  <Loader
                    size="xs"
                    style={{ position: "absolute", right: 10, top: 35 }}
                  />
                )}
              </div>

              <div style={{ position: "relative" }}>
                <TextInput
                  ref={pointBRef}
                  label={t("endPoint")}
                  placeholder={t("enter") + t("destinationCity")}
                  {...form.getInputProps(t("pointB"))}
                  onKeyDown={(e) => handleKeyDown(e, "B")}
                  onClick={() => {
                    setUserClicked((prev) => ({ ...prev, B: true }));
                    if (form.values.pointB.length >= 2) {
                      handleSearch(form.values.pointB, "B");
                    }
                  }}
                  onChange={(e) => {
                    form.setFieldValue("pointB", e.target.value);
                    if (selectedCenterIds.B) {
                      setSelectedCenterIds((prev) => ({
                        ...prev,
                        B: undefined,
                      }));
                    }
                    if (e.target.value.length >= 2 && userClicked.B) {
                      handleSearch(e.target.value, "B");
                    }
                  }}
                />
                {userClicked.B && searchResults.B.length > 0 && (
                  <Paper
                    ref={dropdownBRef}
                    shadow="md"
                    withBorder
                    p="xs"
                    style={{
                      position: "absolute",
                      width: "100%",
                      zIndex: 10,
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {searchResults.B.map((center) => (
                      <Box
                        key={center.elementId}
                        p="xs"
                        style={{ cursor: "pointer" }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCitySelect(center, "B");
                        }}
                      >
                        {center.name}{" "}
                        {center.tags?.["name:en"]
                          ? `(${center.tags["name:en"]})`
                          : ""}
                      </Box>
                    ))}
                  </Paper>
                )}
                {isSearching.B && (
                  <Loader
                    size="xs"
                    style={{ position: "absolute", right: 10, top: 35 }}
                  />
                )}
              </div>

              {/*<Group>*/}
              {/*  <Checkbox*/}
              {/*    label="Include Bridges"*/}
              {/*    {...form.getInputProps("includeBridges", {*/}
              {/*      type: "checkbox",*/}
              {/*    })}*/}
              {/*  />*/}
              {/*  <Checkbox*/}
              {/*    label="Include Tunnels"*/}
              {/*    {...form.getInputProps("includeTunnels", {*/}
              {/*      type: "checkbox",*/}
              {/*    })}*/}
              {/*  />*/}
              {/*  <Checkbox*/}
              {/*    label="Avoid Obstacles"*/}
              {/*    {...form.getInputProps("avoidObstacles", {*/}
              {/*      type: "checkbox",*/}
              {/*    })}*/}
              {/*  />*/}
              {/*</Group>*/}

              {/*<Group>*/}
              {/*  <Button*/}
              {/*    variant={selectedPoint === "A" ? "filled" : "outline"}*/}
              {/*    onClick={() =>*/}
              {/*      setSelectedPoint(selectedPoint === "A" ? null : "A")*/}
              {/*    }*/}
              {/*  >*/}
              {/*    Set Start on Map*/}
              {/*  </Button>*/}
              {/*  <Button*/}
              {/*    variant={selectedPoint === "B" ? "filled" : "outline"}*/}
              {/*    onClick={() =>*/}
              {/*      setSelectedPoint(selectedPoint === "B" ? null : "B")*/}
              {/*    }*/}
              {/*  >*/}
              {/*    Set Destination on Map*/}
              {/*  </Button>*/}
              {/*</Group>*/}

              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader size="sm" /> : t("calculateRoute")}
              </Button>

              {errorMessage && (
                <Text color="red" size="sm">
                  {errorMessage}
                </Text>
              )}

              {routeData && (
                <Paper withBorder p="md">
                  <Title order={4}>Route Summary</Title>
                  <Text>
                    {t("distance")}: {routeData.distance?.toFixed(2)} km
                  </Text>
                  <Text>
                    {t("duration")}:{" "}
                    {Math.floor(+routeData.approximateDuration.split(":")[0])}h{" "}
                    {Math.round(+routeData.approximateDuration.split(":")[1])}m
                  </Text>
                </Paper>
              )}
            </Stack>
          </form>
        </Paper>

        <Paper withBorder style={{ flex: 2, height: "100%" }}>
          <MapView
            selectedPoint={selectedPoint}
            onPointSet={handlePointSet}
            points={points}
            routeData={routeData}
          />
        </Paper>
      </Flex>
    </Box>
  );
}

export default App;

// Route distance and duration calculated from backend

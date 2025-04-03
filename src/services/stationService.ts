export class StationService {
  private static stations = [
    "Station A",
    "Station B",
    "Station C",
    "Central Station",
    "North Terminal",
    "South Junction",
    "East Line Station",
    "West End Terminal",
  ];

  public static async searchStations(query: string): Promise<string[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return StationService.stations.filter((station) =>
      station.toLowerCase().includes(query.toLowerCase()),
    );
  }

  public static async getStationDetails(stationName: string): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      name: stationName,
      id: stationName.replace(/\s/g, "").toLowerCase(),
    };
  }
}

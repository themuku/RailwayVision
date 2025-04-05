// stationService.ts
export interface PopulationCenter {
  latitude: number;
  longitude: number;
  elementId: number;
  tags: object;
  lon: number;
  id: string;
  name: string;
  lat: number;
  lng: number;
  population?: number;
  type?: string;
}

export class PopulationCenterService {
  private static API_BASE_URL = "https://nurlan.bsite.net/api";

  /**
   * Fetches all population centers from the API
   * @returns Promise resolving to an array of population centers
   */
  public static async getAll(): Promise<PopulationCenter[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/populationcenters`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch population centers: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      console.log(data);

      return data;
    } catch (error) {
      console.error("Error fetching population centers:", error);
      throw error;
    }
  }

  /**
   * Fetches a specific population center by ID
   * @param id The ID of the population center to fetch
   * @returns Promise resolving to the population center details
   */
  public static async getById(id: string): Promise<PopulationCenter> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/populationcenters/${id}`,
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch population center: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching population center with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Searches population centers by name
   * @param query The search query string
   * @returns Promise resolving to matching population centers
   */
  public static async search(query: string): Promise<PopulationCenter[]> {
    try {
      const allCenters = await this.getAll();
      return allCenters.filter((center) =>
        center.name.toLowerCase().includes(query.toLowerCase()),
      );
    } catch (error) {
      console.error("Error searching population centers:", error);
      throw error;
    }
  }

  /**
   * Calculates a route between two population centers using their IDs
   * @param fromId ID of the starting population center
   * @param toId ID of the destination population center
   * @param p0
   * @returns Promise resolving to the calculated route data
   */
  public static async calculateRoute(
    fromId: string,
    toId: string,
    p0: {
      includeBridges: boolean;
      includeTunnels: boolean;
      avoidObstacles: boolean;
    },
  ): Promise<any> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/routes?FromId=${fromId}&ToId=${toId}`,
      );

      if (!response.ok) {
        throw new Error(
          `Failed to calculate route: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error calculating route:", error);
      throw error;
    }
  }
}

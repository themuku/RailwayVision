import { RouteData } from "../types";

export interface PopulationCenter {
  latitude: number;
  longitude: number;
  elementId: number;
  tags: Record<string, string | undefined>;
  lon: number;
  id: string;
  name: string;
  lat: number;
  lng: number;
  population?: number;
  type?: string;
}

export class PopulationCenterService {
  private static readonly API_BASE_URL = "https://nurlan.bsite.net/api";
  private static readonly ENDPOINTS = {
    POPULATION_CENTERS: "/populationcenters",
    ROUTES: "/routes",
  };

  /**
   * Helper method to fetch data from the API
   * @param endpoint API endpoint to fetch from
   * @param errorMessage Custom error message prefix
   * @returns Promise with the parsed JSON response
   */
  private static async fetchFromApi<T>(
    endpoint: string,
    errorMessage: string,
  ): Promise<T> {
    const response = await fetch(`${this.API_BASE_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(
        `${errorMessage}: ${response.status} ${response.statusText}`,
      );
    }

    return (await response.json()) as T;
  }

  /**
   * Fetches all population centers from the API
   * @returns Promise resolving to an array of population centers
   */
  public static async getAll(): Promise<PopulationCenter[]> {
    try {
      return await this.fetchFromApi<PopulationCenter[]>(
        this.ENDPOINTS.POPULATION_CENTERS,
        "Failed to fetch population centers",
      );
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
      return await this.fetchFromApi<PopulationCenter>(
        `${this.ENDPOINTS.POPULATION_CENTERS}/${id}`,
        "Failed to fetch population center",
      );
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
   * @returns Promise resolving to the calculated route data
   */
  public static async calculateRoute(
    fromId: string | number,
    toId: string | number,
    // _options: {
    //   includeBridges: boolean;
    //   includeTunnels: boolean;
    //   avoidObstacles: boolean;
    // },
  ): Promise<RouteData> {
    try {
      const data = await this.fetchFromApi<RouteData>(
        `${this.ENDPOINTS.ROUTES}?FromId=${fromId}&ToId=${toId}`,
        "Failed to calculate route",
      );
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error calculating route:", error);
      throw error;
    }
  }
}

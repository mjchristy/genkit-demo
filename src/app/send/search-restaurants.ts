import { CUISINES } from "../constants";
import { ai, z } from "./genkit";

export const RestaurantSchema = z.object({
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  avgRating: z.number().describe("on a scale of 0.0-5.0"),
  cuisine: z.enum(CUISINES),
});
export type Restaurant = z.infer<typeof RestaurantSchema>;

const MOCK_DATA: Restaurant[] = [
  // Italian
  {
    name: "Bella Italia",
    address: "123 Olive Street",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.7,
    cuisine: "Italian",
  },
  {
    name: "Romano's Trattoria",
    address: "456 Pasta Lane",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.3,
    cuisine: "Italian",
  },
  // Chinese
  {
    name: "Golden Dragon",
    address: "789 Grant Avenue",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.5,
    cuisine: "Chinese",
  },
  {
    name: "Sichuan House",
    address: "101 Spice Road",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.8,
    cuisine: "Chinese",
  },
  // Japanese
  {
    name: "Sushi Master",
    address: "202 Sakura Street",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.9,
    cuisine: "Japanese",
  },
  {
    name: "Ramen House",
    address: "303 Noodle Way",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.4,
    cuisine: "Japanese",
  },
  // Mexican
  {
    name: "El Taco Loco",
    address: "404 Salsa Boulevard",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.6,
    cuisine: "Mexican",
  },
  {
    name: "Casa Mexico",
    address: "505 Tortilla Drive",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.2,
    cuisine: "Mexican",
  },
  // Indian
  {
    name: "Taj Palace",
    address: "606 Curry Lane",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.7,
    cuisine: "Indian",
  },
  {
    name: "Spice Route",
    address: "707 Masala Street",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.5,
    cuisine: "Indian",
  },
  // Thai
  {
    name: "Bangkok Kitchen",
    address: "808 Pad Thai Road",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.4,
    cuisine: "Thai",
  },
  {
    name: "Thai Spice",
    address: "909 Basil Avenue",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.6,
    cuisine: "Thai",
  },
  // Mediterranean
  {
    name: "Olive Grove",
    address: "111 Hummus Way",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.3,
    cuisine: "Mediterranean",
  },
  {
    name: "Mediterranean Delight",
    address: "222 Falafel Street",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.5,
    cuisine: "Mediterranean",
  },
  // French
  {
    name: "Le Petit Bistro",
    address: "333 Croissant Lane",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.8,
    cuisine: "French",
  },
  {
    name: "Chez Marie",
    address: "444 Baguette Boulevard",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.6,
    cuisine: "French",
  },
  // American
  {
    name: "Classic Diner",
    address: "555 Burger Street",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.2,
    cuisine: "American",
  },
  {
    name: "American Grill",
    address: "666 Steak Avenue",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.4,
    cuisine: "American",
  },
  // Korean
  {
    name: "Seoul Kitchen",
    address: "777 Kimchi Road",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.7,
    cuisine: "Korean",
  },
  {
    name: "K-BBQ House",
    address: "888 Bulgogi Street",
    city: "San Francisco",
    state: "CA",
    avgRating: 4.5,
    cuisine: "Korean",
  },
];

export const searchRestaurants = ai.defineTool(
  {
    name: "searchRestaurants",
    description:
      "find local restaurants by cuisines (up to 5 results, with at least one restaurant per cuisine)",
    inputSchema: z.object({
      cuisines: z.array(z.enum(CUISINES)),
    }),
    outputSchema: z.array(RestaurantSchema),
  },
  async ({ cuisines }) => {
    // Get all matching restaurants sorted by rating
    const allMatching = MOCK_DATA.filter((restaurant) =>
      cuisines.includes(restaurant.cuisine)
    ).sort((a, b) => b.avgRating - a.avgRating);

    // Ensure at least one restaurant per cuisine
    const results = new Set<Restaurant>();

    // First, get the highest rated restaurant for each cuisine
    cuisines.forEach((cuisine) => {
      const bestForCuisine = allMatching.find((r) => r.cuisine === cuisine);
      if (bestForCuisine) {
        results.add(bestForCuisine);
      }
    });

    // Then fill remaining slots with highest rated restaurants
    for (const restaurant of allMatching) {
      if (results.size >= 5) break;
      results.add(restaurant);
    }

    // Convert Set back to array and sort by rating
    return Array.from(results)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 4);
  }
);

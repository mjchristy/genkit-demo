"use client";

import { useState, useEffect, useRef } from "react";
import type { Recipe } from "./send/generate-recipe";
import type { Restaurant } from "./send/search-restaurants";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/ui/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MessageData } from "genkit";
import { runFlow } from "genkit/beta/client";
import Markdown from "react-markdown";
import { Checkbox } from "@/components/ui/checkbox";
import { CUISINES, DIETARY_RESTRICTIONS } from "./constants";

// Utility function to safely stringify unknown values for display
const safeJsonStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
};

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{restaurant.name}</h3>
        <p className="text-muted-foreground text-sm">{restaurant.address}</p>
        <p className="text-muted-foreground text-sm">
          {restaurant.city}, {restaurant.state}
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="text-xs bg-primary/10 px-2 py-1 rounded-full">{restaurant.cuisine}</span>
        <span className="text-xs bg-secondary/20 px-2 py-1 rounded-full">
          {restaurant.avgRating.toFixed(1)}★
        </span>
      </div>
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{recipe.name}</h3>
        <p className="text-muted-foreground">{recipe.description}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="text-xs bg-primary/10 px-2 py-1 rounded-full">{recipe.cuisine}</span>
        {recipe.dietaryRestrictions.map((restriction: string) => (
          <span key={restriction} className="text-xs bg-secondary/20 px-2 py-1 rounded-full">
            {restriction}
          </span>
        ))}
      </div>

      <div>
        <h4 className="font-medium mb-2">Ingredients</h4>
        <ul className="list-disc list-inside space-y-1">
          {recipe.ingredients.map((ingredient: { quantity: string; name: string }, i: number) => (
            <li key={i} className="text-sm">
              {ingredient.quantity} {ingredient.name}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-medium mb-2">Instructions</h4>
        <ol className="list-decimal list-inside space-y-2">
          {recipe.steps.map((step: string, i: number) => (
            <li key={i} className="text-sm">
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [preferredCuisines, setPreferredCuisines] = useState<string[]>([]);
  const [preferencesExpanded, setPreferencesExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedDietaryRestrictions = localStorage.getItem("dietaryRestrictions");
    const savedPreferredCuisines = localStorage.getItem("preferredCuisines");

    if (savedDietaryRestrictions) {
      setDietaryRestrictions(JSON.parse(savedDietaryRestrictions));
    }
    if (savedPreferredCuisines) {
      setPreferredCuisines(JSON.parse(savedPreferredCuisines));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dietaryRestrictions", JSON.stringify(dietaryRestrictions));
  }, [dietaryRestrictions]);

  useEffect(() => {
    localStorage.setItem("preferredCuisines", JSON.stringify(preferredCuisines));
  }, [preferredCuisines]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);
    // Add user message with preferences
    const userMessage: MessageData = {
      role: "user",
      content: [
        {
          text: inputValue,
        },
      ],
    };

    setMessages([userMessage]);
    setInputValue("");

    const result = await runFlow({
      url: "/send",
      input: {
        message: inputValue,
        preferences: {
          dietaryRestrictions,
          preferredCuisines,
        },
      },
    });
    setMessages([...result.request.messages, result.message]);
    setIsLoading(false);
  };

  async function resetHistory() {
    const response = await fetch("/send", {
      method: "DELETE",
    });

    if (response.ok) {
      setMessages([]);
    } else {
      console.error("Failed to reset history");
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-5 h-screen p-4 max-w-6xl mx-auto">
     <Header className="w-full md:w-1/5">
     </Header>
      <Card className="w-full md:w-1/4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Preferences</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={() => setPreferencesExpanded(!preferencesExpanded)}
          >
            {preferencesExpanded ? "Hide" : "Show"}
          </Button>
        </CardHeader>
        <CardContent className={cn("space-y-6", "md:block", preferencesExpanded ? "block" : "hidden")}>
          <div className="space-y-4">
            <h3 className="font-medium">Dietary Restrictions</h3>
            <div className="space-y-2">
              {DIETARY_RESTRICTIONS.map((restriction) => (
                <div key={restriction} className="flex items-center space-x-2">
                  <Checkbox
                    id={restriction}
                    checked={dietaryRestrictions.includes(restriction)}
                    onCheckedChange={(checked) => {
                      setDietaryRestrictions(
                        checked
                          ? [...dietaryRestrictions, restriction]
                          : dietaryRestrictions.filter((r) => r !== restriction)
                      );
                    }}
                  />
                  <label
                    htmlFor={restriction}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {restriction}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Preferred Cuisines</h3>
            <div className="space-y-2">
              {CUISINES.map((cuisine) => (
                <div key={cuisine} className="flex items-center space-x-2">
                  <Checkbox
                    id={cuisine}
                    checked={preferredCuisines.includes(cuisine)}
                    onCheckedChange={(checked) => {
                      setPreferredCuisines(
                        checked
                          ? [...preferredCuisines, cuisine]
                          : preferredCuisines.filter((c) => c !== cuisine)
                      );
                    }}
                  />
                  <label
                    htmlFor={cuisine}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {cuisine}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 h-full flex flex-col">
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="flex flex-col gap-4">
              {messages
                .filter((m) =>
                  m.content.some((p) => !p.toolRequest && !(p.text?.trim().length === 0))
                )
                .map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role !== "user" && message.role !== "system" && (
                      <Avatar>
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-lg p-3 max-w-[80%]",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : message.role === "system"
                          ? "hidden"
                          : "bg-muted"
                      )}
                    >
                      {/* Group and render all text parts together */}
                      {message.content.some(
                        (item) => !!item.text?.trim().length && item.text !== "\n"
                      ) && (
                        <div
                          className={cn(
                            "mb-2 prose prose-sm",
                            message.role !== "user" && "prose-invert"
                          )}
                        >
                          <Markdown>
                            {message.content
                              .filter((item) => item.text)
                              .map((item) => item.text)
                              .join("")}
                          </Markdown>
                        </div>
                      )}

                      {/* Render non-text content */}
                      {message.content.map((item, contentIndex) => {
                        // Skip text items as they're handled above
                        if (item.text) return null;

                        return (
                          <div key={contentIndex} className="mb-2 last:mb-0">
                            {item.media && (
                              <div className="mt-2">
                                <img
                                  src={item.media.url}
                                  alt="Media content"
                                  className="max-w-full rounded-md"
                                  style={{ maxHeight: "200px" }}
                                />
                              </div>
                            )}

                            {item.toolResponse?.name === "generateRecipe" && (
                              <div className="mt-2">
                                {!!item.toolResponse.output && (
                                  <RecipeCard recipe={item.toolResponse.output as Recipe} />
                                )}
                              </div>
                            )}
                            {item.toolResponse?.name === "searchRestaurants" && (
                              <div className="mt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {!!item.toolResponse.output &&
                                    Array.isArray(item.toolResponse.output) &&
                                    item.toolResponse.output.map((restaurant, idx) => (
                                      <RestaurantCard
                                        key={idx}
                                        restaurant={restaurant as Restaurant}
                                      />
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {message.role === "user" && (
                      <Avatar>
                        <AvatarFallback>You</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar>
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-current rounded-full animate-[bounce_1s_infinite] [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-current rounded-full animate-[bounce_1s_infinite] [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-current rounded-full animate-[bounce_1s_infinite]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex w-full gap-2"
          >
            <Input
              placeholder="What sounds good..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit">Generate</Button>
            <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10 hover:text-secondary text-yellow-500" onClick={resetHistory}>Reset</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

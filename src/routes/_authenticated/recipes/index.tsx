import { createFileRoute } from "@tanstack/react-router";
import { RecipeListPage } from "../../../pages/RecipeListPage";

export const Route = createFileRoute("/_authenticated/recipes/")({
  component: RecipesIndexRoute,
});

function RecipesIndexRoute() {
  return <RecipeListPage />;
}

import { createFileRoute } from "@tanstack/react-router";
import { RecipeDetailPage } from "../../../pages/RecipeDetailPage";

export const Route = createFileRoute("/_authenticated/recipes/$recipeSlug")({
  component: RecipeDetailRoute,
});

function RecipeDetailRoute() {
  const { recipeSlug } = Route.useParams();
  return <RecipeDetailPage slug={recipeSlug} />;
}

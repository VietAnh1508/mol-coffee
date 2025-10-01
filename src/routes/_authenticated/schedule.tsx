import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "../../components/Layout";
import { SchedulePage } from "../../pages/SchedulePage";
import { formatDateLocal } from "../../utils/dateUtils";

interface ScheduleSearchParams {
  date?: string;
}

export const Route = createFileRoute("/_authenticated/schedule")({
  validateSearch: (
    search: Record<string, unknown>
  ): ScheduleSearchParams => {
    const rawDate = typeof search.date === "string" ? search.date.trim() : "";

    if (!rawDate) {
      return {};
    }

    const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(rawDate);
    const isValidDate = !Number.isNaN(
      new Date(`${rawDate}T00:00:00`).getTime()
    );

    if (isValidFormat && isValidDate) {
      return { date: rawDate };
    }

    return {};
  },
  component: ScheduleRoute,
});

function ScheduleRoute() {
  const { date } = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleDateChange = (nextDate: Date) => {
    const nextDateStr = formatDateLocal(nextDate);

    navigate({
      to: "/schedule",
      search: (prev) => {
        if (prev.date === nextDateStr) {
          return prev;
        }
        return { ...prev, date: nextDateStr };
      },
      replace: true,
    });
  };

  return (
    <Layout>
      <SchedulePage initialDate={date} onDateChange={handleDateChange} />
    </Layout>
  );
}

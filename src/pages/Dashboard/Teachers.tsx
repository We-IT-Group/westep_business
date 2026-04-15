import DashboardPlaceholderPage from "../../components/dashboard/DashboardPlaceholderPage";

export default function Teachers() {
  return (
    <DashboardPlaceholderPage
      title="Teachers"
      description="Track mentor capacity, feedback quality, and class performance from one place."
      cards={[
        {
          title: "Active mentors",
          value: "94",
          detail: "Teachers assigned to at least one live course this month.",
        },
        {
          title: "Classes today",
          value: "51",
          detail: "Scheduled mentor sessions across all learning tracks.",
        },
        {
          title: "Avg. rating",
          value: "4.9",
          detail: "Mean feedback score from the latest student reviews.",
        },
        {
          title: "Open reviews",
          value: "13",
          detail: "Sessions still awaiting curriculum quality approval.",
        },
      ]}
    />
  );
}

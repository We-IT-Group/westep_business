import DashboardPlaceholderPage from "../../components/dashboard/DashboardPlaceholderPage";

export default function Schedule() {
  return (
    <DashboardPlaceholderPage
      title="Schedule"
      description="Coordinate live classes, milestone deadlines, and mentor calendars without leaving the dashboard."
      cards={[
        {
          title: "Today events",
          value: "64",
          detail: "Lessons, webinars, and internal review sessions combined.",
        },
        {
          title: "Upcoming exams",
          value: "9",
          detail: "Assessments planned within the next two weeks.",
        },
        {
          title: "Free slots",
          value: "23",
          detail: "Available time windows for additional live sessions.",
        },
        {
          title: "Attendance",
          value: "91%",
          detail: "Average attendance for classes delivered this week.",
        },
      ]}
    />
  );
}

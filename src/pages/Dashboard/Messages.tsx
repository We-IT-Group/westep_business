import DashboardPlaceholderPage from "../../components/dashboard/DashboardPlaceholderPage";

export default function Messages() {
  return (
    <DashboardPlaceholderPage
      title="Messages"
      description="Manage student conversations, broadcast updates, and unanswered support threads."
      cards={[
        {
          title: "Unread chats",
          value: "12",
          detail: "Threads that need a response from the platform team.",
        },
        {
          title: "Announcements",
          value: "5",
          detail: "Draft or scheduled platform-wide messages this week.",
        },
        {
          title: "Response time",
          value: "18m",
          detail: "Average first-response time across all support channels.",
        },
        {
          title: "Resolved",
          value: "264",
          detail: "Conversations closed successfully in the last month.",
        },
      ]}
    />
  );
}

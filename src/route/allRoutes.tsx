import SignIn from "../pages/AuthPages/SignIn";
import VerifyCode from "../pages/AuthPages/VerifyCode.tsx";
import Success from "../pages/AuthPages/Success";
import NotFound from "../pages/OtherPage/NotFound";
import UserProfiles from "../pages/UserProfiles.tsx";
import AddCourse from "../pages/Courses/AddCourse.tsx";
import Logout from "../pages/AuthPages/Logout.tsx";
import SignUp from "../pages/AuthPages/SignUp.tsx";
import Password from "../pages/AuthPages/Password.tsx";
import FormElements from "../pages/Forms/FormElements.tsx";
import CreatePassword from "../pages/AuthPages/CreatePassword.tsx";
import ResetPassword from "../pages/AuthPages/ResetPassword.tsx";
import Courses from "../pages/Courses/Courses.tsx";
import Users from "../pages/Users/Users.tsx";
import AddUsers from "../pages/Users/AddUsers.tsx";
import CourseDetails from "../pages/CourseDetails/CourseDetails.tsx";
import AddLesson from "../components/courseDetails/lessonDetails/AddLesson.tsx";
import ForgotPassword from "../pages/AuthPages/ForgotPassword.tsx";
import Overview from "../pages/Dashboard/Overview.tsx";
import Students from "../pages/Dashboard/Students.tsx";
import Teachers from "../pages/Dashboard/Teachers.tsx";
import Schedule from "../pages/Dashboard/Schedule.tsx";
import Messages from "../pages/Dashboard/Messages.tsx";
import Analytics from "../pages/Dashboard/Analytics.tsx";
import Settings from "../pages/Dashboard/Settings.tsx";
import PublicTrackingRedirect from "../pages/PublicTrackingRedirect.tsx";

export const authProtectedRoutes = [
    {index: true, element: <Overview/>, path: "/"},
    {path: "/dashboard", element: <Overview/>},
    {path: "/courses/update/:id", element: <AddCourse/>},
    {path: "/courses/add", element: <AddCourse/>},
    {
        path: "/courses/details/:id", element: <CourseDetails/>,
        children: [
            {path: "updateLesson/:lessonId", element: <AddLesson/>},
            {path: "addLesson", element: <AddLesson/>}
        ]
    },
    {path: "/courses/addLesson/:id", element: <AddLesson/>},
    // { path: "/courses/updateLesson/:id/lesson/:lessonId", element: <AddLesson /> },
    {path: "/courses", element: <Courses/>},
    {path: "/students", element: <Students/>},
    {path: "/teachers", element: <Teachers/>},
    {path: "/schedule", element: <Schedule/>},
    {path: "/messages", element: <Messages/>},
    {path: "/analytics", element: <Analytics/>},
    {path: "/settings", element: <Settings/>},
    {path: "/users/update/:id", element: <Users/>},
    {path: "/users/add", element: <AddUsers/>},
    {path: "/users", element: <Users/>},
    {path: "/profile", element: <UserProfiles/>},
    {path: "/form-elements", element: <FormElements/>},
    {path: "*", element: <NotFound/>},
];

export const publicRoutes = [
    {path: "/r/:code", element: <PublicTrackingRedirect/>},
    {path: "/login", element: <SignIn/>},
    {path: "/register", element: <SignUp/>},
    {path: "/logout", element: <Logout/>},
    {path: "/password", element: <Password/>},
    {path: "/create-password", element: <CreatePassword/>},
    {path: "/reset-password", element: <ResetPassword/>},
    {path: "/forgot-password", element: <ForgotPassword/>},
    {path: "/verify-code", element: <VerifyCode/>},
    {path: "/success", element: <Success/>},
    {path: "*", element: <NotFound/>},
];

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
import MainPage from "../pages/MainPage";
import CourseDetails from "../pages/CourseDetails/CourseDetails.tsx";
import AddLesson from "../components/courseDetails/lessonDetails/AddLesson.tsx";
import ForgotPassword from "../pages/AuthPages/ForgotPassword.tsx";


export const authProtectedRoutes = [
    {index: true, element: <MainPage/>, path: '/'}, // index route
    {path: "/courses/update/:id", element: <AddCourse/>},
    {path: "/courses/add", element: <AddCourse/>},
    {path: "/courses/details/:id/*", element: <CourseDetails/>},
    {path: "/courses/addLesson/:id", element: <AddLesson/>},
    {path: "/courses/updateLesson/:id/lesson/:lessonId", element: <AddLesson/>},
    {path: "/courses", element: <Courses/>},
    // {path: "/courses/update/:courseId/:id", element: <AddLesson/>},
    // {path: "/courses/add", element: <AddLesson/>},
    {path: "/users/update/:id", element: <AddUsers/>},
    {path: "/users/add", element: <AddUsers/>},
    {path: "/users", element: <Users/>},


    // Others Page
    {path: "/profile", element: <UserProfiles/>},
    // {path: "/calendar", element: <Calendar/>},
    // {path: "/blank", element: <Blank/>},
    //
    // // Forms
    {path: "/form-elements", element: <FormElements/>},
    //
    // // Tables
    // {path: "/basic-tables", element: <BasicTables/>},
    //
    // // UI Elements
    // {path: "/alerts", element: <Alerts/>},

    // {path: "/avatars", element: <Avatars/>},
    // {path: "/badge", element: <Badges/>},
    // {path: "/buttons", element: <Buttons/>},
    // {path: "/images", element: <Images/>},
    // {path: "/videos", element: <Videos/>},
    //
    // // Charts
    // {path: "/line-chart", element: <LineChart/>},
    // {path: "/bar-chart", element: <BarChart/>},
    // Fallback
    {path: "*", element: <NotFound/>},
];
export const publicRoutes = [
    {path: "/login", element: <SignIn/>},
    {path: "/register", element: <SignUp/>},
    {path: "/logout", element: <Logout/>},
    {path: "/password", element: <Password/>},
    {path: "/create-password", element: <CreatePassword/>},
    {path: "/reset-password", element: <ResetPassword/>},
    {path: "/forgot-password", element: <ForgotPassword/>},
    {path: "/verify-code", element: <VerifyCode/>},
    {path: "/success", element: <Success/>},
    {path: "*", element: <NotFound/>}
]

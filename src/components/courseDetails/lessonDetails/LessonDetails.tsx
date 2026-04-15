import AddLesson from "./AddLesson.tsx";
import {Route, Routes} from "react-router-dom";

function LessonDetails() {
    return (
        <Routes>
            <Route
                path={'updateLesson/:lessonId'}
                element={<AddLesson/>}
            />
            <Route
                path={'addLesson'}
                element={<AddLesson/>}
            />
        </Routes>
    );
}

export default LessonDetails;

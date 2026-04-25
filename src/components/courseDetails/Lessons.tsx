import {useGetLessons} from "../../api/lessons/useLesson.ts";
import {Lesson} from "../../types/types.ts";
import LessonCard from "./LessonCard.tsx";

function Lessons({id, openLesson, courseId, activeSession, onSelectionChange}: { 
    id: string, 
    openLesson: boolean, 
    courseId: string,
    activeSession: {
        type: "lesson" | "module" | "course" | "pricing" | "analytics" | "students" | "homework" | "discussions" | "quizzes" | "none",
        id: string | null,
        moduleId?: string | null
    },
    onSelectionChange: (
        type: "lesson" | "module" | "course" | "pricing" | "analytics" | "students" | "homework" | "discussions" | "quizzes" | "none",
        id: string | null,
        meta?: { moduleId?: string | null }
    ) => void
}) {
    const {data, isPending, isError, error} = useGetLessons(id, openLesson);

    const onSelect = (lessonId: string, moduleId: string) => {
        onSelectionChange('lesson', lessonId, {moduleId});
    }

    if (!openLesson) return null;
    if (isPending) return <p className="text-sm text-gray-500 ml-8">Loading lessons...</p>;
    if (isError) return <p className="text-sm text-red-500 ml-8">Error: {error.message}</p>;


    return (
        <div className="space-y-1">
            {data.map((lesson: Lesson) => (
                <LessonCard 
                    key={lesson.id} 
                    onSelect={onSelect} 
                    lesson={lesson} 
                    courseId={courseId}
                    activeSession={activeSession}
                />
            ))}
        </div>
    );
}

export default Lessons;

import {useNavigate} from "react-router";
import {useGetLessons} from "../../api/lessons/useLesson.ts";
import {Lesson} from "../../types/types.ts";
import LessonCard from "./LessonCard.tsx";
import {useEffect} from "react";

function Lessons({id, openLesson, courseId}: { id: string, openLesson: boolean, courseId: string }) {
    const {data, isPending, isError, error} = useGetLessons(id, openLesson);
    const navigate = useNavigate();


    const onSelect = (lessonId: string) => {
        navigate(`/courses/details/${courseId}/updateLesson/${lessonId}`, {state: {moduleId: id}});
    }

    useEffect(() => {

    }, [])

    if (!openLesson) return null;
    if (isPending) return <p className="text-sm text-gray-500">Loading lessons...</p>;
    if (isError) return <p className="text-sm text-red-500">Error: {error.message}</p>;


    return (
        <div>
            <div>
                {data.map((lesson: Lesson) => (
                    <LessonCard key={lesson.id} onSelect={onSelect} lesson={lesson} courseId={courseId}/>
                ))}
            </div>
        </div>
    );
}

export default Lessons;

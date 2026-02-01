import CourseModulesBar from "../../components/courseDetails/CourseModulesBar.tsx";
import {useParams} from "react-router";
import LessonDetails from "../../components/courseDetails/lessonDetails/LessonDetails.tsx";

function CourseDetails() {
    const params = useParams();


    return (
        <>
            <div className={'flex h-full'}>
                <div
                    className={'w-full lg:w-[330px] sticky top-0 overflow-y-auto custom-scrollbar  shadow bg-white lg:bg-[#F8FBFF] p-3 md:p-5'}>
                    <CourseModulesBar id={params?.id}/>
                </div>
                <div
                    className={`hidden lg:block flex-1 overflow-y-auto custom-scrollbar bg-white  transition-all duration-300 ease-in-out`}>
                    <div className="p-5">
                        <LessonDetails/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CourseDetails;
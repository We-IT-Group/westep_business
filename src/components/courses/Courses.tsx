import {useGetMyCourses} from "../../api/courses/useCourse.ts";
import CourseCard from "./CourseCard.tsx";
import {Course} from "../../types/types.ts";
import AddCourse from "./AddCourse.tsx";
import {ArrowRightIcon} from "../../icons";

function Courses() {
    const {data} = useGetMyCourses()
    return (
        <div>
            <div className={'flex justify-between items-center'}>
                <h3 className={'text-xl font-normal hidden lg:flex'}>Sizning Darslaringiz</h3>
                <h3 className={'text-xl font-normal lg:hidden'}>Darslarim</h3>
                <div className={'bg-blue-600 rounded-full p-1 lg:hidden'}>
                    <ArrowRightIcon width={24} height={24}/>
                </div>
            </div>
            <div className={'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4'}>
                <AddCourse/>
                {
                    data?.map((course: Course) =>
                        <CourseCard key={course.id} course={course}/>
                    )
                }
            </div>

        </div>
    );
}

export default Courses;
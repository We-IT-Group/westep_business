import PageMeta from "../../components/common/PageMeta";
import {useGetCourses} from "../../api/courses/useCourse.ts";
import {Button} from "../../components/ui/button/newButton.tsx";
import {Plus} from "lucide-react";
import CourseCard from "../../components/courses/CourseCard.tsx";
import {Link, useNavigate} from "react-router-dom";
import {Course} from "../../types/types.ts";
import {useState} from "react";
import {CourseCreationFlow} from "../../components/courses/CourseCreationFlow.tsx";

export default function Courses() {
    const {data} = useGetCourses();
    const navigate = useNavigate();
    const [showCreationFlow, setShowCreationFlow] = useState(false);

    const handleCreateCourse = () => {
        setShowCreationFlow(true);
    };

    const handleCourseCreated = (courseData: { title: string; description: string }) => {
        const newCourseId = `course-${Date.now()}`;
        navigate(`/courses/${newCourseId}`);
    };
    return (
        <>
            <PageMeta
                title="Courses"
                description="Manage and create your educational content"
            />

            <div className="p-8 max-w-[1600px] mx-auto">


                <div className="flex flex-col gap-5 mb-8 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses</h1>
                        <p className="text-gray-600">Manage and create your educational content</p>
                    </div>
                    <Button
                        onClick={handleCreateCourse}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 transition-all">
                        <Plus className="w-5 h-5"/>
                        Create New Course
                    </Button>
                </div>

                <div className="flex flex-wrap gap-3 mb-8">
                    <button
                        className="px-5 py-2.5 bg-[#0B1F3A] text-white rounded-xl font-medium shadow-sm hover:bg-[#0B1F3A]/90 transition-all">
                        All Courses
                    </button>
                    <button
                        className="px-5 py-2.5 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 border border-gray-200 transition-all">
                        Published
                    </button>
                    <button
                        className="px-5 py-2.5 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 border border-gray-200 transition-all">
                        Draft
                    </button>
                </div>

                {data && data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {data.map((course: Course) => (
                            <CourseCard key={course.id} course={course}/>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <div
                            className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <span className="text-5xl">📚</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">No courses yet</h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Get started by creating your first course. Build engaging content and share your knowledge
                            with
                            students.
                        </p>
                        <Link to="/courses/add">
                            <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-lg">
                                <Plus className="w-5 h-5"/>
                                Create Your First Course
                            </Button>
                        </Link>
                    </div>
                )}

                <CourseCreationFlow
                    open={showCreationFlow}
                    onClose={() => setShowCreationFlow(false)}
                    onComplete={handleCourseCreated}
                />
            </div>
        </>
    );
}

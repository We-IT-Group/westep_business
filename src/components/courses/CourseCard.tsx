import {Course} from "../../types/types.ts";
import Image from "../ui/images/Image.tsx";
import {useDeleteCourse} from "../../api/courses/useCourse.ts";
import DeleteModal from "../common/DeleteModal.tsx";
import {useState} from "react";
import {Link} from "react-router";
import UpdateCourse from "./UpdateCourse.tsx";

function CourseCard({course}: { course: Course }) {


    const {mutate, isPending: isDeletePending} = useDeleteCourse()
    const [openEdit, setOpenEdit] = useState(false);
    const handleDelete = async () => {
        await mutate(course.id)
    }

    const [deleteModal, setDeleteModal] = useState(false);

    const handleOpenEdit = () => {
        setOpenEdit(!openEdit);
    };

    const openDeleteModal = () => {
        setDeleteModal(true);
    };

    return (
        <>
            {
                openEdit ? <UpdateCourse data={course} setOpenEdit={handleOpenEdit}/>
                    :
                    <div className={'border border-blue-200 rounded-3xl overflow-hidden h-full flex flex-col'}>
                        <div className="w-full h-[180px]">
                            <Image imageUrl={course.attachmentUrl as string} openDeleteModal={openDeleteModal}
                                   setOpenEdit={handleOpenEdit}/>
                        </div>
                        <div className={'p-4 flex flex-col justify-between flex-1'}>
                            <div>
                                <h3 className={'text-md font-medium break-all'}>{course?.name}</h3>
                                <div className={'flex items-center gap-3 mt-2 justify-start flex-wrap'}>
                                    <p className={'text-xs font-light break-all'}>{course?.description}</p>
                                </div>
                            </div>
                            <Link to={`/courses/details/${course.id}`} className={'w-full'}>
                                <button
                                    className={'w-full h-[40px] mt-3 bg-blue-50 text-blue-400 border border-blue-400 rounded-full p-1 text-center'}>
                                    Boshlash
                                </button>
                            </Link>
                        </div>
                    </div>
            }

            <DeleteModal
                isPending={isDeletePending}
                setOpen={setDeleteModal}
                open={deleteModal}
                deleteFunction={handleDelete}
            />
        </>

    );
}

export default CourseCard;
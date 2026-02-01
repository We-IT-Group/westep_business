import {Module} from "../../types/types.ts";
import {EditIcon, TrashBinIcon} from "../../icons";
import {useState} from "react";
import DeleteModal from "../common/DeleteModal.tsx";
import {useDeleteModule} from "../../api/module/useModule.ts";
import Lessons from "./Lessons.tsx";
import UpdateModuleForm from "./UpdateModuleForm.tsx";

function ModuleCard({module}: { module: Module }) {

    const {mutate, isPending: isDeletePending} = useDeleteModule()
    const [openLesson, setOpenLesson] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false);

    const handleDelete = async () => {
        await mutate(module.id)
        setDeleteModal(false)
    }

    const openDeleteModal = () => {
        setDeleteModal(true);
    };

    return (
        <>
            <div onClick={() => setOpenLesson(!openLesson)}
                 className={'border border-blue-200 bg-white rounded-[20px] p-[16px]'}>

                <div className={'w-full flex items-center justify-between'}>
                    <h4 className={'text-sm leading-normal font-normal p-0 m-0  break-all w-[80%]'}>{module.name}</h4>
                    <TrashBinIcon onClick={(e) => {
                        e.stopPropagation()
                        openDeleteModal()
                    }} width={18} height={18} className='text-gray-400  cursor-pointer'/>
                </div>
                <div className={'flex items-center justify-between mt-[8px]'}>
                    <h4 className={'text-sm text-blue-light-500 leading-normal font-normal break-all w-[80%]  '}>{module.price?.toLocaleString().replace(',', '.')} so'm</h4>
                    <EditIcon onClick={(e) => {
                        e.stopPropagation()
                        setOpenEdit(!openEdit)
                    }} width={18} height={18} className='text-gray-400 cursor-pointer'/>
                </div>
                <div
                    className={`
      transition-all duration-300 ease-out overflow-hidden
      ${
                        openLesson ? "min-h-[80px] pt-4" : "max-h-0 pt-0"
                    }
    `}
                    style={{transformOrigin: "top"}}>
                    <Lessons id={module.id} openLesson={openLesson} courseId={module.courseId}/>
                </div>
                <UpdateModuleForm open={openEdit} setOpen={setOpenEdit} courseId={module.courseId} module={module}/>
            </div>

            <DeleteModal
                isPending={isDeletePending}
                setOpen={setDeleteModal}
                open={deleteModal}
                deleteFunction={handleDelete}
            />
        </>

    );
}

export default ModuleCard;
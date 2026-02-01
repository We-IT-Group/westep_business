import {useState} from "react";
import {EditIcon, More, TrashBinIcon} from "../../../icons";
import {baseUrlImage} from "../../../api/apiClient.ts";


interface Props {
    imageUrl: string,
    openDeleteModal: () => void,
    setOpenEdit: () => void,
}

function Image({imageUrl, openDeleteModal, setOpenEdit}: Props) {

    const [open, setOpen] = useState(false);


    return (
        <div className="w-full h-[180px] relative">
            {
                imageUrl && <img
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: 'center'
                    }}
                    loading='lazy'
                    src={baseUrlImage + imageUrl}
                    alt={imageUrl as string}
                />
            }
            <div className={'absolute top-2 right-2'}>
                <div
                    onClick={() => setOpen(!open)}
                    className={'flex items-center justify-center'}>
                    <div className="rounded-full
                backdrop-blur-xs
                bg-white/20
                cursor-pointer
                border border-white/40
                shadow-[0_0_4px_rgba(255,255,255,0.8),_0_0_4px_rgba(255,255,255,0.4)]"
                    >
                        <More width={24} height={24} className="text-black/70"/>
                    </div>
                </div>
                <div className={`
        mt-2 rounded-[20px]
        backdrop-blur-xs bg-white/20
        flex items-center justify-center flex-col gap-4
        cursor-pointer px-3.5 py-3
        border border-white/40
        shadow-[0_0_2px_rgba(255,255,255,0.8),_0_0_2px_rgba(255,255,255,0.4)]
        
        transition-all duration-300 ease-out
        origin-top-right
        
        ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
      `}
                >
                    <EditIcon onClick={setOpenEdit} width={18} height={18} className="text-black/70"/>
                    <TrashBinIcon onClick={openDeleteModal} width={18} height={18} className="text-black/70"/>
                </div>
            </div>

        </div>);
}

export default Image;
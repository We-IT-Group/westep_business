import {Plus} from "lucide-react";
import {Button} from "../ui/button/newButton.tsx";

interface BreadcrumbProps {
    pageTitle: string;
    path?: string;
    onClick?: () => void;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({pageTitle}) => {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
                <p className="text-gray-600">Manage and create your educational content</p>
            </div>
            <Button
                // onClick={handleCreateCourse}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 transition-all"
            >
                <Plus className="w-5 h-5"/>
                Create New Course
            </Button>
            {/*{*/}
            {/*    path && <Link to={path}>*/}
            {/*        <Button variant={'primary'} size={'sm'} startIcon={<PlusIcon/>}>*/}
            {/*            Qo'shish*/}
            {/*        </Button>*/}
            {/*    </Link>*/}
            {/*}*/}

        </div>
    );
};

export default PageBreadcrumb;

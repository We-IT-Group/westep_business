import AuthLayout from "../../layout/AuthLayout.tsx";
import CommonButton from "../../components/ui/button/AuthButton.tsx";
import {SuccessIcon} from "../../icons";
import {useNavigate} from "react-router-dom";

function Success() {
    const navigate = useNavigate();
    return (
        <>
            <AuthLayout>
                <section className="flex items-center justify-center w-full">
                    <div className="w-full max-w-lg animate-fadeIn">
                        <div className="flex items-center justify-center w-full mb-5">
                            <SuccessIcon width={138} height={138}/>
                        </div>
                        <h1 className="text-3xl md:text-4xl text-gray-900 font-semibold text-center">Ro’yxatdan
                            muvaffaqiyatli o’tdingiz</h1>

                        <div className="mt-8 w-full">
                            <CommonButton
                                onClick={() => {
                                    navigate("/login");
                                }}
                                type="button"
                                children={"Davom etish"}
                                variant="primary"
                            />
                        </div>
                    </div>
                </section>
            </AuthLayout>
        </>);
}

export default Success;
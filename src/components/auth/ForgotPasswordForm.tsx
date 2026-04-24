import {useFormik} from "formik";
import * as Yup from "yup";
import PhoneNumberInput from "../../components/form/PhoneNumberInput.tsx";
import CommonButton from "../ui/button/AuthButton.tsx";
import {useNavigate} from "react-router-dom";

export default function ForgotPasswordForm() {

    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            phone: '',
        },
        validationSchema: Yup.object().shape({
            phone: Yup.string()
                .required("Telefon raqami xato kiritildi!")
                .length(12, "Telefon raqami xato kiritildi!"),
        }),
        onSubmit: async (values) => {
            sessionStorage.setItem("form", JSON.stringify({phoneNumber: values.phone}));
            navigate("/reset-password");
        },
    });

    return (
        <>
            <section className="flex items-center justify-center w-full">
                <div className="w-full max-w-lg animate-fadeIn">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            formik.handleSubmit();
                        }}
                        className="bg-transparent"
                    >
                        <p className="text-2xl font-semibold text-gray-900 text-center mb-8">
                            Parolni tiklash
                        </p>

                        <div className="space-y-6">
                            <PhoneNumberInput name="phone" formik={formik} className=""/>
                        </div>

                        <div className="mt-8 w-full">
                            <CommonButton
                                type="submit"
                                children={"Davom etish"}
                                variant="primary"
                                isPending={false}
                                disabled={!(formik.isValid && formik.dirty)}
                            />
                        </div>
                    </form>
                </div>
            </section>
        </>
    );
}
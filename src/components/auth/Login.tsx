import {useFormik} from "formik";
import * as Yup from "yup";
import PhoneNumberInput from "../../components/form/PhoneNumberInput.tsx";
import CommonButton from "../ui/button/AuthButton.tsx";
import {useCheckPhoneNumber} from "../../api/auth/useAuth.ts";
import logo from "../../assets/westep_dark_logo.png";

export default function LoginForm() {
    const {mutateAsync, isPending} = useCheckPhoneNumber();


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
            await mutateAsync(values);
        },
    });

    return (
        <>
            <div className='flex justify-center'>
                <img src={logo} width={220} alt="logo"/>
            </div>
            <section className="flex items-center justify-center w-full">
                <div className="w-full max-w-lg animate-fadeIn">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            formik.handleSubmit();
                        }}
                        className="bg-transparent"
                    >
                        <p className="mb-8 text-center text-2xl font-semibold text-gray-900 dark:text-white">
                            Business
                        </p>

                        <div className="space-y-6">
                            <PhoneNumberInput name="phone" formik={formik} className=""/>
                        </div>

                        <div className="mt-8 w-full">
                            <CommonButton
                                type="submit"
                                children={"Kirish"}
                                variant="primary"
                                isPending={isPending}
                                disabled={!(formik.isValid && formik.dirty)}
                            />
                        </div>
                    </form>
                </div>
            </section>
        </>
    );
}

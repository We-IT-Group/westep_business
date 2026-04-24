import {useLogin} from "../../api/auth/useAuth.ts";
import {Link} from "react-router-dom";
import {useFormik} from "formik";
import {useRequireState} from "../../hooks/useRequireState.ts";
import * as Yup from "yup";
import CommonButton from "../ui/button/AuthButton.tsx";
import InputField from "../form/input/AuthInput.tsx";

function PasswordForm() {
    useRequireState('phoneNumber')

    const form = JSON.parse(sessionStorage.getItem('form') as string)
    const {mutateAsync, isPending} = useLogin();


    const formik = useFormik({
        initialValues: {
            password: ''
        },
        validationSchema: Yup.object().shape({
            password: Yup.string()
                .required("Parolni kiriting!")
            .min(6, "Parol kamida 6 ta belgidan iborat bo‘lishi kerak!"),
        }),
        onSubmit: async (values) => {
            await mutateAsync({
                phone: form.phoneNumber,
                password: values.password
            })
        },
    });
    return (
        <section className="flex items-center justify-center w-full">
            <div className="w-full max-w-lg animate-fadeIn">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        formik.handleSubmit();
                        return false;
                    }}
                    className="bg-transparent"
                >
                    <p className="mb-8 text-center text-2xl font-semibold text-gray-900 dark:text-white">
                        Kirish
                    </p>
                    <div className="grid grid-cols-1 mt-2">
                        <InputField
                            placeholder="Parolni kiriting!"
                            formik={formik}
                            type="password"
                            name="password"
                        />
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
                <p className={'mt-2 text-center text-gray-900 dark:text-slate-200'}><Link
                    className={"text-gray-800 dark:text-slate-300"} to="/forgot-password">Parolni unutdingizmi?</Link></p>
            </div>
        </section>
    );
}

export default PasswordForm;

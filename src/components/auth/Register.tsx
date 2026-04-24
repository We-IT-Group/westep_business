import {Link, useNavigate} from "react-router-dom";
import {useFormik} from "formik";
import {useState} from "react";
import * as Yup from "yup";
import {useRequireState} from "../../hooks/useRequireState";
import CommonButton from "../ui/button/AuthButton.tsx";
import InputField from "../form/input/AuthInput.tsx";
import AuthDatePicker from "../form/AuthDatePicker.tsx";

function Register() {

    useRequireState('phoneNumber')

    const navigate = useNavigate();


    const [isPending, setIsPending] = useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            firstname: '',
            lastname: '',
            ownerBirthDate: '',
            ownerGender: 'MALE',
            businessName: '',
            address: '',
            description: '',
        },
        validationSchema: Yup.object().shape({
            firstname: Yup.string().required('Ism kiriting!'),
            lastname: Yup.string().required('Familiyani kiriting!'),
            ownerBirthDate: Yup.string().required("Tu'gilgan sanani tanlang!"),
        }),
        onSubmit: (values) => {
            setIsPending(true);
            setTimeout(() => {
                navigate('/create-password')
                const oldData = JSON.parse(sessionStorage.getItem('form') as string) || {};
                sessionStorage.setItem('form', JSON.stringify({
                    ...oldData,
                    ...values,
                    text: 'Parol yaratish'
                }));
                setIsPending(false)
            }, 500)
        },
    });

    console.log(formik.values);


    return (
        <section className="flex items-center justify-center w-full">
            <div className="w-full animate-fadeIn">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        formik.handleSubmit();
                        return false;
                    }}
                    className="bg-transparent"
                >
                    <p className="text-2xl text-gray-900 font-semibold text-center mb-8">
                        Ro'yxatdan o'tish
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            placeholder="Ism"
                            formik={formik}
                            type="text"
                            name="firstname"
                        />
                        <InputField
                            placeholder="Familiya"
                            formik={formik}
                            type="text"
                            name="lastname"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <AuthDatePicker id="ownerBirthDate" placeholder="Tug'ilgan kun"
                                        onChange={(e: Date[]) => {
                                            const date = new Date(e[0]);
                                            const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                                                .toISOString()
                                                .split("T")[0];
                                            formik.setFieldValue('ownerBirthDate', localDate);
                                        }}
                        />
                        <InputField
                            placeholder="Address"
                            formik={formik}
                            type="text"
                            name="address"
                        />
                    </div>


                    <div className="mt-2">
                        <InputField
                            placeholder="Biznes nomi"
                            formik={formik}
                            type="text"
                            name="businessName"
                        />

                    </div>

                    <div className="mt-2">
                        <InputField
                            placeholder="Tavsif"
                            formik={formik}
                            type="text"
                            name="description"
                        />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-4">
                        <label className="w-1/2">
                            <div
                                className="border h-[48px] md:h-[54px] border-gray-400 rounded-full px-4 py-3 flex justify-center items-center gap-3 cursor-pointer hover:bg-gray-50">
                                <p className="m-0 text-black">Ayol</p>
                                <input
                                    type="radio"
                                    name="ownerGender"
                                    value="FEMALE"
                                    className="scale-150 accent-blue-600 cursor-pointer"
                                    checked={formik.values.ownerGender === "FEMALE"}
                                    onChange={formik.handleChange}
                                />
                            </div>
                        </label>

                        <label className="w-1/2">
                            <div
                                className="border  h-[48px] md:h-[54px] border-gray-400 rounded-full px-4 py-3 flex justify-center items-center gap-3 cursor-pointer hover:bg-gray-50">
                                <p className="m-0 text-black">Erkak</p>
                                <input
                                    type="radio"
                                    name="ownerGender"
                                    value="MALE"
                                    className="scale-150 accent-blue-600 cursor-pointer"
                                    checked={formik.values.ownerGender === "MALE"}
                                    onChange={formik.handleChange}
                                />
                            </div>
                        </label>
                    </div>

                    <div className="mt-8 w-full">
                        <CommonButton
                            type="submit"
                            children={"Davom etish"}
                            variant="primary"
                            isPending={isPending}
                            disabled={!(formik.isValid && formik.dirty)}
                        />
                    </div>
                </form>
                <p className={'text-center text-gray-900 mt-1'}>Akkountingiz bormi? <Link
                    className={"text-primary"} to="/login">Login</Link></p>
            </div>
        </section>
    );
}

export default Register;
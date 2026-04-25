import dateIcon from "../../../assets/icon/date.svg";
import eye from "../../../assets/icon/eye.svg";
import eyeSlash from "../../../assets/icon/eye-slash.svg";
import {useState} from "react";
import {FormikProps} from "formik";

type InputFieldProps<T> = {
    label?: string;
    type?: string;
    name: keyof T;
    formik: FormikProps<T>;
    placeholder?: string;
    icon?: React.ReactNode;
    className?: string;
};

const InputField = <T extends Record<string, unknown>>({
                                                       label = "",
                                                       type = "text",
                                                       name,
                                                       formik,
                                                       placeholder,
                                                       icon = null,
                                                       className = "",
                                                       ...rest
                                                   }: InputFieldProps<T>) => {
    const [changeType, setChangeType] = useState<string>(type);

    return (
        <div className={`${className}  w-full`}>
            {label && (
                <label
                    htmlFor={name as string}
                    className="mb-2 block text-base font-medium text-gray-200 dark:text-slate-200"
                >
                    {label}
                </label>
            )}

            <div className="relative w-full block">
                <input
                    type={changeType}
                    id={name as string}
                    name={name as string}
                    value={(formik.values[name] as string | number | readonly string[] | undefined) ?? ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={placeholder}
                    className={`h-[48px] w-full rounded-full border border-gray-400 bg-transparent px-4 py-3 text-lg text-[16px] text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-500 md:h-[54px] md:px-10 md:text-[18px]`}
                    {...rest}
                />

                {/* 📅 Date yoki custom icon uchun */}
                {(type === "date" || icon) && (
                    <span className="absolute top-1/2 right-5 -translate-y-1/2 text-gray-500 pointer-events-none">
            {icon || (
                <img
                    src={dateIcon}
                    width={24}
                    height={24}
                    alt="date_icon"
                    className="opacity-80"
                />
            )}
          </span>
                )}

                {type === "password" && (
                    <span className="absolute top-1/2 right-5 -translate-y-1/2 text-gray-500 cursor-pointer">
            {changeType === "text" ? (
                <img
                    onClick={() => setChangeType("password")}
                    src={eye}
                    width={22}
                    height={22}
                    alt="hide_password"
                />
            ) : (
                <img
                    onClick={() => setChangeType("text")}
                    src={eyeSlash}
                    width={22}
                    height={22}
                    alt="show_password"
                />
            )}
          </span>
                )}
            </div>

            {formik.errors[name] && formik.touched[name] ? (
                <p className="text-sm text-red-500 mt-2 ml-3">
                    {formik.errors[name] as string}
                </p>
            ) : null}
        </div>
    );
};

export default InputField;

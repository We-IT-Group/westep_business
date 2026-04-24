import PhoneInput from "react-phone-number-input";
import { FormikProps } from "formik";
import {FlagUz} from "../../icons";

interface IPhoneNumberInputProps<T> {
    label?: string;
    name: keyof T;
    formik: FormikProps<T>;
    className?: string;
}

const PhoneNumberInput = <T extends Record<string, unknown>>({
                                                             label = "",
                                                             name,
                                                             formik,
                                                             className = "",
                                                         }: IPhoneNumberInputProps<T>) => {
    return (
        <div className={`${className} mb-3 w-full`}>
            {label && (
                <label
                    htmlFor={name as string}
                    className="mb-2 block text-base font-medium text-gray-200 dark:text-slate-200"
                >
                    {label}
                </label>
            )}

            <PhoneInput
                defaultCountry="UZ"
                value={formik.values[name] ? `+${formik.values[name] as string}` : ""}
                onChange={(e) => {
                    formik.setFieldValue(name as string, e?.replace("+", ""));
                }}
                maxLength={17}
                international
                countryCallingCodeEditable={true}
                countrySelectComponent={() => (
                    <span style={{pointerEvents: 'none', display: 'flex', alignItems: 'center'}}>
      <FlagUz width={24} height={24}/>
    </span>
                )}
                className="w-full rounded-full border border-gray-400 bg-transparent px-5 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-500"
            />

            {formik.errors[name] && formik.touched[name] ? (
                <p className="text-sm text-red-500 mt-2 ml-2">
                    {formik.errors[name] as string}
                </p>
            ) : null}
        </div>
    );
};

export default PhoneNumberInput;

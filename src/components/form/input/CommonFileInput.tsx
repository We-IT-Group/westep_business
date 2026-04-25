import {
    ChangeEvent,
    useState,
    useImperativeHandle,
    forwardRef, useEffect,
} from "react";
import {useAddFile, useDeleteFile, useGetFileById} from "../../../api/file/useFile.ts";
import {FileText, LucidePictureInPicture2} from "lucide-react";

type Props = {
    name?: string;
    accept?: string;
    maxSizeMB?: number;
    onChange?: (file: File | null) => void;
    handleSubmit?: (fileId?: string | null) => Promise<void>;
    className?: string;
    preview?: boolean;
    text?: string;
    attachmentId?: string;
    imageError?: string;
    value?: File | null;
};

export type CommonFileInputRef = {
    saveFile: () => Promise<void>;
};

const CommonFileInput = forwardRef<CommonFileInputRef, Props>(
    (
        {
            name,
            accept = "*/*",
            maxSizeMB = 10,
            onChange,
            className = "",
            preview = true,
            attachmentId,
            handleSubmit,
            imageError,
            value
        },
        ref
    ) => {
        const {mutateAsync: addFile} = useAddFile()
        const [error, setError] = useState<string | null>(null);
        const [file, setFile] = useState<File | null>(null);
        const [selectedFile, setSelectedFile] = useState<File | null>(null)
        const [previewUrl, setPreviewUrl] = useState<string | null>(null);
        const [editId, setEditId] = useState<string | null | undefined>(null)
        const {data} = useGetFileById(attachmentId)
        const {mutateAsync: fileDelete} = useDeleteFile()


        useEffect(() => {
            if (attachmentId) {
                setEditId(attachmentId)
            }
        }, [attachmentId]);

        useEffect(() => {
            if (data) {
                const blob = new Blob([data], {type: data.type || "image/svg+xml"});
                setPreviewUrl(URL.createObjectURL(blob));
                setFile(data)
            }
        }, [data]);

        useEffect(() => {
            if (!value) {
                setSelectedFile(null);
                if (!file) {
                    setPreviewUrl(null);
                }
                return;
            }

            setSelectedFile(value);

            if (preview && value.type.startsWith("image/")) {
                const objectUrl = URL.createObjectURL(value);
                setPreviewUrl(objectUrl);

                return () => {
                    URL.revokeObjectURL(objectUrl);
                };
            }

            setPreviewUrl(null);
        }, [file, preview, value]);


        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            const item = e.target.files?.[0];
            setError(null);
            setFile(null)
            if (!item) {
                setSelectedFile(null);
                setPreviewUrl(null);
                onChange?.(null);
                return;
            }

            if (item.size > maxSizeMB * 1024 * 1024) {
                setError(`Fayl hajmi ${maxSizeMB}MB dan oshmasligi kerak.`);
                return;
            }

            setSelectedFile(item);
            onChange?.(item);

            if (preview && item.type.startsWith("image/")) {
                setPreviewUrl(URL.createObjectURL(item));
            } else {
                setPreviewUrl(null);
            }
        };

        useImperativeHandle(ref, () => ({
            saveFile: async () => {
                if (selectedFile) {
                    const formData = new FormData();
                    formData.append("file", selectedFile);
                    const uploadedFileId = await addFile(formData);

                    if (handleSubmit) {
                        await handleSubmit(uploadedFileId);

                        if (editId) {
                            await fileDelete(editId);
                            setEditId(null);
                        }
                    }
                } else if (editId) {
                    if (handleSubmit) {
                        await handleSubmit(editId);
                    }
                } else {
                    setError('Rasm tanlang!');
                }
            }
        }));

        useEffect(() => {
            setError(imageError ?? null)
        }, [imageError]);

        const isFile = file || selectedFile
        return (
            <div className={`${className} `}>
                {/*{isFile && (*/}
                {/*    <TrashBinIcon onClick={handleRemove}*/}
                {/*                  className="text-xl  absolute top-2 right-2 text-red-500"/>*/}
                {/*)}*/}
                <label
                    className="h-[180px]  w-full cursor-pointer flex justify-center flex-col items-center gap-2"
                >
                    <input
                        type="file"
                        accept={accept}
                        name={name}
                        onChange={handleChange}
                        className="sr-only"
                    />
                    <div
                        className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-green-600"/>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Add Picture</h3>
                    <p className="text-gray-600 text-sm">
                        Each module contains individual lessons with content
                    </p>
                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </label>
                <div
                    className="bg-gray-50 w-full h-[250px] rounded-xl overflow-hidden border-2 border-dashed border-gray-300">
                    {
                        isFile ? <>
                            {preview && previewUrl &&
                                <img
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        objectPosition: 'center'
                                    }}
                                    src={previewUrl}
                                    alt={previewUrl}
                                />}
                        </> : <div className={'p-6'}>
                            <h4 className="font-semibold text-gray-900 mb-3">Course picture:</h4>
                            <div className="flex justify-center items-center">
                                <div className="flex items-start gap-2">
                                    <LucidePictureInPicture2/>
                                </div>
                            </div>
                        </div>
                    }

                </div>
            </div>
        );
    }
);

export default CommonFileInput;

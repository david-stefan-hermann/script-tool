import { BsExclamationCircleFill } from "react-icons/bs";

export default function ErrorMessage({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center text-red-500">
            <BsExclamationCircleFill className="mr-2" />
            <span>{message}</span>
        </div>
    );
}
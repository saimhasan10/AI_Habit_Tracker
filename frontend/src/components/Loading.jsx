import { LoaderCircle } from "lucide-react";

const Loading = () => {
    return (
        <div className="loading-screen">
            <LoaderCircle className="loading-icon" size={32} />
            <p>Loading...</p>
        </div>
    );
};

export default Loading;
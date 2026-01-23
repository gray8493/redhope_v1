export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-black/50">
            <span className="loading loading-spinner text-neutral"></span>
        </div>
    );
}

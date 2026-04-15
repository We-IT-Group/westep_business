import PageMeta from "../../components/common/PageMeta";

export default function Analytics() {
    return (
        <>
            <PageMeta
                title="Analytics"
                description="Track performance and engagement metrics"
            />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
                <p className="text-gray-600">Track performance and engagement metrics</p>
            </div>

            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📊</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
                <p className="text-gray-600">
                    View detailed analytics about course performance, student engagement, and completion rates.
                </p>
            </div>
        </>
    );
}

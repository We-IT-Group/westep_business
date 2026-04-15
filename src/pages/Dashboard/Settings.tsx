import PageMeta from "../../components/common/PageMeta";

export default function Settings() {
    return (
        <>
            <PageMeta
                title="Settings"
                description="Manage your platform preferences and configuration"
            />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">Manage your platform preferences and configuration</p>
            </div>

            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">⚙️</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Platform Settings</h2>
                <p className="text-gray-600">
                    Configure your account, notifications, integrations, and platform preferences.
                </p>
            </div>
        </>
    );
}

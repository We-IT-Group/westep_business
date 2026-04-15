import PageMeta from "../../components/common/PageMeta";
import {BarChart3, Users, BookOpen, TrendingUp, Award, Clock} from "lucide-react";
import {Link} from "react-router";


export default function Overview() {
    return (
        <>
            <PageMeta
                title="Dashboard"
                description="Welcome back! Here's an overview of your platform."
            />
            <div className="p-8 max-w-[1600px] mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                    <p className="text-gray-600">Welcome back! Here's an overview of your platform.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div
                                className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
                                <BookOpen className="w-7 h-7 text-white"/>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-green-600">
                                    <TrendingUp className="w-4 h-4"/>
                                    <span className="text-sm font-semibold">+12%</span>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">24</h3>
                        <p className="text-gray-600 text-sm font-medium">Total Courses</p>
                    </div>

                    <div
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div
                                className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-green-500/30">
                                <Users className="w-7 h-7 text-white"/>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-green-600">
                                    <TrendingUp className="w-4 h-4"/>
                                    <span className="text-sm font-semibold">+23%</span>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">4,892</h3>
                        <p className="text-gray-600 text-sm font-medium">Active Students</p>
                    </div>

                    <div
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div
                                className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
                                <Award className="w-7 h-7 text-white"/>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-green-600">
                                    <TrendingUp className="w-4 h-4"/>
                                    <span className="text-sm font-semibold">+8%</span>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">87%</h3>
                        <p className="text-gray-600 text-sm font-medium">Completion Rate</p>
                    </div>

                    <div
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div
                                className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/30">
                                <BarChart3 className="w-7 h-7 text-white"/>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-green-600">
                                    <TrendingUp className="w-4 h-4"/>
                                    <span className="text-sm font-semibold">+15%</span>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">4.8</h3>
                        <p className="text-gray-600 text-sm font-medium">Average Rating</p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                                <Link to="/analytics" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    View All →
                                </Link>
                            </div>
                            <div className="space-y-1">
                                {[
                                    {
                                        icon: "👤",
                                        text: "New student enrolled in 'Web Development'",
                                        time: "5 minutes ago",
                                        bg: "bg-blue-50"
                                    },
                                    {
                                        icon: "✅",
                                        text: "Course 'React Patterns' was published",
                                        time: "2 hours ago",
                                        bg: "bg-green-50"
                                    },
                                    {
                                        icon: "🎓",
                                        text: "Student completed 'Python for Data Science'",
                                        time: "5 hours ago",
                                        bg: "bg-purple-50"
                                    },
                                    {
                                        icon: "💬",
                                        text: "New feedback received on 'Mobile Development'",
                                        time: "1 day ago",
                                        bg: "bg-orange-50"
                                    },
                                    {
                                        icon: "📊",
                                        text: "Course analytics updated for 'UI/UX Design'",
                                        time: "2 days ago",
                                        bg: "bg-gray-50"
                                    },
                                ].map((activity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                                    >
                                        <div
                                            className={`w-10 h-10 ${activity.bg} rounded-lg flex items-center justify-center text-lg flex-shrink-0`}>
                                            {activity.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                                                {activity.text}
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <Clock className="w-3 h-3"/>
                                                {activity.time}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-6">
                        {/* Quick Create */}
                        <div
                            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                    <BookOpen className="w-6 h-6"/>
                                </div>
                                <h3 className="text-lg font-bold mb-2">Create New Course</h3>
                                <p className="text-sm text-green-50 leading-relaxed">
                                    Start building your next course with our step-by-step wizard
                                </p>
                            </div>
                            <Link
                                to="/courses"
                                className="block w-full bg-white text-green-600 text-center py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Top Courses */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Top Performing Courses</h3>
                            <div className="space-y-3">
                                {[
                                    {title: "Web Development", students: 1247, color: "bg-blue-500"},
                                    {title: "Python for Data Science", students: 2134, color: "bg-purple-500"},
                                    {title: "React Patterns", students: 892, color: "bg-green-500"},
                                ].map((course, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className={`w-2 h-2 ${course.color} rounded-full`}></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                                            <p className="text-xs text-gray-500">{course.students} students</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

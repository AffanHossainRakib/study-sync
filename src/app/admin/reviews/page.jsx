"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Star, Calendar, User } from "lucide-react";

export default function AdminReviewsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/");
            return;
        }

        // Role check (client-side optimization, real check is on API/server)
        // Note: Since we don't store role in firebase auth token directly without custom claims, 
        // we might depend on API to reject us. But let's try to fetch.
        if (user) {
            fetchReviews();
        }
    }, [user, authLoading, router]);

    const fetchReviews = async () => {
        try {
            const token = await user.getIdToken();
            const res = await fetch("/api/reviews", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                if (res.status === 403) {
                    setError("Access denied. You do not have admin permissions.");
                } else {
                    throw new Error("Failed to fetch reviews");
                }
                return;
            }

            const data = await res.json();
            setReviews(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || (loading && !error)) {
        return (
            <div className="min-h-screen pt-24 px-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-24 px-4 text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
                <p className="text-zinc-600 dark:text-zinc-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-zinc-100">
                Product Reviews (Admin)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                    <div
                        key={review._id}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {review.user?.photoURL ? (
                                    <img
                                        src={review.user.photoURL}
                                        alt={review.user.displayName}
                                        className="w-10 h-10 rounded-full"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <User className="w-5 h-5 text-zinc-400" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                        {review.user?.displayName || "Anonymous User"}
                                    </h3>
                                    <p className="text-xs text-zinc-500">
                                        {review.user?.email || "No email"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium text-yellow-700 dark:text-yellow-500">
                                    {review.rating}
                                </span>
                            </div>
                        </div>

                        <p className="text-zinc-600 dark:text-zinc-300 mb-4 whitespace-pre-wrap">
                            {review.comment}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                            <Calendar className="w-4 h-4" />
                            <time>
                                {new Date(review.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </time>
                        </div>
                    </div>
                ))}
            </div>

            {reviews.length === 0 && (
                <div className="text-center py-12 text-zinc-500">
                    No reviews found.
                </div>
            )}
        </div>
    );
}

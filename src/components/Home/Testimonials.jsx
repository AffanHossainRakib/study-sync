'use client';

import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
    {
        id: 1,
        content: "StudySync helped me organize my YouTube learning. I finally finished that 20-hour Python course!",
        author: "Alex Chen",
        role: "Computer Science Student",
        rating: 5
    },
    {
        id: 2,
        content: "The ability to mix PDFs and videos in one plan is a game changer. Highly recommended for self-learners.",
        author: "Sarah Johnson",
        role: "Self-taught Designer",
        rating: 5
    },
    {
        id: 3,
        content: "I love the progress tracking. Seeing the bars fill up keeps me motivated to study every day.",
        author: "Michael Brown",
        role: "Medical Student",
        rating: 4
    }
];

export default function Testimonials() {
    return (
        <section className="py-20 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
                        Loved by Learners
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Join thousands of students and professionals who are mastering new skills with StudySync.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-card border border-border rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    />
                                ))}
                            </div>
                            <p className="text-foreground mb-6 italic">"{testimonial.content}"</p>
                            <div>
                                <div className="font-semibold text-foreground">{testimonial.author}</div>
                                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

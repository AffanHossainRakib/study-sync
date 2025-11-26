'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="bg-destructive/10 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Something went wrong!</h2>
                <p className="text-muted-foreground mb-8">
                    {error.message || 'An unexpected error occurred. Please try again later.'}
                </p>
                <button
                    onClick={() => reset()}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
                >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Try Again
                </button>
            </div>
        </div>
    );
}

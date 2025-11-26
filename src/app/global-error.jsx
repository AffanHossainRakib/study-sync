'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import './globals.css'; // Ensure styles are loaded

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        console.error('Global Error:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-background px-4">
                    <div className="text-center max-w-md">
                        <div className="bg-destructive/10 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-3">Critical Error</h2>
                        <p className="text-muted-foreground mb-8">
                            A critical error occurred and the application cannot recover automatically.
                        </p>
                        <button
                            onClick={() => reset()}
                            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
                        >
                            <RefreshCw className="h-5 w-5 mr-2" />
                            Reload Application
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}

import React from 'react';

type Props = {
    children: React.ReactNode;
};

type State = {
    hasError: boolean;
};

export default class AppErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch() {
        console.error('Application render failure');
    }

    private retry = () => {
        window.location.reload();
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Application Recovery</p>
                    <h1 className="mt-3 text-2xl font-black text-slate-900">Something went wrong</h1>
                    <p className="mt-3 text-sm leading-relaxed text-slate-500">
                        This screen could not be displayed safely. Retry it, or return to the dashboard.
                    </p>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={this.retry}
                            className="flex-1 rounded-xl bg-brand-emerald px-5 py-3 text-sm font-bold text-white"
                        >
                            Retry
                        </button>
                        <a
                            href="/app"
                            className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700"
                        >
                            Dashboard
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

import { HOW_IT_WORKS_STEPS } from "../../../constant";

export function HowItWorksSection() {
    return (
        <section className="relative py-28 px-6 overflow-hidden border-t border-slate-800/50">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:56px_56px]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,#070B14_100%)]"
            />
            <div className="relative max-w-5xl mx-auto">
                <div className="text-center mb-20">
                    <span className="inline-block text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-4">
                        How it works
                    </span>
                    <h2 className="text-4xl font-extrabold tracking-tight text-white mb-4">
                        From blank canvas to shared diagram<br className="hidden sm:block" /> in under three minutes.
                    </h2>
                </div>
                <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-6">
                    <div
                        aria-hidden
                        className="hidden lg:block absolute top-[52px] left-[calc(16.66%+20px)] right-[calc(16.66%+20px)] h-px bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.4)_20%,rgba(139,92,246,0.4)_50%,rgba(34,211,238,0.3)_80%,transparent)] [mask-image:linear-gradient(90deg,transparent_0%,white_15%,white_85%,transparent_100%)]"
                    />
                    {HOW_IT_WORKS_STEPS.map((step, i) => (
                        <div key={step.number} className="flex flex-col items-center text-center gap-5">
                            <div className="relative flex flex-col items-center gap-2">
                                <span className="font-mono text-xs font-bold tracking-widest bg-[linear-gradient(135deg,#818cf8,#a78bfa)] bg-clip-text text-transparent">
                                    {step.number}
                                </span>
                                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${step.iconBg} transition-transform duration-300 hover:scale-110`}>
                                    <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed max-w-[240px] mx-auto">
                                    {step.body}
                                </p>
                            </div>
                            {i < HOW_IT_WORKS_STEPS.length - 1 && (
                                <div className="lg:hidden flex justify-center">
                                    <div className="w-px h-8 bg-gradient-to-b from-indigo-500/30 to-violet-500/20" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
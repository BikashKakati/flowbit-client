interface LogoProps {
    className?: string;
    textClassName?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({
    className = "",
    textClassName = "",
    size = "md"
}: LogoProps) {
    const textSizes = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-2xl",
        xl: "text-3xl",
    };

    return (
        <span className={`font-bold tracking-tight text-white select-none ${textSizes[size]} ${textClassName} ${className}`}>
            Flows
            <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#818cf8_0%,#a78bfa_40%,#38bdf8_100%)]">
                bit
            </span>
        </span>
    );
}

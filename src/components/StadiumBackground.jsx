import { motion } from 'framer-motion';

export default function StadiumBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-dashboard-bg">
            {/* Dynamic gradients for team colors */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-seahawks-green/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-patriots-red/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>

            {/* Spotlights */}
            <div className="absolute inset-0 opacity-40">
                <div className="absolute top-[-20%] left-[20%] w-[200px] h-[1000px] bg-gradient-to-b from-white/10 to-transparent rotate-[25deg] blur-xl origin-top animate-[spotlight_8s_ease-in-out_infinite_alternate]" />
                <div className="absolute top-[-20%] right-[20%] w-[200px] h-[1000px] bg-gradient-to-b from-white/10 to-transparent rotate-[-25deg] blur-xl origin-top animate-[spotlight_8s_ease-in-out_infinite_alternate]" style={{ animationDelay: '1s' }} />
            </div>

            {/* Fog/Atmosphere */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay" />

            {/* Grid overlay for tech feel */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
        </div>
    );
}

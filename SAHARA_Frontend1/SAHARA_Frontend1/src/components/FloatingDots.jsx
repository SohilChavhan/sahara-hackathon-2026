import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function FloatingDots() {
    const [dots, setDots] = useState([]);

    useEffect(() => {
        const generatedDots = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            size: Math.random() * 12 + 8,
            top: Math.random() * 90 + 5 + '%',
            left: Math.random() * 90 + 5 + '%',
            floatDuration: Math.random() * 3 + 3,
        }));
        setDots(generatedDots);
    }, []);

    return (

        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {dots.map((dot) => (
                <motion.div
                    key={dot.id}

                    drag

                    dragMomentum={true}

                    dragConstraints={{ left: 0, right: window.innerWidth, top: 0, bottom: window.innerHeight }}

                    className="absolute bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)] pointer-events-auto cursor-grab active:cursor-grabbing"
                    style={{
                        width: dot.size,
                        height: dot.size,
                        top: dot.top,
                        left: dot.left,
                    }}

                    animate={{
                        y: [0, -15, 0],
                        x: [0, 10, 0]
                    }}
                    transition={{
                        duration: dot.floatDuration,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}

                    whileHover={{ scale: 1.5, boxShadow: "0 0 25px rgba(255,255,255,1)" }}
                    whileDrag={{ scale: 1.2, backgroundColor: "#D9FDD3" }}
                />
            ))}
        </div>
    );
}

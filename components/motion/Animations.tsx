"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export const FadeIn = ({ children, delay = 0, className, ...props }: HTMLMotionProps<"div"> & { delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay }}
        className={className}
        {...props}
    >
        {children}
    </motion.div>
);

export const StaggerContainer = ({ children, className, ...props }: HTMLMotionProps<"div">) => (
    <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.1
                }
            }
        }}
        className={className}
        {...props}
    >
        {children}
    </motion.div>
);

export const StaggerItem = ({ children, className, ...props }: HTMLMotionProps<"div">) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
        }}
        className={className}
        {...props}
    >
        {children}
    </motion.div>
);

import React from 'react';
import { cn } from "../../lib/utils";
import { motion, type Easing } from 'framer-motion';

interface HeroSectionProps {
  logo?: {
    url: string;
    alt: string;
    text?: string;
  };
  slogan?: string;
  title: React.ReactNode;
  subtitle: string;
  callToAction: {
    text: string;
    href: string;
  };
  backgroundImage: string;
  onCtaClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  ({ className, logo, slogan, title, subtitle, callToAction, backgroundImage, onCtaClick }, ref) => {

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.15,
          delayChildren: 0.2,
        },
      },
    };

    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: "easeOut" as Easing,
        },
      },
    };

    return (
      <motion.section
        ref={ref as any}
        className={cn(
          "relative flex w-full flex-col overflow-hidden bg-background text-foreground md:flex-row",
          className
        )}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex w-full flex-col justify-between p-8 md:w-1/2 md:p-12 lg:w-3/5 lg:p-16">
            <div>
                <motion.header className="mb-12" variants={itemVariants}>
                    {logo && (
                        <div className="flex items-center">
                            <img src={logo.url} alt={logo.alt} className="mr-3 h-8" />
                            <div>
                                {logo.text && <p className="text-lg font-bold text-foreground">{logo.text}</p>}
                                {slogan && <p className="text-xs tracking-wider text-muted-foreground">{slogan}</p>}
                            </div>
                        </div>
                    )}
                </motion.header>

                <motion.main variants={containerVariants}>
                    <motion.h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl" variants={itemVariants}>
                        {title}
                    </motion.h1>
                    <motion.div className="my-6 h-1 w-20 bg-primary" variants={itemVariants}></motion.div>
                    <motion.p className="mb-8 max-w-md text-base text-muted-foreground" variants={itemVariants}>
                        {subtitle}
                    </motion.p>
                    <motion.a href={callToAction.href} onClick={onCtaClick} className="inline-block text-lg font-bold tracking-widest text-primary transition-colors hover:text-primary/80 cursor-pointer" variants={itemVariants}>
                        {callToAction.text}
                    </motion.a>
            </motion.main>
          </div>
        </div>

        <motion.div
          className="w-full min-h-[200px] bg-cover bg-center md:w-1/2 md:min-h-full lg:w-2/5"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
          initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
          animate={{ clipPath: 'polygon(0% 0, 100% 0, 100% 100%, 0% 100%)' }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
        </motion.div>
      </motion.section>
    );
  }
);

HeroSection.displayName = "HeroSection";

export { HeroSection };

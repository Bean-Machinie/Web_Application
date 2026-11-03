import { motion } from "motion/react"

type Props = { text: string; delay: number; stagger?: number; from: string; to: string; className?: string }

// Letter by letter: each bounces in out of a blur while the spacing between them tightens from `from` to `to`.
export function TextEffect({ text, delay, stagger = 0.045, from, to, className }: Props) {
  return (
    <motion.span
      aria-label={text}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { letterSpacing: from },
        visible: { letterSpacing: to, transition: { delay, duration: 0.6, ease: "easeOut", delayChildren: delay, staggerChildren: stagger } },
      }}
      className={className}
    >
      {[...text].map((letter, index) => (
        <motion.span
          key={index}
          aria-hidden
          className="inline-block"
          variants={{ hidden: { opacity: 0, y: 16, filter: "blur(4px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)" } }}
          transition={{ type: "spring", stiffness: 520, damping: 11 }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.span>
  )
}

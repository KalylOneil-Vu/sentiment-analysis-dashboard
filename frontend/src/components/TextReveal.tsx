interface TextRevealProps {
  text: string
  delay?: number // Start delay in ms (default: 0)
  stagger?: number // Delay between each character in ms (default: 30)
  className?: string
}

export function TextReveal({
  text,
  delay = 0,
  stagger = 30,
  className = '',
}: TextRevealProps) {
  return (
    <span className={className}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="char-reveal"
          style={{
            animationDelay: `${delay + index * stagger}ms`,
            // Preserve spaces
            whiteSpace: char === ' ' ? 'pre' : undefined,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  )
}

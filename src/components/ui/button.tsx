import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 tracking-wide',
  {
    variants: {
      variant: {
        default: 'bg-neon-green text-black hover:bg-neon-green/80 hover:shadow-lg hover:shadow-neon-green/20',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border-2 border-white/10 bg-transparent hover:bg-white/5 text-white',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-white/10 hover:text-white text-gray-400',
        link: 'text-primary underline-offset-4 hover:underline',
        quest:
          'bg-neon-orange text-black hover:bg-neon-orange/80 hover:shadow-lg hover:shadow-neon-orange/20',
        guild:
          'bg-neon-purple text-white hover:bg-neon-purple/80 hover:shadow-lg hover:shadow-neon-purple/20',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 px-4 text-xs',
        lg: 'h-14 px-10 text-base',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }


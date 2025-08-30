import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const modalVariants = cva(
  "fixed inset-0 z-50 flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-black/50 backdrop-blur-sm",
        dark: "bg-black/70",
        light: "bg-white/30 backdrop-blur-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const modalContentVariants = cva(
  "relative bg-card border-border shadow-lg rounded-lg max-h-[90vh] overflow-auto",
  {
    variants: {
      size: {
        sm: "max-w-md w-full mx-4",
        md: "max-w-lg w-full mx-4",
        lg: "max-w-2xl w-full mx-4",
        xl: "max-w-4xl w-full mx-4",
        full: "max-w-[95vw] max-h-[95vh] w-full h-full mx-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants>,
    VariantProps<typeof modalContentVariants> {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  showCloseButton?: boolean
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    className, 
    variant, 
    size, 
    isOpen, 
    onClose, 
    title, 
    description, 
    showCloseButton = true,
    children, 
    ...props 
  }, ref) => {
    // Handle escape key
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose()
        }
      }

      if (isOpen) {
        document.addEventListener('keydown', handleEscape)
        document.body.style.overflow = 'hidden'
      }

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const modal = (
      <div
        className={cn(modalVariants({ variant }), className)}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
        {...props}
      >
        <div 
          ref={ref}
          className={cn(modalContentVariants({ size }))}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || description || showCloseButton) && (
            <div className="flex items-start justify-between p-6 border-b border-border">
              <div className="flex-1">
                {title && (
                  <h2 className="text-lg font-semibold text-primary">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-secondary">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="ml-4 text-secondary hover:text-primary transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    )

    return createPortal(modal, document.body)
  }
)

Modal.displayName = "Modal"

export { Modal, modalVariants, modalContentVariants } 
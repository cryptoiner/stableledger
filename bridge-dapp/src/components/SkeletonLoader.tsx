interface SkeletonLoaderProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  lines?: number
}

export default function SkeletonLoader({ 
  className = '', 
  variant = 'text', 
  width, 
  height, 
  lines = 1 
}: SkeletonLoaderProps) {
  const baseClasses = 'bg-gray-200 animate-pulse'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  }
  
  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height
  
  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              ...style,
              width: index === lines - 1 ? '70%' : '100%'
            }}
          />
        ))}
      </div>
    )
  }
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

// Predefined skeleton components
export function BalanceCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border p-6 lg:p-8">
      <div className="flex items-center mb-6">
        <SkeletonLoader variant="circular" width={48} height={48} className="mr-4" />
        <div className="flex-1">
          <SkeletonLoader width="40%" height={24} className="mb-2" />
          <SkeletonLoader width="60%" height={16} />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <SkeletonLoader width="30%" height={14} className="mb-2" />
          <SkeletonLoader width="80%" height={28} />
        </div>
        <div>
          <SkeletonLoader width="30%" height={14} className="mb-2" />
          <SkeletonLoader width="60%" height={28} />
        </div>
      </div>
    </div>
  )
}

export function FeatureCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-6">
        <SkeletonLoader variant="circular" width={64} height={64} />
        <div className="flex-1">
          <SkeletonLoader width="60%" height={32} className="mb-2" />
          <SkeletonLoader width="80%" height={20} />
        </div>
      </div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <SkeletonLoader width="40%" height={16} />
          <SkeletonLoader width="20%" height={16} />
        </div>
        <SkeletonLoader height={8} className="rounded-full" />
      </div>
      <SkeletonLoader height={48} className="rounded-xl" />
    </div>
  )
}

export function TransactionSkeleton() {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-start space-x-3">
        <SkeletonLoader variant="circular" width={32} height={32} />
        <div className="flex-1">
          <SkeletonLoader width="40%" height={16} className="mb-1" />
          <SkeletonLoader width="80%" height={14} className="mb-2" />
          <SkeletonLoader width="60%" height={14} />
        </div>
      </div>
    </div>
  )
}
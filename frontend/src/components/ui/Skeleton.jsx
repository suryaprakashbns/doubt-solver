// ─────────────────────────────────────────────
// components/ui/Skeleton.jsx
//
// Skeleton loaders show placeholder shapes
// while real content is loading. Far better UX
// than a spinner — the user can see the page
// layout forming before data arrives.
//
// Every major app (YouTube, LinkedIn, Facebook)
// uses skeleton loading. It's an expected
// professional pattern.
// ─────────────────────────────────────────────

// Base skeleton block — a gray pulsing rectangle
export const SkeletonBlock = ({ className = '' }) => (
  <div
    className={`bg-gray-100 rounded animate-pulse ${className}`}
    aria-hidden="true"
  />
)

// A skeleton that mimics a question card
export const QuestionCardSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-3">
    <div className="flex gap-4">
      {/* Vote/answer stat column */}
      <div className="flex flex-col gap-3 items-center min-w-[40px]">
        <SkeletonBlock className="w-8 h-8 rounded-lg" />
        <SkeletonBlock className="w-8 h-8 rounded-lg" />
        <SkeletonBlock className="w-8 h-8 rounded-lg" />
      </div>

      {/* Content column */}
      <div className="flex-1">
        <SkeletonBlock className="h-5 w-3/4 mb-2" />
        <SkeletonBlock className="h-4 w-full mb-1" />
        <SkeletonBlock className="h-4 w-2/3 mb-4" />

        {/* Tags */}
        <div className="flex gap-2 mb-4">
          <SkeletonBlock className="h-5 w-14 rounded-full" />
          <SkeletonBlock className="h-5 w-16 rounded-full" />
          <SkeletonBlock className="h-5 w-12 rounded-full" />
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2">
          <SkeletonBlock className="w-6 h-6 rounded-full" />
          <SkeletonBlock className="h-3 w-32" />
        </div>
      </div>
    </div>
  </div>
)
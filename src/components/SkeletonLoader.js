import React from 'react';

// Base skeleton component with pulse animation
export const Skeleton = ({ className = '', width = 'w-full', height = 'h-4' }) => (
  <div className={`${width} ${height} bg-gray-200 rounded animate-pulse ${className}`}></div>
);

// Card skeleton for project cards
export const ProjectCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-fadeInUp">
    {/* Status Badge */}
    <div className="flex justify-between items-start mb-6">
      <Skeleton width="w-3/4" height="h-6" />
      <Skeleton width="w-20" height="h-8" className="rounded-full" />
    </div>

    {/* Content */}
    <div className="space-y-4">
      {/* Type */}
      <div className="flex items-center gap-3">
        <Skeleton width="w-10" height="h-10" className="rounded-lg" />
        <div className="flex-1">
          <Skeleton width="w-16" height="h-3" className="mb-1" />
          <Skeleton width="w-24" height="h-5" />
        </div>
      </div>

      {/* Data Sources */}
      <div className="flex items-center gap-3">
        <Skeleton width="w-10" height="h-10" className="rounded-lg" />
        <div className="flex-1">
          <Skeleton width="w-24" height="h-3" className="mb-1" />
          <div className="flex gap-1 mt-2">
            <Skeleton width="w-16" height="h-6" className="rounded-full" />
            <Skeleton width="w-16" height="h-6" className="rounded-full" />
            <Skeleton width="w-16" height="h-6" className="rounded-full" />
          </div>
        </div>
      </div>

      {/* Owner */}
      <div className="flex items-center gap-3">
        <Skeleton width="w-10" height="h-10" className="rounded-lg" />
        <div className="flex-1">
          <Skeleton width="w-16" height="h-3" className="mb-1" />
          <Skeleton width="w-32" height="h-5" />
        </div>
      </div>

      {/* Department */}
      <div className="flex items-center gap-3">
        <Skeleton width="w-10" height="h-10" className="rounded-lg" />
        <div className="flex-1">
          <Skeleton width="w-20" height="h-3" className="mb-1" />
          <Skeleton width="w-28" height="h-5" />
        </div>
      </div>

      {/* Readiness Score */}
      <div className="pt-4 border-t border-gray-100">
        <Skeleton width="w-32" height="h-3" className="mb-2" />
        <div className="flex items-center gap-3">
          <Skeleton width="w-full" height="h-3" className="rounded-full" />
          <Skeleton width="w-12" height="h-6" />
        </div>
      </div>
    </div>
  </div>
);

// Chart skeleton for dashboard
export const ChartSkeleton = ({ height = 'h-80' }) => (
  <div className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 ${height}`}>
    <Skeleton width="w-48" height="h-6" className="mb-6" />
    <Skeleton width="w-full" height="h-full" className="rounded-lg" />
  </div>
);

// Metric card skeleton for dashboard
export const MetricCardSkeleton = () => (
  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
    <Skeleton width="w-32" height="h-5" className="mb-4 bg-white/20" />
    <Skeleton width="w-24" height="h-10" className="mb-2 bg-white/30" />
    <Skeleton width="w-40" height="h-4" className="bg-white/20" />
  </div>
);

// Table skeleton for data grid
export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
    {/* Table Header */}
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200 p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} width="w-full" height="h-5" />
        ))}
      </div>
    </div>

    {/* Table Rows */}
    <div className="divide-y divide-gray-200">
      {[...Array(rows)].map((_, rowIdx) => (
        <div key={rowIdx} className="p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(columns)].map((_, colIdx) => (
              <Skeleton key={colIdx} width="w-full" height="h-4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Profile skeleton
export const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto">
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
        <Skeleton width="w-24" height="h-24" className="rounded-full" />
        <div className="flex-1">
          <Skeleton width="w-48" height="h-8" className="mb-2" />
          <Skeleton width="w-64" height="h-5" />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
            <Skeleton width="w-32" height="h-5" className="mb-3" />
            <Skeleton width="w-40" height="h-6" />
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center p-4 bg-gray-50 rounded-xl">
            <Skeleton width="w-16" height="h-8" className="mx-auto mb-2" />
            <Skeleton width="w-24" height="h-4" className="mx-auto" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Project Detail skeleton
export const ProjectDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    {/* Header */}
    <div className="mb-8">
      <Skeleton width="w-64" height="h-10" className="mb-4" />
      <div className="flex gap-4">
        <Skeleton width="w-32" height="h-10" className="rounded-lg" />
        <Skeleton width="w-32" height="h-10" className="rounded-lg" />
        <Skeleton width="w-32" height="h-10" className="rounded-lg" />
      </div>
    </div>

    {/* Content */}
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <TableSkeleton rows={8} columns={6} />
    </div>
  </div>
);

export default Skeleton;

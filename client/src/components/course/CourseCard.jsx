import { Link } from 'react-router-dom';
import { Star, Users, BookOpen, Clock } from 'lucide-react';

const LEVEL_COLOR = {
  beginner:     'badge-green',
  intermediate: 'badge-yellow',
  advanced:     'badge-red',
};

export default function CourseCard({ course }) {
  const effectivePrice = course.discountPrice || course.price;
  const hasDiscount    = course.discountPrice && parseFloat(course.discountPrice) < parseFloat(course.price);
  const isFree         = course.isFree || !parseFloat(effectivePrice);

  return (
    <Link
      to={`/courses/${course.slug}`}
      className="card-hover flex flex-col overflow-hidden group animate-fade-in"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-surface-100">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-violet-500">
            <BookOpen size={40} className="text-white/60" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {isFree && <span className="badge badge-green shadow-sm">Free</span>}
          <span className={`badge ${LEVEL_COLOR[course.level] || 'badge-gray'} shadow-sm capitalize`}>{course.level}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        <h3 className="font-semibold text-ink text-sm leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>

        {course.instructor && (
          <p className="text-xs text-ink-muted">{course.instructor.name}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={12} className={s <= Math.round(parseFloat(course.rating)) ? 'text-amber-400 fill-amber-400' : 'text-surface-200 fill-surface-200'} />
            ))}
          </div>
          <span className="text-xs font-semibold text-ink">{parseFloat(course.rating).toFixed(1)}</span>
          <span className="text-xs text-ink-light">({(course.totalEnrollments || 0).toLocaleString()})</span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="flex items-center gap-1"><BookOpen size={11} />{course.totalLessons} lessons</span>
          <span className="flex items-center gap-1"><Users size={11} />{(course.totalEnrollments || 0).toLocaleString()}</span>
          {course.language && <span className="flex items-center gap-1"><Clock size={11} />{course.language}</span>}
        </div>

        {/* Price */}
        <div className="mt-auto pt-2.5 border-t border-surface-100 flex items-baseline gap-2">
          {isFree ? (
            <span className="text-base font-bold text-emerald-600">Free</span>
          ) : (
            <>
              <span className="text-base font-bold text-ink">₹{Number(effectivePrice).toLocaleString('en-IN')}</span>
              {hasDiscount && (
                <span className="text-xs text-ink-light line-through">₹{Number(course.price).toLocaleString('en-IN')}</span>
              )}
              {hasDiscount && (
                <span className="badge badge-red ml-auto">
                  {Math.round((1 - parseFloat(course.discountPrice) / parseFloat(course.price)) * 100)}% off
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

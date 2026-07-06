/* eslint-disable react/prop-types */
import { Star } from "lucide-react";

function toFiniteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

export function getProgramGuruRating(program = {}) {
    const summary =
        program?.program_guru_rating ||
        program?.guru_rating_summary ||
        program?.rating_guru_summary ||
        {};

    const average = toFiniteNumber(
        summary?.average_rating ??
        summary?.average ??
        program?.guru_average_rating ??
        program?.average_guru_rating ??
        program?.rating_guru_average,
    );

    const count = toFiniteNumber(
        summary?.guru_rating_count ??
        summary?.total_guru ??
        program?.guru_rating_count ??
        program?.rating_guru_count,
    );

    const submissions = toFiniteNumber(
        summary?.total_rating ??
        program?.guru_rating_submission_count ??
        program?.guru_rating_total,
        count,
    );

    return {
        average: Math.min(Math.max(average, 0), 5),
        count: Math.max(count, 0),
        submissions: Math.max(submissions, 0),
    };
}

function formatRatingTitle({ average, count, submissions }) {
    if (!count && !submissions) return "Belum ada rating guru";

    const averageText = average.toLocaleString("id-ID", {
        minimumFractionDigits: average % 1 === 0 ? 0 : 1,
        maximumFractionDigits: 1,
    });

    const guruText = count ? `${count} guru` : `${submissions} rating`;
    return `Rating guru ${averageText} dari ${guruText} yang mengisi`;
}

export default function ProgramRatingStars({
    program,
    size = 14,
    className = "",
    compact = false,
}) {
    const rating = getProgramGuruRating(program);
    const filledStars = Math.round(rating.average);
    const label = rating.count
        ? `${rating.count} guru mengisi`
        : "Belum ada rating";

    return (
        <div
            className={`inline-flex flex-col gap-1 ${className}`}
            title={formatRatingTitle(rating)}
            aria-label={formatRatingTitle(rating)}
        >
            <div className="inline-flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => {
                    const active = index < filledStars;

                    return (
                        <Star
                            key={index}
                            size={size}
                            strokeWidth={2.3}
                            className={
                                active
                                    ? "text-amber-400"
                                    : "text-slate-300"
                            }
                            fill={active ? "currentColor" : "none"}
                        />
                    );
                })}
            </div>

            {!compact && (
                <span className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                    {label}
                </span>
            )}
        </div>
    );
}

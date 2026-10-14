import { useEffect, useMemo, useState } from 'react';
import type { CompanyReview } from '@/types/dashboard';
import type { CompanySummary } from '@/types/dashboard';

type ReviewSummary = { count: number; average: number; distribution: Record<number, number> };
const Stars = ({ rating }: { rating: number }) => <span aria-label={`${rating} de 5 estrellas`} className="review-stars">{[1, 2, 3, 4, 5].map((star) => <span key={star}>{star <= rating ? '★' : '☆'}</span>)}</span>;
const dateLabel = (value: string) => new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(value));

export function ReviewsPanel({ reviews, summary, admin = false, companies = [], selectedCompanyId, onCompanyChange }: { reviews: CompanyReview[]; summary?: ReviewSummary | null; admin?: boolean; companies?: CompanySummary[]; selectedCompanyId?: number; onCompanyChange?: (companyId?: number) => void }) {
  const [rating, setRating] = useState('');
  const [commentsOnly, setCommentsOnly] = useState(false);
  const [companyQuery, setCompanyQuery] = useState('');
  useEffect(() => { setCompanyQuery(companies.find((company) => company.id === selectedCompanyId)?.name || ''); }, [companies, selectedCompanyId]);
  const reviewList = Array.isArray(reviews) ? reviews : [];
  const calculated = useMemo<ReviewSummary>(() => { const distribution = Object.fromEntries([1, 2, 3, 4, 5].map((value) => [value, 0])) as Record<number, number>; reviewList.forEach((review) => { distribution[review.rating] = (distribution[review.rating] || 0) + 1; }); const count = reviewList.length; return { count, average: count ? reviewList.reduce((total, review) => total + review.rating, 0) / count : 0, distribution }; }, [reviewList]);
  const data = summary || calculated;
  const visible = useMemo(() => reviewList.filter((review) => (!rating || review.rating === Number(rating)) && (!commentsOnly || Boolean(review.comment?.trim()))), [reviewList, rating, commentsOnly]);
  const maxCount = Math.max(...Object.values(data.distribution), 1);
  const writtenComments = reviewList.filter((review) => Boolean(review.comment?.trim())).length;
  const authorInitial = (review: CompanyReview) => ((admin ? review.company?.name : review.customer?.name) || 'C').slice(0, 1).toUpperCase();

  return <section className="reviews-panel">
    <div className="reviews-overview">
      <article className="reviews-score-card"><span className="reviews-overview__eyebrow">Reputación actual</span><div className="reviews-score-card__number">{data.average.toFixed(1)}</div><Stars rating={Math.round(data.average)} /><small>Basado en {data.count} calificación{data.count === 1 ? '' : 'es'}</small></article>
      <article className="reviews-distribution"><span className="reviews-overview__eyebrow">Distribución</span>{[5, 4, 3, 2, 1].map((value) => { const count = data.distribution[value] || 0; return <div className="reviews-distribution__row" key={value}><span>{value}</span><span className="reviews-distribution__star">★</span><div className="reviews-distribution__track"><i style={{ width: `${(count / maxCount) * 100}%` }} /></div><strong>{count}</strong></div>; })}</article>
      <article className="reviews-insight-card"><span className="reviews-overview__eyebrow">Comentarios</span><strong>{writtenComments}</strong><small>opiniones escritas por clientes</small></article>
    </div>
    <div className="reviews-toolbar"><div><span className="reviews-toolbar__eyebrow">Opiniones recibidas</span><strong>{visible.length} resultado{visible.length === 1 ? '' : 's'}</strong></div><div className="reviews-toolbar__filters">{admin && <label>Empresa<input aria-label="Buscar empresa" list="review-companies" onChange={(event) => { const value = event.target.value; setCompanyQuery(value); const company = companies.find((item) => item.name.toLocaleLowerCase() === value.trim().toLocaleLowerCase()); onCompanyChange?.(company?.id); }} placeholder="Buscar empresa..." value={companyQuery} /><datalist id="review-companies">{companies.map((company) => <option key={company.id} value={company.name} />)}</datalist></label>}<label>Calificación<select value={rating} onChange={(event) => setRating(event.target.value)}><option value="">Todas las estrellas</option>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} estrellas</option>)}</select></label><label className="reviews-checkbox"><input checked={commentsOnly} onChange={(event) => setCommentsOnly(event.target.checked)} type="checkbox" /><span>Solo comentarios</span></label></div></div>
    <div className="reviews-list">{visible.map((review) => <article className="review-card" key={review.id}><header className="review-card__header"><div className="review-avatar">{authorInitial(review)}</div><div><strong>{admin ? review.company?.name || 'Empresa' : review.customer ? `${review.customer.name} ${review.customer.last_name}` : 'Cliente'}</strong><small>{review.order?.order_number || 'Pedido'} · {dateLabel(review.created_at)}</small></div><Stars rating={review.rating} /></header>{review.comment?.trim() ? <p className="review-card__comment">“{review.comment}”</p> : <p className="review-card__empty-comment">El cliente dejó una calificación sin comentario.</p>}</article>)}{!visible.length && <div className="reviews-empty"><div>☆</div><strong>No encontramos calificaciones</strong><p>Prueba ajustando los filtros para ver más resultados.</p></div>}</div>
  </section>;
}

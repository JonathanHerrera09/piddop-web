import { CompanyCoverageBoundary, CoveragePoint } from '@/types/dashboard';

export function pointInPolygon(point: CoveragePoint, polygon: CoveragePoint[]) {
  if (polygon.length < 3) return true;
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];
    const intersects = currentPoint.latitude > point.latitude !== previousPoint.latitude > point.latitude &&
      point.longitude < ((previousPoint.longitude - currentPoint.longitude) * (point.latitude - currentPoint.latitude)) /
      ((previousPoint.latitude - currentPoint.latitude) || Number.EPSILON) + currentPoint.longitude;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function isPointWithinCoverage(point: CoveragePoint, coverage: CompanyCoverageBoundary | null) {
  if (!coverage?.enabled || coverage.polygon.length < 3) return true;
  return pointInPolygon(point, coverage.polygon);
}

import { forwardRef } from 'react';
import { renardPoints } from './silhouette';

/**
 * Le renard : une silhouette géométrique à dix sommets, interpolée entre quatre
 * états selon le rang. Il n'existe qu'à cet état de discrétion, dans l'avatar
 * du rail (décision ouverte du paquet de passation : le faire traverser la
 * page en grand n'est pas tranché). L'orange lui appartient et n'appartient
 * qu'à lui.
 *
 * Le `polygon` est exposé par référence : le rail le réécrit à chaque image
 * de défilement, hors de React, comme le reste du rail.
 */
const Renard = forwardRef<SVGPolygonElement, { t: number; size?: number; fill?: string }>(function Renard(
  { t, size = 30, fill = '#d9743f' },
  ref
) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <polygon ref={ref} points={renardPoints(t)} fill={fill} />
    </svg>
  );
});

export default Renard;

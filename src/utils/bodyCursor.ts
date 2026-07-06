export type BodyCursor = 'auto' | 'pointer';

export function setBodyCursor(cursor: BodyCursor) {
  document.body.style.cursor = cursor;
}

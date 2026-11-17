/**
 * One place decides what may become a current map point.
 *
 * A `collection-institution` or `in-situ` assertion says where the object is
 * documented to be now (as of the cited source). A `last-known` assertion is a
 * historical statement — the object was there at some past date — and `unknown`
 * is no statement at all. Neither may be drawn as a present-day collection
 * marker, even though both stay readable in the record list.
 */

import type { CollectionAssertion, LocationKind, ObjectRecord } from './types';

const CURRENT_LOCATION_KINDS: ReadonlySet<LocationKind> = new Set<LocationKind>([
  'collection-institution',
  'in-situ',
]);

export function isCurrentLocationKind(kind: LocationKind): boolean {
  return CURRENT_LOCATION_KINDS.has(kind);
}

export function isCurrentLocation(collection: CollectionAssertion | null | undefined): boolean {
  if (!collection) return false;
  return isCurrentLocationKind(collection.locationKind);
}

/**
 * The place id that may be used for a current map point, or null when the
 * assertion is historical, unknown, or names no place.
 */
export function currentPlaceId(object: ObjectRecord): string | null {
  const collection = object.currentCollection;
  if (!collection || !isCurrentLocation(collection)) return null;
  return collection.placeId;
}

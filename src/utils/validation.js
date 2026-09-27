export const validateSpatialUnit = (unit, building, floor) => {
  const results = [];

  // 1. Building exists
  results.push({
    label: "Building reference valid",
    valid: !!building,
  });

  // 2. Floor exists
  results.push({
    label: "Floor reference valid",
    valid: !!floor,
  });

  // 3. Unit belongs to floor
  results.push({
    label: "Unit reference valid",
    valid: unit.floorId === floor?.id,
  });

  // 4. Vertical coordinates valid
  results.push({
    label: "Vertical coordinates valid",
    valid: unit.zBottom < unit.zTop && unit.zBottom >= 0,
  });

  // 5. Geometry valid
  results.push({
    label: "Geometry valid",
    valid: typeof unit.x === 'number' && typeof unit.y === 'number' && typeof unit.z === 'number',
  });

  const isAllValid = results.every(r => r.valid);

  return {
    isValid: isAllValid,
    details: results,
    status: isAllValid ? "Validated" : "Needs Review",
  };
};

// ─── 3D Bounding-Box Intersection ────────────────────────────────────────────

/**
 * Check if two 3D axis-aligned bounding boxes overlap.
 * Each box: { xMin, xMax, yMin, yMax, zMin, zMax }
 */
export function boxesOverlap(a, b) {
  if (!a || !b) return false;
  return (
    a.xMin < b.xMax && a.xMax > b.xMin &&
    a.yMin < b.yMax && a.yMax > b.yMin &&
    a.zMin < b.zMax && a.zMax > b.zMin
  );
}

/**
 * Compute the intersection volume of two overlapping bounding boxes.
 * Returns 0 if they don't overlap.
 */
export function intersectionVolume(a, b) {
  if (!boxesOverlap(a, b)) return 0;
  const dx = Math.min(a.xMax, b.xMax) - Math.max(a.xMin, b.xMin);
  const dy = Math.min(a.yMax, b.yMax) - Math.max(a.yMin, b.yMin);
  const dz = Math.min(a.zMax, b.zMax) - Math.max(a.zMin, b.zMin);
  return dx * dy * dz;
}

/**
 * Validate topology across all units — detects real 3D bounding-box overlaps.
 * Returns structured conflict information.
 */
export function validateTopology(units) {
  const conflicts = [];

  for (let i = 0; i < units.length; i++) {
    for (let j = i + 1; j < units.length; j++) {
      const a = units[i];
      const b = units[j];

      if (!a.bounds || !b.bounds) continue;

      if (boxesOverlap(a.bounds, b.bounds)) {
        const vol = intersectionVolume(a.bounds, b.bounds);
        conflicts.push({
          unitA: a.ulpin,
          unitB: b.ulpin,
          unitAId: a.id,
          unitBId: b.id,
          unitAType: a.type,
          unitBType: b.type,
          unitACategory: a.unitCategory || 'residential',
          unitBCategory: b.unitCategory || 'residential',
          type: '3D_OVERLAP',
          details: `3D bounding-box overlap between ${a.unitNumber} (${a.type}) and ${b.unitNumber} (${b.type}) — intersection volume ${vol.toFixed(1)} m³`,
          boundsA: { ...a.bounds },
          boundsB: { ...b.bounds },
          intersectionVolume: vol,
        });
      }
    }
  }

  return {
    valid: conflicts.length === 0,
    conflicts,
    totalUnitsChecked: units.length,
  };
}

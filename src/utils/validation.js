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

export const generate3DIdentifier = (buildingCode, floorNumber, unitNumber) => {
  const fCode = `F${String(floorNumber).padStart(3, '0')}`;
  const uCode = `U${String(unitNumber).padStart(3, '0')}`;
  return `PROTOTYPE-${buildingCode.toUpperCase()}-${fCode}-${uCode}`;
};

export const generatePropertyId = (buildingCode, floorNumber, unitNumber) => {
  return `${buildingCode.toUpperCase()}-${String(floorNumber).padStart(3, '0')}-${unitNumber}`;
};

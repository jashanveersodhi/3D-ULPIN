import numpy as np
from shapely.geometry import Polygon, shape
import geopandas as gpd
from typing import Tuple, List

class SpatialUtils:
    @staticmethod
    def calculate_area(coordinates: List[Tuple[float, float]], gsd: float = 1.0) -> float:
        """
        Calculate the real-world area of a polygon.
        gsd: Ground Sample Distance (meters per pixel)
        """
        poly = Polygon(coordinates)
        # If coordinates are in pixels, multiply by gsd^2
        return poly.area * (gsd ** 2)

    @staticmethod
    def calculate_perimeter(coordinates: List[Tuple[float, float]], gsd: float = 1.0) -> float:
        """
        Calculate the real-world perimeter of a polygon.
        """
        poly = Polygon(coordinates)
        return poly.length * gsd

    @staticmethod
    def get_centroid(coordinates: List[Tuple[float, float]]) -> Tuple[float, float]:
        """
        Get the centroid of a polygon.
        """
        poly = Polygon(coordinates)
        centroid = poly.centroid
        return (centroid.x, centroid.y)

    @staticmethod
    def convert_mask_to_polygon(mask: np.ndarray) -> List[List[float]]:
        """
        Placeholder for OpenCV contour detection logic.
        Converts a binary mask to a list of coordinates.
        """
        # In real implementation, use cv2.findContours
        # This is a mock implementation returning a square
        return [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]

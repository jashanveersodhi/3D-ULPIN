from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="3D ULPIN AI Geospatial Backend")

# Pydantic models for API
class FeatureProperties(BaseModel):
    building_id: str
    area_sq_m: float
    perimeter_m: float
    estimated_floors: int
    estimated_height: float
    confidence: float
    status: str

class GeoJSONGeometry(BaseModel):
    type: str
    coordinates: List[List[List[float]]]

class Feature(BaseModel):
    type: str = "Feature"
    properties: FeatureProperties
    geometry: GeoJSONGeometry

class FeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[Feature]

@app.get("/")
async def root():
    return {"message": "3D ULPIN AI Geospatial Backend is running"}

@app.post("/api/v1/extract/process")
async def process_extraction(file: UploadFile = File(...)):
    # This will eventually trigger the AI pipeline
    return {"job_id": "job_12345", "status": "processing", "message": "Image uploaded and extraction started"}

@app.get("/api/v1/extract/results/{job_id}", response_model=FeatureCollection)
async def get_results(job_id: str):
    # Mock data for prototype demonstration
    mock_feature = Feature(
        properties=FeatureProperties(
            building_id="BLD-001",
            area_sq_m=228.4,
            perimeter_m=61.4,
            estimated_floors=3,
            estimated_height=12.5,
            confidence=0.94,
            status="AI_DETECTED"
        ),
        geometry=GeoJSONGeometry(
            type="Polygon",
            coordinates=[[[73.8567, 18.5204], [73.8568, 18.5204], [73.8568, 18.5205], [73.8567, 18.5205], [73.8567, 18.5204]]]
        )
    )
    return FeatureCollection(features=[mock_feature])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """Health check endpoint. Unlike your understanding of physics, this should always return 200."""
    return {
        "status": "healthy",
        "message": "Dr. Cooper is in. Unfortunately for you.",
    }

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """Health check endpoint. Always returns status information."""
    return {
        "status": "healthy",
        "message": "Study workspace API is online.",
    }

from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "WELLTWIN"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DESCRIPTION: str = (
        "AI-Powered Well-to-Surface Digital Twin for CSS and SRP Optimization "
        "in Baghewala Heavy-Oil Field. Prototype Decision-Support System."
    )
    
    # Environment & Storage
    ENVIRONMENT: str = "demo"
    PORT: int = 8000
    DATABASE_URL: str = "sqlite:///./welltwin.db"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    
    # Baghewala Field Engineering Defaults
    FIELD_NAME: str = "Baghewala Heavy-Oil Field, Bikaner-Nagaur Basin"
    DEFAULT_WELL_ID: str = "BGH-01"
    
    # Baghewala heavy oil reservoir defaults
    INITIAL_RESERVOIR_TEMP_C: float = 58.0   # Baseline reservoir temp in Celsius
    STEAM_TEMPERATURE_C: float = 300.0        # Typical CSS saturated steam temp
    OIL_API_GRAVITY: float = 17.5             # Heavy oil API
    DEAD_OIL_VISCOSITY_BASE_CP: float = 8500.0 # Viscosity at initial cold reservoir temp (cP)
    FRACTURE_GRADIENT_BAR: float = 145.0      # Safety cap for injection pressure
    MAX_SRP_SPM: float = 12.0                 # Max pump SPM for heavy viscous oil to prevent rod floating
    MIN_SRP_SPM: float = 2.0
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

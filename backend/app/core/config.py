from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    debug: bool = True
    database_url: str
    jwt_secret: str
    jwt_access_ttl_min: int = 15

settings = Settings()
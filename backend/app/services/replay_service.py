import asyncio
from typing import Dict, Any, List, Optional
from app.services.dataset_service import dataset_service

class ReplayService:
    """
    Simulates continuous time-series arrival for Replay Mode.
    Allows engineers and operators to observe live telemetry evolution,
    thermal decay events, and automated optimization triggers.
    """

    def __init__(self):
        self.active_well_id: str = "BGH-01"
        self.is_playing: bool = True
        self.speed_multiplier: float = 1.0
        self.current_step_index: int = 40 # Near mature cooling point for demo
        self.subscribers: List[asyncio.Queue] = []

    def get_state(self) -> Dict[str, Any]:
        buffer = dataset_service.get_telemetry_history(self.active_well_id, limit=60)
        total_steps = len(buffer)
        step = min(self.current_step_index, total_steps - 1) if total_steps > 0 else 0
        point = buffer[step] if total_steps > 0 else {}

        return {
            "well_id": self.active_well_id,
            "is_playing": self.is_playing,
            "speed_multiplier": self.speed_multiplier,
            "current_step": step,
            "total_steps": total_steps,
            "current_telemetry": point,
            "mode": "REPLAY"
        }

    def set_control(self, action: str, speed: Optional[float] = None, well_id: Optional[str] = None) -> Dict[str, Any]:
        if well_id:
            self.active_well_id = well_id
        if speed is not None:
            self.speed_multiplier = max(0.5, min(speed, 10.0))
        
        buffer = dataset_service.get_telemetry_history(self.active_well_id, limit=60)
        total_steps = len(buffer)

        if action == "PLAY":
            self.is_playing = True
        elif action == "PAUSE":
            self.is_playing = False
        elif action == "STEP_FORWARD":
            self.current_step_index = min(self.current_step_index + 1, total_steps - 1)
        elif action == "STEP_BACKWARD":
            self.current_step_index = max(self.current_step_index - 1, 0)
        elif action == "RESET":
            self.current_step_index = 0
            self.is_playing = True

        return self.get_state()

    def advance_step(self):
        if self.is_playing:
            buffer = dataset_service.get_telemetry_history(self.active_well_id, limit=60)
            if buffer:
                self.current_step_index = (self.current_step_index + 1) % len(buffer)

replay_service = ReplayService()

from typing import Optional, List
import httpx
from app.config import settings


class LLMClient:
    """Client for interacting with LLM providers."""
    
    def __init__(self):
        self.provider = self._determine_provider()
        self.api_key = self._get_api_key()
        self.model = self._get_model()
    
    def _determine_provider(self) -> str:
        """Determine which LLM provider to use."""
        if settings.openai_api_key:
            return "openai"
        elif settings.anthropic_api_key:
            return "anthropic"
        elif settings.gemini_api_key:
            return "gemini"
        return "openai"  # Default
    
    def _get_api_key(self) -> str:
        """Get the API key for the configured provider."""
        if self.provider == "openai":
            return settings.openai_api_key
        elif self.provider == "anthropic":
            return settings.anthropic_api_key
        elif self.provider == "gemini":
            return settings.gemini_api_key
        return ""
    
    def _get_model(self) -> str:
        """Get the model name for the configured provider."""
        if self.provider == "openai":
            return settings.openai_model
        elif self.provider == "anthropic":
            return settings.anthropic_model
        elif self.provider == "gemini":
            return settings.gemini_model
        return "gpt-4o-mini"
    
    async def generate_response(
        self,
        messages: List[dict],
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> str:
        """Generate a response from the LLM."""
        if not self.api_key:
            raise ValueError("No API key configured for LLM provider")
        
        if self.provider == "openai":
            return await self._call_openai(messages, system_instruction, temperature, max_tokens)
        elif self.provider == "anthropic":
            return await self._call_anthropic(messages, system_instruction, temperature, max_tokens)
        elif self.provider == "gemini":
            return await self._call_gemini(messages, system_instruction, temperature, max_tokens)
        
        raise ValueError(f"Unsupported provider: {self.provider}")
    
    async def _call_openai(
        self,
        messages: List[dict],
        system_instruction: Optional[str],
        temperature: float,
        max_tokens: Optional[int]
    ) -> str:
        """Call OpenAI API."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature
        }
        
        if system_instruction:
            payload["messages"] = [{"role": "system", "content": system_instruction}] + messages
        
        if max_tokens:
            payload["max_tokens"] = max_tokens
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    async def _call_anthropic(
        self,
        messages: List[dict],
        system_instruction: Optional[str],
        temperature: float,
        max_tokens: Optional[int]
    ) -> str:
        """Call Anthropic API."""
        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        
        # Convert messages to Anthropic format
        user_message = ""
        for msg in messages:
            if msg["role"] == "user":
                user_message += msg["content"] + "\n"
        
        payload = {
            "model": self.model,
            "max_tokens": max_tokens or 1024,
            "messages": [{"role": "user", "content": user_message}],
            "temperature": temperature
        }
        
        if system_instruction:
            payload["system"] = system_instruction
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            return data["content"][0]["text"]
    
    async def _call_gemini(
        self,
        messages: List[dict],
        system_instruction: Optional[str],
        temperature: float,
        max_tokens: Optional[int]
    ) -> str:
        """Call Google Gemini API."""
        headers = {
            "Content-Type": "application/json"
        }
        
        # Convert messages to Gemini format
        contents = []
        for msg in messages:
            if msg["role"] == "user":
                contents.append({"role": "user", "parts": [{"text": msg["content"]}]})
            elif msg["role"] == "assistant":
                contents.append({"role": "model", "parts": [{"text": msg["content"]}]})
        
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens or 1024
            }
        }
        
        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

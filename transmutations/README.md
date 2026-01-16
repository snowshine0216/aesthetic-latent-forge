# 💎 The Transmutations

This chamber holds the standard formulas. To ensure every creation out of the Forge is of the highest pedigree, we follow these established patterns.

## 🏺 Catalog of Archetypes

### Laboratory Chambers
- **[agents]**: This chamber contains materials and blueprints for crafting autonomous agents.

### Boilerplates
- **[Next.js Alchemist Starter]**: The perfect base for a new experimental application.
- **[Package Blueprint]**: The standard structure for a new shared library.

## 🛠️ Environment Setup & Alchemy

We use **uv** for lightning-fast dependency management and environment isolation.

### 1. Environment Configuration
Create or update your `.env` file in the `transmutations` directory with the following reagents:
```env
OPENAI_API_KEY=your_key
OPENAI_API_BASE=your_base_url
PUSHOVER_USER=your_user_id
PUSHOVER_TOKEN=your_app_token
```

*Note: To use a customized OpenAI key, load the environment with `override=True` and initialize the client as follows:*
```python
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(override=True)
openai_api_key = os.getenv('OPENAI_API_KEY')
openai_api_base = os.getenv('OPENAI_API_BASE')
openai = OpenAI(
    api_key=openai_api_key,
    base_url=openai_api_base
)
```

### 2. Python Environment & Jupyter
We harness the power of Python 3.12. To set up your Jupyter kernel for local experimentation:
```bash
source .venv/bin/activate

# Install the kernel
python -m ipykernel install --user --name .venv --display-name "Python (venv)"

# Verify the kernel installation
jupyter kernelspec list
```

### 3. CrewAI Installation
Prepare for the autonomous era (Week 3 setup):
```bash
uv tool install crewai
uv tool upgrade crewai
```

**Validation Checklist:**
1. Confirm that you now have a folder called `.venv` in your project root directory (`transmutations` / agents).
2. If you run `uv python list`, you should see a Python 3.12 version in your list.
3. If you run `uv tool list`, you should see `crewai` as an installed tool.

### ⚡ Using the `uv` Forge
With **uv**, we follow a more refined process than standard `pip`:
- **Instead of `pip install xxx`**: Use `uv add xxx`. It adds the dependency to `pyproject.toml` and installs it.
- **Instead of `python my_script.py`**: Use `uv run my_script.py`. This updates and activates the environment before calling your script.
- **Auto-Sync**: You don't actually need to run `uv sync` manually; `uv run` handles synchronization for you.
- **Maintenance**: Avoid editing `pyproject.toml` manually, and **never** edit `uv.lock`. To upgrade all packages, run `uv lock --upgrade`.
- **Wisdom**: Study the [Official uv Docs](https://docs.astral.sh/uv/) for a deeper understanding of these modern tools.

---

## 🏺 Best Practices
- **[Functional Transmutation]**: Guidelines for functional programming to keep the codebase side-effect free.
- **[Error Resilience Patterns]**: Using the Resilience package to handle the unpredictability of the external world.

---
*Consistency is the bedrock of mastery.*

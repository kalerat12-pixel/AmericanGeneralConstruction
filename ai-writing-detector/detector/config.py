"""Load and validate config.yaml."""
from __future__ import annotations

import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CONFIG_PATH = ROOT / "config.yaml"
SIGNALS = ("perplexity", "classifier", "style", "uniformity")


class ConfigError(ValueError):
    pass


def load_config(path: str | Path | None = None) -> dict:
    path = Path(path) if path else DEFAULT_CONFIG_PATH
    with open(path, encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    validate(cfg)
    return cfg


def validate(cfg: dict) -> None:
    for key in ("models", "modes", "perplexity", "calibration", "style_rules"):
        if key not in cfg:
            raise ConfigError(f"config.yaml is missing the '{key}' section")
    for mode in ("essay", "notes"):
        m = cfg["modes"].get(mode)
        if not m:
            raise ConfigError(f"config.yaml is missing modes.{mode}")
        w = m.get("weights", {})
        unknown = set(w) - set(SIGNALS)
        if unknown:
            raise ConfigError(f"modes.{mode}.weights has unknown signal(s): {sorted(unknown)}")
        if sum(float(v) for v in w.values()) <= 0:
            raise ConfigError(f"modes.{mode}.weights must contain at least one positive weight")
        t = m.get("thresholds", {})
        if not (0 <= t.get("green_below", -1) <= t.get("red_at_or_above", -1) <= 100):
            raise ConfigError(f"modes.{mode}.thresholds must satisfy 0 <= green_below <= red_at_or_above <= 100")
    for i, rule in enumerate(cfg["style_rules"].get("phrases", [])):
        for k in ("pattern", "weight", "label", "category"):
            if k not in rule:
                raise ConfigError(f"style_rules.phrases[{i}] is missing '{k}'")
        try:
            re.compile(rule["pattern"], re.IGNORECASE)
        except re.error as e:
            raise ConfigError(f"style_rules.phrases[{i}] ({rule['label']}) has a bad pattern: {e}") from e

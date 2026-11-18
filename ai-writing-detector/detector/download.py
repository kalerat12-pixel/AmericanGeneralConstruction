"""Download the models listed in config.yaml (one time). Only model files are fetched."""
from .config import load_config
from .models import get_classifier, get_language_model


def main() -> None:
    cfg = load_config()
    print(f"Checking language model: {cfg['models']['language_model']}")
    get_language_model(cfg["models"]["language_model"])
    if cfg["models"].get("classifier", "none").lower() != "none":
        print(f"Checking classifier: {cfg['models']['classifier']}")
        get_classifier(cfg["models"]["classifier"])
    print("Models ready.")


if __name__ == "__main__":
    main()

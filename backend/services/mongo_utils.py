"""
Helpers for converting between MongoDB documents (with ObjectId) and
JSON-serializable API response dicts.
"""
from bson import ObjectId
from typing import Any, Dict


def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if doc is None:
        return None
    out = dict(doc)
    out["id"] = str(out.pop("_id"))
    return out


def to_object_id(id_str: str) -> ObjectId:
    return ObjectId(id_str)

# Data Model

## Appointment
Start: scheduled date at midnight. End: Start plus one day. Text/Description: non-null strings.
Mantras: non-null list, independently allocated per date. Display completion derives from its mantras.

## MantraTypeModel
Type: existing enum. Name/Description: non-null supplied strings. Count: existing positive count.
IsPracticed: boolean; pending <-> complete on confirmed Save. A draft is a deep copy.

## MantraProgress
Date: valid non-default DateTime, normalized to Date when matching.
MantraName: non-empty string. IsPracticed: required boolean.
JSON property presence is required; null rows and invalid values fail loading without a write.
Unknown date/name combinations are ignored. Existing camelCase or PascalCase fields are accepted.
Key: (Date.Date, MantraName). Save writes one record per supplied day/mantra.

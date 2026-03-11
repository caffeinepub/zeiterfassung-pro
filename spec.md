# Zeiterfassung Pro

## Current State
Neues Projekt, noch kein Code vorhanden.

## Requested Changes (Diff)

### Add
- Kundenverwaltung: Kunden anlegen/bearbeiten/löschen (Name, Adresse, Stundensatz in CHF)
- Zeiterfassung: Zeiteinträge pro Kunde erfassen (Datum, Startzeit, Endzeit, Beschreibung), automatische Rundung auf 15-Minuten-Schritte
- Spesenerfassung: Spesen pro Kunde erfassen (Betrag, Beschreibung, Datum)
- Rechnungsgenerierung: Monatsrechnung pro Kunde erstellen mit:
  - Auflistung aller Zeiteinträge (Datum, Beschreibung, Dauer, Betrag)
  - Auflistung aller Spesen
  - Kleinspesenpauschale (konfigurierbarer Fixbetrag)
  - MwSt-Berechnung (konfigurierbar, Standard 8.1% Schweiz)
  - Summe Netto, MwSt-Betrag, Brutto
  - Druckansicht / PDF-Export der Rechnung
- Einstellungen: Eigene Firmendaten, MwSt-Satz, Kleinspesenpauschale, Standardstundensatz

### Modify
- Nichts (Neuprojekt)

### Remove
- Nichts

## Implementation Plan
1. Backend: Kunden, Zeiteinträge, Spesen, Rechnungen, Einstellungen als Motoko-Datenmodelle
2. Backend-Funktionen: CRUD für alle Entitäten, Rechnungsberechnung mit MwSt und Rundungslogik
3. Frontend: Navigation mit Tabs (Dashboard, Kunden, Zeiterfassung, Spesen, Rechnungen, Einstellungen)
4. Dashboard: Übersicht offene Stunden/Beträge pro Kunde
5. Zeiterfassungsmaske: Datum, Kunde, Start/Ende, Beschreibung; automatische 15-Min-Rundung
6. Rechnungsansicht: Druckfähige Monatsrechnung mit allen Positionen

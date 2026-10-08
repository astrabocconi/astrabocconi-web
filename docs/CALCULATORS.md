# Graduation calculators

Implemented 2026-10-03 at `/calcolatori/bachelor`, `/calcolatori/master`, and
`/calcolatori/clmg`. The homepage and calculator index expose only these three.

## Provenance

- `src/lib/grade-plans.ts` is a snapshot of
  `Desktop/astra-app/packages/shared/src/grade-plans.ts` on 2026-10-02.
  Its upstream generator is `astra-app/bocconi-scraper/grade-plans/gen_plans.py`.
  Bachelor plans originate from Bocconi's 2025-26 guide; Master and CLMG plans
  in the mobile implementation originate from B.lab course lists. Keep this
  attribution when refreshing the snapshot. These are reference datasets, not
  content published by website editors.
- `grade-calc.ts`, `calc-state.ts`, and the names in `calc-plans.ts` are adapted
  from the same mobile checkout. No mobile files were changed.
- Michele's `full guide for courses bocconi.pdf` contains Bachelor study plans
  and exam rules, including section 7.12 on page 407: weighted averages,
  honours worth 31, pass/fail exclusion, and a maximum of two extra exams.
  It does not contain the graduation chapter or Master/CLMG regulations.
- Graduation rules were cross-checked against official sources below.

## Sources

- [Bachelor guide, section 10.5](https://didattica.unibocconi.it/tsg/testo.php?comando=Base&edizione=2027&idAnt=28196&idr=28196&strperc=&volume=N3)
- [Master guide, section 10.6](https://didattica.unibocconi.it/tsg/testo.php?comando=Apri&edizione=2026&idAnt=26655&idr=26655&strperc=10.&volume=R2)
- [Master 2026-27 regulations, article 26, page 29](https://www.unibocconi.it/sites/default/files/media/attachments/All%20DR%2077%20del%2031.08.2026%20Regolamento_bienni_26-27.pdf)
  confirms the athlete bonus for qualifying medal results and the eight-point cap.
- [CLMG guide, section 10.6](https://didattica.unibocconi.it/tsg/testo.php?comando=Base&edizione=2026&idAnt=26590&idr=26590&strperc=&volume=R5)

## Deliberate differences from mobile

- Bachelor honours requires an unrounded sum of 111; mobile used the rounded
  total, which could indicate honours from 110.5. Web fixes this in both the
  result and target calculation. Ordinary grades use half-up rounding.
- Target calculations use the same weighted points as the displayed average,
  including completed integrated-module rounding. Remaining integrated-module
  combinations are still an approximation and the UI explicitly says so.
- Web saves one transcript per degree type in browser localStorage. This is
  local to the browser and does not sync with the mobile app.
- Extra exams are entered manually; the UI tells students to add only the
  best two, with credits breaking grade ties. It does not automatically rank
  extra exams or import a student's official transcript.
- Course plans are editable references. Students must check their own cohort
  and transcript, especially for newly introduced programmes.

## Verification

`npm run test:calculators` (Node 22.18+ or Node 24) covers weighted averages,
pass/fail, honours, integrated modules, internship replacement, caps, target
boundaries and all imported plans. Nine tests pass.

Browser checked at 1440px and 390px: saved grade restored after reload, all
three degree routes accept grades and simulate targets, no client exceptions
or horizontal overflow. Production build prerenders all calculator routes.

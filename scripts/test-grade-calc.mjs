import assert from 'node:assert/strict';
import { test } from 'node:test';
import { newState, weightedAverage, graduation, extraPoints, planForTarget, isGraded } from '../src/lib/grade-calc.ts';
import { GRADE_PLANS } from '../src/lib/grade-plans.ts';

const row = (n, c, k = 'g', m) => ({ n, c, y: 1, k, m });
test('CFU weighting, honours and pass/fail exclusion', () => {
  const s = newState('bachelor', 'test', [row('A', 6), row('B', 12), row('Seminar', 2, 'p')]);
  s.rows[0].grade = 31; s.rows[1].grade = 28; s.rows[2].grade = 30;
  assert.equal(weightedAverage(s).average, 29);
  assert.equal(weightedAverage(s).gradedCredits, 18);
  s.rows[1].noGrade = true;
  assert.equal(weightedAverage(s).average, 31);
});
test('integrated modules round once after both grades are entered', () => {
  const s = newState('bachelor', 'test', [row('A1', 6, 'g', 'A'), row('A2', 6, 'g', 'A')]);
  s.rows[0].grade = 28; s.rows[1].grade = 29;
  assert.equal(weightedAverage(s).average, 29);
});
test('internship replaces only the last eligible optional', () => {
  const s = newState('bachelor', 'test', [row('Optional 1', 6, 's'), row('Optional 2', 6, 's')]);
  s.internship = true;
  assert.equal(isGraded(s.rows[0], s), true);
  assert.equal(isGraded(s.rows[1], s), false);
});
test('Bachelor honours requires raw 111 and at least three thesis points', () => {
  const s = newState('bachelor', 'test', []);
  s.thesis = 3;
  assert.equal(graduation(s, (110.6 - 3) * 30 / 110).lodePossible, false);
  assert.equal(graduation(s, (111.01 - 3) * 30 / 110).lodePossible, true);
  assert.equal(graduation(s, (111 - 3) * 30 / 110).lodePossible, true);
  s.thesis = 2;
  assert.equal(graduation(s, 31).lodePossible, false);
  assert.equal(graduation(s, 31).grade, 110);
});
test('Master research and applied thesis caps', () => {
  const s = newState('master', 'test', []);
  s.thesis = 8; s.onTime = true; s.athlete = true;
  assert.equal(extraPoints(s), 8);
  s.thesisType = 'applied';
  assert.equal(extraPoints(s), 7);
});
test('CLMG combined cap and honours condition', () => {
  const s = newState('clmg', 'test', []);
  s.thesis = 6; s.bonus = true;
  assert.equal(extraPoints(s), 6);
  assert.equal(graduation(s, 30).lodePossible, true);
  s.thesis = 4;
  assert.equal(graduation(s, 31).lodePossible, false);
});
test('empty transcript, attainable and impossible targets', () => {
  const s = newState('bachelor', 'test', [row('A', 6), row('B', 6)]);
  assert.equal(weightedAverage(s).average, null);
  s.rows[0].grade = 18; s.target = 110; s.thesis = 0;
  assert.equal(planForTarget(s).impossible, true);
  s.target = 66;
  assert.equal(planForTarget(s).alreadySafe, true);
  s.rows[1].grade = 30;
  assert.equal(planForTarget(s).noneLeft, true);
});
test('Bachelor honours simulation uses the same raw threshold as graduation', () => {
  const s = newState('bachelor', 'test', [row('A', 6)]);
  s.target = 111; s.thesis = 3;
  assert.ok(Math.abs(planForTarget(s).overallAverage - 108 * 30 / 110) < 1e-10);
});
test('all imported plans have valid positive CFU and unique generated row ids', () => {
  for (const [type, plans] of Object.entries(GRADE_PLANS)) {
    for (const [name, rows] of Object.entries(plans)) {
      assert.ok(rows.length > 0, name);
      assert.ok(rows.every(r => r.c > 0 && Number.isInteger(r.c * 2)), name);
      const s = newState(type, name, rows);
      assert.equal(new Set(s.rows.map(r => r.id)).size, rows.length);
    }
  }
});

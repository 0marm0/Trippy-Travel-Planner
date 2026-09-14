import test from 'node:test';
import assert from 'node:assert/strict';
import { shiftRoute, pointValue, safeLink } from '../src/lib/planner.ts';
import { canServePrivateTripData } from '../src/lib/private-access.ts';

test('a date shift updates stops, transport and calendar together without mutating the source', () => {
  const original = { key:'test', startiso:'2026-09-29', start:'29 Sep', end:'2 Oct', cities:[{id:'city',name:'City',nights:3,cin:'29 Sep',cout:'2 Oct',range:'29 Sep – 2 Oct'}], legs:[{d:'29 Sep',route:'Origin → City'},{d:'2 Oct',route:'City → Home'}], cal:[{iso:'2026-09-29',date:'Tue 29 Sep'}] };
  const shifted = shiftRoute(original,'2026-10-01');
  assert.equal(shifted.startiso,'2026-10-01');
  assert.match(shifted.cities[0].cout,/4 Oct/);
  assert.match(shifted.legs[0].d,/1 Oct/);
  assert.match(shifted.legs[1].d,/4 Oct/);
  assert.equal(shifted.cal[0].iso,'2026-10-01');
  assert.equal(original.cal[0].iso,'2026-09-29');
});
test('cash-versus-points valuation subtracts fees and preserves unknowns', () => {
  assert.equal(pointValue({cash:900,points:40000,taxes:100}),'2.00');
  assert.equal(pointValue({cash:900,points:40000,taxes:null}),null);
  assert.equal(pointValue({cash:null,points:40000,taxes:0}),null);
  assert.equal(pointValue({cash:900,points:0,taxes:0}),null);
});
test('provider links cannot execute code', () => {
  assert.equal(safeLink('javascript:alert(1)'),undefined);
  assert.equal(safeLink('data:text/html,test'),undefined);
  assert.equal(safeLink('https://example.com/hotel'),'https://example.com/hotel');
});
test('private trip data is limited to explicitly enabled local development', () => {
  assert.equal(canServePrivateTripData({hostname:'127.0.0.1',nodeEnv:'development',explicitGate:'true'}),true);
  assert.equal(canServePrivateTripData({hostname:'localhost',nodeEnv:'production',explicitGate:'true'}),false);
  assert.equal(canServePrivateTripData({hostname:'trippy.example',nodeEnv:'development',explicitGate:'true'}),false);
  assert.equal(canServePrivateTripData({hostname:'127.0.0.1',nodeEnv:'development',explicitGate:'false'}),false);
});

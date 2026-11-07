import { describe, expect, test } from 'vitest';
import { lunesDe, sumarDias } from './horarios';

describe('fechas de la agenda', () => {
  test('suma días cruzando meses y años', () => {
    expect(sumarDias('2026-11-30', 1)).toBe('2026-12-01');
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01');
    expect(sumarDias('2026-03-01', -1)).toBe('2026-02-28');
  });

  test('la semana empieza el lunes', () => {
    expect(lunesDe('2026-11-09')).toBe('2026-11-09'); // lunes
    expect(lunesDe('2026-11-12')).toBe('2026-11-09'); // jueves
    expect(lunesDe('2026-11-15')).toBe('2026-11-09'); // domingo
    expect(lunesDe('2026-11-01')).toBe('2026-10-26'); // domingo de otro mes
  });
});

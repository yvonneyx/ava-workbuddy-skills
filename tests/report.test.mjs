import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { queryIndex, recordQuery, renderReport, runAVA } from '../ava/scripts/report.mjs';

test('joint-source evidence renders directly and survives follow-up updates', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'antv-workbuddy-'));
  const path = (name) => join(directory, name);
  const json = async (name, value) => writeFile(path(name), JSON.stringify(value));
  let datasetId;
  try {
    await writeFile(path('sales.csv'), 'period,customer_id,revenue\n2026-01,a,100\n2026-01,b,50\n2026-02,a,250\n');
    await writeFile(path('customers.json'), JSON.stringify([
      { customer_id: 'a', segment: 'Retail' },
      { customer_id: 'b', segment: 'Business' },
    ]));
    ({ datasetId } = await runAVA(['source', path('sales.csv'), path('customers.json')]));
    const { models } = await runAVA(['schema', datasetId]);
    const sales = models.find(({ columns }) => columns.some(({ name }) => name === 'revenue'));
    const customers = models.find(({ columns }) => columns.some(({ name }) => name === 'segment'));
    assert.ok(sales && customers, 'Both source schemas must be present.');
    const tableName = ({ tableReference: { schema, table } }) =>
      [schema, table].filter(Boolean).map((name) => `"${name.replaceAll('"', '""')}"`).join('.');
    await writeFile(path('monthly.sql'), `SELECT s.period, SUM(s.revenue)::DOUBLE AS revenue
      FROM ${tableName(sales)} s JOIN ${tableName(customers)} c USING (customer_id)
      WHERE c.segment = 'Retail' GROUP BY s.period ORDER BY s.period`);
    const evidence = path('evidence');
    const result = await recordQuery({ evidence, datasetId, dsl: path('monthly.sql'), source: 'sales + customers' });
    assert.deepEqual(result.data, [{ period: '2026-01', revenue: 100 }, { period: '2026-02', revenue: 250 }]);
    assert.equal((await queryIndex(evidence)).length, 1);
    const section = {
      id: 'monthly', question: '零售客户收入如何变化？', conclusion: '一月 100，二月 250。',
      queryId: result.queryId, chartFields: { time: 'period', value: 'revenue' },
      chart: { chartType: 'line', config: {} },
    };
    await json('spec.json', {
      title: 'AntV 数据分析验证', summary: '收入增长 150。', sections: [section],
      metrics: [{ label: '一月收入', queryId: result.queryId, field: 'revenue', rowIndex: 0 }],
    });
    const options = { evidence, spec: path('spec.json'), output: path('report-v1.html') };
    const first = await renderReport(options);
    assert.equal(first.chartCount, 1);
    assert.deepEqual(first.chartErrors, []);
    const original = await readFile(first.output, 'utf8');
    const payload = JSON.parse(await readFile(first.dataOutput, 'utf8'));
    assert.deepEqual(payload.charts[0].config.data, [
      { time: '2026-01', value: 100 }, { time: '2026-02', value: 250 },
    ]);
    assert.equal(payload.charts[0].config.type, 'line');
    assert.equal(payload.charts[0].html, undefined);
    assert.ok(!original.includes('<iframe'));
    await assert.rejects(renderReport(options), /EEXIST/);
    assert.equal(await readFile(first.output, 'utf8'), original);

    await runAVA(['dispose', datasetId]);
    datasetId = undefined;
    await json('patch.json', { summary: '二月比一月增长 150%。' });
    const next = await renderReport({ previous: first.dataOutput, spec: path('patch.json'), output: path('report-v2.html') });
    assert.equal(next.chartCount, 1);
    const updated = JSON.parse(await readFile(next.dataOutput, 'utf8'));
    assert.equal(updated.sections.length, 1);
    assert.equal(updated.queries[0].queryId, result.queryId);
    assert.equal(updated.summary, '二月比一月增长 150%。');

    await json('invalid-spec.json', { sections: [{ ...section, chart: { chartType: 'line', config: { type: 'pie' } } }] });
    const invalid = await renderReport({ previous: first.dataOutput, spec: path('invalid-spec.json'), output: path('invalid.html') });
    assert.equal(invalid.chartCount, 0);
    assert.equal(invalid.chartErrors.length, 1);
    assert.equal(JSON.parse(await readFile(invalid.dataOutput, 'utf8')).queries[0].result.data.length, 2);

    if (process.platform !== 'win32') {
      await symlink(fileURLToPath(new URL('../ava/scripts/report.mjs', import.meta.url)), path('report-link.mjs'));
      assert.match(execFileSync(process.execPath, [path('report-link.mjs'), '--help'], { encoding: 'utf8' }), /AVA Skill reports/);
    }
    const record = JSON.parse(await readFile(result.evidenceOutput, 'utf8'));
    record.result.data[0].revenue = 999;
    await writeFile(result.evidenceOutput, JSON.stringify(record));
    await assert.rejects(queryIndex(evidence), /changed or is invalid/);
  } finally {
    try { if (datasetId) await runAVA(['dispose', datasetId]); }
    finally { await rm(directory, { recursive: true, force: true }); }
  }
});

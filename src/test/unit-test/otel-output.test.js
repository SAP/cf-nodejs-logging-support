const { context, SpanKind, trace, TraceFlags } = require('@opentelemetry/api');
const { SeverityNumber } = require('@opentelemetry/api-logs');
const { AsyncLocalStorageContextManager } = require('@opentelemetry/context-async-hooks');
const {
    InMemoryLogRecordExporter,
    LoggerProvider,
    SimpleLogRecordProcessor
} = require('@opentelemetry/sdk-logs');
const { BasicTracerProvider } = require('@opentelemetry/sdk-trace-base');
const { expect } = require('chai');

const { BUILD_CJS_LIB } = require('../paths');
const { Level } = require(`${BUILD_CJS_LIB}/logger/level.js`);
const { Record, RecordType } = require(`${BUILD_CJS_LIB}/logger/record.js`);
const {
    FieldInclusionMode,
    OpenTelemetryLogsOutputPlugin
} = require(`${BUILD_CJS_LIB}/plugins/otelOutput.js`);

describe('OpenTelemetryLogsOutputPlugin', function () {
    let contextManager;
    let exporter;
    let loggerProvider;
    let tracerProvider;

    beforeEach(function () {
        contextManager = new AsyncLocalStorageContextManager().enable();
        context.setGlobalContextManager(contextManager);
        exporter = new InMemoryLogRecordExporter();
        loggerProvider = new LoggerProvider({
            processors: [new SimpleLogRecordProcessor({ exporter })]
        });
    });

    afterEach(async function () {
        await loggerProvider.shutdown();
        if (tracerProvider) {
            await tracerProvider.shutdown();
        }
        context.disable();
        contextManager.disable();
    });

    it('uses the active context when no context is configured', function () {
        const plugin = new OpenTelemetryLogsOutputPlugin(loggerProvider);
        const nonRecordingSpanContext = {
            traceId: '11111111111111111111111111111111',
            spanId: '2222222222222222',
            traceFlags: TraceFlags.NONE
        };
        const activeContext = trace.setSpanContext(context.active(), nonRecordingSpanContext);

        context.with(activeContext, () => plugin.writeRecord(createRecord()));

        const [logRecord] = exporter.getFinishedLogRecords();
        expect(logRecord.spanContext).to.deep.equal(nonRecordingSpanContext);
        expect(trace.getSpan(activeContext).isRecording()).to.equal(false);
    });

    it('uses an explicitly provided context', function () {
        const explicitSpanContext = {
            traceId: '33333333333333333333333333333333',
            spanId: '4444444444444444',
            traceFlags: TraceFlags.SAMPLED
        };
        const explicitContext = trace.setSpanContext(context.active(), explicitSpanContext);
        const plugin = new OpenTelemetryLogsOutputPlugin(loggerProvider, explicitContext);

        plugin.writeRecord(createRecord());

        const [logRecord] = exporter.getFinishedLogRecords();
        expect(logRecord.spanContext).to.deep.equal(explicitSpanContext);
    });

    it('uses a resolved recording server context while preserving log fields', function () {
        tracerProvider = new BasicTracerProvider();
        const serverSpan = tracerProvider.getTracer('test').startSpan('request', {
            kind: SpanKind.SERVER
        });
        const serverContext = trace.setSpan(context.active(), serverSpan);
        const droppedSpanContext = {
            traceId: '55555555555555555555555555555555',
            spanId: '6666666666666666',
            traceFlags: TraceFlags.NONE
        };
        const droppedContext = trace.setSpanContext(context.active(), droppedSpanContext);
        const record = createRecord();
        let resolvedRecord;
        const plugin = new OpenTelemetryLogsOutputPlugin(loggerProvider, currentRecord => {
            resolvedRecord = currentRecord;
            return serverContext;
        });
        plugin.setIncludeFieldsAsAttributes(FieldInclusionMode.CustomFieldsOnly);

        context.with(droppedContext, () => plugin.writeRecord(record));

        const [logRecord] = exporter.getFinishedLogRecords();
        expect(resolvedRecord).to.equal(record);
        expect(serverSpan.isRecording()).to.equal(true);
        expect(logRecord.spanContext).to.deep.equal(serverSpan.spanContext());
        expect(logRecord.spanContext.spanId).not.to.equal(droppedSpanContext.spanId);
        expect(logRecord.severityNumber).to.equal(SeverityNumber.WARN);
        expect(logRecord.severityText).to.equal('WARN');
        expect(logRecord.body).to.equal('context test');
        expect(logRecord.attributes).to.deep.equal({ custom: 'value' });

        serverSpan.end();
    });

    function createRecord() {
        const record = new Record(RecordType.Message, Level.Warn);
        record.metadata.message = 'context test';
        record.metadata.customFieldNames.push('custom');
        record.payload.custom = 'value';
        record.payload.internal = 'not included';
        return record;
    }
});

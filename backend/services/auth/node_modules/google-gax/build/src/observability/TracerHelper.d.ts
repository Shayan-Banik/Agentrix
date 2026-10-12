/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { EventEmitter } from 'events';
import { Context, Tracer } from '@opentelemetry/api';
import { APICallback, GaxCallResult } from '../apitypes';
/**
 * Static metadata about the Google Cloud client library used to populate
 * telemetry span attributes (`gcp.client.*`, `server.*`, `url.domain`).
 */
export interface StaticTraceContext {
    /**
     * The target GCP service endpoint or domain (e.g. 'storage.googleapis.com').
     * Populates `gcp.client.service`.
     */
    gcpClientService?: string;
    /**
     * The version of the client library (e.g. '1.2.3').
     * Populates `gcp.client.version`.
     */
    gcpVersion?: string;
    /**
     * The GitHub repository name hosting the client library (e.g. 'googleapis/google-cloud-node').
     * Populates `gcp.client.repo`.
     */
    gcpRepo?: string;
    /**
     * The NPM package name of the client library (e.g. '@google-cloud/storage').
     * Populates `gcp.client.artifact`.
     */
    gcpArtifact?: string;
    /**
     * Server domain name or IP address for the RPC call.
     * Populates `server.address`.
     */
    serverAddress?: string;
    /**
     * Server port number for the RPC call.
     * Populates `server.port`.
     */
    serverPort?: number;
    /**
     * Target service domain (e.g. 'cloudkms.googleapis.com').
     * Populates `url.domain`.
     */
    urlDomain?: string;
}
/**
 * Dynamic metadata specific to the individual RPC invocation used to populate
 * telemetry span names and attributes.
 */
export interface DynamicTraceContext {
    /**
     * The name of the client class making the call (e.g. 'StorageClient').
     */
    clientName: string;
    /**
     * The name of the API method or RPC being invoked (e.g. 'GetObject').
     */
    methodName: string;
    /**
     * The transport protocol used for the RPC ('grpc' or 'http').
     * Populates `rpc.system.name`.
     */
    rpcType: 'grpc' | 'http';
    /**
     * Server domain name or IP address for the RPC call.
     * Populates `server.address`.
     */
    serverAddress?: string;
    /**
     * Server port number for the RPC call.
     * Populates `server.port`.
     */
    serverPort?: number;
    /**
     * Target service domain (e.g. 'cloudkms.googleapis.com').
     * Populates `url.domain`.
     */
    urlDomain?: string;
}
/**
 * Dynamic metadata specific to an individual RPC transport attempt (low level network span).
 */
export interface AttemptTraceContext extends DynamicTraceContext {
    /**
     * The fully-qualified protobuf service name (e.g. 'google.cloud.kms.v1.KeyManagementService').
     * Combined with `methodName` to populate `rpc.method`.
     */
    apiName?: string;
    /**
     * The ordinal resend count for this attempt (0 for the initial attempt, 1 for the first retry, etc.).
     * Populates `gcp.grpc.resend_count` (gRPC) or `http.request.resend_count` (HTTP) when > 0;
     * omitted from span attributes when 0 or undefined.
     */
    resendCount?: number;
    /**
     * The HTTP request method for REST fallback attempts (e.g. 'GET', 'POST', 'PUT', 'PATCH', 'DELETE').
     * Populates `http.request.method`.
     */
    httpMethod?: string;
    /**
     * The URL path template for REST fallback attempts (e.g. '/v1/{name}:access').
     * Populates `url.template`.
     */
    urlTemplate?: string;
}
/**
 * Updates the `http.request.method` attribute, optional `url.template` attribute,
 * and span name on the currently active low level network attempt span, and
 * propagates `url.template` to the active client request span if this is the first
 * attempt span to resolve a URL template.
 *
 * @param {string} httpMethod - The HTTP request method (e.g. 'GET', 'POST').
 * @param {string} [urlTemplate] - Optional URL path template (e.g. '/v1/{name}:access').
 */
export declare function setAttemptHttpMethod(httpMethod: string, urlTemplate?: string): void;
/**
 * Reports that the request was sent again after a retryable failure.
 *
 * Handed to the traced operation, which calls it once per resend. gax retries
 * in more than one place — the unary retry loop and the server-streaming one —
 * and counting the calls rather than reading a counter keeps the tracer
 * independent of how each of them tracks its own attempts.
 */
export type ResendRecorder = () => void;
/**
 * Returns the OpenTelemetry Tracer instance for google-gax.
 *
 * @returns {Tracer} The OpenTelemetry Tracer.
 */
export declare function getGaxTracer(): Tracer;
/**
 * Resolves google.rpc.ErrorInfo reason if present on the error or its cause chain.
 * Corresponds to Tier 1 in the error.type hierarchy.
 *
 * @param {unknown} e - The error to inspect.
 * @returns {string | undefined} The ErrorInfo reason string if found, or undefined.
 */
export declare function resolveErrorInfoReason(e: unknown): string | undefined;
/**
 * Resolves a server error code received from the backend service:
 * - For HTTP: The HTTP status code string (e.g. '400', '403', '503').
 * - For gRPC: The canonical gRPC status code name in uppercase (e.g. 'PERMISSION_DENIED', 'UNAVAILABLE').
 * Corresponds to Tier 2 in the error.type hierarchy.
 *
 * @param {unknown} e - The error to inspect.
 * @param {'grpc' | 'http'} rpcType - The RPC transport protocol.
 * @returns {string | undefined} The server error code string if the error came from the server, or undefined.
 */
export declare function resolveServerErrorCode(e: unknown, rpcType: 'grpc' | 'http'): string | undefined;
/**
 * Resolves client-side network and operational errors to standard CLIENT_* identifiers.
 * Corresponds to Tier 3 in the error.type hierarchy.
 *
 * @param {unknown} e - The error to inspect.
 * @returns {string | undefined} The standardized CLIENT_* error type if matched, or undefined.
 */
export declare function resolveClientNetworkOrOperationalError(e: unknown): string | undefined;
/**
 * Resolves a language-specific error type name (e.g. AbortError, TypeError, RangeError, CustomRpcError).
 * Generic wrapper types (Error, GoogleError, Object, DOMException) are excluded and unwrap e.cause.
 * Corresponds to Tier 4 in the error.type hierarchy.
 *
 * @param {unknown} e - The error to inspect.
 * @returns {string | undefined} The language-specific error class or name if found, or undefined.
 */
export declare function resolveLanguageSpecificErrorType(e: unknown): string | undefined;
/**
 * Resolves the OpenTelemetry `error.type` attribute according to the 5-tier hierarchy:
 * 1. google.rpc.ErrorInfo.reason
 * 2. Specific Server Error Code (HTTP status code or gRPC status name)
 * 3. Client-Side Network/Operational Errors (CLIENT_* standardized strings)
 * 4. Language-specific error type (e.g. AbortError, RangeError, TypeError, CustomRpcError)
 * 5. Internal Fallback ("INTERNAL")
 *
 * @param {unknown} e - The error to classify.
 * @param {'grpc' | 'http'} rpcType - The RPC transport protocol.
 * @returns {string} The resolved `error.type` value.
 */
export declare function resolveErrorType(e: unknown, rpcType: 'grpc' | 'http'): string;
/**
 * Determines if a failure occurred on the client side before DNS resolution
 * or connection establishment.
 *
 * @param {unknown} e - The error to inspect.
 * @returns {boolean} True if the error occurred before connection establishment.
 */
export declare function isPreConnectionFailure(e: unknown): boolean;
/**
 * Determines whether a failure is a server-side error (i.e. a server response arrived),
 * excluding pre-connection failures, client network/operational errors, and aborts/timeouts.
 *
 * @param {unknown} e - The error to inspect.
 * @param {'grpc' | 'http'} rpcType - The RPC transport protocol.
 * @returns {boolean} True if a server error code was resolved for the transport.
 */
export declare function isServerSideError(e: unknown, rpcType: 'grpc' | 'http'): boolean;
/**
 * Safely converts a value to a JSON string without throwing exceptions on
 * circular references, BigInt values, or non-serializable properties.
 *
 * @param {unknown} value - The value to serialize.
 * @returns {string | undefined} The serialized JSON string, or undefined if `value` is undefined or unserializable.
 */
export declare function safeJsonStringify(value: unknown): string | undefined;
/**
 * Extracts and formats server-side error details (message, status details, and metadata)
 * attached by GFE/backend on server-side errors. Note that only `message` is used on
 * low level network `exception` span events (`exception.stacktrace` is not recorded on spans).
 *
 * @param {Error} e - The server Error instance.
 * @returns {{message: string; stacktrace?: string}} The resolved server message and formatted details string.
 */
export declare function resolveServerExceptionDetails(e: Error): {
    message: string;
    stacktrace?: string;
};
/**
 * Manages span lifecycle for Promise-based operations, ending the span on
 * resolution or recording the error and ending the span on rejection.
 *
 * @template T
 * @param {T} promise - The promise returned from the traced operation.
 * @param {function} recordError - Callback to record errors on the span.
 * @param {function} endSpan - Callback to end the span idempotently.
 */
export declare function handlePromise<T>(promise: T, recordError: (err: unknown) => void, endSpan: () => void): void;
/**
 * Manages span lifecycle for Stream-based operations and cleans up event listeners.
 * For client-streaming calls without a callback, `'finish'` is used as the completion
 * signal because readable events (`'end'`) never fire on write-only streams.
 *
 * @param {EventEmitter} stream - The stream returned from the traced operation.
 * @param {function} recordError - Callback to record errors on the span.
 * @param {function} endSpan - Callback to end the span idempotently.
 * @param {boolean} [hasCallback=false] - Whether the caller supplied a callback
 *   for this call. When true, 'finish' is not treated as a completion signal.
 */
export declare function handleStream(stream: EventEmitter, recordError: (err: unknown) => void, endSpan: () => void, hasCallback?: boolean): void;
/**
 * Executes a function within an active OpenTelemetry client request span
 * (`"{clientName}.{methodName}"`), populating standard GCP client telemetry attributes
 * (`gcp.client.*`, `rpc.system.name`, `url.domain`, `server.address`, `server.port`,
 * `rpc.response.status_code` / `http.response.status_code`) and recording error
 * attributes (`error.type`, `status.message`, and `exception.type` event attribute)
 * if the operation fails. Child low level network attempt spans also propagate `rpc.method` and
 * `url.template` onto this span.
 *
 * For callback-style invocations, pass the user's `callback` as the fifth
 * argument so the span stays open until the callback or stream events finish.
 *
 * @template T
 * @param {DynamicTraceContext} dynamicArgs - Dynamic trace context for the RPC call.
 * @param {StaticTraceContext} staticArgs - Static trace context for the client library.
 * @param {function} fn - The operation to trace. Receives the traced callback
 *   when `callback` is supplied, otherwise `undefined`.
 * @param {boolean} [isStreamCall=false] - Whether the operation is a stream call (true) or promise call (false).
 * @param {APICallback} [callback] - The user callback for callback-style invocations.
 * @returns {T} The result of the traced operation.
 */
export declare function traceCall(dynamicArgs: DynamicTraceContext, staticArgs: StaticTraceContext, fn: (tracedCallback?: APICallback) => GaxCallResult, isStreamCall?: boolean, callback?: APICallback): GaxCallResult;
export declare function traceCall<T extends EventEmitter>(dynamicArgs: DynamicTraceContext, staticArgs: StaticTraceContext, fn: (tracedCallback?: APICallback) => T, isStreamCall: true, callback?: APICallback): T;
export declare function traceCall<T>(dynamicArgs: DynamicTraceContext, staticArgs: StaticTraceContext, fn: (tracedCallback?: APICallback) => T, isStreamCall?: false, callback?: APICallback): T;
/**
 * Executes an individual RPC transport attempt within an active OpenTelemetry
 * CLIENT span (low level network span), parenting it to the active client request span
 * and recording per-attempt client (`gcp.client.*`), network (`rpc.system.name`, `rpc.method`,
 * `http.request.method`, `url.template`, `url.domain`, `server.address`, `server.port`),
 * resend (`gcp.grpc.resend_count` / `http.request.resend_count`), status
 * (`rpc.response.status_code` / `http.response.status_code`), and error (`error.type`,
 * `status.message`, and `exception.type` / `exception.message` event attributes) attributes
 * without injecting span context into outgoing headers.
 *
 * HTTP attempt spans are named `"{http.request.method} {url.template}"` when a URL
 * template is available or `"{http.request.method}"` otherwise; gRPC attempt spans
 * are named `"{apiName}/{methodName}"` or `"{methodName}"`. Also updates `rpc.method`
 * on the parent client request span to `"{apiName}/{methodName}"` for both transports,
 * and propagates `url.template` to the parent client request span from its first HTTP
 * attempt that resolves a URL template.
 *
 * @template T
 * @param {AttemptTraceContext} dynamicArgs - Dynamic trace context for the RPC attempt.
 * @param {StaticTraceContext} staticArgs - Static trace context for the client library.
 * @param {function} fn - The transport attempt operation to trace.
 * @param {boolean} [isStreamCall=false] - Whether the operation is a stream call.
 * @param {APICallback} [callback] - The attempt callback.
 * @param {Context} [parentContext] - Optional parent OpenTelemetry context (e.g. client request span context).
 * @returns {T} The result of the traced attempt.
 */
export declare function traceAttempt<T = GaxCallResult>(dynamicArgs: AttemptTraceContext, staticArgs: StaticTraceContext, fn: (tracedCallback?: APICallback) => T, isStreamCall?: boolean, callback?: APICallback, parentContext?: Context): T;
